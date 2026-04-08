import type { IState } from '../../fsm/IState';
import type { StateMachine } from '../../fsm/StateMachine';
import type { Player } from '../../world/Player';

export class PlayerAttackState implements IState {
    readonly name = 'Attacking';

    private player: Player;
    private fsm: StateMachine;

    constructor(player: Player, fsm: StateMachine) {
        this.player = player;
        this.fsm = fsm;
    }

    enter(): void {
        this.player.vx = 0;
        this.player.vy = 0;
        // TODO: trigger attack animation, apply damage to target
    }

    update(_delta: number): void {
        // TODO: when attack animation finishes → transition back to Idle
        this.fsm.setState('Idle');
    }

    exit(): void {}
}
