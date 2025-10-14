import useUserStore from "@/common/store/useStore";
import { MediaTransportService } from "../mediaTransportService/mediaTransportServive";
import { ConsumerData } from "../screenShare/_types";
import { Consumer } from "mediasoup-client/types";

export class VideoChatViewer {
    public static instance: VideoChatViewer | null = null;
    private sfuService: MediaTransportService;
    private consumers: Map<string, Consumer> = new Map();
    public videoElements: Map<string, HTMLVideoElement> = new Map();
    public videoChatOwnerMap: Record<string, string> = {};
    public updateComponentStateCallback: (() => void) | null = null;

    constructor() {
        this.sfuService = MediaTransportService.getInstance();
        this.setupListeners();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new VideoChatViewer();
        }
        return this.instance;
    }

    private setupListeners(): void {
        this.sfuService.socket.on(
            "newProducer",
            async ({
                producerId,
                userName,
                source,
            }: {
                producerId: string;
                userName: string;
                source: string;
            }) => {
                if (source !== "camera") return;

                this.videoChatOwnerMap[producerId] = userName;
                await this.consumeProducer(producerId);
            },
        );

        this.sfuService.socket.on(
            "endScreenShare",
            ({ producerId }: { producerId: string }) => {
                this.removeScreenShareVideo(producerId);
            },
        );
    }

    private async consumeProducer(producerId: string): Promise<void> {
        try {
            const consumerData = await new Promise<ConsumerData>((resolve) => {
                this.sfuService.socket.emit(
                    "consume",
                    {
                        producerId,
                        rtpCapabilities:
                            this.sfuService.device!.rtpCapabilities,
                        transportId: this.sfuService.recvTransport!.id,
                    },
                    resolve,
                );
            });

            const consumer = await this.sfuService.recvTransport!.consume({
                id: consumerData.id,
                producerId: consumerData.producerId,
                kind: consumerData.kind,
                rtpParameters: consumerData.rtpParameters,
            });

            await new Promise((resolve) => {
                this.sfuService.socket.emit(
                    "resumeConsumer",
                    {
                        consumerId: consumer.id,
                    },
                    resolve,
                );
            });

            const currentProducerIds =
                useUserStore.getState().user.producerIds ?? [];

            this.consumers.set(producerId, consumer);
            useUserStore.getState().updateUser({
                producerIds: [...currentProducerIds, producerId],
            });

            if (consumerData.kind === "video") {
                this.displayVideo(producerId, consumer);
            }
        } catch (error) {
            console.error("Error consuming producer:", error);
        }
    }

    public async loadExistingProducers(): Promise<void> {
        const producers = await new Promise<
            { producerId: string; socketId: string; source: string }[]
        >((resolve) => {
            this.sfuService.socket.emit("getProducers", {}, resolve);
        });

        console.log(`Found ${producers.length} existing producers`);

        const relevantProducers = producers.filter(
            (p) => p.source === "camera", // or 'camera' for VideoChatViewer
        );

        for (const { producerId } of relevantProducers) {
            await this.consumeProducer(producerId);
        }
    }

    private displayVideo(producerId: string, consumer: Consumer): void {
        if (!this.updateComponentStateCallback) return;
        const videoEl = document.createElement("video") as HTMLVideoElement;
        videoEl.srcObject = new MediaStream([consumer.track]);
        videoEl.autoplay = true;
        videoEl.controls = false;
        videoEl.style.width = "100%";
        videoEl.dataset.producerId = producerId;

        videoEl.style.width = "100%";
        videoEl.style.height = "100%";
        videoEl.style.objectFit = "contain";
        videoEl.style.backgroundColor = "#000";
        videoEl.style.display = "block";

        this.videoElements.set(producerId, videoEl);
        this.updateComponentStateCallback!();
    }

    public removeScreenShareVideo(producerId: string) {
        if (!this.updateComponentStateCallback) return;
        this.videoElements.delete(producerId);
        this.updateComponentStateCallback!();
    }
}
