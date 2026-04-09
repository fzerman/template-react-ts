import {
    createContext,
    useContext,
    useCallback,
    useState,
    useRef,
    ReactNode,
} from "react";

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface Toast {
    id: number;
    variant: ToastVariant;
    title: string;
    message?: string;
    duration: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (
        opts: Omit<Toast, "id" | "duration"> & { duration?: number }
    ) => number;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const nextId = useRef(1);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        (
            opts: Omit<Toast, "id" | "duration"> & { duration?: number }
        ): number => {
            const id = nextId.current++;
            const duration = opts.duration ?? DEFAULT_DURATION;
            const toast: Toast = { ...opts, id, duration };

            setToasts((prev) => [...prev, toast]);

            if (duration > 0) {
                setTimeout(() => removeToast(id), duration);
            }

            return id;
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx;
}
