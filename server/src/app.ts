import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

const app = express();

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:8080" }));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────
// TODO: mount route files under /api/v1

// Dev-only: issue a JWT for testing (replace with real auth later)
app.post("/api/v1/auth/dev-token", (req, res) => {
    const username = (req.body as { username?: string }).username || "Player";
    const userId = `user_${Date.now().toString(36)}`;
    const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, userId, username });
});

// ─── Health Check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

export default app;
