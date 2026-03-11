import { usePanel } from '../../hooks/usePanel';
import { Panel } from '../Panel';

export function PausePanel() {
    const { closePanel } = usePanel();

    return (
        <Panel title="Paused">
            <p className="panel-placeholder">Game is paused.</p>
            <button className="ui-btn" onClick={closePanel}>Resume</button>
        </Panel>
    );
}
