import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { PurchaseSchema } from "../validators/products.js";
import * as ProductService from "../services/ProductService.js";

const router = Router();

// ─── GET / — List active products (public) ─────────────────────────────────

router.get("/", async (_req, res) => {
    try {
        const products = await ProductService.listActiveProducts();
        res.json({
            products: products.map((p) => ({
                id: p.id,
                name: p.name,
                description: p.description,
                priceAmount: p.priceAmount,
                priceCurrency: p.priceCurrency,
                coinAmount: p.coinAmount,
            })),
        });
    } catch (err) {
        console.error("[products] list error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ─── POST /purchase — Initiate a purchase (authenticated) ───────────────────

router.post("/purchase", requireAuth, async (req: AuthRequest, res) => {
    try {
        const { productId } = PurchaseSchema.parse(req.body);
        const result = await ProductService.initiatePurchase(req.userId!, productId);
        res.json(result);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: "Invalid request body", details: err.issues });
            return;
        }
        if (err instanceof Error && err.message.includes("not found")) {
            res.status(404).json({ error: err.message });
            return;
        }
        console.error("[products] purchase error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ─── GET /history — Payment history (authenticated) ─────────────────────────

router.get("/history", requireAuth, async (req: AuthRequest, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 100);
        const offset = Math.max(Number(req.query.offset) || 0, 0);
        const result = await ProductService.getPaymentHistory(req.userId!, limit, offset);
        res.json({
            payments: result.payments.map((p) => ({
                id: p.id,
                productId: p.productId,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                providerRef: p.providerRef,
                completedAt: p.completedAt?.toISOString() ?? null,
                createdAt: p.createdAt.toISOString(),
            })),
            total: result.total,
        });
    } catch (err) {
        console.error("[products] history error", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
