import { useRef } from 'react';
import { IRefPhaserGame, PhaserGame } from './PhaserGame';
import {
    UIOverlay,
    UITopLeft, UITopCenter, UITopRight,
    UILeft, UIRight,
    UIBottomLeft, UIBottomCenter, UIBottomRight,
} from './components/UIOverlay';

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    const currentScene = (_scene: Phaser.Scene) => {
        // hook for scene changes — add logic here as needed
    };

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

            <UIOverlay>
                <UITopLeft />
                <UITopCenter />
                <UITopRight />
                <UILeft />
                <UIRight />
                <UIBottomLeft />
                <UIBottomCenter />
                <UIBottomRight />
            </UIOverlay>
        </div>
    );
}

export default App;
