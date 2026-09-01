"use client";

import {
  type CSSProperties,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";

import Badge from "@/components/common/ui/Badge";

import styles from "./FormDropdown.module.scss";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  hint?: string;
  description?: string;
}

export interface SelectProps {
  id?: string;
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  className?: string;
  /** CSS length for the options panel, e.g. `28rem`. Default follows shared dropdown token (`22rem`). */
  dropdownMaxHeight?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    id,
    options,
    value,
    onChange,
    disabled = false,
    invalid = false,
    placeholder = "Select…",
    className,
    dropdownMaxHeight,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-required": ariaRequired,
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const rootStyle: CSSProperties | undefined =
    dropdownMaxHeight != null && dropdownMaxHeight !== ""
      ? { ["--form-dropdown-max-height" as string]: dropdownMaxHeight }
      : undefined;

  return (
    <div
      ref={rootRef}
      className={clsx(styles.root, className)}
      style={rootStyle}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
    >
      <div className={styles.control}>
        <button
          ref={ref}
          id={id}
          type="button"
          className={clsx(styles.trigger, invalid && styles.triggerInvalid)}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined}
          aria-describedby={ariaDescribedBy}
          onClick={() => {
            if (!disabled) {
              setOpen((o) => !o);
            }
          }}
        >
          {selected ? (
            <span className={styles.value}>{selected.label}</span>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
          <ChevronDown
            className={clsx(styles.chevron, open && styles.chevronOpen)}
            size={12}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>

        {open ? (
          <ul
            id={listboxId}
            className={styles.list}
            role="listbox"
            aria-activedescendant={undefined}
          >
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <li
                  key={opt.value}
                  className={styles.option}
                  role="option"
                  aria-selected={isSelected}
                  title={opt.hint}
                >
                  <button
                    type="button"
                    className={styles.optionLabel}
                    disabled={disabled || opt.disabled}
                    onClick={() => {
                      if (disabled || opt.disabled) {
                        return;
                      }
                      onChange(opt.value);
                      close();
                    }}
                  >
                    <span className={styles.optionCopy}>
                      <span className={styles.optionHead}>
                        <span className={styles.optionText}>{opt.label}</span>
                        {opt.hint ? (
                          <Badge variant="blue-subtle" size="sm">
                            {opt.hint}
                          </Badge>
                        ) : null}
                      </span>
                      {opt.description ? (
                        <span className={styles.optionDescription}>{opt.description}</span>
                      ) : null}
                    </span>
                    {isSelected ? (
                      <Check className={styles.optionCheck} size={16} strokeWidth={2} aria-hidden />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
});

export default Select;
