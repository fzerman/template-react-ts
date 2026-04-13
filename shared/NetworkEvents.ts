// ─── Shared types used by both client and server ────────────────────────────
// All game logic runs on the client. Server is for data exchange only.

// ─── User / Economy ─────────────────────────────────────────────────────────

export interface UserData {
    userId: string;
    username: string;
    balance: number;
    level: number;
}

export interface BalanceData {
    coins: number;
    bills: number;
}

export interface ConvertResult {
    coins: number;
    bills: number;
    fee: number;
    coinsReceived: number;
    feePercent: number;
}

export interface TransactionRecord {
    id: string;
    type: string;
    currency: "coin" | "bill";
    amount: number;
    fee: number;
    balanceBefore: number;
    balanceAfter: number;
    meta: Record<string, unknown> | null;
    createdAt: string;
}

export interface TransactionHistoryResponse {
    transactions: TransactionRecord[];
    total: number;
}

export interface ProductData {
    id: string;
    name: string;
    description: string;
    priceAmount: number;
    priceCurrency: string;
    coinAmount: number;
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export interface TaskRewardsData {
    coins?: number;
    bills?: number;
    repetition?: number;
}

export interface TaskData {
    id: string;
    templateId: string;
    name: string;
    description: string;
    rewards: TaskRewardsData;
    status: 'pending' | 'completed' | 'claimed';
    progress: Record<string, unknown> | null;
    createdAt: string;
    completedAt: string | null;
    claimedAt: string | null;
}

export interface TaskClaimResult {
    task: TaskData;
    balance: BalanceData;
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
    'balance:get': (cb: (data: BalanceData) => void) => void;
    'balance:convert': (data: { amount: number }, cb: (data: ConvertResult | { error: string }) => void) => void;
    'balance:history': (data: { limit?: number; offset?: number }, cb: (data: TransactionHistoryResponse) => void) => void;
    'product:list': (cb: (data: ProductData[]) => void) => void;
}

// ─── Server → Client events ────────────────────────────────────────────────

export interface ServerToClientEvents {
    'user:data': (data: UserData) => void;
    'global:state': (data: GlobalState) => void;
    'market:update': (data: MarketPrices) => void;
    'notification': (data: GameNotification) => void;
    'connected': (data: { userId: string }) => void;
    'auth:error': (data: { message: string }) => void;
    'balance:update': (data: BalanceData) => void;
    'task:new': (data: TaskData) => void;
    'task:update': (data: TaskData) => void;
}

// ─── Inter-server events ───────────────────────────────────────────────────

export interface InterServerEvents {
    // placeholder
}

// ─── Socket data attached per connection ───────────────────────────────────

export interface SocketData {
    userId: string;
    vendorId: string;
    username: string;
}
