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
    AUTH_ERROR:       'net:auth:error',         // { message }
} as const;

// ─── Singleton ──────────────────────────────────────────────────────────────

class NetworkManager {
    private socket: TypedSocket | null = null;
    private _status: ConnectionStatus = 'disconnected';
    private _userId: string | null = null;
    private serverUrl: string;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor(serverUrl?: string) {
        this.serverUrl = serverUrl ?? import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';
    }

    get status(): ConnectionStatus { return this._status; }
    get userId(): string | null { return this._userId; }

    /**
     * Authenticate with the server using a publisher JWT.
     * Calls POST /api/v1/auth/connect to exchange it for game tokens, then connects the socket.
     */
    async authenticate(publisherToken: string): Promise<void> {
        this.setStatus('connecting');

        try {
            const res = await fetch(`${this.serverUrl}/api/v1/auth/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: publisherToken }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error((body as { error?: string }).error || `Auth failed (${res.status})`);
            }

            const data = await res.json() as {
                accessToken: string;
                refreshToken: string;
                player: { id: string; vendorId: string; username: string };
            };

            this.accessToken = data.accessToken;
            this.refreshToken = data.refreshToken;
            this._userId = data.player.id;

            this.connectSocket();
        } catch (err) {
            console.error('[NetworkManager] auth failed:', err);
            this.setStatus('error');
            EventBus.emit(NET.AUTH_ERROR, { message: (err as Error).message });
        }
    }

    /** @deprecated Use authenticate() instead. Kept for dev/testing convenience. */
    setToken(token: string): void {
        this.accessToken = token;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            this._userId = payload.userId ?? null;
        } catch {
            this._userId = null;
        }
    }

    /** @deprecated Use authenticate() instead. */
    connect(): void {
        this.connectSocket();
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.accessToken = null;
        this.refreshToken = null;
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

    private connectSocket(): void {
        if (this.socket?.connected) return;
        if (!this.accessToken) {
            console.warn('[NetworkManager] No access token');
            this.setStatus('error');
            return;
        }

        this.setStatus('connecting');

        this.socket = io(this.serverUrl, {
            auth: { token: this.accessToken },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        }) as TypedSocket;

        this.bindSocketEvents();
    }

    private async refreshAccessToken(): Promise<boolean> {
        if (!this.refreshToken) return false;

        try {
            const res = await fetch(`${this.serverUrl}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken }),
            });

            if (!res.ok) return false;

            const data = await res.json() as { accessToken: string };
            this.accessToken = data.accessToken;
            return true;
        } catch {
            return false;
        }
    }

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

        s.on('connect_error', async (err) => {
            console.error('[NetworkManager] connection error:', err.message);

            // Try refreshing token on auth errors
            if (err.message.includes('expired') || err.message.includes('Invalid')) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Tear down old socket without clearing tokens
                    this.socket?.removeAllListeners();
                    this.socket?.disconnect();
                    this.socket = null;
                    this.connectSocket();
                    return;
                }
            }

            this.setStatus('error');
        });

        s.on('connected', (data) => EventBus.emit(NET.CONNECTED, data));
        s.on('user:data', (data) => EventBus.emit(NET.USER_DATA, data));
        s.on('global:state', (data) => EventBus.emit(NET.GLOBAL_STATE, data));
        s.on('market:update', (data) => EventBus.emit(NET.MARKET_UPDATE, data));
        s.on('notification', (data) => EventBus.emit(NET.NOTIFICATION, data));
        s.on('auth:error', (data) => EventBus.emit(NET.AUTH_ERROR, data));
    }
}

export const networkManager = new NetworkManager();
