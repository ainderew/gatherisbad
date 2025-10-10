import React from "react";
import UiControlsButton from "./UiControlsButton";
import {
    Mic,
    MicOff,
    MessageCircle,
    PhoneMissed,
    Sparkles,
    Volume2,
} from "lucide-react";
import useUiControls from "./hooks/useUiControls";
import ChatWindow from "../TextChat/ChatWindow";

function UiControls() {
    const { changeSprite, micControls, toggleChatWindow, isChatWindowOpen } =
        useUiControls();
    const { isMuted, muteMic } = micControls();
    return (
        <div className="h-[var(--ui-controls-height)] w-full flex justify-between items-center bg-primary/80 px-5">
            <div className="controller-container flex gap-4">
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
