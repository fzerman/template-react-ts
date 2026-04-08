import type { Character } from '../world/Character';
import type { IBehavior } from './IBehavior';

export class FleeBehavior implements IBehavior {
    readonly name = 'flee';

    private target: Character;

    constructor(target: Character) {
        this.target = target;
    }

    update(owner: Character, delta: number): void {
        const dx = owner.x - this.target.x;
        const dy = owner.y - this.target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return;

        owner.x += (dx / dist) * owner.speed * (delta / 1000);
        owner.y += (dy / dist) * owner.speed * (delta / 1000);
    }
}
