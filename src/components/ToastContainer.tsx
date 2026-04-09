import { useEffect, useState } from "react";
import { useToast, Toast, ToastVariant } from "../context/ToastContext";

function variantIcon(variant: ToastVariant): string {
    switch (variant) {
        case "success":
            return "\u2713";
        case "warning":
            return "\u26A0";
        case "error":
            return "\u2716";
        case "info":
            return "\u2139";
    }
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (toast.duration <= 0) return;
        // Start exit animation 300ms before removal
        const exitDelay = Math.max(toast.duration - 300, 0);
        const timer = setTimeout(() => setExiting(true), exitDelay);
        return () => clearTimeout(timer);
    }, [toast.duration]);

    const handleClick = () => {
        setExiting(true);
        setTimeout(onRemove, 300);
    };

    return (
        <div
            className={`toast toast--${toast.variant} ${exiting ? "toast--exit" : ""}`}
            onClick={handleClick}
        >
            <span className="toast__icon" data-variant={toast.variant}>
                {variantIcon(toast.variant)}
            </span>
            <div className="toast__body">
                <span className="toast__title">{toast.title}</span>
                {toast.message && (
                    <span className="toast__message">{toast.message}</span>
                )}
            </div>
            {toast.duration > 0 && (
                <div
                    className="toast__timer"
                    style={{
                        animationDuration: `${toast.duration}ms`,
                    }}
                />
            )}
        </div>
    );
}

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div id="toast-container">
            {toasts.map((t) => (
                <ToastItem
                    key={t.id}
                    toast={t}
                    onRemove={() => removeToast(t.id)}
                />
            ))}
        </div>
    );
}
