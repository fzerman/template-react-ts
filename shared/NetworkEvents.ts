// ─── Shared types used by both client and server ────────────────────────────
// All game logic runs on the client. Server is for data exchange only.

// ─── User / Economy ─────────────────────────────────────────────────────────

export interface UserData {
    userId: string;
    username: string;
    balance: number;
    level: number;
}

export interface MarketPrices {
    [itemId: string]: number;
}

export interface GlobalState {
    market: MarketPrices;
    serverTime: number;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'warning' | 'danger' | 'success';

export interface GameNotification {
    type: NotificationType;
    message: string;
    duration?: number;      // ms, default 3000
    data?: Record<string, unknown>;
}

// ─── Client → Server events ────────────────────────────────────────────────

export interface ClientToServerEvents {
    'user:sync': (data: Pick<UserData, 'balance' | 'level'>) => void;
    'market:buy': (data: { itemId: string; quantity: number }) => void;
    'market:sell': (data: { itemId: string; quantity: number }) => void;
    'ping': (cb: (serverTime: number) => void) => void;
}

// ─── Server → Client events ────────────────────────────────────────────────

export interface ServerToClientEvents {
    'user:data': (data: UserData) => void;
    'global:state': (data: GlobalState) => void;
    'market:update': (data: MarketPrices) => void;
    'notification': (data: GameNotification) => void;
    'connected': (data: { userId: string }) => void;
}

// ─── Inter-server events ───────────────────────────────────────────────────

export interface InterServerEvents {
    // placeholder
}

// ─── Socket data attached per connection ───────────────────────────────────

export interface SocketData {
    userId: string;
    username: string;
}
