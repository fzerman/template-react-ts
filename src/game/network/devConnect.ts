import { networkManager, NET } from './NetworkManager';
import { EventBus } from '../EventBus';

const SERVER = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

/**
 * Dev helper — fetches a JWT, connects to the server.
 * Call from browser console: `window.devConnect('MyName')`
 */
export async function devConnect(username = 'Player1'): Promise<void> {
    if (networkManager.status === 'connected') {
        console.log('[devConnect] already connected');
        return;
    }

    const res = await fetch(`${SERVER}/api/v1/auth/dev-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
    });
    const { token } = await res.json();
    console.log('[devConnect] got token');

    networkManager.setToken(token);
    networkManager.connect();
}

// Auto-connect when Game scene is ready (dev only)
EventBus.on('current-scene-ready', (scene: Phaser.Scene) => {
    if (scene.scene.key === 'Game' && networkManager.status === 'disconnected') {
        const name = 'Player_' + Math.random().toString(36).slice(2, 6);
        devConnect(name);
    }
});

// Log network events to console
for (const evt of Object.values(NET)) {
    EventBus.on(evt, (...args: unknown[]) => {
        console.log(`[NET] ${evt}`, ...args);
    });
}

if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).devConnect = devConnect;
    (window as unknown as Record<string, unknown>).networkManager = networkManager;
}
