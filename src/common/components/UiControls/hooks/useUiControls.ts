import { AudioChat } from "@/communication/audioChat/audioChat";
import { useState } from "react";

function useUiControls() {
    const audioService = AudioChat.getInstance();

    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const [isMembersUiOpen, setIsMembersUiOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(audioService.isMuted);

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

    function toggleChatWindow() {
        setIsChatWindowOpen(!isChatWindowOpen);
    }

    function toggleMembersUi() {
        setIsMembersUiOpen(!isMembersUiOpen);
    }

    return {
        micControls,
        toggleMembersUi,
        isMembersUiOpen,
        toggleChatWindow,
        isChatWindowOpen,
    };
}

export default useUiControls;
