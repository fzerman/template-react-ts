import { ReactNode } from 'react';
import { usePanel } from '../hooks/usePanel';

interface PanelProps {
    title: string;
    children: ReactNode;
    onClose?: () => void;
}

/**
 * Reusable panel shell — sticky header, scrollable body, close button.
 *
 * Usage:
 *   <Panel title="Market">
 *     <LoadingIndicator />        ← or any content
 *   </Panel>
 */
export function Panel({ title, children, onClose }: PanelProps) {
    const { closePanel } = usePanel();

    return (
        <div className="panel-content">
            <div className="panel-header">
                <h2 className="panel-title">{title}</h2>
                <button className="panel-close" onClick={onClose ?? closePanel}>✕</button>
            </div>
            <div className="gold-rule" />
            <div className="panel-body">
                {children}
            </div>
        </div>
    );
}
