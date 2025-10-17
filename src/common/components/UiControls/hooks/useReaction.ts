import usePlayersStore from "@/common/store/playerStore";
import { ReactionData } from "@/communication/reaction/_types";
import { ReactionService } from "@/communication/reaction/reaction";

function useReaction() {
    const localPlayer = usePlayersStore((state) => state.localPlayerId);
    const reactionService = ReactionService.getInstance();

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

    return {
        handleReact,
    };
}
export default useReaction;
