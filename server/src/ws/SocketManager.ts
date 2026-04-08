import type { Server, Socket } from "socket.io";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
    PlayerState,
    GamePhase,
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

// ─── Tuning constants ───────────────────────────────────────────────────────

const SERVER_TICK_HZ  = 10;            // snapshot broadcast rate
const AOI_RADIUS      = 1200;          // pixels — players beyond this are culled
const AOI_RADIUS_SQ   = AOI_RADIUS * AOI_RADIUS;

// ─── Room state ─────────────────────────────────────────────────────────────

interface RoomState {
    phase: GamePhase;
    players: Map<string, PlayerState>;
    /** socket.id → userId lookup for fast access */
    socketToUser: Map<string, string>;
    dirty: Set<string>;                 // userIds that changed since last tick
    tick: number;
    tickTimer: ReturnType<typeof setInterval> | null;
}

// ─── SocketManager ──────────────────────────────────────────────────────────

export class SocketManager {
    private io: TypedServer;
    private rooms: Map<string, RoomState> = new Map();

    constructor(io: TypedServer) {
        this.io = io;
    }

    /** Call once at server startup. */
    init(): void {
        this.io.use(socketAuth as Parameters<typeof this.io.use>[0]);

        this.io.on("connection", (socket) => {
            console.log(
                `[ws] connected: ${socket.data.userId} (${socket.data.username})`,
            );

            this.registerHandlers(socket);

            socket.on("disconnect", (reason) => {
                console.log(
                    `[ws] disconnected: ${socket.data.userId} — ${reason}`,
                );
                this.handleLeaveRoom(socket);
            });
        });
    }

    // ── Handler registration ────────────────────────────────────────────

    private registerHandlers(socket: TypedSocket): void {
        socket.on("room:join", (data) => this.handleJoinRoom(socket, data.roomId));
        socket.on("room:leave", () => this.handleLeaveRoom(socket));
        socket.on("player:sync", (data) => this.handlePlayerSync(socket, data));
        socket.on("game:ready", () => this.handleReady(socket));
        socket.on("ping", (cb) => cb(Date.now()));
    }

    // ── Room management ─────────────────────────────────────────────────

    private getOrCreateRoom(roomId: string): RoomState {
        let room = this.rooms.get(roomId);
        if (!room) {
            room = {
                phase: "lobby",
                players: new Map(),
                socketToUser: new Map(),
                dirty: new Set(),
                tick: 0,
                tickTimer: null,
            };
            this.rooms.set(roomId, room);
            this.startRoomTick(roomId, room);
        }
        return room;
    }

    private handleJoinRoom(socket: TypedSocket, roomId: string): void {
        this.handleLeaveRoom(socket);

        const room = this.getOrCreateRoom(roomId);
        socket.data.roomId = roomId;
        socket.join(roomId);

        const playerState: PlayerState = {
            id: socket.data.userId,
            x: 512,
            y: 400,
            vx: 0,
            vy: 0,
            hp: 100,
            maxHp: 100,
            state: "Idle",
            name: socket.data.username,
        };
        room.players.set(socket.data.userId, playerState);
        room.socketToUser.set(socket.id, socket.data.userId);

        // Tell the joiner about the room (full snapshot)
        socket.emit("room:joined", {
            roomId,
            players: Array.from(room.players.values()),
        });

        // Tell others
        socket.to(roomId).emit("player:joined", playerState);

        this.io.to(roomId).emit("game:notification", {
            type: "info",
            message: `${socket.data.username} joined the room`,
        });
    }

    private handleLeaveRoom(socket: TypedSocket): void {
        const roomId = socket.data.roomId;
        if (!roomId) return;

        const room = this.rooms.get(roomId);
        if (room) {
            room.players.delete(socket.data.userId);
            room.socketToUser.delete(socket.id);
            room.dirty.delete(socket.data.userId);

            socket.to(roomId).emit("player:left", { id: socket.data.userId });
            socket.to(roomId).emit("game:notification", {
                type: "warning",
                message: `${socket.data.username} left the room`,
            });

            if (room.players.size === 0) {
                this.stopRoomTick(room);
                this.rooms.delete(roomId);
            }
        }

        socket.leave(roomId);
        socket.data.roomId = undefined;
    }

    // ── Player sync (ingest only — no immediate broadcast) ──────────────

    private handlePlayerSync(
        socket: TypedSocket,
        data: Pick<PlayerState, "x" | "y" | "vx" | "vy" | "hp" | "state">,
    ): void {
        const roomId = socket.data.roomId;
        if (!roomId) return;

        const room = this.rooms.get(roomId);
        if (!room) return;

        const player = room.players.get(socket.data.userId);
        if (!player) return;

        player.x = data.x;
        player.y = data.y;
        player.vx = data.vx;
        player.vy = data.vy;
        player.hp = data.hp;
        player.state = data.state;

        // Mark dirty — will be included in next tick broadcast
        room.dirty.add(socket.data.userId);
    }

    // ── Server tick: batched AOI broadcast ──────────────────────────────

    private startRoomTick(roomId: string, room: RoomState): void {
        room.tickTimer = setInterval(() => {
            this.tickRoom(roomId, room);
        }, 1000 / SERVER_TICK_HZ);
    }

    private stopRoomTick(room: RoomState): void {
        if (room.tickTimer) {
            clearInterval(room.tickTimer);
            room.tickTimer = null;
        }
    }

    private tickRoom(roomId: string, room: RoomState): void {
        if (room.dirty.size === 0) return;

        room.tick++;

        // Collect dirty player states
        const dirtyStates: PlayerState[] = [];
        for (const uid of room.dirty) {
            const p = room.players.get(uid);
            if (p) dirtyStates.push(p);
        }
        room.dirty.clear();

        // Per-socket AOI filtered broadcast
        const sockets = this.io.sockets.adapter.rooms.get(roomId);
        if (!sockets) return;

        for (const socketId of sockets) {
            const receiverSocket = this.io.sockets.sockets.get(socketId);
            if (!receiverSocket) continue;

            const receiverUid = (receiverSocket.data as SocketData).userId;
            const receiver = room.players.get(receiverUid);
            if (!receiver) continue;

            // Filter: only send dirty players within AOI of this receiver
            const nearby: PlayerState[] = [];
            for (const dp of dirtyStates) {
                if (dp.id === receiverUid) continue; // skip self
                const dx = dp.x - receiver.x;
                const dy = dp.y - receiver.y;
                if (dx * dx + dy * dy <= AOI_RADIUS_SQ) {
                    nearby.push(dp);
                }
            }

            if (nearby.length > 0) {
                receiverSocket.emit("players:snapshot", nearby);
            }
        }
    }

    // ── Game flow ───────────────────────────────────────────────────────

    private handleReady(socket: TypedSocket): void {
        const roomId = socket.data.roomId;
        if (!roomId) return;

        const room = this.rooms.get(roomId);
        if (!room) return;

        this.io.to(roomId).emit("game:state", {
            phase: room.phase,
            roomId,
            players: Array.from(room.players.values()),
            tick: room.tick,
        });

        this.io.to(roomId).emit("game:notification", {
            type: "success",
            message: `${socket.data.username} is ready!`,
        });
    }

    // ── Utility ─────────────────────────────────────────────────────────

    /** Send a notification to an entire room. */
    notifyRoom(
        roomId: string,
        type: "info" | "warning" | "danger" | "success",
        message: string,
        duration?: number,
    ): void {
        this.io.to(roomId).emit("game:notification", { type, message, duration });
    }
}
