import { Panel } from "../Panel";

export function SettingsPanel() {
    return (
        <Panel title="Settings">
            <div className="settings-group">
                <h3 className="settings-group__title">Audio</h3>
                <div className="settings-row">
                    <span className="settings-row__label">Master Volume</span>
                    <input
                        type="range"
                        className="settings-slider"
                        min="0"
                        max="100"
                        defaultValue="80"
                    />
                </div>
                <div className="settings-row">
                    <span className="settings-row__label">Music</span>
                    <input
                        type="range"
                        className="settings-slider"
                        min="0"
                        max="100"
                        defaultValue="60"
                    />
                </div>
                <div className="settings-row">
                    <span className="settings-row__label">SFX</span>
                    <input
                        type="range"
                        className="settings-slider"
                        min="0"
                        max="100"
                        defaultValue="100"
                    />
                </div>
            </div>

            <div className="settings-group">
                <h3 className="settings-group__title">Display</h3>
                <div className="settings-row">
                    <span className="settings-row__label">Show FPS</span>
                    <label className="settings-toggle">
                        <input type="checkbox" />
                        <span className="settings-toggle__track" />
                    </label>
                </div>
                <div className="settings-row">
                    <span className="settings-row__label">Screen Shake</span>
                    <label className="settings-toggle">
                        <input type="checkbox" defaultChecked />
                        <span className="settings-toggle__track" />
                    </label>
                </div>
            </div>
        </Panel>
    );
}
