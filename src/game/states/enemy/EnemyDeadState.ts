import type { IState } from '../../fsm/IState';
import type { Enemy } from '../../world/Enemy';

export class EnemyDeadState implements IState {
    readonly name = 'Dead';

    constructor(private enemy: Enemy) {}

    enter(): void {
        this.enemy.vx = 0;
        this.enemy.vy = 0;
        // TODO: play death animation, remove from world after delay
    }

    update(_delta: number): void {}

    exit(): void {}
}
