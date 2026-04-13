import { useState, useRef, useCallback, useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    BalanceData,
    ConvertResult,
    TransactionHistoryResponse,
    ProductData,
} from '../../shared/NetworkEvents';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SERVER = 'http://localhost:3001';

interface LogEntry {
    id: number;
    time: string;
    dir: '→' | '←' | '⚡';
    event: string;
    data: unknown;
}

let logId = 0;

export function DevTestPage() {
    // ── State ────────────────────────────────────────────────────────────
    const [username, setUsername] = useState('TestPlayer');
    const [publisherToken, setPublisherToken] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [refreshToken, setRefreshToken] = useState('');
    const [socketStatus, setSocketStatus] = useState<string>('disconnected');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [balance, setBalance] = useState<BalanceData | null>(null);

    // Form state
    const [syncBalance, setSyncBalance] = useState('100');
    const [syncLevel, setSyncLevel] = useState('1');
    const [buyItemId, setBuyItemId] = useState('ammo');
    const [buyQty, setBuyQty] = useState('1');
    const [sellItemId, setSellItemId] = useState('ammo');
    const [sellQty, setSellQty] = useState('1');
    const [convertAmount, setConvertAmount] = useState('100');
    const [historyLimit, setHistoryLimit] = useState('20');
    const [historyOffset, setHistoryOffset] = useState('0');

    // Product form state
    const [purchaseProductId, setPurchaseProductId] = useState('');
    const [callbackPaymentId, setCallbackPaymentId] = useState('');
    const [callbackProviderRef, setCallbackProviderRef] = useState('test_ref_' + Date.now());
    const [callbackStatus, setCallbackStatus] = useState<'completed' | 'failed'>('completed');
    const [paymentSecret, setPaymentSecret] = useState('payment-callback-secret-change-me');

    const socketRef = useRef<TypedSocket | null>(null);
    const logContainerRef = useRef<HTMLDivElement | null>(null);

    const addLog = useCallback((dir: LogEntry['dir'], event: string, data: unknown) => {
        setLogs(prev => {
            const next = [...prev, {
                id: ++logId,
                time: new Date().toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 } as Intl.DateTimeFormatOptions),
                dir,
                event,
                data,
            }];
            return next.slice(-200); // keep last 200
        });
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        const el = logContainerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [logs]);

    // ── Auth Actions ─────────────────────────────────────────────────────

    const getDevToken = async () => {
        try {
            const res = await fetch(`${SERVER}/api/v1/auth/dev-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const data = await res.json();
            addLog('←', 'auth/dev-token', data);
            if (data.token) setPublisherToken(data.token);
        } catch (err) {
            addLog('⚡', 'auth/dev-token ERROR', (err as Error).message);
        }
    };

    const authConnect = async () => {
        try {
            const res = await fetch(`${SERVER}/api/v1/auth/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: publisherToken }),
            });
            const data = await res.json();
            addLog('←', 'auth/connect', data);
            if (data.accessToken) setAccessToken(data.accessToken);
            if (data.refreshToken) setRefreshToken(data.refreshToken);
        } catch (err) {
            addLog('⚡', 'auth/connect ERROR', (err as Error).message);
        }
    };

    const authRefresh = async () => {
        try {
            const res = await fetch(`${SERVER}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            const data = await res.json();
            addLog('←', 'auth/refresh', data);
            if (data.accessToken) setAccessToken(data.accessToken);
        } catch (err) {
            addLog('⚡', 'auth/refresh ERROR', (err as Error).message);
        }
    };

    const quickConnect = async () => {
        addLog('→', 'quickConnect', { username });
        try {
            // Step 1: Get dev token
            const r1 = await fetch(`${SERVER}/api/v1/auth/dev-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const d1 = await r1.json();
            setPublisherToken(d1.token);
            addLog('←', 'dev-token', { token: d1.token?.slice(0, 20) + '…' });

            // Step 2: Exchange for game tokens
            const r2 = await fetch(`${SERVER}/api/v1/auth/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: d1.token }),
            });
            const d2 = await r2.json();
            setAccessToken(d2.accessToken);
            setRefreshToken(d2.refreshToken);
            addLog('←', 'auth/connect', { player: d2.player });

            // Step 3: Connect socket
            connectSocket(d2.accessToken);
        } catch (err) {
            addLog('⚡', 'quickConnect ERROR', (err as Error).message);
        }
    };

    // ── Socket ───────────────────────────────────────────────────────────

    const connectSocket = (token?: string) => {
        if (socketRef.current?.connected) {
            addLog('⚡', 'socket', 'Already connected');
            return;
        }

        const tk = token || accessToken;
        if (!tk) {
            addLog('⚡', 'socket', 'No access token');
            return;
        }

        const socket = io(SERVER, {
            auth: { token: tk },
            transports: ['websocket', 'polling'],
        }) as TypedSocket;

        socket.on('connect', () => {
            setSocketStatus('connected');
            addLog('⚡', 'socket:connect', { id: socket.id });
        });

        socket.on('disconnect', (reason) => {
            setSocketStatus('disconnected');
            addLog('⚡', 'socket:disconnect', { reason });
        });

        socket.on('connect_error', (err) => {
            setSocketStatus('error');
            addLog('⚡', 'socket:connect_error', err.message);
        });

        // Server → Client events
        socket.on('connected', (data) => addLog('←', 'connected', data));
        socket.on('user:data', (data) => addLog('←', 'user:data', data));
        socket.on('global:state', (data) => addLog('←', 'global:state', data));
        socket.on('market:update', (data) => addLog('←', 'market:update', data));
        socket.on('notification', (data) => addLog('←', 'notification', data));
        socket.on('auth:error', (data) => addLog('←', 'auth:error', data));
        socket.on('balance:update', (data) => {
            setBalance(data);
            addLog('←', 'balance:update', data);
        });

        socketRef.current = socket;
        setSocketStatus('connecting');
    };

    const disconnectSocket = () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
        setSocketStatus('disconnected');
        setBalance(null);
    };

    // ── Socket Actions ───────────────────────────────────────────────────

    const emitPing = () => {
        const s = socketRef.current;
        if (!s?.connected) return;
        const start = Date.now();
        addLog('→', 'ping', {});
        s.emit('ping', (serverTime: number) => {
            addLog('←', 'ping response', { serverTime, rtt: Date.now() - start + 'ms' });
        });
    };

    const emitUserSync = () => {
        const s = socketRef.current;
        if (!s?.connected) return;
        const payload = { balance: Number(syncBalance), level: Number(syncLevel) };
        addLog('→', 'user:sync', payload);
        s.emit('user:sync', payload);
    };

    const emitMarketBuy = () => {
        const s = socketRef.current;
        if (!s?.connected) return;
        const payload = { itemId: buyItemId, quantity: Number(buyQty) };
        addLog('→', 'market:buy', payload);
        s.emit('market:buy', payload);
    };

    const emitMarketSell = () => {
        const s = socketRef.current;
        if (!s?.connected) return;
        const payload = { itemId: sellItemId, quantity: Number(sellQty) };
        addLog('→', 'market:sell', payload);
        s.emit('market:sell', payload);
    };

    const emitBalanceGet = () => {
        const s = socketRef.current;
        if (!s?.connected) return;
        addLog('→', 'balance:get', {});
        s.emit('balance:get', (data: BalanceData) => {
            setBalance(data);
            addLog('←', 'balance:get response', data);
        });
    };

    const emitBalanceConvert = () => {
        const s = socketRef.current;
        if (!s?.connected) return;
        const payload = { amount: Number(convertAmount) };
        addLog('→', 'balance:convert', payload);
        s.emit('balance:convert', payload, (data: ConvertResult | { error: string }) => {
            addLog('←', 'balance:convert response', data);
        });
    };

    const emitBalanceHistory = () => {
        const s = socketRef.current;
        if (!s?.connected) return;
        const payload = { limit: Number(historyLimit), offset: Number(historyOffset) };
        addLog('→', 'balance:history', payload);
        s.emit('balance:history', payload, (data: TransactionHistoryResponse) => {
            addLog('←', 'balance:history response', data);
        });
    };

    // ── Product Actions (REST) ─────────────────────────────────────────────

    const fetchProducts = async () => {
        try {
            addLog('→', 'GET /products', {});
            const res = await fetch(`${SERVER}/api/v1/products`);
            const data = await res.json();
            addLog('←', 'GET /products', data);
            if (data.products?.length > 0) {
                setPurchaseProductId(data.products[0].id);
            }
        } catch (err) {
            addLog('⚡', 'GET /products ERROR', (err as Error).message);
        }
    };

    const emitProductList = () => {
        const s = socketRef.current;
        if (!s?.connected) return;
        addLog('→', 'product:list', {});
        s.emit('product:list', (data: ProductData[]) => {
            addLog('←', 'product:list response', data);
            if (data.length > 0) {
                setPurchaseProductId(data[0].id);
            }
        });
    };

    const initiatePurchase = async () => {
        if (!accessToken) { addLog('⚡', 'purchase', 'No access token'); return; }
        try {
            const payload = { productId: purchaseProductId };
            addLog('→', 'POST /products/purchase', payload);
            const res = await fetch(`${SERVER}/api/v1/products/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            addLog('←', `POST /products/purchase (${res.status})`, data);
            if (data.paymentId) {
                setCallbackPaymentId(data.paymentId);
            }
        } catch (err) {
            addLog('⚡', 'POST /products/purchase ERROR', (err as Error).message);
        }
    };

    const sendPaymentCallback = async () => {
        try {
            const payload = {
                paymentId: callbackPaymentId,
                providerRef: callbackProviderRef,
                status: callbackStatus,
                providerData: { test: true, timestamp: Date.now() },
            };
            addLog('→', 'POST /payments/callback', payload);
            const res = await fetch(`${SERVER}/api/v1/payments/callback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Payment-Secret': paymentSecret,
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            addLog('←', `POST /payments/callback (${res.status})`, data);
        } catch (err) {
            addLog('⚡', 'POST /payments/callback ERROR', (err as Error).message);
        }
    };

    const fetchPaymentHistory = async () => {
        if (!accessToken) { addLog('⚡', 'payment history', 'No access token'); return; }
        try {
            addLog('→', 'GET /products/history', {});
            const res = await fetch(`${SERVER}/api/v1/products/history?limit=20&offset=0`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });
            const data = await res.json();
            addLog('←', `GET /products/history (${res.status})`, data);
        } catch (err) {
            addLog('⚡', 'GET /products/history ERROR', (err as Error).message);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────

    const statusColor = socketStatus === 'connected' ? '#0f0' : socketStatus === 'connecting' ? '#ff0' : '#f44';

    return (
        <div style={{
            padding: '24px',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            minHeight: '100vh',
            fontFamily: 'Rajdhani, sans-serif',
        }}>
            {/* ── Header ── */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '24px', color: 'var(--neon-gold)' }}>
                    DEV TEST
                </h1>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '4px',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '14px',
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
                    {socketStatus}
                </span>
                {balance && (
                    <span style={{
                        padding: '4px 12px', borderRadius: '4px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '14px',
                    }}>
                        Coins: {balance.coins} | Bills: {balance.bills}
                    </span>
                )}
            </div>

            {/* ── Left Column: Controls ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>

                {/* Quick Connect */}
                <Section title="Quick Connect">
                    <Row>
                        <Input label="Username" value={username} onChange={setUsername} />
                        <Btn onClick={quickConnect} color="#0f0">Connect All</Btn>
                    </Row>
                </Section>

                {/* Auth */}
                <Section title="Auth (REST)">
                    <Row>
                        <Input label="Username" value={username} onChange={setUsername} />
                        <Btn onClick={getDevToken}>Get Dev Token</Btn>
                    </Row>
                    <Row>
                        <Input label="Publisher Token" value={publisherToken} onChange={setPublisherToken} mono />
                        <Btn onClick={authConnect}>Auth Connect</Btn>
                    </Row>
                    <Row>
                        <Input label="Access Token" value={accessToken} onChange={setAccessToken} mono />
                    </Row>
                    <Row>
                        <Input label="Refresh Token" value={refreshToken} onChange={setRefreshToken} mono />
                        <Btn onClick={authRefresh}>Refresh</Btn>
                    </Row>
                </Section>

                {/* Socket */}
                <Section title="Socket.IO">
                    <Row>
                        <Btn onClick={() => connectSocket()} color="#0f0">Connect</Btn>
                        <Btn onClick={disconnectSocket} color="#f44">Disconnect</Btn>
                        <Btn onClick={emitPing}>Ping</Btn>
                    </Row>
                </Section>

                {/* user:sync */}
                <Section title="user:sync">
                    <Row>
                        <Input label="Balance" value={syncBalance} onChange={setSyncBalance} type="number" />
                        <Input label="Level" value={syncLevel} onChange={setSyncLevel} type="number" />
                        <Btn onClick={emitUserSync}>Send</Btn>
                    </Row>
                </Section>

                {/* market:buy */}
                <Section title="market:buy">
                    <Row>
                        <Select label="Item" value={buyItemId} onChange={setBuyItemId}
                            options={['ammo', 'armor', 'medkit', 'weapon_pistol', 'weapon_rifle']} />
                        <Input label="Qty" value={buyQty} onChange={setBuyQty} type="number" />
                        <Btn onClick={emitMarketBuy}>Buy</Btn>
                    </Row>
                </Section>

                {/* market:sell */}
                <Section title="market:sell">
                    <Row>
                        <Select label="Item" value={sellItemId} onChange={setSellItemId}
                            options={['ammo', 'armor', 'medkit', 'weapon_pistol', 'weapon_rifle']} />
                        <Input label="Qty" value={sellQty} onChange={setSellQty} type="number" />
                        <Btn onClick={emitMarketSell}>Sell</Btn>
                    </Row>
                </Section>

                {/* Balance */}
                <Section title="Balance">
                    <Row>
                        <Btn onClick={emitBalanceGet}>Get Balance</Btn>
                    </Row>
                    <Row>
                        <Input label="Bill Amount" value={convertAmount} onChange={setConvertAmount} type="number" />
                        <Btn onClick={emitBalanceConvert} color="var(--neon-orange)">Convert Bill→Coin</Btn>
                    </Row>
                    <Row>
                        <Input label="Limit" value={historyLimit} onChange={setHistoryLimit} type="number" />
                        <Input label="Offset" value={historyOffset} onChange={setHistoryOffset} type="number" />
                        <Btn onClick={emitBalanceHistory}>History</Btn>
                    </Row>
                </Section>

                {/* Products */}
                <Section title="Products (REST + Socket)">
                    <Row>
                        <Btn onClick={fetchProducts}>GET /products</Btn>
                        <Btn onClick={emitProductList}>Socket product:list</Btn>
                    </Row>
                    <Row>
                        <Input label="Product ID" value={purchaseProductId} onChange={setPurchaseProductId} mono />
                        <Btn onClick={initiatePurchase} color="var(--neon-orange)">Purchase</Btn>
                    </Row>
                    <Row>
                        <Btn onClick={fetchPaymentHistory}>Payment History</Btn>
                    </Row>
                </Section>

                {/* Payment Callback */}
                <Section title="Payment Callback (Provider Webhook)">
                    <Row>
                        <Input label="Payment ID" value={callbackPaymentId} onChange={setCallbackPaymentId} mono />
                    </Row>
                    <Row>
                        <Input label="Provider Ref" value={callbackProviderRef} onChange={setCallbackProviderRef} />
                        <Select label="Status" value={callbackStatus} onChange={(v) => setCallbackStatus(v as 'completed' | 'failed')}
                            options={['completed', 'failed']} />
                    </Row>
                    <Row>
                        <Input label="X-Payment-Secret" value={paymentSecret} onChange={setPaymentSecret} mono />
                    </Row>
                    <Row>
                        <Btn onClick={sendPaymentCallback} color="#0f0">Send Callback</Btn>
                    </Row>
                </Section>
            </div>

            {/* ── Right Column: Event Log ── */}
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 100px)' }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
                    borderRadius: '8px 8px 0 0', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none',
                }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Event Log
                    </span>
                    <Btn onClick={() => setLogs([])} color="#666" small>Clear</Btn>
                </div>
                <div
                    ref={logContainerRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0 0 8px 8px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        lineHeight: '1.6',
                    }}
                >
                    {logs.map(log => (
                        <div key={log.id} style={{
                            padding: '4px 10px',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            wordBreak: 'break-all',
                        }}>
                            <span style={{ color: '#666' }}>{log.time}</span>{' '}
                            <span style={{
                                color: log.dir === '→' ? '#4fc3f7' : log.dir === '←' ? '#81c784' : '#ffb74d',
                                fontWeight: 700,
                            }}>
                                {log.dir}
                            </span>{' '}
                            <span style={{ color: 'var(--neon-gold)', fontWeight: 600 }}>{log.event}</span>{' '}
                            <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                {JSON.stringify(log.data)}
                            </span>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#555' }}>
                            No events yet. Click "Connect All" to start.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Tiny UI primitives ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
        }}>
            <div style={{
                fontSize: '13px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '1px', marginBottom: '8px', color: 'var(--neon-gold)',
            }}>
                {title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {children}
            </div>
        </div>
    );
}

function Row({ children }: { children: React.ReactNode }) {
    return <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>{children}</div>;
}

function Input({ label, value, onChange, type = 'text', mono = false }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; mono?: boolean;
}) {
    return (
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            {label}
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: '#fff',
                    fontSize: '13px',
                    fontFamily: mono ? 'monospace' : 'inherit',
                    outline: 'none',
                    width: '100%',
                }}
            />
        </label>
    );
}

function Select({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
    return (
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            {label}
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                }}
            >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </label>
    );
}

function Btn({ onClick, children, color = 'var(--neon-gold)', small = false }: {
    onClick: () => void; children: React.ReactNode; color?: string; small?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'transparent',
                border: `1px solid ${color}`,
                color: color,
                borderRadius: '4px',
                padding: small ? '2px 8px' : '6px 14px',
                fontSize: small ? '11px' : '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontFamily: 'Rajdhani, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = `${color}22`)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
            {children}
        </button>
    );
}
