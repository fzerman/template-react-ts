import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import paymentRoutes from "./routes/payments.js";
import taskRoutes from "./routes/tasks.js";

const app = express();

// ─── Core Middleware ─────────────────────────────────────────────────────────
// Skip helmet on /admin — AdminJS serves its own assets with inline scripts/styles
const helmetMiddleware = helmet();
app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/admin")) return next();
    helmetMiddleware(req, res, next);
});
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:8080" }));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/tasks", taskRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

export default app;
