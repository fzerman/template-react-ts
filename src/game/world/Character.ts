import { StateMachine } from '../fsm/StateMachine';

export interface CharacterConfig {
    scene:          Phaser.Scene;
    x:              number;
    y:              number;
    worldLayer:     Phaser.GameObjects.Layer;
    overheadLayer:  Phaser.GameObjects.Layer;
    shadowLayer:    Phaser.GameObjects.Layer;
    name:           string;
    color:          number;
    spriteKey?:     string;
    collisionRadius?: number;
    maxHp?:         number;
    speed?:         number;
}

const HP_BAR_WIDTH  = 40;
const HP_BAR_HEIGHT = 5;
const HP_BAR_OFFSET_Y = -80;   // above the label

export abstract class Character {
    readonly scene:           Phaser.Scene;
    readonly sprite:          Phaser.GameObjects.Sprite | Phaser.GameObjects.Rectangle;
    readonly label:           Phaser.GameObjects.Text;
    readonly colliderArc:     Phaser.GameObjects.Arc;
    readonly collisionRadius: number;
    readonly stateMachine:    StateMachine;

    private readonly hpBarBg:   Phaser.GameObjects.Rectangle;
    private readonly hpBarFill: Phaser.GameObjects.Rectangle;

    hp:    number;
    maxHp: number;
    speed: number;
    vx = 0;
    vy = 0;

    constructor(config: CharacterConfig) {
        this.scene           = config.scene;
        this.collisionRadius = config.collisionRadius ?? 22;
        this.maxHp           = config.maxHp ?? 100;
        this.hp              = this.maxHp;
        this.speed           = config.speed ?? 200;
        this.stateMachine    = new StateMachine();

        // Sprite — use spritesheet if available, otherwise placeholder rectangle
        if (config.spriteKey) {
            this.sprite = config.scene.add
                .sprite(config.x, config.y, config.spriteKey)
                .setOrigin(0.5, 1);
        } else {
            this.sprite = config.scene.add
                .rectangle(config.x, config.y, 44, 64, config.color)
                .setStrokeStyle(2, 0xffffff)
                .setOrigin(0.5, 1);
        }
        config.worldLayer.add(this.sprite);

        // Collision circle at feet
        this.colliderArc = config.scene.add
            .circle(config.x, config.y, this.collisionRadius, config.color, 0.18)
            .setStrokeStyle(1.5, config.color, 0.85);
        config.shadowLayer.add(this.colliderArc);

        // Health bar — background (dark) + fill (green→red)
        this.hpBarBg = config.scene.add
            .rectangle(config.x, config.y + HP_BAR_OFFSET_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x000000, 0.6)
            .setStrokeStyle(1, 0x333333)
            .setOrigin(0.5);
        config.overheadLayer.add(this.hpBarBg);

        this.hpBarFill = config.scene.add
            .rectangle(config.x, config.y + HP_BAR_OFFSET_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x00ff00)
            .setOrigin(0.5);
        config.overheadLayer.add(this.hpBarFill);

        // Label above head (above health bar)
        this.label = config.scene.add
            .text(config.x, config.y + HP_BAR_OFFSET_Y - 10, config.name, {
                fontSize:        '11px',
                color:           '#' + config.color.toString(16).padStart(6, '0'),
                fontFamily:      'Arial Black',
                stroke:          '#000000',
                strokeThickness: 3,
            })
            .setOrigin(0.5);
        config.overheadLayer.add(this.label);
    }

    // ── Position accessors ──────────────────────────────────────────────

    get x(): number { return this.sprite.x; }
    set x(v: number) { this.sprite.x = v; }

    get y(): number { return this.sprite.y; }
    set y(v: number) { this.sprite.y = v; }

    // ── Health ──────────────────────────────────────────────────────────

    takeDamage(amount: number): void {
        this.hp = Math.max(0, this.hp - amount);
        this.updateHpBar();
        if (this.hp <= 0) {
            this.stateMachine.setState('Dead');
        }
    }

    heal(amount: number): void {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        this.updateHpBar();
    }

    private updateHpBar(): void {
        const ratio = this.hp / this.maxHp;
        this.hpBarFill.width = HP_BAR_WIDTH * ratio;

        // Green → Yellow → Red
        const r = ratio < 0.5 ? 255 : Math.floor(255 * (1 - ratio) * 2);
        const g = ratio > 0.5 ? 255 : Math.floor(255 * ratio * 2);
        this.hpBarFill.fillColor = (r << 16) | (g << 8);
    }

    get isDead(): boolean {
        return this.hp <= 0;
    }

    // ── Frame update ────────────────────────────────────────────────────

    update(delta: number): void {
        this.stateMachine.update(delta);
        this.syncVisuals();
    }

    protected syncVisuals(): void {
        this.label.setPosition(this.sprite.x, this.sprite.y + HP_BAR_OFFSET_Y - 10);
        this.hpBarBg.setPosition(this.sprite.x, this.sprite.y + HP_BAR_OFFSET_Y);
        this.hpBarFill.setPosition(this.sprite.x, this.sprite.y + HP_BAR_OFFSET_Y);
        this.colliderArc.setPosition(this.sprite.x, this.sprite.y);
    }

    // ── Cleanup ─────────────────────────────────────────────────────────

    destroy(): void {
        this.sprite.destroy();
        this.label.destroy();
        this.hpBarBg.destroy();
        this.hpBarFill.destroy();
        this.colliderArc.destroy();
    }
}
