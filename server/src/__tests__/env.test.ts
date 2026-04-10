import { describe, it, expect, vi, beforeEach } from "vitest";

describe("env config", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it("uses fallback values in non-production", async () => {
        vi.stubEnv("NODE_ENV", "development");
        vi.stubEnv("JWT_SECRET", "");
        vi.stubEnv("PUBLISHER_JWT_SECRET", "");
        vi.stubEnv("ADMIN_EMAIL", "");
        vi.stubEnv("ADMIN_PASSWORD", "");
        vi.stubEnv("ADMIN_COOKIE_SECRET", "");

        const { env } = await import("../config/env.js");

        expect(env.NODE_ENV).toBe("development");
        expect(env.PORT).toBe(3001);
        expect(env.JWT_SECRET).toBe("dev-secret-change-me");
        expect(env.PUBLISHER_JWT_SECRET).toBe("publisher-secret-change-me");
        expect(env.ADMIN_EMAIL).toBe("admin@mafia.local");

        vi.unstubAllEnvs();
    });

    it("uses environment variable when set", async () => {
        vi.stubEnv("JWT_SECRET", "my-real-secret");

        const { env } = await import("../config/env.js");

        expect(env.JWT_SECRET).toBe("my-real-secret");

        vi.unstubAllEnvs();
    });

    it("uses custom PORT when set", async () => {
        vi.stubEnv("PORT", "4000");

        const { env } = await import("../config/env.js");

        expect(env.PORT).toBe(4000);

        vi.unstubAllEnvs();
    });
});
