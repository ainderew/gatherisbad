import { AudioChat } from "@/communication/audioChat/audioChat";
import { VideoChatService } from "@/communication/videoChat/videoChat";
import { useState } from "react";

function useUiControls() {
    const audioService = AudioChat.getInstance();
    const videoCamService = VideoChatService.getInstance();

    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const [isMembersUiOpen, setIsMembersUiOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(audioService.isMuted);
    const [isVideoOff, setIsVideoOff] = useState(true);

    function micControls() {
        function toggleMic() {
            setIsMuted((prev) => !prev);

            if (audioService.isMuted) {
                audioService.unMuteMic();
            } else {
                audioService.muteMic();
            }
        }

        return {
            isMuted,
            toggleMic,
        };
    }

    function videoCamControls() {
        function toggleVideoCam() {
            setIsVideoOff((prev) => !prev);
        }

        if (isVideoOff) {
            videoCamService.stopVideoChat();
        }

        return {
            isVideoOff,
            toggleVideoCam,
        };
    }

    function toggleChatWindow() {
        closeAll();
        setIsChatWindowOpen(!isChatWindowOpen);
    }

    function toggleMembersUi() {
        closeAll();
        setIsMembersUiOpen(!isMembersUiOpen);
    }

    function closeAll() {
        setIsMembersUiOpen(false);
        setIsChatWindowOpen(false);
    }

    return {
        micControls,
        videoCamControls,
        toggleMembersUi,
        isMembersUiOpen,
        toggleChatWindow,
        isChatWindowOpen,
    };
}

export default useUiControls;
