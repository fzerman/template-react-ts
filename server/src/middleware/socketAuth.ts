import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData,
} from "../../../shared/NetworkEvents.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface JwtPayload {
    userId: string;
    username: string;
}

/**
 * Socket.IO middleware that verifies the JWT token from `socket.handshake.auth.token`.
 * On success, populates `socket.data` with userId and username.
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
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        socket.data.userId = payload.userId;
        socket.data.username = payload.username;
        next();
    } catch {
        next(new Error("Invalid or expired token"));
    }
}
