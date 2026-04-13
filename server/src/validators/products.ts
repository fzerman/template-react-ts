import { z } from "zod";

export const PurchaseSchema = z.object({
    productId: z.string().uuid(),
});

export const PaymentCallbackSchema = z.object({
    paymentId: z.string().uuid(),
    providerRef: z.string().min(1),
    status: z.enum(["completed", "failed"]),
    providerData: z.record(z.string(), z.unknown()).optional().default({}),
});
