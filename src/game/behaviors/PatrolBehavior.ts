import type { Character } from '../world/Character';
import type { IBehavior } from './IBehavior';

export class PatrolBehavior implements IBehavior {
    readonly name = 'patrol';

    private waypoints: { x: number; y: number }[];
    private currentIndex = 0;
    private reachThreshold = 8;

    constructor(waypoints: { x: number; y: number }[]) {
        this.waypoints = waypoints;
    }

    update(owner: Character, delta: number): void {
        const target = this.waypoints[this.currentIndex];
        const dx = target.x - owner.x;
        const dy = target.y - owner.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.reachThreshold) {
            this.currentIndex = (this.currentIndex + 1) % this.waypoints.length;
            return;
        }

        owner.x += (dx / dist) * owner.speed * (delta / 1000);
        owner.y += (dy / dist) * owner.speed * (delta / 1000);
    }
}
