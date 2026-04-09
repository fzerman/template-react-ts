import type { IBehavior } from '../behaviors/IBehavior';
import { Character, type CharacterConfig } from './Character';

export interface EnemyConfig extends CharacterConfig {
    attackDamage?: number;
    attackRate?: number;
    npcId?: string;
}

export class Enemy extends Character {
    readonly attackDamage: number;
    readonly attackRate: number;
    readonly npcId: string;

    private behaviors: Map<string, IBehavior> = new Map();

    constructor(config: EnemyConfig, behaviors?: IBehavior[]) {
        super(config);
        this.attackDamage = config.attackDamage ?? 10;
        this.attackRate   = config.attackRate ?? 1;
        this.npcId        = config.npcId ?? config.name;

        if (behaviors) {
            for (const b of behaviors) {
                this.addBehavior(b);
            }
        }
    }

    addBehavior(behavior: IBehavior): void {
        this.behaviors.set(behavior.name, behavior);
        behavior.onAttach?.(this);
    }

    removeBehavior(name: string): void {
        const b = this.behaviors.get(name);
        if (b) {
            b.onDetach?.(this);
            this.behaviors.delete(name);
        }
    }

    getBehavior<T extends IBehavior>(name: string): T | undefined {
        return this.behaviors.get(name) as T | undefined;
    }

    runBehavior(name: string, delta: number): void {
        this.behaviors.get(name)?.update(this, delta);
    }

    destroy(): void {
        for (const b of this.behaviors.values()) {
            b.onDetach?.(this);
        }
        this.behaviors.clear();
        super.destroy();
    }
}
