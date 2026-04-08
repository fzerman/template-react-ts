import type { IState } from '../../fsm/IState';
import type { Player } from '../../world/Player';

export class PlayerDeadState implements IState {
    readonly name = 'Dead';

    constructor(private player: Player) {}

    enter(): void {
        this.player.vx = 0;
        this.player.vy = 0;
        // TODO: play death animation, disable input
    }

    update(_delta: number): void {
        // Dead — no updates
    }

    exit(): void {}
}
