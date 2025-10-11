import React from "react";
import UiControlsButton from "./UiControlsButton";
import {
    Mic,
    MicOff,
    MessageCircle,
    PhoneMissed,
    Sparkles,
    Volume2,
    MonitorUp,
    ScreenShare as ScreenShareIcon,
} from "lucide-react";
import useUiControls from "./hooks/useUiControls";
import ChatWindow from "../TextChat/ChatWindow";
import CharacterButton from "./CharacterButton";
import { ScreenShareService } from "@/communication/screenShare/screenShare";

function UiControls() {
    const { changeSprite, micControls, toggleChatWindow, isChatWindowOpen } =
        useUiControls();
    const { isMuted, muteMic } = micControls();

    const handleScreenShare = async () => {
        try {
            await ScreenShareService.startScreenShare();
            console.log("Screen sharing started successfully");
        } catch (error) {
            console.error("Screen share error:", error);

            // ✅ Show user-friendly error message
            if (error instanceof Error) {
                if (error.name === "NotAllowedError") {
                    alert("Screen sharing permission denied");
                } else if (error.name === "NotFoundError") {
                    alert("No screen available to share");
                } else {
                    alert("Failed to start screen sharing");
                }
            }
        }
    };

    return (
        <div className="h-[var(--ui-controls-height)] w-full flex justify-between items-center bg-primary/80 px-5">
            <div className="controller-container flex gap-4">
                <CharacterButton />
                <UiControlsButton icon={Volume2} label={"Mute"} />
                <UiControlsButton
                    icon={PhoneMissed}
                    label={"Leave Call"}
                    color={"bg-red-600"}
                    round={true}
                    size={"large"}
                />
                <UiControlsButton
                    onClick={muteMic}
                    icon={isMuted ? MicOff : Mic}
                    label={"Mute"}
                />
                <UiControlsButton
                    onClick={handleScreenShare}
                    icon={ScreenShareIcon}
                    label={"Share Screen"}
                />
            </div>

            <div className="chat-buttons-container flex gap-4">
                <UiControlsButton
                    onClick={changeSprite}
                    icon={Sparkles}
                    label={"Change Sprite"}
                />
                <UiControlsButton
                    onClick={toggleChatWindow}
                    icon={MessageCircle}
                    label={"Chat"}
                />
            </div>

            <ChatWindow isChatWindowOpen={isChatWindowOpen} />
        </div>
    );
}

export default UiControls;
