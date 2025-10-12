import React from "react";
import useUserStore from "@/common/store/useStore";
import { UserStore } from "@/common/store/_types";

function CharacterButton() {
    const user = useUserStore((state: UserStore) => state.user);

    return (
        <div className="container text-white font-light bg-neutral-800 p-2 rounded-xl w-40 flex items-center gap-7">
            <div
                className="character-container w-10 h-10 rounded-full border-solid border-green-500 border-2
                bg-center bg-contain bg-no-repeat bg-[url('/assets/characters/Characters/Soldier/Soldier/soldier-portrait.jpeg')]"
            ></div>

            {/* <Avatar className="w-10 h-10 bg-center rounded-full aspect-square"> */}
            {/*     <AvatarImage */}
            {/*         className="" */}
            {/*         src="/assets/characters/Characters/Soldier/Soldier/soldier-portrait.jpeg" */}
            {/*         alt="@shadcn" */}
            {/*     /> */}
            {/*     <AvatarFallback className="bg-black"> */}
            {/*         {user.name[0]} */}
            {/*     </AvatarFallback> */}
            {/* </Avatar> */}
            <div className="name flex flex-col">
                <span className="name-text text-sm font-extralight">
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
