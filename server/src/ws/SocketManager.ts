import type { Server, Socket } from "socket.io";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
    MarketPrices,
} from "../../../shared/NetworkEvents.js";
import { socketAuth } from "../middleware/socketAuth.js";

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

            socket.emit("user:data", {
                userId: socket.data.userId,
                username: socket.data.username,
                balance: 1000,  // TODO: load from DB
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
        socket.on("user:sync", (data) => this.handleUserSync(socket, data));
        socket.on("market:buy", (data) => this.handleMarketBuy(socket, data));
        socket.on("market:sell", (data) => this.handleMarketSell(socket, data));
        socket.on("ping", (cb) => cb(Date.now()));
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
    notifyUser(userId: string, type: "info" | "warning" | "danger" | "success", message: string): void {
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
