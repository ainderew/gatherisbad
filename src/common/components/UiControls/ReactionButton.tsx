import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SmilePlus } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import useReaction from "./hooks/useReaction";

function ReactionButton() {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    function expnadEmojiContainer() {
        setIsExpanded((prev) => !prev);
    }

    const { handleReact } = useReaction();

    return (
        <div
            className={`relative flex cursor-pointer dark bg-neutral-700 h-9 text-white gap-4 rounded-md transition-all duration-200
                        ${isExpanded ? "overflow-auto w-105" : "overflow-hidden w-9"}`}
        >
            <div
                onClick={expnadEmojiContainer}
                className={`w-9 h-9 flex items-center absolute justify-center  hover:bg-neutral-100 hover:text-neutral-900 z-20`}
            >
                <SmilePlus size={18} />
            </div>

            {isExpanded && <Separator orientation="vertical" />}

            <div
                className={`expanded-emoji-container flex gap-2 transition-all duration-200 
                ${isExpanded ? "translate-x-9" : "-translate-x-190 absolute -z-10"}
                `}
            >
                <Button
                    onClick={() => handleReact("👍")}
                    className="text-lg bg-neutral-700 hover:bg-neutral-100 hover:text-neutral-900  h-9"
                    variant="default"
                >
                    👍
                </Button>
                <Button
                    onClick={() => handleReact("😂")}
                    className="text-lg bg-neutral-700 hover:bg-neutral-100 hover:text-neutral-900  h-9"
                    variant="default"
                >
                    😂
                </Button>
                <Button
                    onClick={() => handleReact("❤️")}
                    className="text-lg bg-neutral-700 hover:bg-neutral-100 hover:text-neutral-900  h-9"
                    variant="default"
                >
                    ❤️
                </Button>
                <Button
                    onClick={() => handleReact("🔥")}
                    className="text-lg bg-neutral-700 hover:bg-neutral-100 hover:text-neutral-900  h-9"
                    variant="default"
                >
                    🔥
                </Button>
                <Button
                    onClick={() => handleReact("🥷")}
                    className="text-xl bg-neutral-700 hover:bg-neutral-100 hover:text-neutral-900  h-9"
                    variant="default"
                >
                    🥷
                </Button>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            className="text-lg bg-neutral-700 hover:bg-neutral-100 hover:text-neutral-900  h-9"
                            variant="default"
                        >
                            🤚
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Raise Hand</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}

export default ReactionButton;
