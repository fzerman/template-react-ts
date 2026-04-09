import { useEffect, useRef, useState } from 'react';
import { usePanelContext } from '../context/PanelContext';
import { PANEL_REGISTRY } from './panels';

type AnimState = 'closed' | 'open' | 'closing';

const CLOSE_DURATION = 250; // must match CSS animation duration

export function PanelLayer() {
    const { activePanel, closePanel } = usePanelContext();
    const [animState, setAnimState] = useState<AnimState>('closed');
    const [renderedPanel, setRenderedPanel] = useState(activePanel);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (activePanel) {
            // Cancel any in-flight close animation
            if (closeTimer.current) {
                clearTimeout(closeTimer.current);
                closeTimer.current = null;
            }
            setRenderedPanel(activePanel);
            setAnimState('open');
        } else if (animState === 'open') {
            // Begin exit animation, then unmount
            setAnimState('closing');
            closeTimer.current = setTimeout(() => {
                setAnimState('closed');
                setRenderedPanel(null);
                closeTimer.current = null;
            }, CLOSE_DURATION);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePanel]);

    if (animState === 'closed') return null;

    const PanelComponent = renderedPanel ? PANEL_REGISTRY[renderedPanel] : null;

    const layerClass = [
        'panel-layer',
        animState === 'open'    ? 'is-open'    : '',
        animState === 'closing' ? 'is-closing' : '',
    ].filter(Boolean).join(' ');

    return (
        <div id="panel-layer" className={layerClass}>
            <div className="panel-backdrop" onClick={closePanel} />
            <div className="panel-box">
                {PanelComponent && <PanelComponent />}
            </div>
        </div>
    );
}
