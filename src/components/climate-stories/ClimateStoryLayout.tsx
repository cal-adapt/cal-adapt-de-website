import type { ReactNode } from "react";

import ArticleTableOfContents from "@/components/common/content/ArticleTableOfContents";
import Panel from "@/components/common/content/Panel";
import CitationBox from "@/components/common/ui/CitationBox";
import type { ClimateStory } from "@/config/climate-stories";

import styles from "./ClimateStoryLayout.module.scss";

interface ClimateStoryLayoutProps {
  story: ClimateStory;
  children: ReactNode;
}

const ARTICLE_ID = "climate-story";

export default function ClimateStoryLayout({ story, children }: ClimateStoryLayoutProps) {
  return (
    <article id={ARTICLE_ID} className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{story.title}</h1>
        <p className={styles.lede}>{story.summary}</p>
        <p className={styles.meta}>Last updated: {story.lastUpdated}</p>
      </header>

      <Panel eyebrow="In this story" className={styles.intro}>
        <p className={styles.introBody}>{story.intro}</p>
      </Panel>

      <ArticleTableOfContents articleId={ARTICLE_ID} className={styles.toc} />

      <div className={styles.body}>{children}</div>

      <CitationBox title={story.title} className={styles.citation} />
    </article>
  );
}
