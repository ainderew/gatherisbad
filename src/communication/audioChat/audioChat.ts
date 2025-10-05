import { CONFIG } from "@/common/utils/config";
import io from "socket.io-client";
import { Device } from "mediasoup-client";
import {
    RtpCapabilities,
    TransportOptions,
    DtlsParameters,
    RtpParameters,
    Transport,
} from "mediasoup-client/types";

interface ConsumerServerResponse {
    id: string;
    producerId: string;
    kind: "audio" | "video";
    rtpParameters: RtpParameters;
}

export class AudioChat {
    socket: SocketIOClient.Socket = io(CONFIG.SFU_SERVER_URL, {
        autoConnect: false,
    });

    device: Device | null = null;
    sendTransport: Transport | null = null;
    recvTransport: Transport | null = null;

    constructor() {
        console.log("AudioChat initialized");
        this.device = new Device();
    }

    public connectToServer() {
        this.socket.connect();
    }

    public disconnectFromServer() {
        this.socket.disconnect();
    }

    public async joinVoiceChat() {
        await this.initializeRtpCapabilities();

        const sendTransportInfo: TransportOptions = await new Promise(
            (resolve) => {
                this.socket.emit("createTransport", { type: "send" }, resolve);
            },
        );

        this.sendTransport =
            this.device!.createSendTransport(sendTransportInfo);

        this.sendTransport.on(
            "connect",
            async (
                { dtlsParameters }: { dtlsParameters: DtlsParameters },
                callback: () => void,
                errback: (err: Error) => void,
            ) => {
                try {
                    await new Promise((resolve) => {
                        this.socket.emit(
                            "connectTransport",
                            {
                                transportId: this.sendTransport!.id,
                                dtlsParameters,
                            },
                            resolve,
                        );
                    });
                    callback();
                } catch (err) {
                    errback(err as Error);
                }
            },
        );

        this.sendTransport.on(
            "produce",
            async (
                {
                    kind,
                    rtpParameters,
                }: { kind: "audio" | "video"; rtpParameters: RtpParameters },
                callback: (data: { id: string }) => void,
                errback: (err: Error) => void,
            ) => {
                try {
                    const { id } = await new Promise<{ id: string }>(
                        (resolve) =>
                            this.socket.emit(
                                "produce",
                                {
                                    kind,
                                    rtpParameters,
                                    transportId: this.sendTransport!.id,
                                },
                                resolve,
                            ),
                    );
                    callback({ id });
                } catch (err) {
                    errback(err as Error);
                }
            },
        );

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        const [audioTrack] = stream.getAudioTracks();

        await this.sendTransport.produce({ track: audioTrack });

        console.log("MF YOU Joined voice chat - now producing audio");
    }

    public async watchNewProducers() {
        this.socket.on("newProducer", async (data: { producerId: string }) => {
            console.log("new producer detected:", data.producerId);

            try {
                if (!this.recvTransport) {
                    const recvTransportInfo: TransportOptions =
                        await new Promise((resolve) => {
                            this.socket.emit(
                                "createTransport",
                                { type: "recv" },
                                resolve,
                            );
                        });

                    this.recvTransport =
                        this.device!.createRecvTransport(recvTransportInfo);

                    this.recvTransport.on(
                        "connect",
                        async (
                            {
                                dtlsParameters,
                            }: { dtlsParameters: DtlsParameters },
                            callback: () => void,
                            errback: (err: Error) => void,
                        ) => {
                            try {
                                await new Promise((resolve) => {
                                    this.socket.emit(
                                        "connectTransport",
                                        {
                                            transportId: this.recvTransport!.id,
                                            dtlsParameters,
                                        },
                                        resolve,
                                    );
                                });
                                callback();
                            } catch (err) {
                                errback(err as Error);
                            }
                        },
                    );
                }

                const consumerData: ConsumerServerResponse =
                    await new Promise<ConsumerServerResponse>((resolve) => {
                        this.socket.emit(
                            "consume",
                            {
                                producerId: data.producerId,
                                rtpCapabilities: this.device!.rtpCapabilities,
                                transportId: this.recvTransport!.id,
                            },
                            resolve,
                        );
                    });

                const consumer = await this.recvTransport.consume({
                    id: consumerData.id,
                    producerId: consumerData.producerId,
                    kind: consumerData.kind,
                    rtpParameters: consumerData.rtpParameters,
                });

                await new Promise((resolve) => {
                    this.socket.emit(
                        "resumeConsumer",
                        { consumerId: consumer.id },
                        resolve,
                    );
                });

                // Create remote stream
                const remoteStream = new MediaStream([consumer.track]);

                // Method 1: Simple HTML Audio (most reliable)
                const audioEl = document.createElement("audio");
                audioEl.srcObject = remoteStream;
                audioEl.autoplay = true;
                audioEl.volume = 1.0;
                audioEl.play();

                console.log("Audio should be playing now");
                console.log(
                    "Track:",
                    consumer.track.readyState,
                    "Enabled:",
                    consumer.track.enabled,
                );
            } catch (error) {
                console.error("Error:", error);
            }
        });
    }

    private async initializeRtpCapabilities() {
        const routerRtpCapabilities: RtpCapabilities = await new Promise(
            (resolve) => {
                this.socket.emit("getRouterRtpCapabilities", {}, resolve);
            },
        );
        await this.device!.load({ routerRtpCapabilities });
    }
}
