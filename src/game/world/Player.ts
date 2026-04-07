import { EventBus } from '../EventBus';

export class Player {
    readonly sprite:          Phaser.GameObjects.Rectangle;
    readonly label:           Phaser.GameObjects.Text;
    readonly collisionRadius  = 22; // sprite width / 2

    private readonly colliderArc: Phaser.GameObjects.Arc;
    private vx = 0;
    private vy = 0;
    private readonly speed = 200;

    private keys!:  Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!:  {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    };

    private readonly onMove = ({ dx, dy }: { dx: number; dy: number }) => {
        this.vx = dx * this.speed;
        this.vy = dy * this.speed;
    };
    private readonly onStop = () => {
        this.vx = 0;
        this.vy = 0;
    };

    constructor(
        scene:         Phaser.Scene,
        x:             number,
        y:             number,
        worldLayer:    Phaser.GameObjects.Layer,
        overheadLayer: Phaser.GameObjects.Layer,
        shadowLayer:   Phaser.GameObjects.Layer,
    ) {
        // Origin (0.5, 1) → .y is the "feet" — correct anchor for Y-sort
        this.sprite = scene.add
            .rectangle(x, y, 44, 64, 0xff2d9b)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5, 1);
        worldLayer.add(this.sprite);

        // Collision circle — centered at feet, radius = sprite width / 2
        this.colliderArc = scene.add
            .circle(x, y, this.collisionRadius, 0xff2d9b, 0.18)
            .setStrokeStyle(1.5, 0xff2d9b, 0.85);
        shadowLayer.add(this.colliderArc);

        this.label = scene.add.text(x, y - 72, 'PLAYER', {
            fontSize: '11px',
            color: '#ff2d9b',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);
        overheadLayer.add(this.label);

        const kb = scene.input.keyboard!;
        this.keys = kb.createCursorKeys();
        this.wasd = {
            up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        EventBus.on('player:move', this.onMove);
        EventBus.on('player:stop', this.onStop);
    }

    update(delta: number) {
        let kx = 0;
        let ky = 0;
        if (this.keys.left.isDown  || this.wasd.left.isDown)  kx -= 1;
        if (this.keys.right.isDown || this.wasd.right.isDown) kx += 1;
        if (this.keys.up.isDown    || this.wasd.up.isDown)    ky -= 1;
        if (this.keys.down.isDown  || this.wasd.down.isDown)  ky += 1;

        const fx = kx !== 0 ? kx * this.speed : this.vx;
        const fy = ky !== 0 ? ky * this.speed : this.vy;

        this.sprite.x += fx * (delta / 1000);
        this.sprite.y += fy * (delta / 1000);

        // Sync label and collision arc to current feet position
        this.label.setPosition(this.sprite.x, this.sprite.y - 72);
        this.colliderArc.setPosition(this.sprite.x, this.sprite.y);
    }

    destroy() {
        EventBus.removeListener('player:move', this.onMove);
        EventBus.removeListener('player:stop', this.onStop);
        this.sprite.destroy();
        this.label.destroy();
        this.colliderArc.destroy();
    }
}
