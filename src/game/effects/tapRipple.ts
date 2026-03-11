import type { Scene } from 'phaser';

/**
 * Spawns a ripple circle at (x, y) and fades it out.
 * Works for both touch and mouse input feedback.
 */
export function tapRipple(
    scene: Scene,
    x: number,
    y: number,
    options: { color?: number; radius?: number; duration?: number } = {}
): void {
    const { color = 0xffff00, radius = 20, duration = 400 } = options;

    const dot = scene.add.circle(x, y, radius, color, 0.8);
    scene.tweens.add({
        targets: dot,
        alpha: 0,
        scaleX: 2,
        scaleY: 2,
        duration,
        onComplete: () => dot.destroy(),
    });
}
