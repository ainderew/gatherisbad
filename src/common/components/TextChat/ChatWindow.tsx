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
            className={`chat-window h-[calc(100%-var(--ui-controls-height)+5px)] w-lg bg-primary/90 absolute right-0 top-0  ${isChatWindowOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out flex flex-col p-5 gap-4`}
        >
            <div className="chat-container w-full h-full border-2 border-amber-100 gap-2 overflow-hidden"></div>
            <Textarea className="bg-white text-black mt-auto" />
        </div>
    );
}

export default ChatWindow;
