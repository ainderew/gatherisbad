import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useUserStore from "@/common/store/useStore";
import { UserStore } from "@/common/store/_types";

function SplashScreen() {
    const updateUser = useUserStore((state: UserStore) => state.updateUser);
    const [name, setName] = useState("");

    function handleNameInput() {
        updateUser({ name });
        localStorage.setItem("user", JSON.stringify({ name }));
    }
    return (
        <div className="splash galaxy-animated w-full h-full flex justify-center items-center text-white">
            <div className="z-10 flex w-full max-w-sm items-center gap-2">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleNameInput();
                        }
                    }}
                    type="text"
                    maxLength={13}
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
