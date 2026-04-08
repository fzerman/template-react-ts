// ─── Shared types used by both client and server ────────────────────────────
// This file has NO runtime imports so it can be consumed by either tsconfig.

// ─── Player Sync ────────────────────────────────────────────────────────────

export interface PlayerState {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    hp: number;
    maxHp: number;
    state: string;          // FSM state name
    name: string;
}

// ─── Game State ─────────────────────────────────────────────────────────────

export type GamePhase = 'lobby' | 'playing' | 'ended';

export interface GameState {
    phase: GamePhase;
    roomId: string;
    players: PlayerState[];
    tick: number;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'warning' | 'danger' | 'success';

export interface GameNotification {
    type: NotificationType;
    message: string;
    duration?: number;      // ms, default 3000
}

// ─── Client → Server events ────────────────────────────────────────────────

export interface ClientToServerEvents {
    'player:sync': (data: Pick<PlayerState, 'x' | 'y' | 'vx' | 'vy' | 'hp' | 'state'>) => void;
    'room:join': (data: { roomId: string }) => void;
    'room:leave': () => void;
    'game:ready': () => void;
    'ping': (cb: (serverTime: number) => void) => void;
}

// ─── Server → Client events ────────────────────────────────────────────────

export interface ServerToClientEvents {
    'player:joined': (data: PlayerState) => void;
    'player:left': (data: { id: string }) => void;
    'player:updated': (data: PlayerState) => void;
    'players:snapshot': (data: PlayerState[]) => void;
    'game:state': (data: GameState) => void;
    'game:notification': (data: GameNotification) => void;
    'room:joined': (data: { roomId: string; players: PlayerState[] }) => void;
    'room:error': (data: { message: string }) => void;
    'pong': (data: { serverTime: number }) => void;
}

// ─── Inter-server events (unused for now, required by socket.io typing) ────

export interface InterServerEvents {
    // placeholder
}

// ─── Socket data attached per connection ───────────────────────────────────

export interface SocketData {
    userId: string;
    username: string;
    roomId?: string;
}
