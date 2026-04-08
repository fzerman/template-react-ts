import type { IState } from './IState';

export class StateMachine {
    private currentState: IState | null = null;
    private states: Map<string, IState> = new Map();

    addState(state: IState): this {
        this.states.set(state.name, state);
        return this;
    }

    setState(name: string): void {
        const next = this.states.get(name);
        if (!next) {
            console.warn(`StateMachine: unknown state "${name}"`);
            return;
        }
        if (this.currentState === next) return;

        this.currentState?.exit();
        this.currentState = next;
        this.currentState.enter();
    }

    update(delta: number): void {
        this.currentState?.update(delta);
    }

    getCurrentState(): string | null {
        return this.currentState?.name ?? null;
    }
}
