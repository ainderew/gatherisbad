import { Consumer, Producer, RtpParameters } from "mediasoup-client/types";
import { MediaTransportService } from "../mediaTransportService/mediaTransportServive";
import usePlayersStore from "@/common/store/playerStore";
import { AvailabilityStatus } from "@/game/player/_enums";

interface ConsumerServerResponse {
    id: string;
    producerId: string;
    kind: "audio" | "video";
    rtpParameters: RtpParameters;
}

export class AudioChat {
    public static instance: AudioChat | null = null;
    public isMuted: boolean = true;

    private sfuService: MediaTransportService;
    private audioProducer?: Producer;
    private audioElementsSetter: (audioElement: HTMLAudioElement) => void;
    private audioContext: AudioContext;
    private audioDestination?: MediaStreamAudioDestinationNode;
    private consumers: Map<string, Consumer> = new Map();
    private isInFocusMode: boolean;

    constructor() {
        /**
         * Doing singleton pattern
         * So the sfu transport and connection does not get accidentally get created
         **/
        console.log("initializeAudioChat");
        this.sfuService = MediaTransportService.getInstance();
        console.log("AudioChat initialized");
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new AudioChat();
        }

        return this.instance;
    }

    public initializeAudioChat(
        setter: (audioElement: HTMLAudioElement) => void,
    ) {
        this.audioElementsSetter = setter;
        this.watchFocusModeChanges();
    }

    public async joinVoiceChat() {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                sampleRate: 48000,
                sampleSize: 16,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            },
        });

        const processedStream = await this.processAudioStream(stream);
        const [audioTrack] = processedStream.getAudioTracks();

        this.audioProducer = await this.sfuService.sendTransport!.produce({
            track: audioTrack,
        });
        this.muteMic();

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

            const consumer: Consumer =
                await this.sfuService.recvTransport!.consume({
                    id: consumerData.id,
                    producerId: consumerData.producerId,
                    kind: consumerData.kind,
                    rtpParameters: consumerData.rtpParameters,
                });

            this.consumers.set(consumer.id, consumer);

            if (this.isInFocusMode) {
                consumer.pause();
            }
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

    private async processAudioStream(
        stream: MediaStream,
    ): Promise<MediaStream> {
        // Create audio context
        this.audioContext = new AudioContext({ sampleRate: 48000 });

        // Create source from microphone
        const source = this.audioContext.createMediaStreamSource(stream);

        // Create a compressor for better dynamic range
        const compressor = this.audioContext.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        // Create a gain node for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1.2; // Slight boost

        // Optional: Add a basic high-pass filter to reduce low-frequency noise
        const highPassFilter = this.audioContext.createBiquadFilter();
        highPassFilter.type = "highpass";
        highPassFilter.frequency.value = 80; // Remove rumble below 80Hz

        // Create destination
        this.audioDestination =
            this.audioContext.createMediaStreamDestination();

        // Connect the audio pipeline
        source
            .connect(highPassFilter)
            .connect(compressor)
            .connect(gainNode)
            .connect(this.audioDestination);

        return this.audioDestination.stream;
    }

    public muteMic() {
        if (this.audioProducer) {
            this.audioProducer?.pause();
            this.isMuted = true;
        }
    }
    public unMuteMic() {
        if (this.audioProducer) {
            this.audioProducer?.resume();
            this.isMuted = false;
        }
    }

    public enableFocusMode() {
        if (!this.consumers) return;
        this.consumers.forEach((consumer) => consumer.pause());
        this.isInFocusMode = true;
    }

    public disableFocusMode() {
        if (!this.consumers) return;
        this.consumers.forEach((consumer) => consumer.resume());
        this.isInFocusMode = false;
    }

    public emitFocusModeChange() {
        const localPlayerId = usePlayersStore.getState().localPlayerId;
        this.sfuService.socket.emit("focusModeChange", {
            playerId: localPlayerId,
            isInFocusMode: this.isInFocusMode,
        });
    }

    public watchFocusModeChanges() {
        this.sfuService.socket.on(
            "playerFocusModeChanged",
            (data: {
                playerId: string;
                isInFocusMode: boolean;
                socketId: string;
            }) => {
                const playerMap = usePlayersStore.getState().playerMap;
                console.log(playerMap);
                playerMap[data.playerId].changePlayerAvailabilityStatus(
                    data.isInFocusMode
                        ? AvailabilityStatus.FOCUS
                        : AvailabilityStatus.ONLINE,
                );

                // Update UI or player state accordingly
            },
        );
    }
}
