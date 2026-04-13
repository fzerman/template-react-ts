import { describe, it, expect, vi } from 'vitest';

vi.mock('socket.io-client', () => ({
    io: vi.fn(() => ({
        on: vi.fn(),
        emit: vi.fn(),
        disconnect: vi.fn(),
        connected: false,
    })),
}));

describe('DevTestPage', () => {
    it('exports DevTestPage component', async () => {
        const mod = await import('../DevTestPage');
        expect(mod.DevTestPage).toBeDefined();
        expect(typeof mod.DevTestPage).toBe('function');
    });
});
