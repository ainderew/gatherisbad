import React from "react";
import useUserStore from "@/common/store/useStore";
import { UserStore } from "@/common/store/_types";

function CharacterButton() {
    const user = useUserStore((state: UserStore) => state.user);

    return (
        <div className="container text-white font-light bg-neutral-800 p-2 rounded-xl w-40 flex items-center gap-7">
            <div
                className="character-container w-8 h-8 rounded-full border-solid border-green-500 border-2
    bg-no-repeat overflow-hidden"
                style={{
                    backgroundImage:
                        "url('/assets/characters/Characters/Adam/Adam_idle_16x16.png')",
                    backgroundSize: "auto 200%",
                    backgroundPosition: "-588px -16px",
                    imageRendering: "pixelated",
                }}
            />
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
