function requireEnv(name: string, fallback?: string): string {
    const value = process.env[name];
    if (value) return value;
    if (process.env.NODE_ENV === "production") {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing environment variable: ${name}`);
}

export const env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT) || 3001,
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:8080",
    JWT_SECRET: requireEnv("JWT_SECRET", "dev-secret-change-me"),
    PUBLISHER_JWT_SECRET: requireEnv("PUBLISHER_JWT_SECRET", "publisher-secret-change-me"),
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    ADMIN_EMAIL: requireEnv("ADMIN_EMAIL", "admin@mafia.local"),
    ADMIN_PASSWORD: requireEnv("ADMIN_PASSWORD", "admin"),
    ADMIN_COOKIE_SECRET: requireEnv("ADMIN_COOKIE_SECRET", "admin-cookie-secret-change-me"),
} as const;
