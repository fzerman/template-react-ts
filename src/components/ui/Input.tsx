import {
    InputHTMLAttributes,
    TextareaHTMLAttributes,
    SelectHTMLAttributes,
    ReactNode,
    forwardRef,
} from "react";

// ─── Shared wrapper ──────────────────────────────────────────────────────────

interface FieldWrapperProps {
    label?: string;
    hint?: string;
    error?: string;
    children: ReactNode;
    className?: string;
}

function FieldWrapper({ label, hint, error, children, className }: FieldWrapperProps) {
    return (
        <div className={`cy-field ${error ? "cy-field--error" : ""} ${className ?? ""}`}>
            {label && <label className="cy-field__label">{label}</label>}
            {children}
            {error && <span className="cy-field__error">{error}</span>}
            {!error && hint && <span className="cy-field__hint">{hint}</span>}
        </div>
    );
}

// ─── Text Input ──────────────────────────────────────────────────────────────

type InputSize = "sm" | "md" | "lg";

interface CyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    label?: string;
    hint?: string;
    error?: string;
    inputSize?: InputSize;
}

export const CyInput = forwardRef<HTMLInputElement, CyInputProps>(
    ({ label, hint, error, inputSize = "md", className, ...rest }, ref) => (
        <FieldWrapper label={label} hint={hint} error={error}>
            <input
                ref={ref}
                className={`cy-input cy-input--${inputSize} ${className ?? ""}`}
                {...rest}
            />
        </FieldWrapper>
    )
);
CyInput.displayName = "CyInput";

// ─── Textarea ────────────────────────────────────────────────────────────────

interface CyTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    hint?: string;
    error?: string;
}

export const CyTextarea = forwardRef<HTMLTextAreaElement, CyTextareaProps>(
    ({ label, hint, error, className, ...rest }, ref) => (
        <FieldWrapper label={label} hint={hint} error={error}>
            <textarea
                ref={ref}
                className={`cy-textarea ${className ?? ""}`}
                {...rest}
            />
        </FieldWrapper>
    )
);
CyTextarea.displayName = "CyTextarea";

// ─── Select ──────────────────────────────────────────────────────────────────

interface CySelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    hint?: string;
    error?: string;
    options: { value: string; label: string; disabled?: boolean }[];
    placeholder?: string;
}

export const CySelect = forwardRef<HTMLSelectElement, CySelectProps>(
    ({ label, hint, error, options, placeholder, className, ...rest }, ref) => (
        <FieldWrapper label={label} hint={hint} error={error}>
            <div className="cy-select-wrap">
                <select
                    ref={ref}
                    className={`cy-select ${className ?? ""}`}
                    {...rest}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((o) => (
                        <option key={o.value} value={o.value} disabled={o.disabled}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <span className="cy-select-wrap__arrow">{"\u25BE"}</span>
            </div>
        </FieldWrapper>
    )
);
CySelect.displayName = "CySelect";

// ─── Checkbox ────────────────────────────────────────────────────────────────

interface CyCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
}

export const CyCheckbox = forwardRef<HTMLInputElement, CyCheckboxProps>(
    ({ label, className, ...rest }, ref) => (
        <label className={`cy-checkbox ${className ?? ""}`}>
            <input ref={ref} type="checkbox" {...rest} />
            <span className="cy-checkbox__box" />
            <span className="cy-checkbox__label">{label}</span>
        </label>
    )
);
CyCheckbox.displayName = "CyCheckbox";

// ─── Radio ───────────────────────────────────────────────────────────────────

interface CyRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
}

export const CyRadio = forwardRef<HTMLInputElement, CyRadioProps>(
    ({ label, className, ...rest }, ref) => (
        <label className={`cy-radio ${className ?? ""}`}>
            <input ref={ref} type="radio" {...rest} />
            <span className="cy-radio__dot" />
            <span className="cy-radio__label">{label}</span>
        </label>
    )
);
CyRadio.displayName = "CyRadio";

// ─── Toggle ──────────────────────────────────────────────────────────────────

interface CyToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
}

export const CyToggle = forwardRef<HTMLInputElement, CyToggleProps>(
    ({ label, className, ...rest }, ref) => (
        <label className={`cy-toggle ${className ?? ""}`}>
            <span className="cy-toggle__label">{label}</span>
            <span className="cy-toggle__switch">
                <input ref={ref} type="checkbox" {...rest} />
                <span className="cy-toggle__track" />
            </span>
        </label>
    )
);
CyToggle.displayName = "CyToggle";

// ─── Slider ──────────────────────────────────────────────────────────────────

interface CySliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    label?: string;
    showValue?: boolean;
}

export const CySlider = forwardRef<HTMLInputElement, CySliderProps>(
    ({ label, showValue = false, className, ...rest }, ref) => (
        <div className={`cy-slider-field ${className ?? ""}`}>
            {label && <span className="cy-slider-field__label">{label}</span>}
            <input
                ref={ref}
                type="range"
                className="cy-slider"
                {...rest}
            />
        </div>
    )
);
CySlider.displayName = "CySlider";
