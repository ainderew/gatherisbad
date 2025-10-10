import React, { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import AudioButton from "./common/components/AudioButton";
import UiControls from "./common/components/UiControls/UiControls";
import SplashScreen from "./common/components/Splash/SplashScreen";
import useUserStore from "./common/store/useStore";

function App() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const currentScene = (scene: Phaser.Scene) => {
        if (scene.scene.key === "Game") {
            return true;
        }
        return false;
    };

    const user = useUserStore((state) => state.user);

    if (!user.name) return <SplashScreen />;

    return (
        <div
            id="app"
            className="w-full h-full grow flex flex-col items-center justify-end bg-black"
        >
            <PhaserGame
                ref={phaserRef}
                currentActiveScene={currentScene}
                user={user}
            />
            <AudioButton />
            <UiControls />
        </div>
    );
}

export default App;
