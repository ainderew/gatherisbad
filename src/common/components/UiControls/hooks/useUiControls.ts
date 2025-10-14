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
        toggleMembersUi,
        isMembersUiOpen,
        toggleChatWindow,
        isChatWindowOpen,
    };
}

export default useUiControls;
