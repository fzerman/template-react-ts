import "dotenv/config";
import http from "node:http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { SocketManager } from "./ws/SocketManager.js";

const PORT = Number(process.env.PORT) || 3001;

const server = http.createServer(app);

// ─── Socket.IO ──────────────────────────────────────────────────────────────
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:8080",
        methods: ["GET", "POST"],
    },
});

// ─── WebSocket handlers ─────────────────────────────────────────────────────
const socketManager = new SocketManager(io);
socketManager.init();

// ─── Start ──────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
});

export { io, socketManager };
