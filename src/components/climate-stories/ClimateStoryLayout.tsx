import type { ReactNode } from "react";

import Panel from "@/components/common/content/Panel";
import CitationBox from "@/components/common/ui/CitationBox";
import type { ClimateStory } from "@/config/climate-stories";

import { STORY_REFERENCES_SECTION } from "./StoryReferences";
import StoryTableOfContents, { type StorySection } from "./StoryTableOfContents";

import styles from "./ClimateStoryLayout.module.scss";

interface ClimateStoryLayoutProps {
  story: ClimateStory;
  sections: readonly StorySection[];
  children: ReactNode;
}

export default function ClimateStoryLayout({ story, sections, children }: ClimateStoryLayoutProps) {
  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{story.title}</h1>
        <p className={styles.lede}>{story.summary}</p>
        <p className={styles.meta}>Last updated: {story.lastUpdated}</p>
      </header>

      <Panel eyebrow="In this story" className={styles.intro}>
        <p className={styles.introBody}>{story.intro}</p>
      </Panel>

      <StoryTableOfContents
        sections={[...sections, STORY_REFERENCES_SECTION]}
        className={styles.toc}
      />

      <div className={styles.body}>{children}</div>

      <CitationBox title={story.title} className={styles.citation} />
    </article>
  );
}
