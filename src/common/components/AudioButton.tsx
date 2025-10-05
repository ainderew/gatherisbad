import { AudioChat } from "@/communication/audioChat/audioChat";
import { useEffect, useMemo, useState } from "react";

export default function AudioButton() {
    const [audioElements, setAudioElements] = useState<HTMLAudioElement[]>([]);

    const audioChat = useMemo(
        () =>
            new AudioChat((audioElement: HTMLAudioElement) =>
                setAudioElements((prev) => [audioElement, ...prev]),
            ),
        [],
    );

    useEffect(() => {
        audioChat.connectToServer();
        audioChat.joinVoiceChat();
        audioChat.watchNewProducers();

        return () => {
            audioChat.disconnectFromServer();
        };
    }, [audioChat]);

    useEffect(() => {
        for (const audioEl of audioElements) {
            if (!audioEl) continue;
            audioEl.muted = false;
            audioEl.play().catch(console.error);
        }
    }, [audioElements]);

    return null;
}
