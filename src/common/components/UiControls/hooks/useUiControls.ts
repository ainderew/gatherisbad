import { AudioChat } from "@/communication/audioChat/audioChat";
import { VideoChatService } from "@/communication/videoChat/videoChat";
import { useState } from "react";

function useUiControls() {
    const audioService = AudioChat.getInstance();
    const videoCamService = VideoChatService.getInstance();

    const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);
    const [isMembersUiOpen, setIsMembersUiOpen] = useState(false);
    const [isCalendarUiOpen, setIsCalendarUiOpen] = useState(false);
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
            if (!isVideoOff) {
                videoCamService.stopVideoChat();
            }
        }

        return {
            isVideoOff,
            toggleVideoCam,
        };
    }

    function toggleChatWindow() {
        closeAllExcluding("chat");
        setIsChatWindowOpen((prev) => !prev);
    }

    function toggleMembersUi() {
        closeAllExcluding("members");
        setIsMembersUiOpen((prev) => !prev);
    }

    function toggleCalendarMenu() {
        closeAllExcluding("calendar");
        setIsCalendarUiOpen((prev) => !prev);
    }

    //TODO: refactor to use a single state variable make more scalable
    function closeAllExcluding(exlcuded: string) {
        switch (exlcuded) {
            case "chat":
                setIsChatWindowOpen((prev) => prev);
                setIsMembersUiOpen(false);
                setIsCalendarUiOpen(false);

                break;
            case "members":
                setIsMembersUiOpen((prev) => prev);
                setIsChatWindowOpen(false);
                setIsCalendarUiOpen(false);
                break;
            case "calendar":
                setIsCalendarUiOpen((prev) => prev);
                setIsMembersUiOpen(false);
                setIsChatWindowOpen(false);

                break;
        }
    }

    return {
        micControls,
        videoCamControls,
        toggleMembersUi,
        isMembersUiOpen,
        toggleChatWindow,
        isChatWindowOpen,

        toggleCalendarMenu,
        isCalendarUiOpen,
    };
}

export default useUiControls;
