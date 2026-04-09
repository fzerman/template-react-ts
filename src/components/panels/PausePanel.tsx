import { usePanel } from "../../hooks/usePanel";
import { useModal } from "../../context/ModalContext";
import { Panel } from "../Panel";
import { CyButton } from "../ui/Button";
import { Row, Col } from "../ui/Grid";

export function PausePanel() {
    const { closePanel, openPanel } = usePanel();
    const { danger } = useModal();

    return (
        <Panel title="Paused">
            <Row gap="none">
                <Col span={12}>
                    <CyButton variant="primary" fullWidth onClick={closePanel}>
                        Resume
                    </CyButton>
                </Col>
            </Row>
            <Row gap="none">
                <Col span={12}>
                    <CyButton
                        variant="ghost"
                        fullWidth
                        onClick={() => openPanel("Settings")}
                    >
                        Settings
                    </CyButton>
                </Col>
            </Row>
            <Row gap="none">
                <Col span={12}>
                    <CyButton
                        variant="danger"
                        fullWidth
                        onClick={() =>
                            danger({
                                title: "Quit to Menu?",
                                message:
                                    "All unsaved progress will be lost. This cannot be undone.",
                                confirmLabel: "Quit",
                                cancelLabel: "Stay",
                            })
                        }
                    >
                        Quit to Menu
                    </CyButton>
                </Col>
            </Row>
        </Panel>
    );
}
