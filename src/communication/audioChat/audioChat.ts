import { RtpParameters } from "mediasoup-client/types";
import { MediaTransportService } from "../mediaTransportService/mediaTransportServive";

interface ConsumerServerResponse {
    id: string;
    producerId: string;
    kind: "audio" | "video";
    rtpParameters: RtpParameters;
}

export class AudioChat {
    recvTransportConnected: boolean = false;
    sfuService: MediaTransportService;

    constructor(
        private audioElementsSetter: (audioElement: HTMLAudioElement) => void,
    ) {
        /**
         * Doing singleton pattern
         * So the sfu transport and connection does not get accidentally get created
         **/
        console.log("initializeAudioChat");
        this.sfuService = MediaTransportService.getInstance();
        console.log("AudioChat initialized");
    }

    public initializeAudioChat() {}

    public async joinVoiceChat() {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        const [audioTrack] = stream.getAudioTracks();

        await this.sfuService.sendTransport!.produce({ track: audioTrack });

        const existingProducers = await new Promise<{ producerId: string }[]>(
            (resolve) => {
                this.sfuService.socket.emit("getProducers", {}, resolve);
            },
        );

        for (const producer of existingProducers) {
            await this.consumeProducer(producer.producerId);
        }
    }

    public async watchNewProducers() {
        this.sfuService.socket.on(
            "newProducer",
            async (data: { producerId: string }) => {
                await this.consumeProducer(data.producerId);
            },
        );
    }

    private async consumeProducer(producerId: string) {
        try {
            const consumerData: ConsumerServerResponse = await new Promise(
                (resolve) => {
                    this.sfuService.socket.emit(
                        "consume",
                        {
                            producerId: producerId,
                            rtpCapabilities:
                                this.sfuService.device!.rtpCapabilities,
                            transportId: this.sfuService.recvTransport!.id,
                        },
                        resolve,
                    );
                },
            );

            const consumer = await this.sfuService.recvTransport!.consume({
                id: consumerData.id,
                producerId: consumerData.producerId,
                kind: consumerData.kind,
                rtpParameters: consumerData.rtpParameters,
            });

            // Wait for transport to be connected before resuming
            // let attempts = 0;
            // while (!this.recvTransportConnected && attempts < 50) {
            //     await new Promise((resolve) => setTimeout(resolve, 100));
            //     attempts++;
            // }
            //
            // if (!this.recvTransportConnected) {
            //     console.error("Transport failed to connect after 5 seconds");
            // }

            await new Promise((resolve) => {
                this.sfuService.socket.emit(
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
}
