import { Op } from "sequelize";
import { sequelize } from "../db/models/index.js";
import { TaskTemplate } from "../db/models/TaskTemplate.js";
import { PlayerTask } from "../db/models/PlayerTask.js";
import { Balance } from "../db/models/Balance.js";
import * as BalanceService from "./BalanceService.js";
import type { TaskRequirements } from "../db/models/TaskTemplate.js";
import type { TaskData } from "../../../shared/NetworkEvents.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTask(pt: PlayerTask, tpl: TaskTemplate): TaskData {
    return {
        id: pt.id,
        templateId: pt.templateId,
        name: tpl.name,
        description: tpl.description,
        rewards: tpl.rewards,
        status: pt.status,
        progress: pt.progress,
        createdAt: pt.createdAt.toISOString(),
        completedAt: pt.completedAt?.toISOString() ?? null,
        claimedAt: pt.claimedAt?.toISOString() ?? null,
    };
}

interface PlayerState {
    level: number;
    coins: number;
    bills: number;
    repetition: number;
}

function meetsRequirements(state: PlayerState, req: TaskRequirements): boolean {
    if (req.minLevel !== undefined && state.level < req.minLevel) return false;
    if (req.minCoins !== undefined && state.coins < req.minCoins) return false;
    if (req.minBills !== undefined && state.bills < req.minBills) return false;
    if (req.minRepetition !== undefined && state.repetition < req.minRepetition) return false;
    return true;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Check all active templates against player state.
 * Creates new tasks for templates the player qualifies for (respecting cooldown).
 * Returns newly created tasks.
 */
export async function checkAndAssignTasks(playerId: string): Promise<TaskData[]> {
    const templates = await TaskTemplate.findAll({ where: { active: true } });
    if (templates.length === 0) return [];

    // Get player state
    const balance = await BalanceService.getBalance(playerId);
    // TODO: level and repetition should come from Player model once those fields exist
    const state: PlayerState = {
        level: 1,
        coins: balance.coins,
        bills: balance.bills,
        repetition: 0,
    };

    // Get existing tasks for this player (not claimed — still active or pending)
    const existingTasks = await PlayerTask.findAll({
        where: { playerId },
    });

    const existingByTemplate = new Map<string, PlayerTask[]>();
    for (const t of existingTasks) {
        const list = existingByTemplate.get(t.templateId) ?? [];
        list.push(t);
        existingByTemplate.set(t.templateId, list);
    }

    const newTasks: TaskData[] = [];

    for (const tpl of templates) {
        // Check requirements
        if (!meetsRequirements(state, tpl.requirements)) continue;

        const playerTasks = existingByTemplate.get(tpl.id) ?? [];

        // Don't assign if there's already a pending or completed (unclaimed) task for this template
        const hasActive = playerTasks.some((t) => t.status === "pending" || t.status === "completed");
        if (hasActive) continue;

        // Check cooldown: last claimed task for this template
        if (tpl.cooldownMinutes > 0) {
            const lastClaimed = playerTasks
                .filter((t) => t.status === "claimed" && t.claimedAt)
                .sort((a, b) => b.claimedAt!.getTime() - a.claimedAt!.getTime())[0];

            if (lastClaimed) {
                const cooldownMs = tpl.cooldownMinutes * 60 * 1000;
                const elapsed = Date.now() - lastClaimed.claimedAt!.getTime();
                if (elapsed < cooldownMs) continue;
            }
        }

        // Create the task
        const pt = await PlayerTask.create({ playerId, templateId: tpl.id });
        newTasks.push(formatTask(pt, tpl));
    }

    return newTasks;
}

/**
 * Get all tasks for a player (with template info).
 */
export async function getPlayerTasks(
    playerId: string,
    status?: string,
): Promise<TaskData[]> {
    const where: Record<string, unknown> = { playerId };
    if (status) where.status = status;

    const tasks = await PlayerTask.findAll({
        where,
        include: [{ model: TaskTemplate, as: "template" }],
        order: [["createdAt", "DESC"]],
    });

    return tasks.map((pt) => {
        const tpl = (pt as PlayerTask & { template: TaskTemplate }).template;
        return formatTask(pt, tpl);
    });
}

/**
 * Mark a task as completed (player finished the objective).
 */
export async function completeTask(playerId: string, taskId: string): Promise<TaskData> {
    const pt = await PlayerTask.findOne({
        where: { id: taskId, playerId, status: "pending" },
        include: [{ model: TaskTemplate, as: "template" }],
    });

    if (!pt) throw new Error("Task not found or not pending");

    pt.status = "completed";
    pt.completedAt = new Date();
    await pt.save();

    const tpl = (pt as PlayerTask & { template: TaskTemplate }).template;
    return formatTask(pt, tpl);
}

/**
 * Claim rewards for a completed task.
 * Awards coins, bills, and/or repetition to the player.
 */
export async function claimReward(
    playerId: string,
    taskId: string,
): Promise<{ task: TaskData; balance: { coins: number; bills: number } }> {
    return sequelize.transaction(async (t) => {
        const pt = await PlayerTask.findOne({
            where: { id: taskId, playerId, status: "completed" },
            include: [{ model: TaskTemplate, as: "template" }],
            lock: t.LOCK.UPDATE,
            transaction: t,
        });

        if (!pt) throw new Error("Task not found or not claimable");

        const tpl = (pt as PlayerTask & { template: TaskTemplate }).template;

        // Award rewards
        let finalBalance = await BalanceService.getBalance(playerId);

        if (tpl.rewards.coins && tpl.rewards.coins > 0) {
            finalBalance = await BalanceService.addCoins(playerId, tpl.rewards.coins);
        }
        if (tpl.rewards.bills && tpl.rewards.bills > 0) {
            finalBalance = await BalanceService.addBills(playerId, tpl.rewards.bills);
        }
        // TODO: award repetition once Player model has repetition field

        pt.status = "claimed";
        pt.claimedAt = new Date();
        await pt.save({ transaction: t });

        return {
            task: formatTask(pt, tpl),
            balance: finalBalance,
        };
    });
}
