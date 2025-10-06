import React from "react";
import UiControlsButton from "./UiControlsButton";
import { Mic, PhoneMissed, Sparkles, Volume2 } from "lucide-react";
import useUiControls from "./hooks/useUiControls";

function UiControls() {
    const { changeSprite } = useUiControls();
    return (
        <div className="absolute bottom-0 h-14 w-full flex justify-between items-center bg-black/80 px-5">
            <div className="controller-container flex gap-3">
                <UiControlsButton icon={Volume2} label={"Mute"} />
                <UiControlsButton
                    icon={PhoneMissed}
                    label={"Leave Call"}
                    color={"bg-red-600"}
                    round={true}
                    size={"large"}
                />
                <UiControlsButton icon={Mic} label={"Mute"} />
            </div>

            <UiControlsButton
                onClick={changeSprite}
                icon={Sparkles}
                label={"Change Sprite"}
            />
        </div>
    );
}

export default UiControls;
