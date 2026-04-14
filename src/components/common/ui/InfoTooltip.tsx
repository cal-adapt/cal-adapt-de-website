"use client";

import { type ReactNode,useEffect, useId, useRef, useState } from "react";

import clsx from "clsx";

import Icon from "./Icon";

import styles from "./InfoTooltip.module.scss";

export type InfoTooltipPlacement = "top" | "bottom" | "left" | "right";

export interface InfoTooltipProps {
  /** Tooltip body (plain text or rich content). */
  content: ReactNode;
  placement?: InfoTooltipPlacement;
  /** Root wrapper; use to clear margins when inline with labels. */
  className?: string;
  iconClassName?: string;
  /** Accessible name for the trigger button. */
  ariaLabel?: string;
}

const placementClass: Record<InfoTooltipPlacement, string> = {
  top: styles.placementTop,
  bottom: styles.placementBottom,
  left: styles.placementLeft,
  right: styles.placementRight,
};

/**
 * Accessible info (i) control with rich content on hover or keyboard focus.
 * Pure CSS/React — no MUI. Tooltip content is hidden until opened; `aria-describedby` links when open.
 */
export default function InfoTooltip({
  content,
  placement = "top",
  className,
  iconClassName,
  ariaLabel = "Additional information",
}: InfoTooltipProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = hovered || focused;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHovered(false);
        setFocused(false);
        triggerRef.current?.blur();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <span
      className={clsx(styles.root, className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={ariaLabel}
        aria-describedby={open ? tooltipId : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <Icon variant="alertInfo" className={clsx(styles.icon, iconClassName)} aria-hidden />
      </button>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={clsx(styles.popover, placementClass[placement])}
        >
          <span className={styles.popoverInner}>{content}</span>
        </span>
      ) : null}
    </span>
  );
}
