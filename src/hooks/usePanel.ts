import { usePanelContext, PanelName } from '../context/PanelContext';

/**
 * Access the panel system from any React component.
 *
 * const { activePanel, openPanel, closePanel } = usePanel();
 * openPanel('Market');
 * closePanel();
 */
export function usePanel() {
    return usePanelContext();
}

export type { PanelName };
