import type { Server, Socket } from "socket.io";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
    MarketPrices,
} from "../../../shared/NetworkEvents.js";
import { socketAuth } from "../middleware/socketAuth.js";
import {
    validate,
    MarketBuySchema,
    MarketSellSchema,
    UserSyncSchema,
    BalanceConvertSchema,
    BalanceHistorySchema,
} from "../validators/socketEvents.js";
import * as BalanceService from "../services/BalanceService.js";
import * as ProductService from "../services/ProductService.js";
import * as TaskService from "../services/TaskService.js";
import { z } from "zod";

type TypedServer = Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

type TypedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

// ─── SocketManager ──────────────────────────────────────────────────────────

export class SocketManager {
    private io: TypedServer;

    // Global state shared with all connected clients
    private marketPrices: MarketPrices = {
        ammo: 10,
        armor: 50,
        medkit: 25,
        weapon_pistol: 100,
        weapon_rifle: 300,
    };

    constructor(io: TypedServer) {
        this.io = io;
    }

    init(): void {
        this.io.use(socketAuth as Parameters<typeof this.io.use>[0]);

        this.io.on("connection", (socket) => {
            console.log(
                `[ws] connected: ${socket.data.userId} (${socket.data.username})`,
            );

            // Send initial data to the client
            socket.emit("connected", { userId: socket.data.userId });

            // Load and send balance from DB
            BalanceService.getBalance(socket.data.userId)
                .then((bal) => {
                    socket.emit("balance:update", bal);
                })
                .catch((err) =>
                    console.error("[ws] initial balance load error", err),
                );

            // Check and assign automatic tasks, emit each new one
            TaskService.checkAndAssignTasks(socket.data.userId)
                .then((newTasks) => {
                    for (const task of newTasks) {
                        socket.emit("task:new", task);
                    }
                })
                .catch((err) =>
                    console.error("[ws] task assignment error", err),
                );

            socket.emit("user:data", {
                userId: socket.data.userId,
                username: socket.data.username,
                balance: 0,
                level: 1,
            });

            socket.emit("global:state", {
                market: this.marketPrices,
                serverTime: Date.now(),
            });

            this.registerHandlers(socket);

            socket.on("disconnect", (reason) => {
                console.log(
                    `[ws] disconnected: ${socket.data.userId} — ${reason}`,
                );
            });
        });
    }

    // ── Handler registration ────────────────────────────────────────────

