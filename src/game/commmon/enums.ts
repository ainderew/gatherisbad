export enum SpriteKeys {
    ORC = "ORC",
    SOLDIER = "SOLDIER",

    SOLDIER_ATTACK = "soldier-attack",
    SOLDIER_WALK = "soldier-walk",
    SOLDIER_IDLE = "soldier-idle",

    ORC_ATTACK = "orc-attack",
    ORC_WALK = "orc-walk",
    ORC_IDLE = "orc-idle",
}

export const AttackAnimationKeys: { [key: string]: string } = {
    SOLDIER: "soldier-attack",
    ORC: "orc-attack",
};

export const WalkAnimationKeys: { [key: string]: string } = {
    SOLDIER: "soldier-walk",
    ORC: "orc-walk",
};

export const IdleAnimationKeys: { [key: string]: string } = {
    SOLDIER: "soldier-idle",
    ORC: "orc-idle",
};
