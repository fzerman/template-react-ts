import type { Character } from '../world/Character';
import type { IBehavior } from './IBehavior';

export class IdleBehavior implements IBehavior {
    readonly name = 'idle';

    update(owner: Character, _delta: number): void {
        owner.vx = 0;
        owner.vy = 0;
    }
}
