import useUserStore from "@/common/store/useStore";
import { CONFIG } from "@/common/utils/config";
import { Device } from "mediasoup-client";
import {
    DtlsParameters,
    MediaKind,
    RtpCapabilities,
    RtpParameters,
    Transport,
    TransportOptions,
} from "mediasoup-client/types";
import io from "socket.io-client";

/**
 * Don't touch singleton pattern
 * used so we don't create multiple connections when sharing audio and screenshare
 **/
export class MediaTransportService {
    private static instance: MediaTransportService | null = null;
    public socket: SocketIOClient.Socket;
    public device: Device | null = null;

    public recvTransport: Transport | null = null;
    public sendTransport: Transport | null = null;

    constructor() {
        this.socket = io(CONFIG.SFU_SERVER_URL, {
            autoConnect: false,
        });

        this.device = new Device();
    }

    public connect() {
        if (this.socket.connected) return;
        this.socket.connect();
    }

    public static getInstance() {
        if (MediaTransportService.instance)
            return MediaTransportService.instance;

        MediaTransportService.instance = new MediaTransportService();
        return MediaTransportService.instance;
    }

    public disconnect() {
        this.recvTransport?.close();
        this.sendTransport?.close();
        this.socket.disconnect();
    }

    public async initializeSfu() {
        console.log("Initializing SFU");
        await this.initializeRtpCapabilities();
        await this.createReceiveTransport();
        await this.createSendTransport();
        this.setUserDataOnSfuServer();
    }

    private setUserDataOnSfuServer() {
        const user = useUserStore.getState().user;
        this.socket.emit("setUserInfo", user);
    }

    private async createReceiveTransport() {
        const receiveTransportOptions =
            await this.createTransportOptions("recv");

        this.recvTransport = this.device!.createRecvTransport(
            receiveTransportOptions,
        );
        this.recvTransport.on(
            "connect",
            this.handleConnect(this.recvTransport),
        );
    }

    private async createSendTransport() {
        const sendTransportOptions = await this.createTransportOptions("send");

        this.sendTransport =
            this.device!.createSendTransport(sendTransportOptions);

        this.sendTransport.on(
            "connect",
            this.handleConnect(this.sendTransport),
        );
        this.sendTransport.on("produce", this.handleProduce);
    }

    private handleProduce = async (
        {
            kind,
            rtpParameters,
            appData,
        }: {
            kind: MediaKind;
            rtpParameters: RtpParameters;
            appData: Record<string, unknown>;
        },
        callback: (data: { id: string }) => void,
        errback: (err: Error) => void,
    ) => {
        try {
            const { id } = await new Promise<{ id: string }>((resolve) =>
                this.socket.emit(
                    "produce",
                    {
                        kind,
                        rtpParameters,
                        transportId: this.sendTransport!.id,
                        appData,
                    },
                    resolve,
                ),
            );
            callback({ id });
        } catch (err) {
            errback(err as Error);
        }
    };

    private handleConnect(transport: Transport) {
        return async (
            { dtlsParameters }: { dtlsParameters: DtlsParameters },
            callback: () => void,
            errback: (err: Error) => void,
        ) => {
            try {
                await new Promise((resolve) => {
                    this.socket.emit(
                        "connectTransport",
                        {
                            transportId: transport.id,
                            dtlsParameters,
                        },
                        resolve,
                    );
                });
                callback();
            } catch (err) {
                errback(err as Error);
            }
        };
    }

    private async createTransportOptions(
        type: "send" | "recv",
    ): Promise<TransportOptions> {
        const transportInfo: TransportOptions = await new Promise((resolve) =>
            this.socket.emit("createTransport", { type }, resolve),
        );

        return transportInfo;
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
