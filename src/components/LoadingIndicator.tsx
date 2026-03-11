interface Props {
    label?: string;
}

export function LoadingIndicator({ label = "Loading..." }: Props) {
    return (
        <div className="panel-loading">
            <div className="panel-loading__spinner" />
            <span className="panel-loading__label">{label}</span>
        </div>
    );
}
