import type { IState } from '../../fsm/IState';
import type { StateMachine } from '../../fsm/StateMachine';
import type { Character } from '../../world/Character';
import type { Enemy } from '../../world/Enemy';

export class EnemyChaseState implements IState {
    readonly name = 'Chase';

    private leashRange: number;
    private stopRange: number;
    private attackTimer = 0;

    constructor(
        private enemy: Enemy,
        private fsm: StateMachine,
        private target: Character,
        leashRange = 350,
        stopRange = 50,
    ) {
        this.leashRange = leashRange;
        this.stopRange = stopRange;
    }

    enter(): void {
        // Reset attack timer so first hit has a short delay
        this.attackTimer = 0;
    }

    update(delta: number): void {
        const dx = this.target.x - this.enemy.x;
        const dy = this.target.y - this.enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.leashRange) {
            this.fsm.setState('Patrol');
            return;
        }

        // Within stop range — hold position and attack
        if (dist < this.stopRange) {
            this.enemy.vx = 0;
            this.enemy.vy = 0;

            this.attackTimer += delta;
            const interval = 1000 / this.enemy.attackRate;
            if (this.attackTimer >= interval) {
                this.attackTimer -= interval;
                this.target.takeDamage(this.enemy.attackDamage);
            }
            return;
        }

        // Reset attack timer when chasing (not in range)
        this.attackTimer = 0;
        this.enemy.runBehavior('chase', delta);
    }

    exit(): void {
        this.attackTimer = 0;
    }
}
