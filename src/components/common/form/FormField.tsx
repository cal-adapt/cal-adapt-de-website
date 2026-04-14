"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
} from "react";

import clsx from "clsx";

import Badge from "@/components/common/ui/Badge";
import InfoTooltip from "@/components/common/ui/InfoTooltip";

import FormInlineError from "./FormInlineError";
import Label from "./Label";

import styles from "./FormField.module.scss";

function mergeDescribedBy(existing: string | undefined, ids: string[]): string | undefined {
  const parts = [existing, ...ids].filter(Boolean) as string[];
  const merged = parts.join(" ").trim();
  return merged.length > 0 ? merged : undefined;
}

export interface FormFieldProps {
  /** Explicit id for the control; otherwise a stable id is generated. */
  id?: string;
  label?: ReactNode;
  /** Renders at the end of the label row (e.g. “N selected”), with space-between. */
  labelAccessory?: ReactNode;
  hint?: ReactNode;
  /** `inline` shows hint text under the label; `tooltip` shows an (i) icon with the hint on hover/focus. */
  hintVariant?: "inline" | "tooltip";
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps a single control (`Input`, custom `Select`, `Textarea`, `Checkbox`, or `MultiSelect`) with
 * label, optional hint (below the label or in an info tooltip), and error text.
 * Wires `id`, `aria-describedby`, and `aria-invalid`.
 */
export default function FormField({
  id: idProp,
  label,
  labelAccessory,
  hint,
  hintVariant = "inline",
  error,
  required,
  className,
  children,
}: FormFieldProps) {
  const genId = useId();
  const fieldId = idProp ?? genId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  const describedIds: string[] = [];
  if (hint) {
    describedIds.push(hintId);
  }
  if (error) {
    describedIds.push(errorId);
  }

  let control: ReactNode = children;

  if (Children.count(children) === 1 && isValidElement(children)) {
    const child = children as ReactElement<{
      id?: string;
      invalid?: boolean;
      "aria-describedby"?: string;
      "aria-invalid"?: boolean;
      "aria-required"?: boolean;
    }>;

    control = cloneElement(child, {
      id: child.props.id ?? fieldId,
      invalid: child.props.invalid ?? Boolean(error),
      "aria-invalid": error ? true : child.props["aria-invalid"],
      "aria-describedby": mergeDescribedBy(child.props["aria-describedby"], describedIds),
      "aria-required": child.props["aria-required"] ?? required ?? undefined,
    });
  }

  const hintTooltip =
    hint != null && hint !== "" && hintVariant === "tooltip" ? (
      <InfoTooltip
        className={styles.hintTooltipIcon}
        iconClassName={styles.hintInfoIcon}
        content={<span>{hint}</span>}
        placement="top"
      />
    ) : null;

  return (
    <div className={clsx(styles.root, className)}>
      {label != null && label !== "" ? (
        labelAccessory != null || hintTooltip != null ? (
          <div className={styles.labelRow}>
            {hintTooltip != null ? (
              <div className={styles.labelGroup}>
                <Label className={styles.labelInRow} htmlFor={fieldId} required={required}>
                  {label}
                </Label>
                {hintTooltip}
              </div>
            ) : (
              <Label className={styles.labelInRow} htmlFor={fieldId} required={required}>
                {label}
              </Label>
            )}
            <span className={styles.labelAccessory}>
              {labelAccessory ?? (
                <span className={styles.labelAccessoryPlaceholder} aria-hidden>
                  {/*
                    Reserves the same space as a real “N selected” Badge so fields without a badge
                    align with sibling fields in a grid (label row height / control start position).
                  */}
                  <Badge>00 selected</Badge>
                </span>
              )}
            </span>
          </div>
        ) : (
          <Label htmlFor={fieldId} required={required}>
            {label}
          </Label>
        )
      ) : null}
      {hint && hintVariant === "inline" ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {hint && hintVariant === "tooltip" ? (
        <span id={hintId} className="sr-only">
          {hint}
        </span>
      ) : null}
      {control}
      {error ? (
        <FormInlineError variant="field" id={errorId}>
          {error}
        </FormInlineError>
      ) : null}
    </div>
  );
}
