import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { UniqueConstraintError } from "sequelize";
import { Player } from "../db/models/index.js";
import { env } from "../config/env.js";

const router = Router();

const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later" },
});

router.use(authLimiter);

// ─── Schemas ────────────────────────────────────────────────────────────────

const ConnectSchema = z.object({ token: z.string().min(1) });
const RefreshSchema = z.object({ refreshToken: z.string().min(1) });

// ─── POST /connect ──────────────────────────────────────────────────────────

router.post("/connect", async (req, res) => {
    try {
        const { token } = ConnectSchema.parse(req.body);

        // Verify publisher JWT
        const payload = jwt.verify(token, env.PUBLISHER_JWT_SECRET) as {
            vendorId: string;
            username: string;
        };

        if (!payload.vendorId || !payload.username) {
            res.status(400).json({ error: "Invalid publisher token payload" });
            return;
        }

        // Get-or-create player
        let player: Player;
        let created: boolean;
        try {
            [player, created] = await Player.findOrCreate({
                where: { vendorId: payload.vendorId },
                defaults: {
                    username: payload.username,
                    vendorId: payload.vendorId,
                },
            });
        } catch (err) {
            if (err instanceof UniqueConstraintError) {
                res.status(409).json({ error: "Username already taken" });
                return;
            }
            throw err;
        }

        // Update username if changed
        if (!created && player.username !== payload.username) {
            player.username = payload.username;
            try {
                await player.save();
            } catch (err) {
                if (err instanceof UniqueConstraintError) {
                    res.status(409).json({ error: "Username already taken" });
                    return;
                }
                throw err;
            }
        }

        // Issue game tokens
        const accessToken = jwt.sign(
            {
                userId: player.id,
                vendorId: player.vendorId,
                username: player.username,
                type: "access",
            },
            env.JWT_SECRET,
            { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
        );

        const refreshToken = jwt.sign(
            { userId: player.id, type: "refresh" },
            env.JWT_SECRET,
            { expiresIn: env.JWT_REFRESH_EXPIRES_IN },
        );

        res.json({
            accessToken,
            refreshToken,
            player: {
                id: player.id,
                vendorId: player.vendorId,
                username: player.username,
            },
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({
                error: "Invalid request body",
                details: err.issues,
            });
            return;
        }
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid publisher token" });
            return;
        }
        console.error("[auth/connect]", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ─── POST /refresh ──────────────────────────────────────────────────────────

router.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = RefreshSchema.parse(req.body);

        const payload = jwt.verify(refreshToken, env.JWT_SECRET) as {
            userId: string;
            type: string;
        };

        if (payload.type !== "refresh") {
            res.status(401).json({ error: "Invalid token type" });
            return;
        }

        const player = await Player.findByPk(payload.userId);
        if (!player) {
            res.status(401).json({ error: "Player not found" });
            return;
        }

        const accessToken = jwt.sign(
            {
                userId: player.id,
                vendorId: player.vendorId,
                username: player.username,
                type: "access",
            },
            env.JWT_SECRET,
            { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
        );

        res.json({ accessToken });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({
                error: "Invalid request body",
                details: err.issues,
            });
            return;
        }
        if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid or expired refresh token" });
            return;
        }
        console.error("[auth/refresh]", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ─── Dev-only: issue a publisher JWT for testing ────────────────────────────

if (env.NODE_ENV === "development") {
    router.post("/dev-token", (req, res) => {
        const username =
            (req.body as { username?: string }).username || "Player";
        const vendorId = `dev_${username}`;
        const token = jwt.sign({ vendorId, username }, env.PUBLISHER_JWT_SECRET, {
            expiresIn: "24h",
        });
        res.json({ token, vendorId, username });
    });
}

export default router;

