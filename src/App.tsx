import React, { useEffect, useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import AudioButton from "./common/components/AudioButton";
import UiControls from "./common/components/UiControls/UiControls";
import SplashScreen from "./common/components/Splash/SplashScreen";
import useUserStore from "./common/store/useStore";
import { User } from "./common/store/_types";
import { MediaTransportService } from "./communication/mediaTransportService/mediaTransportServive";
import ScreenShareUi from "./common/components/ScreenShare/ScreenShareUi";
import { ScreenShareService } from "./communication/screenShare/screenShare";

function App() {
    useEffect(() => {
        const transport = MediaTransportService.getInstance();
        transport.connect();

        // Optional: cleanup on unmount
        return () => {
            transport.disconnect();
        };
    }, []);

    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const currentScene = (scene: Phaser.Scene) => {
        if (scene.scene.key === "Game") {
            return true;
        }
        return false;
    };

    const setUser = useUserStore((state) => state.setUser);
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user: User = JSON.parse(storedUser);
            setUser(user);
        }
    }, [setUser]);

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
            <ScreenShareUi />
        </div>
    );
}

export default App;
