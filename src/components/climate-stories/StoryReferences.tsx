import { formatBibliography } from "@/lib/citations/bibliography";

import type { StorySection } from "./StoryTableOfContents";

import styles from "./StoryReferences.module.scss";

export const STORY_REFERENCES_SECTION = {
  id: "references",
  title: "References",
} as const satisfies StorySection;

interface StoryReferencesProps {
  id?: string;
  citationKeys: readonly string[];
}

export default async function StoryReferences({
  id = STORY_REFERENCES_SECTION.id,
  citationKeys,
}: StoryReferencesProps) {
  const headingId = `${id}-heading`;
  const bibliography = await formatBibliography(citationKeys);

  return (
    <section id={id} className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {STORY_REFERENCES_SECTION.title}
      </h2>
      <div className={styles.bibliography} dangerouslySetInnerHTML={{ __html: bibliography }} />
    </section>
  );
}
