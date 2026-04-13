import { z } from "zod";

export const MarketBuySchema = z.object({
    itemId: z.string().min(1),
    quantity: z.number().int().min(1).max(100),
});

export const MarketSellSchema = z.object({
    itemId: z.string().min(1),
    quantity: z.number().int().min(1).max(100),
});

export const UserSyncSchema = z.object({
    balance: z.number().min(0),
    level: z.number().int().min(1),
});

export const BalanceConvertSchema = z.object({
    amount: z.number().int().min(1),
});

export const BalanceHistorySchema = z.object({
    limit: z.number().int().min(1).max(100).optional().default(20),
    offset: z.number().int().min(0).optional().default(0),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}
