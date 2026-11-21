"use client";

import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import Link from "@/components/common/ui/Link";
import {
  glossaryEntries,
  glossaryEntryLabel,
  glossaryEntrySummary,
  type GlossaryId,
} from "@/config/glossary";
import { isNavLinkEnabled, navLinks } from "@/config/navigation";

import styles from "./GlossaryTerm.module.scss";

/** Space kept between the popover and the edge of the page, in pixels. */
const POPOVER_EDGE_GAP = 16;

interface GlossaryTermProps {
  /** The glossary entry to define; its term and definition come from the glossary. */
  id: GlossaryId;
  /** Text shown in the story. Defaults to the glossary term. */
  children?: ReactNode;
  /**
   * Punctuation right after the term, such as "," or ".". Pass it here rather than after the
   * component: browsers can wrap the line right after a button, which would leave the
   * punctuation alone at the start of the next line.
   */
  punctuation?: string;
}

export default function GlossaryTerm({ id, children, punctuation }: GlossaryTermProps) {
  const entry = glossaryEntries.find((e) => e.id === id)!;
  const term = glossaryEntryLabel(entry);
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLSpanElement>(null);
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
        if (rootRef.current?.contains(document.activeElement)) {
          (document.activeElement as HTMLElement).blur();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // The popover opens left-aligned under the term. Near the right edge of the page that would
  // push it off screen, so shift it left just enough to fit.
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!open || !popover) {
      return;
    }

    const { left, right } = popover.getBoundingClientRect();
    const overflow = right - (document.documentElement.clientWidth - POPOVER_EDGE_GAP);
    if (overflow > 0) {
      const shift = Math.min(overflow, left - POPOVER_EDGE_GAP);
      popover.style.left = `${-shift}px`;
    }
  }, [open]);

  return (
    <span
      ref={rootRef}
      className={styles.root}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      // Stay open while focus moves from the term to the glossary link inside the popover.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setFocused(false);
        }
      }}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label={`${term}, definition`}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
      >
        {children ?? entry.term}
      </button>
      {punctuation}
      {open ? (
        <span id={tooltipId} ref={popoverRef} className={styles.popover}>
          <span className={styles.kicker}>Glossary</span>
          <span className={styles.term}>{term}</span>
          <span className={styles.definition}>{glossaryEntrySummary(entry)}</span>
          {isNavLinkEnabled(navLinks.glossary) ? (
            <Link href={`${navLinks.glossary.href}#${entry.id}`} className={styles.more}>
              Full definition
            </Link>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
