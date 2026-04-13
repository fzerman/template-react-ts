import { z } from "zod";

export const TaskListQuerySchema = z.object({
    status: z.enum(["pending", "completed", "claimed"]).optional(),
});

export const TaskClaimParamsSchema = z.object({
    id: z.string().uuid(),
});

export const TaskCompleteParamsSchema = z.object({
    id: z.string().uuid(),
});
