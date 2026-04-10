import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
} from "../../../shared/NetworkEvents.js";
import { Player } from "../db/models/index.js";
import { env } from "../config/env.js";

export interface JwtPayload {
    userId: string;
    vendorId: string;
    username: string;
    type: string;
}

/**
 * Socket.IO middleware that verifies the JWT token from `socket.handshake.auth.token`.
 * On success, verifies the player exists in DB and populates `socket.data`.
 */
export function socketAuth(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    next: (err?: Error) => void,
): void {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
        return next(new Error("Authentication required"));
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        if (payload.type !== "access") {
            return next(new Error("Invalid token type"));
        }

        Player.findByPk(payload.userId).then((player) => {
            if (!player) {
                return next(new Error("Player not found"));
            }
            socket.data.userId = player.id;
            socket.data.vendorId = player.vendorId;
            socket.data.username = player.username;
            next();
        }).catch(() => {
            next(new Error("Database error during authentication"));
        });
    } catch {
        next(new Error("Invalid or expired token"));
    }
}
