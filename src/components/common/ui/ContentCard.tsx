import Link from "@/components/common/ui/Link";

import styles from "./ContentCard.module.scss";

export interface ContentCardProps {
  href: string;
  title: string;
  /** Short category label above the title, e.g. "Heat". */
  eyebrow?: string;
  summary?: string;
}

/** Linked card with a figure placeholder, title and summary, for listing pages in a grid. */
export default function ContentCard({ href, title, eyebrow, summary }: ContentCardProps) {
  return (
    <Link className={styles.card} href={href} aria-label={summary ? `${title}: ${summary}` : title}>
      <div className={styles.thumbnail} aria-hidden>
        <span className={styles.thumbnailLabel}>[FPO: Figure]</span>
      </div>
      <div className={styles.body}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <h2 className={styles.title}>{title}</h2>
        {summary ? <p className={styles.summary}>{summary}</p> : null}
      </div>
    </Link>
  );
}
