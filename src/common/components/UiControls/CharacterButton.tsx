import React, { useState } from "react";
import useUserStore from "@/common/store/useStore";
import { UserStore } from "@/common/store/_types";
import { AudioChat } from "@/communication/audioChat/audioChat";
import { AvailabilityStatus } from "@/game/player/_enums";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function CharacterButton() {
    const [focusState, setFocusState] = useState<AvailabilityStatus>(
        AvailabilityStatus.ONLINE,
    );
    const user = useUserStore((state: UserStore) => state.user);

    const audioChatService = AudioChat.getInstance();

    function toggleFocusMode() {
        if (focusState === AvailabilityStatus.ONLINE) {
            audioChatService.enableFocusMode();
            audioChatService.emitFocusModeChange();

            setFocusState(AvailabilityStatus.FOCUS);
        } else {
            audioChatService.disableFocusMode();
            audioChatService.emitFocusModeChange();
            setFocusState(AvailabilityStatus.ONLINE);
        }
    }

    return (
        <div className="container text-white font-light bg-neutral-800 p-2 rounded-xl w-40 flex items-center gap-7">
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={toggleFocusMode}
                        className={`character-container w-8 h-8 rounded-full border-solid outline-3 bg-no-repeat overflow-hidden cursor-pointer
                ${focusState === AvailabilityStatus.FOCUS ? "outline-amber-500 " : "outline-green-600"}`}
                        style={{
                            backgroundImage:
                                "url('/assets/characters/Characters/Adam/Adam_idle_16x16.png')",
                            backgroundSize: "auto 200%",
                            backgroundPosition: "-607px -16px",
                            imageRendering: "pixelated",
                        }}
                    />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Toggle focus mode</p>
                </TooltipContent>
            </Tooltip>

            <div className="name flex flex-col">
                <span className="name-text text-xs font-extralight">
                    {user.name}
                </span>
                <span className="name-text text-xs font-extralight">
                    Available
                </span>
            </div>
        </div>
    );
}
export default CharacterButton;
