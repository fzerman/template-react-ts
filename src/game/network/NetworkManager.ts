import { io, Socket } from 'socket.io-client';
import { EventBus } from '../EventBus';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
} from '../../../shared/NetworkEvents';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// ─── EventBus event names ───────────────────────────────────────────────────

export const NET = {
    STATUS_CHANGE:    'net:status',
    CONNECTED:        'net:connected',        // { userId }
    USER_DATA:        'net:user:data',         // UserData
    GLOBAL_STATE:     'net:global:state',      // GlobalState
    MARKET_UPDATE:    'net:market:update',      // MarketPrices
    NOTIFICATION:     'net:notification',       // GameNotification
} as const;

// ─── Singleton ──────────────────────────────────────────────────────────────

class NetworkManager {
    private socket: TypedSocket | null = null;
    private _status: ConnectionStatus = 'disconnected';
    private _userId: string | null = null;
    private serverUrl: string;
    private token: string | null = null;

    constructor(serverUrl?: string) {
        this.serverUrl = serverUrl ?? import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';
    }

    get status(): ConnectionStatus { return this._status; }
    get userId(): string | null { return this._userId; }

    setToken(token: string): void {
        this.token = token;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            this._userId = payload.userId ?? null;
        } catch {
            this._userId = null;
        }
    }

    connect(): void {
        if (this.socket?.connected) return;
        if (!this.token) {
            console.warn('[NetworkManager] No JWT token set');
            this.setStatus('error');
            return;
        }

        this.setStatus('connecting');

        this.socket = io(this.serverUrl, {
            auth: { token: this.token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        }) as TypedSocket;

        this.bindSocketEvents();
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.setStatus('disconnected');
    }

    // ── Client → Server ─────────────────────────────────────────────────

    syncUser(data: { balance: number; level: number }): void {
        this.socket?.emit('user:sync', data);
    }

    buyItem(itemId: string, quantity = 1): void {
        this.socket?.emit('market:buy', { itemId, quantity });
    }

    sellItem(itemId: string, quantity = 1): void {
        this.socket?.emit('market:sell', { itemId, quantity });
    }

    async ping(): Promise<number> {
        if (!this.socket?.connected) return -1;
        const start = Date.now();
        return new Promise((resolve) => {
            this.socket!.emit('ping', (_serverTime: number) => {
                resolve(Date.now() - start);
            });
        });
    }

    // ── Internal ────────────────────────────────────────────────────────

    private setStatus(status: ConnectionStatus): void {
        this._status = status;
        EventBus.emit(NET.STATUS_CHANGE, status);
    }

    private bindSocketEvents(): void {
        const s = this.socket!;

        s.on('connect', () => {
            console.log('[NetworkManager] connected', s.id);
            this.setStatus('connected');
        });

        s.on('disconnect', (reason) => {
            console.log('[NetworkManager] disconnected:', reason);
            this.setStatus('disconnected');
        });

        s.on('connect_error', (err) => {
            console.error('[NetworkManager] connection error:', err.message);
            this.setStatus('error');
        });

        s.on('connected', (data) => EventBus.emit(NET.CONNECTED, data));
        s.on('user:data', (data) => EventBus.emit(NET.USER_DATA, data));
        s.on('global:state', (data) => EventBus.emit(NET.GLOBAL_STATE, data));
        s.on('market:update', (data) => EventBus.emit(NET.MARKET_UPDATE, data));
        s.on('notification', (data) => EventBus.emit(NET.NOTIFICATION, data));
    }
}

export const networkManager = new NetworkManager();
