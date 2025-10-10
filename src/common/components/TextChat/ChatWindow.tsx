import React, { useEffect } from "react";

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
            className={`chat-window h-[calc(100%-var(--ui-controls-height)+5px)] w-lg bg-primary/90 absolute right-0 top-0  ${isChatWindowOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out`}
        >
            test
        </div>
    );
}

export default ChatWindow;
