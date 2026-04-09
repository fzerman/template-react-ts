import { useRef } from "react";
import "./game/network/devConnect"; // registers window.devConnect + event logging
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import {
    UIOverlay,
    UITopLeft,
    UITopCenter,
    UITopRight,
    UILeft,
    UIRight,
    UIBottomLeft,
    UIBottomCenter,
    UIBottomRight,
} from "./components/UIOverlay";
import { PanelProvider } from "./context/PanelContext";
import { PanelLayer } from "./components/PanelLayer";
import { usePanel } from "./hooks/usePanel";
import { ToastProvider } from "./context/ToastContext";
import { ToastContainer } from "./components/ToastContainer";
import { useToast } from "./context/ToastContext";
import { ModalProvider } from "./components/ui/Modal";

function AppUI() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const { openPanel } = usePanel();
    const { addToast } = useToast();

    const currentScene = (_scene: Phaser.Scene) => {
        // hook for scene changes — add logic here as needed
    };

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

            <UIOverlay>
                <UITopLeft>
                    <button
                        className="ui-btn"
                        onClick={() => openPanel("Pause")}
                    >
                        Menu
                    </button>
                </UITopLeft>

                <UITopCenter>
                    <div className="ui-box">Rep: 0</div>
                </UITopCenter>

                <UITopRight>
                    <div className="ui-btn-group">
                        <button
                            className="ui-btn"
                            onClick={() => openPanel("Notifications")}
                        >
                            Intel
                        </button>
                        <button
                            className="ui-btn"
                            onClick={() => openPanel("Settings")}
                        >
                            Settings
                        </button>
                    </div>
                </UITopRight>

                <UILeft>
                    <div className="ui-btn-group ui-btn-group--vertical">
                        <div className="ui-box">Rackets</div>
                        <button
                            className="ui-btn"
                            onClick={() => openPanel("Components")}
                        >
                            UI Kit
                        </button>
                    </div>
                </UILeft>

                <UIRight>
                    <div className="ui-btn-group ui-btn-group--vertical">
                        <button
                            className="ui-btn"
                            onClick={() => openPanel("Market")}
                        >
                            Black Market
                        </button>
                        <button
                            className="ui-btn"
                            onClick={() => openPanel("MarketItemDetail")}
                        >
                            Item Detail
                        </button>
                    </div>
                </UIRight>

                <UIBottomLeft>
                    <button
                        className="ui-btn"
                        onClick={() => openPanel("Map")}
                    >
                        Map
                    </button>
                </UIBottomLeft>

                <UIBottomCenter>{/*      <ControlPad /> */}</UIBottomCenter>

                <UIBottomRight>
                    <button
                        className="ui-btn ui-btn--primary"
                        onClick={() =>
                            addToast({
                                variant: "success",
                                title: "Action Complete",
                                message: "Operation executed successfully.",
                            })
                        }
                    >
                        Action
                    </button>
                </UIBottomRight>
            </UIOverlay>

            <PanelLayer />
            <ToastContainer />
        </div>
    );
}

export default function App() {
    return (
        <ToastProvider>
            <ModalProvider>
                <PanelProvider>
                    <AppUI />
                </PanelProvider>
            </ModalProvider>
        </ToastProvider>
    );
}
