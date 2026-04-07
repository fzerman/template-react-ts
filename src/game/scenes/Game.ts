import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { PANEL_EVENTS } from "../../context/PanelContext";
import { LayerManager } from "../world/LayerManager";
import { Player } from "../world/Player";

const BOX_CONFIGS = [
    { x: 180, y: 220, color: 0x00d4ff, name: "BOX A" },
    { x: 700, y: 290, color: 0xf5e642, name: "BOX B" },
    { x: 380, y: 510, color: 0x00ff88, name: "BOX C" },
    { x: 800, y: 560, color: 0xff8800, name: "BOX D" },
    { x: 120, y: 440, color: 0xaa44ff, name: "BOX E" },
    { x: 570, y: 380, color: 0xff6688, name: "BOX F" },
];

const BOX_W = 48;
const BOX_COLLIDER_R = BOX_W / 2; // 24

interface CircleCollider {
    x: number;
    y: number;
    radius: number;
}

export class Game extends Scene {
    private layers!: LayerManager;
    private player!: Player;
    private boxColliders: CircleCollider[] = [];

    constructor() {
        super("Game");
    }

    create() {
        this.cameras.main.setBackgroundColor(0x111122);

        this.layers = new LayerManager(this);

        this.buildGround();
        this.buildTestBoxes();

        this.player = new Player(
            this,
            512,
            400,
            this.layers.world,
            this.layers.overhead,
            this.layers.shadows,
        );

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
        this.resolveCollisions();
        this.layers.sort();
    }

    shutdown() {
        EventBus.removeListener(PANEL_EVENTS.OPENED, this.onPanelOpen, this);
        EventBus.removeListener(PANEL_EVENTS.CLOSED, this.onPanelClose, this);
        this.player.destroy();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

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
            // Flat drop-shadow ellipse
            const shadow = this.add.ellipse(
                cfg.x,
                cfg.y + 4,
                40,
                14,
                0x000000,
                0.4,
            );
            this.layers.shadows.add(shadow);

            // Collision circle — centered at feet, radius = box width / 2
            const colliderArc = this.add
                .circle(cfg.x, cfg.y, BOX_COLLIDER_R, cfg.color, 0.18)
                .setStrokeStyle(1.5, cfg.color, 0.85);
            this.layers.shadows.add(colliderArc);

            // Store collider data for resolution
            this.boxColliders.push({
                x: cfg.x,
                y: cfg.y,
                radius: BOX_COLLIDER_R,
            });

            // Body rectangle — origin at feet (0.5, 1) so .y is the Y-sort key
            const rect = this.add
                .rectangle(cfg.x, cfg.y, BOX_W, 68, cfg.color)
                .setStrokeStyle(2, 0xffffff, 0.6)
                .setOrigin(0.5, 1);
            this.layers.world.add(rect);

            // Label in overhead layer — always visible above everything
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

    /** Circle-circle collision: push player out of any overlapping box collider. */
    private resolveCollisions() {
        const pr = this.player.collisionRadius;
        const ps = this.player.sprite;

        for (const box of this.boxColliders) {
            const dx = ps.x - box.x;
            const dy = ps.y - box.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minD = pr + box.radius;

            if (dist < minD && dist > 0) {
                const overlap = minD - dist;
                ps.x += (dx / dist) * overlap;
                ps.y += (dy / dist) * overlap;
            }
        }
    }

    private onPanelOpen = () => {
        this.input.enabled = false;
    };
    private onPanelClose = () => {
        this.input.enabled = true;
    };

    changeScene() {
        this.scene.start("GameOver");
    }
}

