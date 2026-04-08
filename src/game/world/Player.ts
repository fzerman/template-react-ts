import { EventBus } from '../EventBus';
import { Character, type CharacterConfig } from './Character';
import { PlayerIdleState } from '../states/player/PlayerIdleState';
import { PlayerWalkState } from '../states/player/PlayerWalkState';
import { PlayerAttackState } from '../states/player/PlayerAttackState';
import { PlayerDeadState } from '../states/player/PlayerDeadState';

export class Player extends Character {
    private keys!:  Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!:  {
        up:    Phaser.Input.Keyboard.Key;
        down:  Phaser.Input.Keyboard.Key;
        left:  Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    };

    /** D-pad direction from EventBus (mobile touch controls) */
    private dpadX = 0;
    private dpadY = 0;

    private readonly onMove = ({ dx, dy }: { dx: number; dy: number }) => {
        this.dpadX = dx;
        this.dpadY = dy;
    };
    private readonly onStop = () => {
        this.dpadX = 0;
        this.dpadY = 0;
    };

    constructor(config: CharacterConfig) {
        super(config);

        // Keyboard input
        const kb = config.scene.input.keyboard!;
        this.keys = kb.createCursorKeys();
        this.wasd = {
            up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // D-pad EventBus listeners
        EventBus.on('player:move', this.onMove);
        EventBus.on('player:stop', this.onStop);

        // Register states
        this.stateMachine
            .addState(new PlayerIdleState(this, this.stateMachine))
            .addState(new PlayerWalkState(this, this.stateMachine))
            .addState(new PlayerAttackState(this, this.stateMachine))
            .addState(new PlayerDeadState(this))
            .setState('Idle');
    }

    /**
     * Returns the current input direction as a normalized-ish vector.
     * Keyboard takes priority; falls back to d-pad if no keys pressed.
     */
    getInputDirection(): { x: number; y: number } {
        let kx = 0;
        let ky = 0;
        if (this.keys.left.isDown  || this.wasd.left.isDown)  kx -= 1;
        if (this.keys.right.isDown || this.wasd.right.isDown) kx += 1;
        if (this.keys.up.isDown    || this.wasd.up.isDown)    ky -= 1;
        if (this.keys.down.isDown  || this.wasd.down.isDown)  ky += 1;

        // Keyboard overrides d-pad
        if (kx !== 0 || ky !== 0) return { x: kx, y: ky };
        return { x: this.dpadX, y: this.dpadY };
    }

    destroy(): void {
        EventBus.removeListener('player:move', this.onMove);
        EventBus.removeListener('player:stop', this.onStop);
        super.destroy();
    }
}
