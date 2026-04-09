import { Panel } from "../Panel";
import { CyToggle, CySlider, CySelect } from "../ui/Input";
import { Row, Col } from "../ui/Grid";

export function SettingsPanel() {
    return (
        <Panel title="Settings">
            <div className="settings-group">
                <h3 className="settings-group__title">Audio</h3>
                <CySlider label="Master Volume" min={0} max={100} defaultValue={80} />
                <CySlider label="Music" min={0} max={100} defaultValue={60} />
                <CySlider label="SFX" min={0} max={100} defaultValue={100} />
            </div>

            <div className="settings-group">
                <h3 className="settings-group__title">Display</h3>
                <CyToggle label="Show FPS" />
                <CyToggle label="Screen Shake" defaultChecked />
                <CyToggle label="Damage Numbers" defaultChecked />
            </div>

            <div className="settings-group">
                <h3 className="settings-group__title">Controls</h3>
                <Row gap="md" align="end" wrap>
                    <Col span={6}>
                        <CySelect
                            label="Movement"
                            options={[
                                { value: "wasd", label: "WASD" },
                                { value: "arrows", label: "Arrow Keys" },
                                { value: "dpad", label: "Touch D-Pad" },
                            ]}
                            defaultValue="wasd"
                        />
                    </Col>
                    <Col span={6}>
                        <CySelect
                            label="Language"
                            options={[
                                { value: "en", label: "English" },
                                { value: "tr", label: "Turkish" },
                                { value: "ja", label: "Japanese" },
                                { value: "es", label: "Spanish" },
                            ]}
                            defaultValue="en"
                        />
                    </Col>
                </Row>
            </div>
        </Panel>
    );
}
