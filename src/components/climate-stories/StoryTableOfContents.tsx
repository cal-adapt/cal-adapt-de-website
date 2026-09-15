import clsx from "clsx";

import styles from "./StoryTableOfContents.module.scss";

export interface StoryHeading {
  id: string;
  label: string;
}

interface StoryTableOfContentsProps {
  headings: readonly StoryHeading[];
  className?: string;
}

export default function StoryTableOfContents({ headings, className }: StoryTableOfContentsProps) {
  return (
    <nav className={clsx(styles.root, className)} aria-label="On this page">
      <p className={styles.label}>Table of contents</p>
      <ol className={styles.list}>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`}>{heading.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
