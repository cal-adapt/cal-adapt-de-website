import type { ReactNode } from "react";

import styles from "./StoryBlock.module.scss";

interface StoryBlockProps {
  id: string;
  title: string;
  children: ReactNode;
}

export default function StoryBlock({ id, title, children }: StoryBlockProps) {
  const headingId = `${id}-heading`;

  return (
    <section id={id} className={styles.block} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {title}
      </h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
