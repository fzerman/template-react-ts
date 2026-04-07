export class LayerManager {
    readonly ground:   Phaser.GameObjects.Layer;
    readonly shadows:  Phaser.GameObjects.Layer;
    readonly world:    Phaser.GameObjects.Layer;
    readonly overhead: Phaser.GameObjects.Layer;
    readonly effects:  Phaser.GameObjects.Layer;

    constructor(scene: Phaser.Scene) {
        this.ground   = scene.add.layer().setDepth(0);
        this.shadows  = scene.add.layer().setDepth(10);
        this.world    = scene.add.layer().setDepth(100);
        this.overhead = scene.add.layer().setDepth(1000);
        this.effects  = scene.add.layer().setDepth(2000);
    }

    /** Call once per frame — re-orders worldLayer children by their Y (feet) position. */
    sort() {
        this.world.sort('y');
    }
}
