import type { IState } from '../../fsm/IState';
import type { StateMachine } from '../../fsm/StateMachine';
import type { Player } from '../../world/Player';

export class PlayerIdleState implements IState {
    readonly name = 'Idle';

    constructor(
        private player: Player,
        private fsm: StateMachine,
    ) {}

    enter(): void {
        this.player.vx = 0;
        this.player.vy = 0;
    }

    update(_delta: number): void {
        const dir = this.player.getInputDirection();
        if (dir.x !== 0 || dir.y !== 0) {
            this.fsm.setState('Walking');
        }
    }

    exit(): void {}
}
