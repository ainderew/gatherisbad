import { MediaTransportService } from "../mediaTransportService/mediaTransportServive";
import { ScreenShareEvents } from "./_enums";
import { Room } from "./_types";
import { Device } from "mediasoup-client";

export class ScreenShareService {
    private static _socket: SocketIOClient.Socket;
    static device: Device;
    static roomId: Room;
    static producer;
    static consumers;

    private static get socket(): SocketIOClient.Socket {
        if (!this._socket) {
            this._socket = MediaTransportService.getInstance().socket;
        }

        return this._socket;
    }

    public static async startScreenShare() {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                displaySurface: "monitor", // Hint preference (user can override)
                width: { max: 1920, ideal: 1920 },
                height: { max: 1080, ideal: 1080 },
                frameRate: { max: 30, ideal: 30 },
            },
            audio: {
                echoCancellation: true, // System audio if supported
                noiseSuppression: true,
                autoGainControl: false,
                // sampleRate: 44100
            },
        });

        this.socket.emit(ScreenShareEvents.startScreenShare, stream);

        return stream;
    }
}
