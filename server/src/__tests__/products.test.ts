import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { PurchaseSchema, PaymentCallbackSchema } from "../validators/products.js";

// ─── Validator Tests ────────────────────────────────────────────────────────

describe("PurchaseSchema", () => {
    it("accepts valid UUID productId", () => {
        const id = "550e8400-e29b-41d4-a716-446655440000";
        expect(PurchaseSchema.parse({ productId: id })).toEqual({ productId: id });
    });

    it("rejects non-UUID productId", () => {
        expect(() => PurchaseSchema.parse({ productId: "not-a-uuid" })).toThrow();
    });

    it("rejects missing productId", () => {
        expect(() => PurchaseSchema.parse({})).toThrow();
    });
});

describe("PaymentCallbackSchema", () => {
    const valid = {
        paymentId: "550e8400-e29b-41d4-a716-446655440000",
        providerRef: "stripe_pi_123",
        status: "completed" as const,
    };

    it("accepts valid completed callback", () => {
        const result = PaymentCallbackSchema.parse(valid);
        expect(result.status).toBe("completed");
        expect(result.providerData).toEqual({});
    });

    it("accepts valid failed callback", () => {
        const result = PaymentCallbackSchema.parse({ ...valid, status: "failed" });
        expect(result.status).toBe("failed");
    });

    it("accepts providerData", () => {
        const result = PaymentCallbackSchema.parse({ ...valid, providerData: { chargeId: "ch_1" } });
        expect(result.providerData).toEqual({ chargeId: "ch_1" });
    });

    it("rejects invalid status", () => {
        expect(() => PaymentCallbackSchema.parse({ ...valid, status: "pending" })).toThrow();
    });

    it("rejects missing providerRef", () => {
        expect(() => PaymentCallbackSchema.parse({ paymentId: valid.paymentId, status: "completed" })).toThrow();
    });

    it("rejects non-UUID paymentId", () => {
        expect(() => PaymentCallbackSchema.parse({ ...valid, paymentId: "bad" })).toThrow();
    });
});

// ─── ProductService Unit Tests (mocked DB) ──────────────────────────────────

const mockProduct = {
    id: "prod-uuid-1",
    name: "100 Coins",
    description: "Buy 100 coins",
    priceAmount: 999,
    priceCurrency: "USD",
    coinAmount: 100,
    active: true,
    meta: null,
};

const mockPayment = {
    id: "pay-uuid-1",
    playerId: "player-uuid-1",
    productId: "prod-uuid-1",
    providerRef: null as string | null,
    amount: 999,
    currency: "USD",
    status: "pending" as string,
    providerData: null as Record<string, unknown> | null,
    completedAt: null as Date | null,
    save: vi.fn().mockResolvedValue(undefined),
};

vi.mock("../db/models/index.js", () => ({
    sequelize: {
        transaction: vi.fn(async (cb: (t: unknown) => Promise<unknown>) => {
            const mockT = { LOCK: { UPDATE: "UPDATE" } };
            return cb(mockT);
        }),
    },
}));

vi.mock("../db/models/Product.js", () => ({
    Product: {
        findAll: vi.fn().mockResolvedValue([mockProduct]),
        findByPk: vi.fn().mockResolvedValue(mockProduct),
    },
}));

vi.mock("../db/models/PaymentTransaction.js", () => ({
    PaymentTransaction: {
        create: vi.fn().mockImplementation(async (data: Record<string, unknown>) => ({
            ...mockPayment,
            ...data,
            id: "pay-uuid-new",
        })),
        findByPk: vi.fn().mockResolvedValue(mockPayment),
        findAndCountAll: vi.fn().mockResolvedValue({ rows: [], count: 0 }),
    },
}));

vi.mock("../services/BalanceService.js", () => ({
    addCoins: vi.fn().mockResolvedValue({ coins: 100, bills: 0 }),
}));

describe("ProductService", () => {
    let ProductService: typeof import("../services/ProductService.js");

    beforeEach(async () => {
        vi.clearAllMocks();
        mockPayment.status = "pending";
        mockPayment.providerRef = null;
        mockPayment.providerData = null;
        mockPayment.completedAt = null;
        ProductService = await import("../services/ProductService.js");
    });

    describe("listActiveProducts", () => {
        it("returns active products", async () => {
            const products = await ProductService.listActiveProducts();
            expect(products).toHaveLength(1);
        });
    });

    describe("initiatePurchase", () => {
        it("creates a pending payment", async () => {
            const result = await ProductService.initiatePurchase("player-1", "prod-uuid-1");
            expect(result.paymentId).toBe("pay-uuid-new");
            expect(result.amount).toBe(999);
            expect(result.currency).toBe("USD");
        });

        it("rejects inactive product", async () => {
            const { Product } = await import("../db/models/Product.js");
            vi.mocked(Product.findByPk).mockResolvedValueOnce({ ...mockProduct, active: false } as never);
            await expect(ProductService.initiatePurchase("player-1", "prod-uuid-1"))
                .rejects.toThrow("Product not found or inactive");
        });

        it("rejects unknown product", async () => {
            const { Product } = await import("../db/models/Product.js");
            vi.mocked(Product.findByPk).mockResolvedValueOnce(null);
            await expect(ProductService.initiatePurchase("player-1", "nonexistent"))
                .rejects.toThrow("Product not found or inactive");
        });
    });

    describe("completePurchase", () => {
        it("completes payment and delivers coins", async () => {
            const result = await ProductService.completePurchase(
                "pay-uuid-1", "stripe_123", "completed", { charge: "ch_1" },
            );
            expect(result.status).toBe("completed");
            expect(result.coinsAwarded).toBe(100);
            expect(mockPayment.save).toHaveBeenCalled();
        });

        it("marks payment as failed", async () => {
            const result = await ProductService.completePurchase(
                "pay-uuid-1", "stripe_123", "failed", {},
            );
            expect(result.status).toBe("failed");
            expect(result.coinsAwarded).toBeUndefined();
        });

        it("rejects already processed payment", async () => {
            mockPayment.status = "completed";
            await expect(
                ProductService.completePurchase("pay-uuid-1", "stripe_123", "completed", {}),
            ).rejects.toThrow("already processed");
        });

        it("rejects unknown payment", async () => {
            const { PaymentTransaction } = await import("../db/models/PaymentTransaction.js");
            vi.mocked(PaymentTransaction.findByPk).mockResolvedValueOnce(null);
            await expect(
                ProductService.completePurchase("nonexistent", "ref", "completed", {}),
            ).rejects.toThrow("Payment not found");
        });
    });

    describe("getPaymentHistory", () => {
        it("returns empty list when no payments", async () => {
            const result = await ProductService.getPaymentHistory("player-1");
            expect(result).toEqual({ payments: [], total: 0 });
        });
    });
});
