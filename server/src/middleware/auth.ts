import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthRequest extends Request {
    userId?: string;
    vendorId?: string;
    username?: string;
}

/**
 * Express middleware that verifies the Bearer JWT access token.
 * Populates req.userId, req.vendorId, req.username on success.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing or invalid Authorization header" });
        return;
    }

    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as {
            userId: string;
            vendorId: string;
            username: string;
            type: string;
        };

        if (payload.type !== "access") {
            res.status(401).json({ error: "Invalid token type" });
            return;
        }

        req.userId = payload.userId;
        req.vendorId = payload.vendorId;
        req.username = payload.username;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
