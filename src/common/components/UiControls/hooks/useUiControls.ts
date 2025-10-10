import { useState } from "react";

function useUiControls() {
    const [isMuted, setIsMuted] = useState(false);
    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

    //TODO: make helper and enums for this
    function changeSprite() {
        console.log("Change Sprite");
        window.dispatchEvent(
            new CustomEvent("change-sprite", { detail: true }),
        );
    }

    function micControls() {
        function muteMic() {
            setIsMuted(!isMuted);
            // window.dispatchEvent(
            //     new CustomEvent("mute-mic", { detail: !isMuted }),
            // );
        }

        return {
            isMuted,
            muteMic,
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
