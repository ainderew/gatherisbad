export interface PlayerDto {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    t?: Date;
    opts: {
        isLocal: boolean;
    };
}
