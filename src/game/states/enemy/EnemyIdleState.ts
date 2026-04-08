import type { IState } from '../../fsm/IState';
import type { StateMachine } from '../../fsm/StateMachine';
import type { Enemy } from '../../world/Enemy';

export class EnemyIdleState implements IState {
    readonly name = 'Idle';

    private elapsed = 0;
    private waitTime: number;

    constructor(
        private enemy: Enemy,
        private fsm: StateMachine,
        waitTimeMs = 2000,
    ) {
        this.waitTime = waitTimeMs;
    }

    enter(): void {
        this.elapsed = 0;
        this.enemy.vx = 0;
        this.enemy.vy = 0;
    }

    update(delta: number): void {
        this.elapsed += delta;
        if (this.elapsed >= this.waitTime) {
            this.fsm.setState('Patrol');
        }
    }

    exit(): void {}
}
