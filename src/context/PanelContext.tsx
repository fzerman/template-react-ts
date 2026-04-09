import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EventBus } from '../game/EventBus';

// ─── Panel names ─────────────────────────────────────────────────────────────
export type PanelName = 'Market' | 'MarketItemDetail' | 'Settings' | 'Pause' | 'Map' | 'Notifications' | 'Components' | 'Inventory';

// ─── Event name constants (shared with Phaser scenes) ────────────────────────
export const PANEL_EVENTS = {
    OPEN:   'panel:open',
    CLOSE:  'panel:close',
    OPENED: 'panel:opened',
    CLOSED: 'panel:closed',
} as const;

// ─── Context shape ────────────────────────────────────────────────────────────
interface PanelContextValue {
    activePanel: PanelName | null;
    openPanel:   (name: PanelName) => void;
    closePanel:  () => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PanelProvider({ children }: { children: ReactNode }) {
    const [activePanel, setActivePanel] = useState<PanelName | null>(null);

    const openPanel = (name: PanelName) => {
        setActivePanel(name);
        EventBus.emit(PANEL_EVENTS.OPENED, name);
    };

    const closePanel = () => {
        setActivePanel(null);
        EventBus.emit(PANEL_EVENTS.CLOSED);
    };

    // Listen for open/close requests coming from Phaser scenes
    useEffect(() => {
        const onOpen = (name: PanelName) => openPanel(name);
        const onClose = () => closePanel();

        EventBus.on(PANEL_EVENTS.OPEN, onOpen);
        EventBus.on(PANEL_EVENTS.CLOSE, onClose);

        return () => {
            EventBus.removeListener(PANEL_EVENTS.OPEN, onOpen);
            EventBus.removeListener(PANEL_EVENTS.CLOSE, onClose);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <PanelContext.Provider value={{ activePanel, openPanel, closePanel }}>
            {children}
        </PanelContext.Provider>
    );
}

// ─── Internal hook (used by PanelLayer) ──────────────────────────────────────
export function usePanelContext() {
    const ctx = useContext(PanelContext);
    if (!ctx) throw new Error('usePanelContext must be used inside PanelProvider');
    return ctx;
}
