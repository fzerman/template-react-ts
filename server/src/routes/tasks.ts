import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { TaskListQuerySchema, TaskClaimParamsSchema, TaskCompleteParamsSchema } from "../validators/tasks.js";
import * as TaskService from "../services/TaskService.js";

const router = Router();

// ─── GET / — List player's tasks ──────────────────────────────────────────

router.get("/", requireAuth, async (req: AuthRequest, res) => {
    try {
        const { status } = TaskListQuerySchema.parse(req.query);
        const tasks = await TaskService.getPlayerTasks(req.userId!, status);
        res.json({ tasks });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: "Invalid query", details: err.issues });
            return;
        }
        console.error("[tasks] list error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ─── POST /:id/complete — Mark task as completed ──────────────────────────

router.post("/:id/complete", requireAuth, async (req: AuthRequest, res) => {
    try {
        const { id } = TaskCompleteParamsSchema.parse(req.params);
        const task = await TaskService.completeTask(req.userId!, id);
        res.json({ task });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: "Invalid task ID" });
            return;
        }
        if (err instanceof Error && err.message.includes("not found")) {
            res.status(404).json({ error: err.message });
            return;
        }
        console.error("[tasks] complete error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ─── POST /:id/claim — Claim task rewards ─────────────────────────────────

router.post("/:id/claim", requireAuth, async (req: AuthRequest, res) => {
    try {
        const { id } = TaskClaimParamsSchema.parse(req.params);
        const result = await TaskService.claimReward(req.userId!, id);
        res.json(result);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: "Invalid task ID" });
            return;
        }
        if (err instanceof Error && err.message.includes("not found")) {
            res.status(404).json({ error: err.message });
            return;
        }
        console.error("[tasks] claim error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
