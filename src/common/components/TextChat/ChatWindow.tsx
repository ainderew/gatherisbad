import React from "react";
import { Textarea } from "@/components/ui/textarea";

function ChatWindow({ isChatWindowOpen }: { isChatWindowOpen: boolean }) {
    //TODO: Fix focus on input when chat window opens
    // if(isChatWindowOpen) {
    //     useEffect(() => {
    //         const chatInput = document.getElementById("chat-input");
    //         if (chatInput) {
    //             chatInput.focus();
    //         }
    //     }, []);
    // }

    if (!isChatWindowOpen) {
        return null;
    }

    return (
        <div
            className={`chat-window h-[calc(100%-var(--ui-controls-height)+5px)] w-100 bg-primary/95 absolute right-0 top-0  ${isChatWindowOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out flex flex-col p-5 gap-4`}
        >
            <div className="chat-container w-full h-full gap-2 overflow-hidden"></div>
            <Textarea
                onKeyDown={(e) => {
                    e.stopPropagation(); // Prevent keys from reaching the game
                    // if (e.key === "Enter") {
                    //     sendMessage();
                    // }
                }}
                className="text-white mt-auto"
                placeholder="Message the team"
            />
        </div>
    );
}

export default ChatWindow;
