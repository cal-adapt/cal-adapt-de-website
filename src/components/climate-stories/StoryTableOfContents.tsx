import clsx from "clsx";

import styles from "./StoryTableOfContents.module.scss";

export interface StorySection {
  id: string;
  title: string;
}

interface StoryTableOfContentsProps {
  sections: readonly StorySection[];
  className?: string;
}

export default function StoryTableOfContents({ sections, className }: StoryTableOfContentsProps) {
  return (
    <nav className={clsx(styles.root, className)} aria-label="On this page">
      <p className={styles.label}>Table of contents</p>
      <ol className={styles.list}>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
