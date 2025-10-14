import React, { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import AudioButton from "./common/components/AudioButton";
import UiControls from "./common/components/UiControls/UiControls";
import SplashScreen from "./common/components/Splash/SplashScreen";
import useUserStore from "./common/store/useStore";
import { User, UserStore } from "./common/store/_types";
import { MediaTransportService } from "./communication/mediaTransportService/mediaTransportServive";
import ScreenShareUi from "./common/components/ScreenShare/ScreenShareUi";
import { ScreenShareViewer } from "./communication/screenShare/screenShareViewer";
import VideoChatUi from "./common/components/VideoChat/VideoChatUi";
import { VideoChatViewer } from "./communication/videoChat/videoChatViewer";
import { TextChatService } from "./communication/textChat/textChat";

function App() {
    const [isInitialized, setIsInitialized] = useState(false);
    useEffect(() => {
        const init = async () => {
            const transport = MediaTransportService.getInstance();
            transport.connect();
            await transport.initializeSfu();

            const screenShare = ScreenShareViewer.getInstance();
            screenShare.loadExistingProducers();

            const videoChat = VideoChatViewer.getInstance();
            videoChat.loadExistingProducers();

            const textChat = TextChatService.getInstance();
            textChat.setupMessageListener();

            setIsInitialized(true);
        };

        init();
    }, []);

    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const currentScene = (scene: Phaser.Scene) => {
        if (scene.scene.key === "Game") {
            return true;
        }
        return false;
    };

    const setUser = useUserStore((state: UserStore) => state.setUser);
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user: User = JSON.parse(storedUser);
            setUser(user);
        }
    }, [setUser]);

    const user = useUserStore((state: UserStore) => state.user);

    if (!user.name) return <SplashScreen />;
    if (!isInitialized) return <div>Loading...</div>;

    return (
        <div
            id="app"
            className="w-full h-full grow flex flex-col items-center justify-end bg-black relative"
        >
            <PhaserGame
                ref={phaserRef}
                currentActiveScene={currentScene}
                user={user}
            />
            <AudioButton />
            <UiControls />
            <ScreenShareUi />
            <VideoChatUi />
        </div>
    );
}

export default App;
