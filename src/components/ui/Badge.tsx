import { ReactNode } from "react";

type BadgeVariant = "default" | "gold" | "orange" | "pink" | "dim";

interface CyBadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    dot?: boolean;
    className?: string;
}

export function CyBadge({
    children,
    variant = "default",
    dot = false,
    className,
}: CyBadgeProps) {
    return (
        <span className={`cy-badge cy-badge--${variant} ${className ?? ""}`}>
            {dot && <span className="cy-badge__dot" />}
            {children}
        </span>
    );
}
