"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import InfoTooltip from "./InfoTooltip";

import styles from "./LabelValue.module.scss";

export interface LabelValueProps {
  label: ReactNode;
  value: ReactNode;
  /** Optional helper shown in an info (i) tooltip next to the label (matches Pencil “Label / Value” + info). */
  hint?: ReactNode;
  className?: string;
}

/**
 * Vertical “label / value” pair: label row (optional info tooltip) + value — common for read-only
 * summaries and detail rows.
 */
export default function LabelValue({ label, value, hint, className }: LabelValueProps) {
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {hint != null ? (
          <InfoTooltip
            content={hint}
            placement="top"
            iconClassName={styles.hintIcon}
            ariaLabel="Additional information"
          />
        ) : null}
      </div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
