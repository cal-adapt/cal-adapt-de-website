"use client";

import clsx from "clsx";

import styles from "./Switch.module.scss";

export interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Lighter label weight, for a switch nested under another control. */
  subtle?: boolean;
  disabled?: boolean;
}

/** On/off switch with its label on the left and the track on the right. */
export default function Switch({ label, checked, onChange, subtle, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={clsx(styles.root, subtle && styles.subtle)}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
    </button>
  );
}
