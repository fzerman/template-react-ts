import { Router } from "express";
import { z } from "zod";
import { BaseError as SequelizeBaseError } from "sequelize";
import { PaymentCallbackSchema } from "../validators/products.js";
import { env } from "../config/env.js";
import * as ProductService from "../services/ProductService.js";

const router = Router();

// ─── POST /callback — Payment provider webhook ─────────────────────────────
// The payment provider calls this endpoint when a payment is completed or failed.
// Secured by a shared secret in the X-Payment-Secret header.

router.post("/callback", async (req, res) => {
    try {
        // Verify provider secret
        const secret = req.headers["x-payment-secret"];
        if (secret !== env.PAYMENT_CALLBACK_SECRET) {
            res.status(401).json({ error: "Invalid payment secret" });
            return;
        }

        const { paymentId, providerRef, status, providerData } =
            PaymentCallbackSchema.parse(req.body);

        const result = await ProductService.completePurchase(
            paymentId,
            providerRef,
            status,
            providerData,
        );

        res.json(result);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: "Invalid callback payload", details: err.issues });
            return;
        }
        if (err instanceof Error) {
            if (err.message.includes("not found")) {
                res.status(404).json({ error: err.message });
                return;
            }
            if (err.message.includes("already processed")) {
                res.status(409).json({ error: err.message });
                return;
            }
        }
        if (err instanceof SequelizeBaseError) {
            console.error("[payments] db error", err);
            res.status(409).json({ error: "Database error" });
            return;
        }
        console.error("[payments] callback error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
