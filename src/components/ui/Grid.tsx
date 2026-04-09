import { HTMLAttributes, ReactNode } from "react";

// ─── Row ─────────────────────────────────────────────────────────────────────

type RowAlign = "start" | "center" | "end" | "stretch";
type RowJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
type RowGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";

interface RowProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    align?: RowAlign;
    justify?: RowJustify;
    gap?: RowGap;
    wrap?: boolean;
}

export function Row({
    children,
    align = "stretch",
    justify = "start",
    gap = "md",
    wrap = true,
    className,
    ...rest
}: RowProps) {
    const classes = [
        "cy-row",
        `cy-row--align-${align}`,
        `cy-row--justify-${justify}`,
        `cy-row--gap-${gap}`,
        wrap ? "cy-row--wrap" : "",
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classes} {...rest}>
            {children}
        </div>
    );
}

// ─── Col ─────────────────────────────────────────────────────────────────────

type ColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "auto";

interface ColProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    span?: ColSpan;
    sm?: ColSpan;
    md?: ColSpan;
    lg?: ColSpan;
    offset?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
}

export function Col({
    children,
    span = "auto",
    sm,
    md,
    lg,
    offset,
    className,
    ...rest
}: ColProps) {
    const classes = [
        "cy-col",
        span !== "auto" ? `cy-col--${span}` : "",
        sm ? `cy-col--sm-${sm}` : "",
        md ? `cy-col--md-${md}` : "",
        lg ? `cy-col--lg-${lg}` : "",
        offset ? `cy-col--offset-${offset}` : "",
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classes} {...rest}>
            {children}
        </div>
    );
}
