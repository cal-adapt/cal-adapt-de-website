import type { ReactNode } from "react";

import type { ClimateStory } from "@/config/climate-stories";

import StoryTableOfContents, { type StoryHeading } from "./StoryTableOfContents";

import styles from "./ClimateStoryLayout.module.scss";

interface ClimateStoryLayoutProps {
  story: ClimateStory;
  headings: readonly StoryHeading[];
  children: ReactNode;
}

export default function ClimateStoryLayout({ story, headings, children }: ClimateStoryLayoutProps) {
  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{story.title}</h1>
        <p className={styles.lede}>{story.summary}</p>
        <p className={styles.meta}>Last updated: {story.lastUpdated}</p>
      </header>

      <aside className={styles.intro}>
        <p className={styles.introKicker}>In this story</p>
        <p className={styles.introBody}>{story.intro}</p>
      </aside>

      <StoryTableOfContents headings={headings} className={styles.toc} />

      <div className={styles.body}>{children}</div>
    </article>
  );
}
