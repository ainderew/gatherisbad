import React from "react";
import { Button } from "@/components/ui/button";
import { UsersRound } from "lucide-react";
import usePlayersStore from "@/common/store/playerStore";

function UiOnlineButton({ onClick }: { onClick: () => void }) {
    const playersMap = usePlayersStore((state) => state.playerMap);

    return (
        <Button
            onClick={onClick}
            variant="default"
            size="default"
            className="cursor-pointer bg-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 flex gap-2"
        >
            {<UsersRound />}
            <span className="">
                {Array.from(Object.keys(playersMap)).length} Online
            </span>

            <div className="circle w-2 h-2 bg-green-400 rounded-full" />
        </Button>
    );
}

export default UiOnlineButton;
