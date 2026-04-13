import { sequelize } from "../db/models/index.js";
import { Product } from "../db/models/Product.js";
import { PaymentTransaction } from "../db/models/PaymentTransaction.js";
import * as BalanceService from "./BalanceService.js";

export async function listActiveProducts(): Promise<Product[]> {
    return Product.findAll({
        where: { active: true },
        order: [["priceAmount", "ASC"]],
    });
}

export async function getProduct(productId: string): Promise<Product | null> {
    return Product.findByPk(productId);
}

/**
 * Initiate a purchase — creates a pending PaymentTransaction.
 * Returns the payment ID that the client sends to the payment provider.
 */
export async function initiatePurchase(
    playerId: string,
    productId: string,
): Promise<{ paymentId: string; amount: number; currency: string }> {
    const product = await Product.findByPk(productId);
    if (!product || !product.active) {
        throw new Error("Product not found or inactive");
    }

    const payment = await PaymentTransaction.create({
        playerId,
        productId,
        amount: product.priceAmount,
        currency: product.priceCurrency,
        status: "pending",
    });

    return {
        paymentId: payment.id,
        amount: product.priceAmount,
        currency: product.priceCurrency,
    };
}

/**
 * Complete a purchase — called by payment provider callback.
 * Validates the payment, marks it completed, and delivers coins.
 */
export async function completePurchase(
    paymentId: string,
    providerRef: string,
    status: "completed" | "failed",
    providerData: Record<string, unknown>,
): Promise<{ paymentId: string; status: string; coinsAwarded?: number }> {
    return sequelize.transaction(async (t) => {
        const payment = await PaymentTransaction.findByPk(paymentId, {
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!payment) {
            throw new Error("Payment not found");
        }

        if (payment.status !== "pending") {
            throw new Error(`Payment already processed (status: ${payment.status})`);
        }

        payment.providerRef = providerRef;
        payment.providerData = providerData;

        if (status === "failed") {
            payment.status = "failed";
            await payment.save({ transaction: t });
            return { paymentId: payment.id, status: "failed" };
        }

        // Mark completed
        payment.status = "completed";
        payment.completedAt = new Date();
        await payment.save({ transaction: t });

        // Deliver coins
        const product = await Product.findByPk(payment.productId, { transaction: t });
        if (!product) {
            throw new Error("Product not found for delivery");
        }

        await BalanceService.addCoins(payment.playerId, product.coinAmount);

        return {
            paymentId: payment.id,
            status: "completed",
            coinsAwarded: product.coinAmount,
        };
    });
}

/**
 * Get payment history for a player.
 */
export async function getPaymentHistory(
    playerId: string,
    limit = 20,
    offset = 0,
): Promise<{ payments: PaymentTransaction[]; total: number }> {
    const { rows, count } = await PaymentTransaction.findAndCountAll({
        where: { playerId },
        order: [["createdAt", "DESC"]],
        include: [{ model: Product, attributes: ["name", "coinAmount"] }],
        limit,
        offset,
    });
    return { payments: rows, total: count };
}
