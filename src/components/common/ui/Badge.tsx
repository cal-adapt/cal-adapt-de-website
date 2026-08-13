"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import styles from "./Badge.module.scss";

export type BadgeVariant = "blue" | "blue-subtle";
export type BadgeSize = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  blue: styles.blue,
  "blue-subtle": styles.blueSubtle,
};

export interface BadgeProps {
  children: ReactNode;
  /** `blue` is a solid fill; `blue-subtle` is a low-contrast tint for dense surfaces. */
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  /** Accessible label (and native tooltip) for icon-only or ambiguous badges. */
  title?: string;
  /** For live regions when content updates (e.g. selection counts). */
  "aria-live"?: "off" | "polite" | "assertive";
}

export default function Badge({
  children,
  variant = "blue-subtle",
  size = "sm",
  className,
  title,
  "aria-live": ariaLive,
}: BadgeProps) {
  return (
    <span
      className={clsx(styles.root, styles[size], VARIANT_CLASS[variant], className)}
      title={title}
      aria-live={ariaLive}
    >
      {children}
    </span>
  );
}
