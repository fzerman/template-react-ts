import type { Character } from '../world/Character';
import type { IBehavior } from './IBehavior';

export class ChaseBehavior implements IBehavior {
    readonly name = 'chase';

    private target: Character;
    private stopDistance: number;

    constructor(target: Character, stopDistance = 50) {
        this.target = target;
        this.stopDistance = stopDistance;
    }

    update(owner: Character, delta: number): void {
        const dx = this.target.x - owner.x;
        const dy = this.target.y - owner.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Stop when close enough — prevents collision jitter
        if (dist < this.stopDistance) return;

        owner.x += (dx / dist) * owner.speed * (delta / 1000);
        owner.y += (dy / dist) * owner.speed * (delta / 1000);
    }
}
