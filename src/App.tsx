import { useRef } from "react";
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

function AppUI() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const { openPanel } = usePanel();

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
                    <div className="ui-box">Score: 0</div>
                </UITopCenter>

                <UITopRight>
                    <button
                        className="ui-btn"
                        onClick={() => openPanel("Settings")}
                    >
                        Settings
                    </button>
                </UITopRight>

                <UILeft>
                    <div className="ui-box">Abilities</div>
                </UILeft>

                <UIRight>
                    <button
                        className="ui-btn"
                        onClick={() => openPanel("Market")}
                    >
                        Market
                    </button>
                </UIRight>

                <UIBottomLeft>
                    <button className="ui-btn">Map</button>
                </UIBottomLeft>

                <UIBottomCenter>{/*      <ControlPad /> */}</UIBottomCenter>

                <UIBottomRight>
                    <button className="ui-btn">Action</button>
                </UIBottomRight>
            </UIOverlay>

            <PanelLayer />
        </div>
    );
}

export default function App() {
    return (
        <PanelProvider>
            <AppUI />
        </PanelProvider>
    );
}
