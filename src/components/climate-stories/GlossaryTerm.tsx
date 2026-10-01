"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import styles from "./GlossaryTerm.module.scss";

interface GlossaryTermProps {
  term: string;
  definition: ReactNode;
  children?: ReactNode;
}

export default function GlossaryTerm({ term, definition, children }: GlossaryTermProps) {
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
      className={styles.root}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={`${term}, definition`}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children ?? term}
      </button>
      {open ? (
        <span id={tooltipId} role="tooltip" className={styles.popover}>
          <span className={styles.kicker}>Glossary</span>
          <span className={styles.term}>{term}</span>
          <span className={styles.definition}>{definition}</span>
        </span>
      ) : null}
    </span>
  );
}
