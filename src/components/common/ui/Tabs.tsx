"use client";

import { type KeyboardEvent, useRef } from "react";

import clsx from "clsx";

import styles from "./Tabs.module.scss";

export interface TabItem<T extends string> {
  /** Value reported via `onChange` when this tab is activated. */
  value: T;
  /** Visible tab label. */
  label: string;
  /** DOM id of the tab button; reference it from the controlled panel's
   *  `aria-labelledby`. */
  tabId: string;
  /** DOM id of the panel this tab controls; wired to the button's
   *  `aria-controls`. */
  panelId: string;
  /* Disabled tabs are skipped by keyboard navigation */
  disabled?: boolean;
  /** Hover tooltip for the tab (e.g. "Coming soon" on a disabled tab). */
  hint?: string;
}

export interface TabsProps<T extends string> {
  /** Currently selected tab value (controlled). */
  value: T;
  onChange: (next: T) => void;
  tabs: readonly TabItem<T>[];
  /** Accessible name for the tablist (e.g. "Chart view"). */
  label: string;
}

/**
 * Generic, controlled tablist implementing the WAI-ARIA tabs pattern.
 */
export default function Tabs<T extends string>({ value, onChange, tabs, label }: TabsProps<T>) {
  // Keyed by tab value so keyboard navigation can move focus to the
  // newly-selected tab.
  const buttonsRef = useRef<Partial<Record<T, HTMLButtonElement | null>>>({});

  const focusTab = (next: T) => {
    onChange(next);
    buttonsRef.current[next]?.focus();
  };

  /** Nearest selectable tab starting at `from` and stepping by `dir`, wrapping
   *  around the ends. Returns `null` when every tab is disabled. */
  const enabledTabFrom = (from: number, dir: 1 | -1): TabItem<T> | null => {
    for (let i = 1; i <= tabs.length; i++) {
      const candidate = tabs[(from + dir * i + tabs.length * i) % tabs.length];
      if (!candidate.disabled) {
        return candidate;
      }
    }
    return null;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: TabItem<T> | null = null;
    switch (e.key) {
      case "ArrowRight":
        next = enabledTabFrom(index, 1);
        break;
      case "ArrowLeft":
        next = enabledTabFrom(index, -1);
        break;
      case "Home":
        next = enabledTabFrom(-1, 1);
        break;
      case "End":
        next = enabledTabFrom(tabs.length, -1);
        break;
      default:
        return;
    }
    e.preventDefault();
    if (next) {
      focusTab(next.value);
    }
  };

  return (
    <div className={styles.root} role="tablist" aria-label={label}>
      {tabs.map((tab, index) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            id={tab.tabId}
            ref={(el) => {
              buttonsRef.current[tab.value] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={tab.disabled ? undefined : tab.panelId}
            aria-disabled={tab.disabled || undefined}
            title={tab.hint}
            tabIndex={selected ? 0 : -1}
            className={clsx(
              styles.tab,
              selected && styles.tabSelected,
              tab.disabled && styles.tabDisabled
            )}
            onClick={() => {
              if (!tab.disabled) {
                onChange(tab.value);
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
