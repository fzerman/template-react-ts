import { useCallback, useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { CyButton } from "./Button";
import { ModalContext, ModalConfig } from "../../context/ModalContext";

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modal, setModal] = useState<ModalConfig | null>(null);
    const [closing, setClosing] = useState(false);
    const nextId = useRef(1);

    const closeModal = useCallback(() => {
        setClosing(true);
        setTimeout(() => {
            setModal(null);
            setClosing(false);
        }, 200);
    }, []);

    const open = useCallback(
        (opts: Omit<ModalConfig, "id">) => {
            setClosing(false);
            setModal({ ...opts, id: nextId.current++ });
        },
        []
    );

    const confirm = useCallback(
        (opts: Omit<ModalConfig, "id" | "variant"> & { variant?: ModalConfig["variant"] }) => {
            open({ variant: opts.variant ?? "confirm", ...opts });
        },
        [open]
    );

    const danger = useCallback(
        (opts: Omit<ModalConfig, "id" | "variant">) => {
            open({ ...opts, variant: "danger" });
        },
        [open]
    );

    const info = useCallback(
        (opts: Omit<ModalConfig, "id" | "variant" | "cancelLabel" | "onCancel">) => {
            open({ ...opts, variant: "info" });
        },
        [open]
    );

    const handleConfirm = () => {
        modal?.onConfirm?.();
        closeModal();
    };

    const handleCancel = () => {
        modal?.onCancel?.();
        closeModal();
    };

    return (
        <ModalContext.Provider value={{ confirm, danger, info, closeModal }}>
            {children}
            {modal &&
                createPortal(
                    <ModalOverlay
                        modal={modal}
                        closing={closing}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                    />,
                    document.body
                )}
        </ModalContext.Provider>
    );
}

// ─── Modal Overlay ───────────────────────────────────────────────────────────

interface ModalOverlayProps {
    modal: ModalConfig;
    closing: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ModalOverlay({ modal, closing, onConfirm, onCancel }: ModalOverlayProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onCancel]);

    const variantIcon = () => {
        switch (modal.variant) {
            case "danger":
                return "\u26A0";
            case "info":
                return "\u2139";
            case "confirm":
                return "\u2753";
        }
    };

    return (
        <div className={`cy-modal-overlay ${closing ? "cy-modal-overlay--closing" : ""}`}>
            <div className="cy-modal-backdrop" onClick={onCancel} />
            <div className={`cy-modal cy-modal--${modal.variant}`}>
                <div className="cy-modal__icon" data-variant={modal.variant}>
                    {variantIcon()}
                </div>
                <h3 className="cy-modal__title">{modal.title}</h3>
                <div className="cy-modal__message">{modal.message}</div>
                <div className="cy-modal__actions">
                    {modal.variant !== "info" && (
                        <CyButton variant="ghost" onClick={onCancel}>
                            {modal.cancelLabel ?? "Cancel"}
                        </CyButton>
                    )}
                    <CyButton
                        variant={modal.variant === "danger" ? "danger" : "primary"}
                        onClick={onConfirm}
                    >
                        {modal.confirmLabel ?? "Confirm"}
                    </CyButton>
                </div>
            </div>
        </div>
    );
}
