export interface IState {
    readonly name: string;
    enter(): void;
    update(delta: number): void;
    exit(): void;
}
