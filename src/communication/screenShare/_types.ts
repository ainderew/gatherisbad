import { RtpParameters } from "mediasoup-client/types";

export interface Room {
    participants: Map<string, string>; // Who's in this call?
    producers: Map<string, string>; // Who's sharing their screen?
    consumers: Map<string, string>; // Who's watching which screens?

    createdAt: Date;
    settings: {
        maxSharers: number;
        recordingEnabled: boolean;
        metadata: {
            roomName: string;
            hostUserId: string;
        };
    };
}

export interface ConsumerData {
    id: string;
    producerId: string;
    kind: "audio" | "video";
    rtpParameters: RtpParameters;
    producerPaused: boolean;
}
