"use client";

import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

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

/** Minimum gap (px) kept between a tooltip and the edge of the window. */
const VIEWPORT_MARGIN = 8;

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
  const popoverRef = useRef<HTMLSpanElement>(null);

  // Nudge a top/bottom tooltip horizontally so it stays inside the window;
  // the arrow is offset by the same amount so it still points at the icon.
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!open || !popover || (placement !== "top" && placement !== "bottom")) return;
    popover.style.setProperty("--tooltip-shift", "0px");
    const { left, right } = popover.getBoundingClientRect();
    const maxRight = document.documentElement.clientWidth - VIEWPORT_MARGIN;
    let shift = 0;
    if (right > maxRight) shift = Math.max(maxRight - right, VIEWPORT_MARGIN - left);
    else if (left < VIEWPORT_MARGIN) shift = VIEWPORT_MARGIN - left;
    popover.style.setProperty("--tooltip-shift", `${shift}px`);
  }, [open, placement]);

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
          ref={popoverRef}
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
