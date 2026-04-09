/**
 * Test script — simulates a second player connecting and moving.
 *
 * Usage:
 *   node test-client.mjs [username] [roomId]
 *   node test-client.mjs Bot1 test-room
 */
import { io } from "socket.io-client";

const SERVER   = "http://localhost:3001";
const USERNAME = process.argv[2] || "Bot1";
const ROOM_ID  = process.argv[3] || "test-room";

// 1. Get dev token
const res = await fetch(`${SERVER}/api/v1/auth/dev-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME }),
});
const { token } = await res.json();
console.log(`[${USERNAME}] got token`);

// 2. Connect
const socket = io(SERVER, {
    auth: { token },
    transports: ["websocket"],
});

socket.on("connect", () => {
    console.log(`[${USERNAME}] connected (${socket.id})`);
    socket.emit("room:join", { roomId: ROOM_ID });
});

socket.on("room:joined", (data) => {
    console.log(`[${USERNAME}] joined room "${data.roomId}" with ${data.players.length} player(s)`);
});

socket.on("player:joined", (p) => {
    console.log(`[${USERNAME}] player joined: ${p.name} (${p.id})`);
});

socket.on("player:left", (p) => {
    console.log(`[${USERNAME}] player left: ${p.id}`);
});

socket.on("players:snapshot", (players) => {
    for (const p of players) {
        console.log(`[${USERNAME}] sees ${p.name} at (${Math.round(p.x)}, ${Math.round(p.y)}) state=${p.state}`);
    }
});

socket.on("game:notification", (n) => {
    console.log(`[${USERNAME}] notification [${n.type}]: ${n.message}`);
});

socket.on("disconnect", (reason) => {
    console.log(`[${USERNAME}] disconnected: ${reason}`);
});

socket.on("connect_error", (err) => {
    console.error(`[${USERNAME}] error: ${err.message}`);
});

// 3. Simulate movement — walk in a square
let x = 300, y = 300;
const waypoints = [
    { x: 300, y: 300 },
    { x: 600, y: 300 },
    { x: 600, y: 500 },
    { x: 300, y: 500 },
];
let wpIdx = 0;
const SPEED = 100; // px/sec

setInterval(() => {
    const target = waypoints[wpIdx];
    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
        wpIdx = (wpIdx + 1) % waypoints.length;
    } else {
        x += (dx / dist) * SPEED * 0.066; // ~15Hz interval
        y += (dy / dist) * SPEED * 0.066;
    }

    socket.emit("player:sync", {
        x, y, vx: dx, vy: dy, hp: 100, state: "Walking",
    });
}, 66); // ~15 Hz
