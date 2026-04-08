import type { IState } from '../../fsm/IState';
import type { StateMachine } from '../../fsm/StateMachine';
import type { Character } from '../../world/Character';
import type { Enemy } from '../../world/Enemy';

export class EnemyPatrolState implements IState {
    readonly name = 'Patrol';

    private aggroRange: number;

    constructor(
        private enemy: Enemy,
        private fsm: StateMachine,
        private target: Character,
        aggroRange = 200,
    ) {
        this.aggroRange = aggroRange;
    }

    enter(): void {}

    update(delta: number): void {
        // Check aggro
        const dx = this.target.x - this.enemy.x;
        const dy = this.target.y - this.enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.aggroRange) {
            this.fsm.setState('Chase');
            return;
        }

        this.enemy.runBehavior('patrol', delta);
    }

    exit(): void {}
}
