import type { Character } from '../world/Character';

export interface IBehavior {
    readonly name: string;
    update(owner: Character, delta: number): void;
    onAttach?(owner: Character): void;
    onDetach?(owner: Character): void;
}
