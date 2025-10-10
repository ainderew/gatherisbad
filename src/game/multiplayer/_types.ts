export interface PlayerDto {
    id: string;
    name?: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    t?: Date;
    opts: {
        isLocal: boolean;
    };
}
