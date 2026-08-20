import Link from "./Link";

import styles from "./Citation.module.scss";

export interface CitationProps {
  /** Reference number, matching its position in the source list. */
  n: number;
  href: string;
  /** Accessible name for the link, e.g. "Source: World Health Organization — ...". */
  label: string;
}

/** A numbered, superscript citation link — the site-wide style for hand-authored
 * in-text references (mirrors the numbered bibliography style rehype-citation
 * renders on MDX pages). */
export default function Citation({ n, href, label }: CitationProps) {
  return (
    <sup className={styles.citation}>
      <Link href={href} aria-label={label} className={styles.link}>
        {n}
      </Link>
    </sup>
  );
}
