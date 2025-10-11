import { ScreenShareService } from "@/communication/screenShare/screenShare";
import { useEffect } from "react";

function ScreenShareUi() {
    useEffect(() => {
        ScreenShareService.initialize();
    }, []);
    return null;
}

export default ScreenShareUi;
