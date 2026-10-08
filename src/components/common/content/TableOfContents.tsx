import clsx from "clsx";

import styles from "./TableOfContents.module.scss";

export interface TocSection {
  id: string;
  title: string;
  /** Renders the entry indented under the section before it. */
  nested?: boolean;
}

interface TableOfContentsProps {
  sections: readonly TocSection[];
  className?: string;
}

export default function TableOfContents({ sections, className }: TableOfContentsProps) {
  return (
    <nav className={clsx(styles.root, className)} aria-label="On this page">
      <p className={styles.label}>Table of contents</p>
      <ol className={styles.list}>
        {sections.map((section) => (
          <li key={section.id} className={clsx(section.nested && styles.nested)}>
            <a href={`#${section.id}`}>{section.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
