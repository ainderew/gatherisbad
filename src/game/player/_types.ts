export interface Player {
    x: number;
    y: number;
    vx: number;
    vy: number;
    id: string;
    isLocal: boolean;
    targetPos?: {
        x: number;
        y: number;
        vx: number;
        vy: number;
        t: number;
    };
    update: (time: number, delta: number) => void;
    destroy: () => void;
}
