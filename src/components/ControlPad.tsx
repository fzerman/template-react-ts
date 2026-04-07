import { useCallback } from 'react';
import { EventBus } from '../game/EventBus';

type Dir = 'up' | 'down' | 'left' | 'right';

const DIRS: Record<Dir, { dx: number; dy: number }> = {
    up:    { dx:  0, dy: -1 },
    down:  { dx:  0, dy:  1 },
    left:  { dx: -1, dy:  0 },
    right: { dx:  1, dy:  0 },
};

export function ControlPad() {
    const press = useCallback((dir: Dir) => {
        EventBus.emit('player:move', DIRS[dir]);
    }, []);

    const release = useCallback(() => {
        EventBus.emit('player:stop');
    }, []);

    const btn = (dir: Dir, label: string) => (
        <button
            className="ctrl-btn"
            onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                press(dir);
            }}
            onPointerUp={release}
            onPointerCancel={release}
        >
            {label}
        </button>
    );

    return (
        <div className="ctrl-pad">
            <div className="ctrl-row">
                {btn('up', '▲')}
            </div>
            <div className="ctrl-row">
                {btn('left', '◄')}
                <div className="ctrl-center" />
                {btn('right', '►')}
            </div>
            <div className="ctrl-row">
                {btn('down', '▼')}
            </div>
        </div>
    );
}
