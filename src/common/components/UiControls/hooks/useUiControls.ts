import { AudioChat } from "@/communication/audioChat/audioChat";
import { useState } from "react";

function useUiControls() {
    const audioService = AudioChat.getInstance();

    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(audioService.isMuted);

    //TODO: make helper and enums for this
    function changeSprite() {
        window.dispatchEvent(
            new CustomEvent("change-sprite", { detail: true }),
        );
    }

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
    return {
        micControls,
        changeSprite,
        toggleChatWindow,
        isChatWindowOpen,
    };
}

export default useUiControls;
