import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:8080" }));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────
// TODO: mount route files under /api/v1

// ─── Health Check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

export default app;
