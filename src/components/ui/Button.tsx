import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

type ButtonVariant = "default" | "primary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface CyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: ReactNode;
    fullWidth?: boolean;
}

export const CyButton = forwardRef<HTMLButtonElement, CyButtonProps>(
    (
        {
            variant = "default",
            size = "md",
            loading = false,
            icon,
            fullWidth = false,
            children,
            className,
            disabled,
            ...rest
        },
        ref
    ) => {
        const classes = [
            "cy-btn",
            `cy-btn--${variant}`,
            `cy-btn--${size}`,
            fullWidth ? "cy-btn--full" : "",
            loading ? "cy-btn--loading" : "",
            className ?? "",
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <button
                ref={ref}
                className={classes}
                disabled={disabled || loading}
                {...rest}
            >
                {loading && <span className="cy-btn__spinner" />}
                {!loading && icon && (
                    <span className="cy-btn__icon">{icon}</span>
                )}
                {children && <span className="cy-btn__text">{children}</span>}
            </button>
        );
    }
);
CyButton.displayName = "CyButton";
