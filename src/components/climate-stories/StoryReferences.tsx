import { formatBibliography } from "@/lib/citations/bibliography";

import StoryBlock from "./StoryBlock";

import styles from "./StoryReferences.module.scss";

export const STORY_REFERENCES_SECTION = {
  id: "references",
  title: "References",
} as const;

interface StoryReferencesProps {
  id?: string;
  citationKeys: readonly string[];
}

export default async function StoryReferences({
  id = STORY_REFERENCES_SECTION.id,
  citationKeys,
}: StoryReferencesProps) {
  const bibliography = await formatBibliography(citationKeys);

  return (
    <StoryBlock id={id} title={STORY_REFERENCES_SECTION.title}>
      <div className={styles.bibliography} dangerouslySetInnerHTML={{ __html: bibliography }} />
    </StoryBlock>
  );
}
