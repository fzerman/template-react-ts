import type { IState } from '../../fsm/IState';
import type { StateMachine } from '../../fsm/StateMachine';
import type { Player } from '../../world/Player';

export class PlayerWalkState implements IState {
    readonly name = 'Walking';

    constructor(
        private player: Player,
        private fsm: StateMachine,
    ) {}

    enter(): void {}

    update(delta: number): void {
        const dir = this.player.getInputDirection();
        if (dir.x === 0 && dir.y === 0) {
            this.fsm.setState('Idle');
            return;
        }
        this.player.x += dir.x * this.player.speed * (delta / 1000);
        this.player.y += dir.y * this.player.speed * (delta / 1000);
    }

    exit(): void {}
}
