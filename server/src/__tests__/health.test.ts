import { describe, it, expect, afterAll } from "vitest";
import { createServer, type Server } from "node:http";
import app from "../app.js";

let server: Server;
let baseUrl: string;

afterAll(() => {
    server?.close();
});

describe("GET /health", () => {
    it("returns 200 with status ok", async () => {
        server = createServer(app);
        await new Promise<void>((resolve) => {
            server.listen(0, () => resolve());
        });

        const port = (server.address() as { port: number }).port;
        baseUrl = `http://127.0.0.1:${port}`;

        const res = await fetch(`${baseUrl}/health`);
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(body).toEqual({ status: "ok" });
    });
});
