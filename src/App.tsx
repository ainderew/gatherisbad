import React, { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import AudioButton from "./common/components/AudioButton";

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const currentScene = (scene: Phaser.Scene) => {
        if (scene.scene.key === "Game") {
            return true;
        }
        return false;
    };

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <AudioButton />
        </div>
    );
}

export default App;
