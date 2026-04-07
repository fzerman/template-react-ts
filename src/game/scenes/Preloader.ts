import { Scene } from "phaser";

const W = 1920;
const H = 1080;
const MIN_MS = 4000; // minimum splash duration

export class Preloader extends Scene {
    private startTime = 0;

    constructor() {
        super("Preloader");
    }

    init() {
        this.startTime = Date.now();

        // ── Dark background ──────────────────────────────────────────────────
        this.add.rectangle(W / 2, H / 2, W, H, 0x0a0a14);

        // ── Title text ───────────────────────────────────────────────────────
        const title = this.add
            .text(W / 2, H / 2 - 160, "MAFIA", {
                fontFamily: "Arial Black",
                fontSize: "96px",
                color: "#ffffff",
                stroke: "#00d4ff",
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setAlpha(0);

        this.tweens.add({
            targets: title,
            alpha: 1,
            duration: 600,
            ease: "Sine.easeOut",
        });

        // ── Bar layout ───────────────────────────────────────────────────────
        const barW = 480;
        const barH = 6;
        const barX = W / 2 - barW / 2;
        const barY = H / 2 + 80;

        // Track
        this.add
            .rectangle(W / 2, barY + barH / 2, barW, barH, 0x223355)
            .setOrigin(0.5);

        // Fill
        const fill = this.add
            .rectangle(barX, barY, 0, barH, 0x00d4ff)
            .setOrigin(0, 0);

        // Glow cap
        const cap = this.add
            .rectangle(barX, barY - 2, 4, barH + 4, 0xffffff)
            .setOrigin(0.5, 0)
            .setAlpha(0.9);

        // Percentage text
        const pct = this.add
            .text(W / 2, barY + 24, "0%", {
                fontFamily: "Arial",
                fontSize: "18px",
                color: "rgba(255,255,255,0.55)",
                letterSpacing: 4,
            })
            .setOrigin(0.5, 0);

        // ── Progress listener ────────────────────────────────────────────────
        // We split progress into two phases:
        //   Asset load  → fills bar to 85%
        //   Min-wait    → animates the remaining 15% once assets are done
        this.load.on("progress", (progress: number) => {
            const visual = progress * 0.85;
            fill.width = barW * visual;
            cap.x = barX + fill.width;
            pct.setText(`${Math.round(visual * 100)}%`);
        });

        // Store refs so create() can finish the bar animation
        this.registry.set("__preloader_fill", fill);
        this.registry.set("__preloader_cap", cap);
        this.registry.set("__preloader_pct", pct);
        this.registry.set("__preloader_barW", barW);
        this.registry.set("__preloader_barX", barX);
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("logo", "logo.png");
        this.load.image("star", "star.png");
    }

    create() {
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, MIN_MS - elapsed);

        const fill = this.registry.get(
            "__preloader_fill",
        ) as Phaser.GameObjects.Rectangle;
        const cap = this.registry.get(
            "__preloader_cap",
        ) as Phaser.GameObjects.Rectangle;
        const pct = this.registry.get(
            "__preloader_pct",
        ) as Phaser.GameObjects.Text;
        const barW = this.registry.get("__preloader_barW") as number;
        const barX = this.registry.get("__preloader_barX") as number;

        // Animate bar from 85% → 100% over the remaining wait time
        const startFill = fill.width;
        const endFill = barW;

        this.tweens.addCounter({
            from: startFill,
            to: endFill,
            duration: remaining,
            ease: "Sine.easeInOut",
            onUpdate: (tween) => {
                const w = tween.getValue() ?? 0;
                fill.width = w as number;
                cap.x = barX + (w as number);
                pct.setText(`${Math.round(((w as number) / barW) * 100)}%`);
            },
            onComplete: () => {
                this.scene.start("MainMenu");
            },
        });
    }
}

