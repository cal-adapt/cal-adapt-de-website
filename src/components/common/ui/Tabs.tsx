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

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1;
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        focusTab(tabs[index === last ? 0 : index + 1].value);
        return;
      case "ArrowLeft":
        e.preventDefault();
        focusTab(tabs[index === 0 ? last : index - 1].value);
        return;
      case "Home":
        e.preventDefault();
        focusTab(tabs[0].value);
        return;
      case "End":
        e.preventDefault();
        focusTab(tabs[last].value);
        return;
      default:
        return;
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
            aria-controls={tab.panelId}
            tabIndex={selected ? 0 : -1}
            className={clsx(styles.tab, selected && styles.tabSelected)}
            onClick={() => onChange(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
