import { Device } from "mediasoup-client";
import {
    RtpCapabilities,
    TransportOptions,
    DtlsParameters,
    RtpParameters,
    Transport,
} from "mediasoup-client/types";
import { MediaTransportService } from "../mediaTransportService/mediaTransportServive";

interface ConsumerServerResponse {
    id: string;
    producerId: string;
    kind: "audio" | "video";
    rtpParameters: RtpParameters;
}

export class AudioChat {
    socket: SocketIOClient.Socket;

    device: Device | null = null;
    sendTransport: Transport | null = null;
    recvTransport: Transport | null = null;
    recvTransportConnected: boolean = false;

    constructor(
        private audioElementsSetter: (audioElement: HTMLAudioElement) => void,
    ) {
        this.socket = MediaTransportService.getInstance().socket;
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

        console.log("Joined voice chat - now producing audio");

        const existingProducers = await new Promise<{ producerId: string }[]>(
            (resolve) => {
                this.socket.emit("getProducers", {}, resolve);
            },
        );

        console.log("Existing producers:", existingProducers);

        for (const producer of existingProducers) {
            await this.consumeProducer(producer.producerId);
        }
    }

    public async watchNewProducers() {
        this.socket.on("newProducer", async (data: { producerId: string }) => {
            console.log("New producer detected:", data.producerId);
            await this.consumeProducer(data.producerId);
        });
    }

    private async createRecvTransport() {
        if (this.recvTransport) {
            return;
        }

        const recvTransportInfo: TransportOptions = await new Promise(
            (resolve) => {
                this.socket.emit("createTransport", { type: "recv" }, resolve);
            },
        );

        this.recvTransport =
            this.device!.createRecvTransport(recvTransportInfo);

        this.recvTransport.on(
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
                                transportId: this.recvTransport!.id,
                                dtlsParameters,
                            },
                            resolve,
                        );
                    });
                    this.recvTransportConnected = true;
                    console.log("Recv transport connected!");
                    callback();
                } catch (err) {
                    errback(err as Error);
                }
            },
        );
    }

    private async consumeProducer(producerId: string) {
        try {
            await this.createRecvTransport();

            console.log("Requesting to consume producer:", producerId);

            const consumerData: ConsumerServerResponse = await new Promise(
                (resolve) => {
                    this.socket.emit(
                        "consume",
                        {
                            producerId: producerId,
                            rtpCapabilities: this.device!.rtpCapabilities,
                            transportId: this.recvTransport!.id,
                        },
                        resolve,
                    );
                },
            );

            console.log("Consumer data received, consuming...");

            const consumer = await this.recvTransport!.consume({
                id: consumerData.id,
                producerId: consumerData.producerId,
                kind: consumerData.kind,
                rtpParameters: consumerData.rtpParameters,
            });

            console.log(
                "Consumer created, waiting for transport connection...",
            );

            // Wait for transport to be connected before resuming
            let attempts = 0;
            while (!this.recvTransportConnected && attempts < 50) {
                await new Promise((resolve) => setTimeout(resolve, 100));
                attempts++;
            }

            if (!this.recvTransportConnected) {
                console.error("Transport failed to connect after 5 seconds");
            }

            console.log("Resuming consumer...");

            await new Promise((resolve) => {
                this.socket.emit(
                    "resumeConsumer",
                    { consumerId: consumer.id },
                    resolve,
                );
            });

            console.log("Consumer resumed, creating audio element...");

            const remoteStream = new MediaStream([consumer.track]);

            const audioEl = document.createElement("audio");
            audioEl.srcObject = remoteStream;
            audioEl.autoplay = false;
            audioEl.volume = 1.0;
            audioEl.muted = false;

            this.audioElementsSetter(audioEl);
            document.body.appendChild(audioEl);

            console.log("Audio element created and ready");
            console.log(
                "Track:",
                consumer.track.readyState,
                "Enabled:",
                consumer.track.enabled,
            );
        } catch (error) {
            console.error("Error consuming producer:", error);
        }
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
