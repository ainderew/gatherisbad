export interface PlayerDto {
    id: string;
    name?: string;
    x: number;
    y: number;
    isAttacking: boolean;
    vx: number;
    vy: number;
    t?: Date;
    opts: {
        isLocal: boolean;
    };
}