import { usePanel } from "../../hooks/usePanel";
import { Panel } from "../Panel";

export function PausePanel() {
    const { closePanel, openPanel } = usePanel();

    return (
        <Panel title="Paused">
            <div className="pause-menu">
                <button className="pause-menu__item" onClick={closePanel}>
                    Resume
                </button>
                <button
                    className="pause-menu__item"
                    onClick={() => openPanel("Settings")}
                >
                    Settings
                </button>
                <button className="pause-menu__item pause-menu__item--danger">
                    Quit to Menu
                </button>
            </div>
        </Panel>
    );
}
