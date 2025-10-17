import usePlayersStore from "@/common/store/playerStore";
import { ReactionData } from "@/communication/reaction/_types";
import { ReactionService } from "@/communication/reaction/reaction";
import { useEffect, useState } from "react";

function useReaction() {
    const localPlayer = usePlayersStore((state) => state.localPlayerId);
    const reactionService = ReactionService.getInstance();

    const [isRaisingHand, setIsRaisingHand] = useState(false);
    const [handEmoji, setHandEmoji] = useState("🤚");

    useEffect(() => {
        if (isRaisingHand) {
            setHandEmoji("stop-raise-hand");
        } else {
            setHandEmoji("🤚");
        }
    }, [isRaisingHand]);

    function sendEmojiEvent(emoji: string) {
        const emojiData: ReactionData = {
            reaction: emoji,
            playerId: localPlayer!,
        };
        reactionService.sendReaction(emojiData);
    }

    function handleReact(emoji: string) {
        sendEmojiEvent(emoji);
    }

    function toggleRaiseHand() {
        setIsRaisingHand((prev) => !prev);
        handleReact(handEmoji);
    }

    return {
        handleReact,
        toggleRaiseHand,
        isRaisingHand,
        handEmoji,
    };
}
export default useReaction;
