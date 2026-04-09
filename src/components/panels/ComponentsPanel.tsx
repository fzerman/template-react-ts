import { Panel } from "../Panel";
import { CyButton } from "../ui/Button";
import { CyInput, CyTextarea, CySelect, CyCheckbox, CyRadio, CyToggle, CySlider } from "../ui/Input";
import { CyBadge } from "../ui/Badge";
import { useModal } from "../../context/ModalContext";
import { Row, Col } from "../ui/Grid";
import { useToast } from "../../context/ToastContext";

export function ComponentsPanel() {
    const { confirm, danger, info } = useModal();
    const { addToast } = useToast();

    return (
        <Panel title="Components">
            {/* ── Buttons ──────────────────────────── */}
            <h3 className="settings-group__title">Buttons</h3>

            <Row gap="sm" wrap>
                <Col span="auto">
                    <CyButton variant="default">Default</CyButton>
                </Col>
                <Col span="auto">
                    <CyButton variant="primary">Primary</CyButton>
                </Col>
                <Col span="auto">
                    <CyButton variant="danger">Danger</CyButton>
                </Col>
                <Col span="auto">
                    <CyButton variant="ghost">Ghost</CyButton>
                </Col>
            </Row>

            <Row gap="sm" align="center" wrap>
                <Col span="auto">
                    <CyButton size="sm">Small</CyButton>
                </Col>
                <Col span="auto">
                    <CyButton size="md">Medium</CyButton>
                </Col>
                <Col span="auto">
                    <CyButton size="lg">Large</CyButton>
                </Col>
            </Row>

            <Row gap="sm" wrap>
                <Col span="auto">
                    <CyButton loading>Loading</CyButton>
                </Col>
                <Col span="auto">
                    <CyButton disabled>Disabled</CyButton>
                </Col>
                <Col span="auto">
                    <CyButton variant="primary" icon={"\u26A1"}>
                        With Icon
                    </CyButton>
                </Col>
            </Row>

            <CyButton variant="primary" fullWidth>
                Full Width Button
            </CyButton>

            <div className="gold-rule" />

            {/* ── Badges ──────────────────────────── */}
            <h3 className="settings-group__title">Badges</h3>

            <Row gap="sm" align="center" wrap>
                <Col span="auto">
                    <CyBadge>Default</CyBadge>
                </Col>
                <Col span="auto">
                    <CyBadge variant="gold">Gold</CyBadge>
                </Col>
                <Col span="auto">
                    <CyBadge variant="orange">Orange</CyBadge>
                </Col>
                <Col span="auto">
                    <CyBadge variant="pink">Pink</CyBadge>
                </Col>
                <Col span="auto">
                    <CyBadge variant="dim">Dim</CyBadge>
                </Col>
            </Row>
            <Row gap="sm" align="center" wrap>
                <Col span="auto">
                    <CyBadge variant="gold" dot>With Dot</CyBadge>
                </Col>
                <Col span="auto">
                    <CyBadge variant="pink" dot>3 threats</CyBadge>
                </Col>
                <Col span="auto">
                    <CyBadge variant="orange" dot>Pending</CyBadge>
                </Col>
            </Row>

            <div className="gold-rule" />

            {/* ── Inputs ──────────────────────────── */}
            <h3 className="settings-group__title">Inputs</h3>

            <Row gap="md" wrap>
                <Col span={6} sm={6}>
                    <CyInput
                        label="Agent Name"
                        placeholder="Enter codename..."
                        hint="Your syndicate alias"
                    />
                </Col>
                <Col span={6} sm={6}>
                    <CyInput
                        label="Access Code"
                        type="password"
                        placeholder="Enter code..."
                    />
                </Col>
            </Row>

            <Row gap="md" wrap>
                <Col span={6} sm={6}>
                    <CyInput
                        label="Amount"
                        type="number"
                        placeholder="0"
                    />
                </Col>
                <Col span={6} sm={6}>
                    <CyInput
                        label="Contact"
                        type="email"
                        placeholder="agent@syndicate.net"
                        error="Invalid contact address"
                    />
                </Col>
            </Row>

            <CyTextarea
                label="Mission Briefing"
                placeholder="Describe the operation details..."
                rows={3}
            />

            <Row gap="md" wrap>
                <Col span={6} sm={6}>
                    <CySelect
                        label="District"
                        placeholder="Select zone..."
                        options={[
                            { value: "neon", label: "Neon Strip" },
                            { value: "port", label: "Port Sector" },
                            { value: "midtown", label: "Midtown" },
                            { value: "iron", label: "Iron Quarter" },
                            { value: "under", label: "Undercity" },
                        ]}
                    />
                </Col>
                <Col span={6} sm={6}>
                    <CySelect
                        label="Priority"
                        options={[
                            { value: "low", label: "Low" },
                            { value: "medium", label: "Medium" },
                            { value: "high", label: "High" },
                            { value: "critical", label: "Critical" },
                        ]}
                        defaultValue="medium"
                    />
                </Col>
            </Row>

            <div className="gold-rule" />

            {/* ── Toggles & Sliders ───────────────── */}
            <h3 className="settings-group__title">Toggles & Sliders</h3>

            <CyToggle label="Armed escort" defaultChecked />
            <CyToggle label="Silent approach" />
            <CyToggle label="Disabled option" disabled />

            <CySlider label="Risk Level" min={0} max={100} defaultValue={50} />
            <CySlider label="Crew Size" min={1} max={10} defaultValue={4} />

            <div className="gold-rule" />

            {/* ── Checkboxes & Radios ─────────────── */}
            <h3 className="settings-group__title">Checkboxes & Radios</h3>

            <Row gap="lg" wrap>
                <Col span="auto">
                    <CyCheckbox label="Armed escort" defaultChecked />
                </Col>
                <Col span="auto">
                    <CyCheckbox label="Silent approach" />
                </Col>
                <Col span="auto">
                    <CyCheckbox label="Disabled" disabled />
                </Col>
            </Row>

            <Row gap="lg" wrap>
                <Col span="auto">
                    <CyRadio name="time" label="Night Op" defaultChecked />
                </Col>
                <Col span="auto">
                    <CyRadio name="time" label="Day Op" />
                </Col>
                <Col span="auto">
                    <CyRadio name="time" label="Dawn Raid" />
                </Col>
            </Row>

            <div className="gold-rule" />

            {/* ── Modals ──────────────────────────── */}
            <h3 className="settings-group__title">Modals</h3>

            <Row gap="sm" wrap>
                <Col span="auto">
                    <CyButton
                        variant="primary"
                        onClick={() =>
                            confirm({
                                title: "Confirm Transfer",
                                message:
                                    "Transfer $12,000 to Ghost Circuit for the Plasma Pistol shipment?",
                                confirmLabel: "Transfer",
                                onConfirm: () =>
                                    addToast({
                                        variant: "success",
                                        title: "Transfer Sent",
                                        message: "$12,000 wired to Ghost Circuit.",
                                    }),
                            })
                        }
                    >
                        Confirm
                    </CyButton>
                </Col>
                <Col span="auto">
                    <CyButton
                        variant="danger"
                        onClick={() =>
                            danger({
                                title: "Abandon Mission?",
                                message:
                                    "All progress will be lost and your crew will scatter. This cannot be undone.",
                                confirmLabel: "Abandon",
                                cancelLabel: "Stay",
                                onConfirm: () =>
                                    addToast({
                                        variant: "error",
                                        title: "Mission Abandoned",
                                    }),
                            })
                        }
                    >
                        Danger
                    </CyButton>
                </Col>
                <Col span="auto">
                    <CyButton
                        variant="ghost"
                        onClick={() =>
                            info({
                                title: "Intel Received",
                                message:
                                    "Kurosawa Clan spotted moving weapons through Port Sector. Surveillance active.",
                                confirmLabel: "Acknowledged",
                            })
                        }
                    >
                        Info
                    </CyButton>
                </Col>
            </Row>

            <div className="gold-rule" />

            {/* ── Grid Demo ───────────────────────── */}
            <h3 className="settings-group__title">Grid Layout</h3>

            <Row gap="sm">
                <Col span={3}><div className="grid-demo-cell">3</div></Col>
                <Col span={3}><div className="grid-demo-cell">3</div></Col>
                <Col span={3}><div className="grid-demo-cell">3</div></Col>
                <Col span={3}><div className="grid-demo-cell">3</div></Col>
            </Row>
            <Row gap="sm">
                <Col span={4}><div className="grid-demo-cell">4</div></Col>
                <Col span={4}><div className="grid-demo-cell">4</div></Col>
                <Col span={4}><div className="grid-demo-cell">4</div></Col>
            </Row>
            <Row gap="sm">
                <Col span={3}><div className="grid-demo-cell">3</div></Col>
                <Col span={6}><div className="grid-demo-cell">6</div></Col>
                <Col span={3}><div className="grid-demo-cell">3</div></Col>
            </Row>
            <Row gap="sm">
                <Col span={2}><div className="grid-demo-cell">2</div></Col>
                <Col span={2}><div className="grid-demo-cell">2</div></Col>
                <Col span={2}><div className="grid-demo-cell">2</div></Col>
                <Col span={2}><div className="grid-demo-cell">2</div></Col>
                <Col span={2}><div className="grid-demo-cell">2</div></Col>
                <Col span={2}><div className="grid-demo-cell">2</div></Col>
            </Row>

            <div className="gold-rule" />

            {/* ── Toasts ──────────────────────────── */}
            <h3 className="settings-group__title">Toasts</h3>

            <Row gap="sm" wrap>
                <Col span="auto">
                    <CyButton size="sm" onClick={() => addToast({ variant: "success", title: "Success", message: "Operation completed." })}>
                        Success
                    </CyButton>
                </Col>
                <Col span="auto">
                    <CyButton size="sm" onClick={() => addToast({ variant: "warning", title: "Warning", message: "Threat level elevated." })}>
                        Warning
                    </CyButton>
                </Col>
                <Col span="auto">
                    <CyButton size="sm" variant="danger" onClick={() => addToast({ variant: "error", title: "Error", message: "Connection lost to safehouse." })}>
                        Error
                    </CyButton>
                </Col>
                <Col span="auto">
                    <CyButton size="sm" variant="ghost" onClick={() => addToast({ variant: "info", title: "Info", message: "New data incoming." })}>
                        Info
                    </CyButton>
                </Col>
            </Row>
        </Panel>
    );
}
