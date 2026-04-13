import { sequelize } from "../db/models/index.js";
import { Balance } from "../db/models/Balance.js";
import { Transaction } from "../db/models/Transaction.js";
import type { Transaction as SequelizeTransaction } from "sequelize";

// Dynamic fee: percentage lost when converting Bill → Coin
// Can be updated at runtime (e.g. via admin, events, economy balancing)
let billToCoinFeePercent = 10; // default 10%

export function getBillToCoinFeePercent(): number {
    return billToCoinFeePercent;
}

export function setBillToCoinFeePercent(percent: number): void {
    if (percent < 0 || percent > 100) {
        throw new Error("Fee percent must be between 0 and 100");
    }
    billToCoinFeePercent = percent;
}

async function getOrCreateBalance(playerId: string, t?: SequelizeTransaction): Promise<Balance> {
    const [balance] = await Balance.findOrCreate({
        where: { playerId },
        defaults: { playerId, coins: 0, bills: 0 },
        transaction: t,
        lock: t ? t.LOCK.UPDATE : undefined,
    });
    return balance;
}

export async function getBalance(playerId: string): Promise<{ coins: number; bills: number }> {
    const balance = await getOrCreateBalance(playerId);
    return { coins: balance.coins, bills: balance.bills };
}

export async function addCoins(playerId: string, amount: number): Promise<{ coins: number; bills: number }> {
    if (amount <= 0) throw new Error("Amount must be positive");

    return sequelize.transaction(async (t) => {
        const balance = await getOrCreateBalance(playerId, t);
        const before = balance.coins;
        balance.coins += amount;
        await balance.save({ transaction: t });

        await Transaction.create(
            {
                playerId,
                type: "coin_purchase",
                currency: "coin",
                amount,
                balanceBefore: before,
                balanceAfter: balance.coins,
            },
            { transaction: t },
        );

        return { coins: balance.coins, bills: balance.bills };
    });
}

export async function addBills(playerId: string, amount: number): Promise<{ coins: number; bills: number }> {
    if (amount <= 0) throw new Error("Amount must be positive");

    return sequelize.transaction(async (t) => {
        const balance = await getOrCreateBalance(playerId, t);
        const before = balance.bills;
        balance.bills += amount;
        await balance.save({ transaction: t });

        await Transaction.create(
            {
                playerId,
                type: "bill_earn",
                currency: "bill",
                amount,
                balanceBefore: before,
                balanceAfter: balance.bills,
            },
            { transaction: t },
        );

        return { coins: balance.coins, bills: balance.bills };
    });
}

export async function convertBillToCoin(
    playerId: string,
    billAmount: number,
): Promise<{ coins: number; bills: number; fee: number; coinsReceived: number }> {
    if (billAmount <= 0) throw new Error("Amount must be positive");

    return sequelize.transaction(async (t) => {
        const balance = await getOrCreateBalance(playerId, t);

        if (balance.bills < billAmount) {
            throw new Error("Insufficient bills");
        }

        const feeAmount = Math.floor(billAmount * (billToCoinFeePercent / 100));
        const coinsReceived = billAmount - feeAmount;

        const billsBefore = balance.bills;
        const coinsBefore = balance.coins;

        balance.bills -= billAmount;
        balance.coins += coinsReceived;
        await balance.save({ transaction: t });

        // Log the bill deduction
        await Transaction.create(
            {
                playerId,
                type: "bill_to_coin",
                currency: "bill",
                amount: billAmount,
                fee: feeAmount,
                balanceBefore: billsBefore,
                balanceAfter: balance.bills,
                meta: { coinsReceived, feePercent: billToCoinFeePercent },
            },
            { transaction: t },
        );

        // Log the coin credit
        await Transaction.create(
            {
                playerId,
                type: "bill_to_coin",
                currency: "coin",
                amount: coinsReceived,
                fee: 0,
                balanceBefore: coinsBefore,
                balanceAfter: balance.coins,
                meta: { billsSpent: billAmount, feePercent: billToCoinFeePercent },
            },
            { transaction: t },
        );

        return { coins: balance.coins, bills: balance.bills, fee: feeAmount, coinsReceived };
    });
}

export async function getTransactionHistory(
    playerId: string,
    limit = 20,
    offset = 0,
): Promise<{ transactions: Transaction[]; total: number }> {
    const { rows, count } = await Transaction.findAndCountAll({
        where: { playerId },
        order: [["createdAt", "DESC"]],
        limit,
        offset,
    });
    return { transactions: rows, total: count };
}
