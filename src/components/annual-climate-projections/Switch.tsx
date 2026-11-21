"use client";

import { useId } from "react";

import clsx from "clsx";

import InfoTooltip from "@/components/common/ui/InfoTooltip";

import styles from "./Switch.module.scss";

export interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Tooltip text shown in an (i) icon after the label. Empty or missing shows no icon. */
  hint?: string;
  /** Lighter label weight, for a switch nested under another control. */
  subtle?: boolean;
  disabled?: boolean;
}

/**
 * On/off switch with its label (and optional info tooltip) on the left and the
 * track on the right. The tooltip sits outside the switch button because a
 * button can't contain another button.
 */
export default function Switch({ label, checked, onChange, hint, subtle, disabled }: SwitchProps) {
  const id = useId();

  return (
    <div className={clsx(styles.root, subtle && styles.subtle)}>
      <span className={styles.labelGroup}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {hint ? (
          <InfoTooltip
            className={styles.hintTooltipIcon}
            iconClassName={styles.hintInfoIcon}
            content={<span>{hint}</span>}
          />
        ) : null}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={styles.track}
        onClick={() => onChange(!checked)}
        disabled={disabled}
      >
        <span className={styles.knob} />
      </button>
    </div>
  );
}
