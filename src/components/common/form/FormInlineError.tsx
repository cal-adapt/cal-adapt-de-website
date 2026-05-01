"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import OctagonAlertFilled from "@/components/common/ui/OctagonAlertFilled";

import styles from "./FormInlineError.module.scss";

export interface FormInlineErrorProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /**
   * `field` — under a single `FormField` (tighter top margin). `default` — standalone block (e.g. section).
   */
  variant?: "default" | "field";
}

/**
 * Inline validation text with octagon icon (no box). Use with `FormField` (`variant="field"`) or standalone (`default`).
 */
export default function FormInlineError({
  children,
  className,
  id,
  variant = "default",
}: FormInlineErrorProps) {
  return (
    <div
      className={clsx(
        styles.root,
        variant === "field" ? styles.rootField : styles.rootDefault,
        className
      )}
      id={id}
      role="alert"
    >
      <span className={styles.iconWrap} aria-hidden>
        <OctagonAlertFilled size={14} />
      </span>
      <span className={styles.text}>{children}</span>
    </div>
  );
}
