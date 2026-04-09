import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { PANEL_EVENTS } from "../../context/PanelContext";
import { LayerManager } from "../world/LayerManager";
import { CollisionManager } from "../world/CollisionManager";
import { Player } from "../world/Player";
import { Enemy } from "../world/Enemy";
import { PatrolBehavior } from "../behaviors/PatrolBehavior";
import { ChaseBehavior } from "../behaviors/ChaseBehavior";
import { IdleBehavior } from "../behaviors/IdleBehavior";
import { EnemyIdleState } from "../states/enemy/EnemyIdleState";
import { EnemyPatrolState } from "../states/enemy/EnemyPatrolState";
import { EnemyChaseState } from "../states/enemy/EnemyChaseState";
import { EnemyDeadState } from "../states/enemy/EnemyDeadState";

const BOX_CONFIGS = [
    { x: 180, y: 220, color: 0x00d4ff, name: "BOX A" },
    { x: 700, y: 290, color: 0xf5e642, name: "BOX B" },
    { x: 380, y: 510, color: 0x00ff88, name: "BOX C" },
    { x: 800, y: 560, color: 0xff8800, name: "BOX D" },
    { x: 120, y: 440, color: 0xaa44ff, name: "BOX E" },
];

const BOX_W = 48;
const BOX_COLLIDER_R = BOX_W / 2;

const ENEMY_CONFIGS = [
    {
        id: "guard-a", x: 300, y: 300, color: 0x00d4ff, name: "GUARD A",
        speed: 80, attackDamage: 8, attackRate: 1,
        waypoints: [{ x: 250, y: 250 }, { x: 450, y: 250 }, { x: 450, y: 400 }, { x: 250, y: 400 }],
    },
    {
        id: "guard-b", x: 650, y: 450, color: 0xf5e642, name: "GUARD B",
        speed: 100, attackDamage: 12, attackRate: 1.5,
        waypoints: [{ x: 600, y: 400 }, { x: 750, y: 400 }, { x: 750, y: 500 }, { x: 600, y: 500 }],
    },
    {
        id: "guard-c", x: 400, y: 200, color: 0x00ff88, name: "GUARD C",
        speed: 90, attackDamage: 5, attackRate: 2,
        waypoints: [{ x: 350, y: 180 }, { x: 500, y: 180 }, { x: 500, y: 300 }, { x: 350, y: 300 }],
    },
];

export class Game extends Scene {
    private layers!: LayerManager;
    private collisions!: CollisionManager;
    private player!: Player;
    private enemies: Enemy[] = [];

    constructor() {
        super("Game");
    }

    create() {
        this.cameras.main.setBackgroundColor(0x111122);

        this.layers = new LayerManager(this);
        this.collisions = new CollisionManager();

        this.buildGround();
        this.buildTestBoxes();

        this.player = new Player({
            scene: this,
            x: 512,
            y: 400,
            worldLayer: this.layers.world,
            overheadLayer: this.layers.overhead,
            shadowLayer: this.layers.shadows,
            name: "PLAYER",
            color: 0xff2d9b,
        });
        this.collisions.register(this.player);

        this.spawnEnemies();

        this.add
            .text(512, 14, "Y-SORT  ·  WASD / ↑↓←→ / D-PAD to move", {
                fontSize: "12px",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "Arial",
            })
            .setOrigin(0.5, 0)
            .setDepth(3000);

        EventBus.on(PANEL_EVENTS.OPENED, this.onPanelOpen, this);
        EventBus.on(PANEL_EVENTS.CLOSED, this.onPanelClose, this);

        EventBus.emit("current-scene-ready", this);
    }

    update(_time: number, delta: number) {
        this.player.update(delta);
        for (const enemy of this.enemies) enemy.update(delta);
        this.collisions.resolve();
        this.layers.sort();
    }

    shutdown() {
        EventBus.removeListener(PANEL_EVENTS.OPENED, this.onPanelOpen, this);
        EventBus.removeListener(PANEL_EVENTS.CLOSED, this.onPanelClose, this);
        for (const enemy of this.enemies) {
            this.collisions.unregister(enemy);
            enemy.destroy();
        }
        this.enemies = [];
        this.collisions.unregister(this.player);
        this.player.destroy();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private spawnEnemies() {
        for (const cfg of ENEMY_CONFIGS) {
            const enemy = new Enemy(
                {
                    scene: this,
                    x: cfg.x,
                    y: cfg.y,
                    worldLayer: this.layers.world,
                    overheadLayer: this.layers.overhead,
                    shadowLayer: this.layers.shadows,
                    name: cfg.name,
                    color: cfg.color,
                    speed: cfg.speed,
                    attackDamage: cfg.attackDamage,
                    attackRate: cfg.attackRate,
                    npcId: cfg.id,
                },
                [
                    new IdleBehavior(),
                    new PatrolBehavior(cfg.waypoints),
                    new ChaseBehavior(this.player),
                ],
            );

            enemy.stateMachine
                .addState(new EnemyIdleState(enemy, enemy.stateMachine))
                .addState(new EnemyPatrolState(enemy, enemy.stateMachine, this.player))
                .addState(new EnemyChaseState(enemy, enemy.stateMachine, this.player))
                .addState(new EnemyDeadState(enemy))
                .setState("Idle");

            this.collisions.register(enemy);
            this.enemies.push(enemy);
        }
    }

    private buildGround() {
        const gfx = this.add.graphics();
        gfx.fillStyle(0x111122);
        gfx.fillRect(0, 0, 1920, 1080);
        gfx.lineStyle(1, 0x223355, 0.45);
        for (let x = 0; x <= 1920; x += 64) gfx.lineBetween(x, 0, x, 1080);
        for (let y = 0; y <= 1080; y += 64) gfx.lineBetween(0, y, 1920, y);
        this.layers.ground.add(gfx);
    }

    private buildTestBoxes() {
        for (const cfg of BOX_CONFIGS) {
            const shadow = this.add.ellipse(cfg.x, cfg.y + 4, 40, 14, 0x000000, 0.4);
            this.layers.shadows.add(shadow);

            const colliderArc = this.add
                .circle(cfg.x, cfg.y, BOX_COLLIDER_R, cfg.color, 0.18)
                .setStrokeStyle(1.5, cfg.color, 0.85);
            this.layers.shadows.add(colliderArc);

            this.collisions.addStatic({ x: cfg.x, y: cfg.y, radius: BOX_COLLIDER_R });

            const rect = this.add
                .rectangle(cfg.x, cfg.y, BOX_W, 68, cfg.color)
                .setStrokeStyle(2, 0xffffff, 0.6)
                .setOrigin(0.5, 1);
            this.layers.world.add(rect);

            const lbl = this.add
                .text(cfg.x, cfg.y - 76, cfg.name, {
                    fontSize: "10px",
                    color: "#ffffff",
                    fontFamily: "Arial Black",
                    stroke: "#000000",
                    strokeThickness: 3,
                })
                .setOrigin(0.5);
            this.layers.overhead.add(lbl);
        }
    }

    private onPanelOpen = () => { this.input.enabled = false; };
    private onPanelClose = () => { this.input.enabled = true; };

    changeScene() {
        this.scene.start("GameOver");
    }
}
