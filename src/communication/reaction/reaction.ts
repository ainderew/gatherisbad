import { MediaTransportService } from "../mediaTransportService/mediaTransportServive";
import { ReactionEventEnums } from "./_enums";
import usePlayersStore from "@/common/store/playerStore";
import { ReactionData } from "./_types";

export class ReactionService {
    public static instance: ReactionService;
    private sfuService: MediaTransportService;
    public uiUpdater: ((emojiData: ReactionData) => void) | null = null;

    constructor() {
        this.sfuService = MediaTransportService.getInstance();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ReactionService();
        }
        return this.instance;
    }

    public setupReactionListener() {
        this.sfuService.socket?.on(
            ReactionEventEnums.NEW_REACTION,
            (emojiData: ReactionData) => this.routeReactionToPlayer(emojiData),
        );
    }

    public sendReaction(emojiData: ReactionData) {
        this.sfuService.socket?.emit(
            ReactionEventEnums.SEND_REACTION,
            emojiData,
        );
    }

    public routeReactionToPlayer(emojiData: ReactionData) {
        const players = usePlayersStore.getState().playerMap;
        players[emojiData.playerId]?.showReactionTag(emojiData);
    }
}
