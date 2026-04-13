import { describe, it, expect, vi, beforeEach } from "vitest";
import { UniqueConstraintError, ValidationErrorItem } from "sequelize";

// Mock Player model
const mockPlayer = {
    id: "uuid-1",
    vendorId: "vendor_abc",
    username: "OldName",
    save: vi.fn(),
};

vi.mock("../db/models/index.js", () => ({
    Player: {
        findOrCreate: vi.fn(),
        findByPk: vi.fn(),
    },
}));

// Mock env
vi.mock("../config/env.js", () => ({
    env: {
        NODE_ENV: "development",
        JWT_SECRET: "test-secret",
        PUBLISHER_JWT_SECRET: "test-publisher-secret",
        JWT_ACCESS_EXPIRES_IN: "15m",
        JWT_REFRESH_EXPIRES_IN: "7d",
    },
}));

import { createServer, type Server } from "node:http";
import jwt from "jsonwebtoken";

describe("Unique username handling", () => {
    let server: Server;
    let baseUrl: string;
    let Player: typeof import("../db/models/index.js")["Player"];

    beforeEach(async () => {
        vi.clearAllMocks();
        const models = await import("../db/models/index.js");
        Player = models.Player;

        // Import app after mocks are set up
        const { default: app } = await import("../app.js");
        server = createServer(app);
        await new Promise<void>((resolve) => {
            server.listen(0, () => resolve());
        });
        const port = (server.address() as { port: number }).port;
        baseUrl = `http://127.0.0.1:${port}`;
    });

    it("returns 409 when findOrCreate hits duplicate username", async () => {
        vi.mocked(Player.findOrCreate).mockRejectedValueOnce(
            new UniqueConstraintError({
                errors: [new ValidationErrorItem("username must be unique", "unique violation", "username", "TakenName")],
            }),
        );

        const publisherToken = jwt.sign(
            { vendorId: "vendor_new", username: "TakenName" },
            "test-publisher-secret",
        );

        const res = await fetch(`${baseUrl}/api/v1/auth/connect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: publisherToken }),
        });

        expect(res.status).toBe(409);
        const body = await res.json();
        expect(body.error).toBe("Username already taken");

        server.close();
    });

    it("returns 409 when username update hits duplicate", async () => {
        const savingPlayer = { ...mockPlayer, save: vi.fn() };
        savingPlayer.save.mockRejectedValueOnce(
            new UniqueConstraintError({
                errors: [new ValidationErrorItem("username must be unique", "unique violation", "username", "TakenName")],
            }),
        );

        vi.mocked(Player.findOrCreate).mockResolvedValueOnce([savingPlayer as never, false]);

        const publisherToken = jwt.sign(
            { vendorId: "vendor_abc", username: "TakenName" },
            "test-publisher-secret",
        );

        const res = await fetch(`${baseUrl}/api/v1/auth/connect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: publisherToken }),
        });

        expect(res.status).toBe(409);
        const body = await res.json();
        expect(body.error).toBe("Username already taken");

        server.close();
    });

    it("succeeds when username is available", async () => {
        vi.mocked(Player.findOrCreate).mockResolvedValueOnce([mockPlayer as never, true]);

        const publisherToken = jwt.sign(
            { vendorId: "vendor_abc", username: "OldName" },
            "test-publisher-secret",
        );

        const res = await fetch(`${baseUrl}/api/v1/auth/connect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: publisherToken }),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.player.username).toBe("OldName");
        expect(body.accessToken).toBeDefined();

        server.close();
    });
});
