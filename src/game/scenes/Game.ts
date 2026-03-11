import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { tapRipple } from '../effects/tapRipple';
import { PANEL_EVENTS } from '../../context/PanelContext';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.gameText = this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Touch / click handler — works for both mouse and touch input
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const label = pointer.wasTouch ? 'Touch' : 'Click';
            console.log(`${label} at (${Math.round(pointer.x)}, ${Math.round(pointer.y)})`);

            tapRipple(this, pointer.x, pointer.y);
        });

        // Disable Phaser input while a panel is open, re-enable on close
        EventBus.on(PANEL_EVENTS.OPENED, () => { this.input.enabled = false; });
        EventBus.on(PANEL_EVENTS.CLOSED, () => { this.input.enabled = true;  });

        EventBus.emit('current-scene-ready', this);
    }

    shutdown ()
    {
        EventBus.removeListener(PANEL_EVENTS.OPENED);
        EventBus.removeListener(PANEL_EVENTS.CLOSED);
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
