import { ReactNode } from 'react';

// ─── Zone components ──────────────────────────────────────────────────────────

interface ZoneProps { children?: ReactNode; }

export const UITopLeft     = ({ children }: ZoneProps) => <div className="ui-zone ui-top-left">{children}</div>;
export const UITopCenter   = ({ children }: ZoneProps) => <div className="ui-zone ui-top-center">{children}</div>;
export const UITopRight    = ({ children }: ZoneProps) => <div className="ui-zone ui-top-right">{children}</div>;
export const UILeft        = ({ children }: ZoneProps) => <div className="ui-zone ui-left">{children}</div>;
export const UIRight       = ({ children }: ZoneProps) => <div className="ui-zone ui-right">{children}</div>;
export const UIBottomLeft  = ({ children }: ZoneProps) => <div className="ui-zone ui-bottom-left">{children}</div>;
export const UIBottomCenter= ({ children }: ZoneProps) => <div className="ui-zone ui-bottom-center">{children}</div>;
export const UIBottomRight = ({ children }: ZoneProps) => <div className="ui-zone ui-bottom-right">{children}</div>;

// ─── Overlay wrapper ─────────────────────────────────────────────────────────

export function UIOverlay({ children }: { children?: ReactNode }) {
    return <div id="ui-overlay">{children}</div>;
}
