import { Consumer } from "mediasoup-client/types";
import { MediaTransportService } from "../mediaTransportService/mediaTransportServive";
import useUserStore from "@/common/store/useStore";
import { ConsumerData } from "./_types";

export class ScreenShareViewer {
    private static instance: ScreenShareViewer | null = null;
    private service: MediaTransportService;
    private consumers: Map<string, Consumer> = new Map();
    public videoElements: Map<string, HTMLVideoElement> = new Map();
    public videoOwnerMap: Record<string, string> = {};
    public updateComponentStateCallback: (() => void) | null = null;

    private constructor() {
        this.service = MediaTransportService.getInstance();
        this.setupListeners();
    }

    public static getInstance(): ScreenShareViewer {
        if (!ScreenShareViewer.instance) {
            ScreenShareViewer.instance = new ScreenShareViewer();
        }
        return ScreenShareViewer.instance;
    }

    private setupListeners(): void {
        this.service.socket.on(
            "newProducer",
            async ({
                producerId,
                userName,
            }: {
                producerId: string;
                userName: string;
            }) => {
                this.videoOwnerMap[producerId] = userName;
                await this.consumeProducer(producerId);
            },
        );

        this.service.socket.on(
            "endScreenShare",
            ({ producerId }: { producerId: string }) => {
                this.removeScreenShareVideo(producerId);
            },
        );
    }

    public async loadExistingProducers(): Promise<void> {
        const producers = await new Promise<
            { producerId: string; socketId: string }[]
        >((resolve) => {
            this.service.socket.emit("getProducers", {}, resolve);
        });

        console.log(`Found ${producers.length} existing producers`);

        for (const { producerId } of producers) {
            await this.consumeProducer(producerId);
        }
    }

    private async consumeProducer(producerId: string): Promise<void> {
        try {
            const consumerData = await new Promise<ConsumerData>((resolve) => {
                this.service.socket.emit(
                    "consume",
                    {
                        producerId,
                        rtpCapabilities: this.service.device!.rtpCapabilities,
                        transportId: this.service.recvTransport!.id,
                    },
                    resolve,
                );
            });

            const consumer = await this.service.recvTransport!.consume({
                id: consumerData.id,
                producerId: consumerData.producerId,
                kind: consumerData.kind,
                rtpParameters: consumerData.rtpParameters,
            });

            await new Promise((resolve) => {
                this.service.socket.emit(
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

    private displayVideo(producerId: string, consumer: Consumer): void {
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
        this.videoElements.delete(producerId);
        this.updateComponentStateCallback!();
    }

    public cleanup(): void {
        this.consumers.forEach((consumer) => consumer.close());
        this.videoElements.forEach((el) => el.remove());
        this.consumers.clear();
        this.videoElements.clear();
        this.updateComponentStateCallback!();
    }
}
