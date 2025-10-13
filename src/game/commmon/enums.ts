export enum SpriteKeys {
    ORC = "ORC",
    SOLDIER = "SOLDIER",
    ADAM = "ADAM",

    SOLDIER_ATTACK = "soldier-attack",
    SOLDIER_WALK = "soldier-walk",
    SOLDIER_IDLE = "soldier-idle",

    ORC_ATTACK = "orc-attack",
    ORC_WALK = "orc-walk",
    ORC_IDLE = "orc-idle",

    ADAM_ATTACK = "adam-attack",
    ADAM_WALK = "adam-walk",
    ADAM_IDLE = "adam-idle",
}

export const AttackAnimationKeys: { [key: string]: string } = {
    SOLDIER: "soldier-attack",
    ORC: "orc-attack",
    ADAM: "adam-attack",
};

export const WalkAnimationKeys: { [key: string]: string } = {
    SOLDIER: "soldier-walk",
    ORC: "orc-walk",
    ADAM: "adam-walk",
    ADAM_UP: "adam-walk-up",
    ADAM_DOWN: "adam-walk-down",
};

export const IdleAnimationKeys: { [key: string]: string } = {
    SOLDIER: "soldier-idle",
    ORC: "orc-idle",
    ADAM: "adam-idle",
};
