import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useUserStore from "@/common/store/useStore";

function SplashScreen() {
    const updateUser = useUserStore((state) => state.updateUser);
    const [name, setName] = useState("");

    function handleNameInput() {
        updateUser({ name });
    }
    return (
        <div className="splash galaxy-animated w-full h-full flex justify-center items-center text-white">
            <div className="z-10 flex w-full max-w-sm items-center gap-2">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Display Name"
                />
                <Button
                    className="text-black cursor-pointer"
                    type="submit"
                    variant="outline"
                    onClick={handleNameInput}
                >
                    Enter
                </Button>
            </div>
        </div>
    );
}

export default SplashScreen;
