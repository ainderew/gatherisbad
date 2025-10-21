import { Player } from "@/game/player/player";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import React from "react";

function MemberItem({ player }: { player: Player }) {
    return (
        <div
            onClick={() => {}}
            className="member-item flex items-center gap-4 text-white hover:bg-neutral-600 px-4 py-2 rounded-lg"
        >
            <div className="avatar-online-container relative w-8 h-8">
                <div className="avatar-container overflow-hidden w-8 h-8 bg-center rounded-full aspect-square">
                    <Avatar className="">
                        <div
                            className="w-full h-full bg-no-repeat"
                            style={{
                                backgroundImage:
                                    "url('/assets/characters/Characters/Adam/Adam_idle_16x16.png')",
                                backgroundSize: "auto 200%",
                                backgroundPosition: "-575px -16px",
                                imageRendering: "pixelated",
                            }}
                        />
                        <AvatarFallback className="bg-black">
                            {player.name![0]}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="online-indicator w-2 h-2 bg-green-600 rounded-full absolute right-0 bottom-0 outline-neutral-900 outline-3 outline-solid" />
            </div>
            {player.name}
        </div>
    );
}
export default MemberItem;