    private registerHandlers(socket: TypedSocket): void {
        socket.on("user:sync", (data) => {
            try {
                this.handleUserSync(socket, validate(UserSyncSchema, data));
            } catch (err) {
                if (err instanceof z.ZodError) {
                    socket.emit("notification", {
                        type: "danger",
                        message: "Invalid user:sync payload",
                    });
                }
            }
        });
        socket.on("market:buy", (data) => {
            try {
                this.handleMarketBuy(socket, validate(MarketBuySchema, data));
            } catch (err) {
                if (err instanceof z.ZodError) {
                    socket.emit("notification", {
                        type: "danger",
                        message: "Invalid market:buy payload",
                    });
                }
            }
        });
        socket.on("market:sell", (data) => {
            try {
                this.handleMarketSell(socket, validate(MarketSellSchema, data));
            } catch (err) {
                if (err instanceof z.ZodError) {
                    socket.emit("notification", {
                        type: "danger",
                        message: "Invalid market:sell payload",
                    });
                }
            }
        });
        socket.on("ping", (cb) => cb(Date.now()));

        socket.on("balance:get", async (cb) => {
            try {
                const balance = await BalanceService.getBalance(
                    socket.data.userId,
                );
                cb(balance);
            } catch (err) {
                console.error("[ws] balance:get error", err);
                socket.emit("notification", {
                    type: "danger",
                    message: "Failed to get balance",
                });
            }
        });

        socket.on("balance:convert", async (data, cb) => {
            try {
                const { amount } = validate(BalanceConvertSchema, data);
                const result = await BalanceService.convertBillToCoin(
                    socket.data.userId,
                    amount,
                );
                cb({
                    ...result,
                    feePercent: BalanceService.getBillToCoinFeePercent(),
                });
                socket.emit("balance:update", {
                    coins: result.coins,
                    bills: result.bills,
                });
            } catch (err) {
                if (err instanceof z.ZodError) {
                    cb({ error: "Invalid amount" });
                } else if (err instanceof Error) {
                    cb({ error: err.message });
                } else {
                    cb({ error: "Conversion failed" });
                }
            }
        });

        socket.on("product:list", async (cb) => {
            try {
                const products = await ProductService.listActiveProducts();
                cb(
                    products.map((p) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        priceAmount: p.priceAmount,
                        priceCurrency: p.priceCurrency,
                        coinAmount: p.coinAmount,
                    })),
                );
            } catch (err) {
                console.error("[ws] product:list error", err);
                cb([]);
            }
        });

        socket.on("balance:history", async (data, cb) => {
            try {
                const { limit, offset } = validate(BalanceHistorySchema, data);
                const result = await BalanceService.getTransactionHistory(
                    socket.data.userId,
                    limit,
                    offset,
                );
                cb({
                    transactions: result.transactions.map((t) => ({
                        id: t.id,
                        type: t.type,
                        currency: t.currency,
                        amount: t.amount,
                        fee: t.fee,
                        balanceBefore: t.balanceBefore,
                        balanceAfter: t.balanceAfter,
                        meta: t.meta,
                        createdAt: t.createdAt.toISOString(),
                    })),
                    total: result.total,
                });
            } catch (err) {
                console.error("[ws] balance:history error", err);
                cb({ transactions: [], total: 0 });
            }
        });
    }

    // ── Handlers ────────────────────────────────────────────────────────

    private handleUserSync(
        socket: TypedSocket,
        data: { balance: number; level: number },
    ): void {
        // TODO: validate and persist to DB
        console.log(`[ws] user:sync ${socket.data.userId}`, data);
    }

    private handleMarketBuy(
        socket: TypedSocket,
        data: { itemId: string; quantity: number },
    ): void {
        const price = this.marketPrices[data.itemId];
        if (price === undefined) {
            socket.emit("notification", {
                type: "danger",
                message: `Unknown item: ${data.itemId}`,
            });
            return;
        }

        // TODO: validate balance from DB, deduct, persist
        const total = price * data.quantity;
        socket.emit("notification", {
            type: "success",
            message: `Bought ${data.quantity}x ${data.itemId} for $${total}`,
            data: { itemId: data.itemId, quantity: data.quantity, total },
        });
    }

    private handleMarketSell(
        socket: TypedSocket,
        data: { itemId: string; quantity: number },
    ): void {
        const price = this.marketPrices[data.itemId];
        if (price === undefined) {
            socket.emit("notification", {
                type: "danger",
                message: `Unknown item: ${data.itemId}`,
            });
            return;
        }

        // TODO: validate inventory from DB, add balance, persist
        const total = Math.floor(price * 0.7) * data.quantity;
        socket.emit("notification", {
            type: "success",
            message: `Sold ${data.quantity}x ${data.itemId} for $${total}`,
            data: { itemId: data.itemId, quantity: data.quantity, total },
        });
    }

    // ── Public API for server-side code ─────────────────────────────────

    /** Broadcast a notification to all connected clients. */
    notifyAll(
        type: "info" | "warning" | "danger" | "success",
        message: string,
        duration?: number,
    ): void {
        this.io.emit("notification", { type, message, duration });
    }

    /** Broadcast a notification to a specific user. */
    notifyUser(
        userId: string,
        type: "info" | "warning" | "danger" | "success",
        message: string,
    ): void {
        // Find the socket for this user
        for (const [, socket] of this.io.sockets.sockets) {
            if ((socket.data as SocketData).userId === userId) {
                socket.emit("notification", { type, message });
                break;
            }
        }
    }

    /** Update and broadcast market prices to all clients. */
    updateMarketPrices(prices: MarketPrices): void {
        Object.assign(this.marketPrices, prices);
        this.io.emit("market:update", this.marketPrices);
    }
}

/*
//TODO: lkasjdşasjdklashdkaşls
  parent: error: duplicate key value violates unique constraint "payment_transactions_providerRef_key"
  */

