import { createContext, useContext, ReactNode } from "react";

export interface ModalConfig {
    id: number;
    title: string;
    message: string | ReactNode;
    variant: "confirm" | "danger" | "info";
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export interface ModalContextValue {
    confirm: (opts: Omit<ModalConfig, "id" | "variant"> & { variant?: ModalConfig["variant"] }) => void;
    danger: (opts: Omit<ModalConfig, "id" | "variant">) => void;
    info: (opts: Omit<ModalConfig, "id" | "variant" | "cancelLabel" | "onCancel">) => void;
    closeModal: () => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used inside ModalProvider");
    return ctx;
}
