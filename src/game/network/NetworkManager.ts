import { io, Socket } from 'socket.io-client';
import { EventBus } from '../EventBus';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    PlayerState,
} from '../../../shared/NetworkEvents';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// ─── EventBus event names (used by Phaser scenes + React components) ────────

export const NET = {
    // Connection lifecycle
    STATUS_CHANGE:      'net:status',           // ConnectionStatus
    // Player sync
    PLAYER_JOINED:      'net:player:joined',    // PlayerState
    PLAYER_LEFT:        'net:player:left',      // { id }
    PLAYER_UPDATED:     'net:player:updated',   // PlayerState
    PLAYERS_SNAPSHOT:   'net:players:snapshot',  // PlayerState[]
    // Game state
    GAME_STATE:         'net:game:state',        // GameState
    // Notifications
    NOTIFICATION:       'net:notification',      // GameNotification
    // Room
    ROOM_JOINED:        'net:room:joined',       // { roomId, players }
    ROOM_ERROR:         'net:room:error',        // { message }
} as const;

// ─── Singleton ──────────────────────────────────────────────────────────────

class NetworkManager {
    private socket: TypedSocket | null = null;
    private _status: ConnectionStatus = 'disconnected';
    private serverUrl: string;
    private token: string | null = null;
    private syncInterval: ReturnType<typeof setInterval> | null = null;
    private localPlayer: Pick<PlayerState, 'x' | 'y' | 'vx' | 'vy' | 'hp' | 'state'> | null = null;
    private lastSentPlayer: string | null = null; // JSON snapshot for dirty check

    constructor(serverUrl?: string) {
        this.serverUrl = serverUrl ?? import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';
    }

    // ── Public API ──────────────────────────────────────────────────────

    get status(): ConnectionStatus { return this._status; }

    /** Set JWT token. Must be called before connect(). */
    setToken(token: string): void {
        this.token = token;
    }

    /** Connect to the server with JWT auth. */
    connect(): void {
        if (this.socket?.connected) return;
        if (!this.token) {
            console.warn('[NetworkManager] No JWT token set — call setToken() first');
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

    /** Disconnect and clean up. */
    disconnect(): void {
        this.stopSync();
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.setStatus('disconnected');
    }

    /** Join a game room. */
    joinRoom(roomId: string): void {
        this.socket?.emit('room:join', { roomId });
    }

    /** Leave current room. */
    leaveRoom(): void {
        this.socket?.emit('room:leave');
    }

    /** Signal ready to start. */
    ready(): void {
        this.socket?.emit('game:ready');
    }

    /** Measure round-trip latency. Returns ms. */
    async ping(): Promise<number> {
        if (!this.socket?.connected) return -1;
        const start = Date.now();
        return new Promise((resolve) => {
            this.socket!.emit('ping', (_serverTime: number) => {
                resolve(Date.now() - start);
            });
        });
    }

    // ── Player sync ─────────────────────────────────────────────────────

    /** Start sending local player state at a fixed rate (default 15 Hz).
     *  Only sends when state has actually changed (dirty check). */
    startSync(hz = 15): void {
        this.stopSync();
        const interval = 1000 / hz;
        this.syncInterval = setInterval(() => {
            if (!this.localPlayer || !this.socket?.connected) return;

            const snapshot = JSON.stringify(this.localPlayer);
            if (snapshot === this.lastSentPlayer) return; // nothing changed

            this.lastSentPlayer = snapshot;
            this.socket.emit('player:sync', this.localPlayer);
        }, interval);
    }

    /** Stop sending player sync. */
    stopSync(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /** Update local player data (called from game loop). */
    updateLocalPlayer(data: Pick<PlayerState, 'x' | 'y' | 'vx' | 'vy' | 'hp' | 'state'>): void {
        this.localPlayer = data;
    }

    // ── Internal ────────────────────────────────────────────────────────

    private setStatus(status: ConnectionStatus): void {
        this._status = status;
        EventBus.emit(NET.STATUS_CHANGE, status);
    }

    private bindSocketEvents(): void {
        const s = this.socket!;

        // Connection lifecycle
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

        // Player sync
        s.on('player:joined', (data) => EventBus.emit(NET.PLAYER_JOINED, data));
        s.on('player:left', (data) => EventBus.emit(NET.PLAYER_LEFT, data));
        s.on('player:updated', (data) => EventBus.emit(NET.PLAYER_UPDATED, data));
        s.on('players:snapshot', (data) => EventBus.emit(NET.PLAYERS_SNAPSHOT, data));

        // Game state
        s.on('game:state', (data) => EventBus.emit(NET.GAME_STATE, data));

        // Notifications
        s.on('game:notification', (data) => EventBus.emit(NET.NOTIFICATION, data));

        // Room
        s.on('room:joined', (data) => EventBus.emit(NET.ROOM_JOINED, data));
        s.on('room:error', (data) => EventBus.emit(NET.ROOM_ERROR, data));
    }
}

// ── Export singleton ────────────────────────────────────────────────────────

export const networkManager = new NetworkManager();
