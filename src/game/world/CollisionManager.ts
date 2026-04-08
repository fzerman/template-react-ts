import type { Character } from './Character';

export interface StaticCollider {
    x: number;
    y: number;
    radius: number;
}

export class CollisionManager {
    private entities: Set<Character> = new Set();
    private statics: StaticCollider[] = [];

    register(entity: Character): void {
        this.entities.add(entity);
    }

    unregister(entity: Character): void {
        this.entities.delete(entity);
    }

    addStatic(collider: StaticCollider): void {
        this.statics.push(collider);
    }

    /** Call once per frame. Resolves all circle-circle collisions. */
    resolve(): void {
        // Pass 1: Entity vs Static
        for (const entity of this.entities) {
            for (const sc of this.statics) {
                this.pushOut(entity, sc.x, sc.y, sc.radius);
            }
        }

        // Pass 2: Entity vs Entity
        const arr = Array.from(this.entities);
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                this.pushApart(arr[i], arr[j]);
            }
        }
    }

    /** Push entity out of a static circle collider. */
    private pushOut(entity: Character, sx: number, sy: number, sr: number): void {
        const dx = entity.x - sx;
        const dy = entity.y - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minD = entity.collisionRadius + sr;

        if (dist < minD && dist > 0) {
            const overlap = minD - dist;
            entity.x += (dx / dist) * overlap;
            entity.y += (dy / dist) * overlap;
        }
    }

    /** Push two entities apart by half the overlap each. */
    private pushApart(a: Character, b: Character): void {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minD = a.collisionRadius + b.collisionRadius;

        if (dist < minD && dist > 0) {
            const half = (minD - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x += nx * half;
            a.y += ny * half;
            b.x -= nx * half;
            b.y -= ny * half;
        }
    }
}
