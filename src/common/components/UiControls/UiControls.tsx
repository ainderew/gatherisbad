import React from "react";
import UiControlsButton from "./UiControlsButton";
import {
    Mic,
    MicOff,
    MessageCircle,
    PhoneMissed,
    VideoIcon,
    ScreenShare as ScreenShareIcon,
} from "lucide-react";
import useUiControls from "./hooks/useUiControls";
import ChatWindow from "../TextChat/ChatWindow";
import CharacterButton from "./CharacterButton";
import { ScreenShareService } from "@/communication/screenShare/screenShare";
import { ButtonSizeEnum, ColorEnum } from "./_enums";
import UiOnlineButton from "./UiOnlineButton";
import MembersUi from "../Members/MembersUi";
import { VideoChatService } from "@/communication/videoChat/videoChat";

function UiControls() {
    const {
        micControls,
        toggleChatWindow,
        isChatWindowOpen,
        toggleMembersUi,
        isMembersUiOpen,
    } = useUiControls();

    const { isMuted, toggleMic } = micControls();

    const handleScreenShare = async () => {
        try {
            const screenShare = ScreenShareService.getInstance();
            screenShare.startScreenShare();
            console.log("Screen sharing started successfully");
        } catch (error) {
            console.error("Screen share error:", error);

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

    const handleShareVideoCam = async () => {
        try {
            const screenShare = VideoChatService.getInstance();
            screenShare.startVideoChat();
            console.log("Screen sharing started successfully");
        } catch (error) {
            console.error("Screen share error:", error);

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
                <UiControlsButton
                    icon={PhoneMissed}
                    label={"Leave Call"}
                    round={true}
                    size={ButtonSizeEnum.large}
                />
                <UiControlsButton
                    onClick={handleShareVideoCam}
                    icon={VideoIcon}
                    label={"Share Video"}
                    size={ButtonSizeEnum.regular}
                />
                <UiControlsButton
                    onClick={toggleMic}
                    icon={isMuted ? MicOff : Mic}
                    label={"Mute Mic"}
                    color={isMuted ? ColorEnum.darkRed : ColorEnum.darkGreen}
                    textColor={isMuted ? ColorEnum.red : ColorEnum.green}
                />
                <UiControlsButton
                    onClick={handleScreenShare}
                    icon={ScreenShareIcon}
                    label={"Share Screen"}
                    size={ButtonSizeEnum.regular}
                />
            </div>

            <div className="chat-buttons-container flex gap-4">
                <UiOnlineButton onClick={toggleMembersUi} />
                <UiControlsButton
                    onClick={toggleChatWindow}
                    icon={MessageCircle}
                    label={"Chat"}
                />
            </div>

            <ChatWindow isChatWindowOpen={isChatWindowOpen} />
            <MembersUi
                isMembersUiOpen={isMembersUiOpen}
                onClose={toggleMembersUi}
            />
        </div>
    );
}

export default UiControls;
