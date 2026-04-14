"use client";

import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import clsx from "clsx";
import { Check, ChevronDown, Minus, X } from "lucide-react";

import fd from "./FormDropdown.module.scss";
import styles from "./MultiSelect.module.scss";

const MARK_ON_DARK_PX = 12;

function MultiSelectCheckboxIcon({ mode }: { mode: "unchecked" | "checked" | "indeterminate" }) {
  if (mode === "indeterminate") {
    return (
      <Minus
        size={MARK_ON_DARK_PX}
        strokeWidth={2}
        className={styles.checkboxMarkOnDark}
        aria-hidden
      />
    );
  }
  if (mode === "checked") {
    return (
      <Check
        size={MARK_ON_DARK_PX}
        strokeWidth={2.5}
        className={styles.checkboxMarkOnDark}
        aria-hidden
      />
    );
  }
  return null;
}

function MultiSelectCheckboxBox({
  mode,
  children,
}: {
  mode: "unchecked" | "checked" | "indeterminate";
  children: ReactNode;
}) {
  const filled = mode === "checked" || mode === "indeterminate";
  return (
    <span className={clsx(styles.checkboxBox, filled && styles.checkboxBoxFilled)} aria-hidden>
      {children}
    </span>
  );
}

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  id?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  className?: string;
  /** CSS length for the options panel, e.g. `32rem`. Default: `22rem` via shared dropdown token. */
  dropdownMaxHeight?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(function MultiSelect(
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
  const [visibleChipCount, setVisibleChipCount] = useState(() => value.length);
  const rootRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const selectAllInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const enabledValues = useMemo(
    () => options.filter((o) => !o.disabled).map((o) => o.value),
    [options]
  );

  const selectedOptions = useMemo(() => {
    const map = new Map(options.map((o) => [o.value, o]));
    return value.map((v) => map.get(v)).filter(Boolean) as MultiSelectOption[];
  }, [options, value]);

  const selectionKey = useMemo(() => value.join("\0"), [value]);

  const cappedVisibleCount = Math.min(visibleChipCount, selectedOptions.length);

  const visibleSelectedOptions = useMemo(
    () => selectedOptions.slice(0, cappedVisibleCount),
    [selectedOptions, cappedVisibleCount]
  );

  const moreSelectedCount = selectedOptions.length - cappedVisibleCount;

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset visible count before overflow trim measures DOM
    setVisibleChipCount(selectedOptions.length);
  }, [selectionKey, selectedOptions.length]);

  /**
   * Chips area uses a fixed max-height (~3 rows). If content (chips + “+N more”) overflows,
   * remove one chip and re-measure on the next paint until it fits — row count comes from layout,
   * not a fixed chip count.
   */
  useLayoutEffect(() => {
    const el = chipsRef.current;
    if (!el || selectedOptions.length === 0) {
      return;
    }
    if (el.scrollHeight > el.clientHeight + 1 && visibleChipCount > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- iterative DOM measurement requires setState in layout effect
      setVisibleChipCount((c) => c - 1);
    }
  }, [selectedOptions.length, visibleChipCount]);

  /** Width changes how chips wrap → re-show all, then trim. */
  useEffect(() => {
    const el = chipsRef.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(() => {
      setVisibleChipCount(selectedOptions.length);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [selectedOptions.length, selectionKey]);

  const allEnabledSelected =
    enabledValues.length > 0 && enabledValues.every((v) => value.includes(v));

  const selectedEnabledCount = useMemo(
    () => enabledValues.filter((v) => value.includes(v)).length,
    [enabledValues, value]
  );

  const selectAllIndeterminate =
    enabledValues.length > 0 &&
    selectedEnabledCount > 0 &&
    selectedEnabledCount < enabledValues.length;

  const selectAllIconMode = selectAllIndeterminate
    ? "indeterminate"
    : allEnabledSelected
      ? "checked"
      : "unchecked";

  const toggleValue = useCallback(
    (v: string) => {
      if (disabled) {
        return;
      }
      const opt = options.find((o) => o.value === v);
      if (opt?.disabled) {
        return;
      }
      if (value.includes(v)) {
        onChange(value.filter((x) => x !== v));
      } else {
        onChange([...value, v]);
      }
    },
    [disabled, onChange, options, value]
  );

  const removeValue = useCallback(
    (v: string) => {
      if (disabled) {
        return;
      }
      onChange(value.filter((x) => x !== v));
    },
    [disabled, onChange, value]
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useLayoutEffect(() => {
    const el = selectAllInputRef.current;
    if (!el) {
      return;
    }
    if (enabledValues.length === 0) {
      el.indeterminate = false;
      return;
    }
    const selectedEnabledCount = enabledValues.filter((v) => value.includes(v)).length;
    el.indeterminate = selectedEnabledCount > 0 && selectedEnabledCount < enabledValues.length;
  }, [enabledValues, value]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const rootStyle: CSSProperties | undefined =
    dropdownMaxHeight != null && dropdownMaxHeight !== ""
      ? { ["--form-dropdown-max-height" as string]: dropdownMaxHeight }
      : undefined;

  return (
    <div
      ref={rootRef}
      className={clsx(fd.root, className)}
      style={rootStyle}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
    >
      <div className={fd.control}>
        <button
          ref={ref}
          id={id}
          type="button"
          className={clsx(fd.trigger, invalid && fd.triggerInvalid)}
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
          <div className={styles.chipsRow}>
            {selectedOptions.length === 0 ? (
              <p className={fd.placeholder}>{placeholder}</p>
            ) : (
              <div ref={chipsRef} className={styles.chips}>
                {visibleSelectedOptions.map((opt) => (
                  <span key={opt.value} className={styles.chip}>
                    <span className={styles.chipLabel}>{opt.label}</span>
                    {/*
                      Not <button>: must not nest interactive content inside the trigger <button>.
                      Plain span + click only (no tabindex): users can still clear via the listbox.
                    */}
                    <span
                      className={styles.chipRemove}
                      title={`Remove ${opt.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) {
                          removeValue(opt.value);
                        }
                      }}
                    >
                      <X size={12} strokeWidth={2} aria-hidden />
                    </span>
                  </span>
                ))}
                {moreSelectedCount > 0 ? (
                  <span
                    className={styles.moreText}
                    aria-label={`${moreSelectedCount} more selected`}
                  >
                    +{moreSelectedCount} more
                  </span>
                ) : null}
              </div>
            )}
          </div>
          <ChevronDown
            className={clsx(fd.chevron, open && fd.chevronOpen)}
            size={12}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>

        {open ? (
          <ul id={listboxId} className={fd.list} role="listbox" aria-multiselectable="true">
            <li className={styles.selectAllRow} role="presentation">
              <label className={clsx(fd.optionLabel, styles.selectAllLabel)}>
                <input
                  ref={selectAllInputRef}
                  type="checkbox"
                  className={clsx("sr-only", styles.checkboxInput)}
                  checked={allEnabledSelected}
                  disabled={disabled || enabledValues.length === 0}
                  onChange={() => {
                    if (disabled || enabledValues.length === 0) {
                      return;
                    }
                    if (allEnabledSelected) {
                      onChange([]);
                    } else {
                      onChange([...enabledValues]);
                    }
                  }}
                />
                <MultiSelectCheckboxBox mode={selectAllIconMode}>
                  <MultiSelectCheckboxIcon mode={selectAllIconMode} />
                </MultiSelectCheckboxBox>
                <span className={fd.optionText}>Select all</span>
              </label>
            </li>
            {options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <li key={opt.value} className={fd.option} role="option" aria-selected={selected}>
                  <label className={clsx(fd.optionLabel, styles.optionLabelWithCheckbox)}>
                    <input
                      type="checkbox"
                      className={clsx("sr-only", styles.checkboxInput)}
                      checked={selected}
                      disabled={disabled || opt.disabled}
                      onChange={() => toggleValue(opt.value)}
                    />
                    <MultiSelectCheckboxBox mode={selected ? "checked" : "unchecked"}>
                      <MultiSelectCheckboxIcon mode={selected ? "checked" : "unchecked"} />
                    </MultiSelectCheckboxBox>
                    <span className={fd.optionText}>{opt.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
});

export default MultiSelect;
