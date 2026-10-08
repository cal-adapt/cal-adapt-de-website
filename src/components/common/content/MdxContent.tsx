import type { ReactNode } from "react";

import Container from "@/components/common/layout/Container";

import ArticleTableOfContents from "./ArticleTableOfContents";
import CitationLinks from "./CitationLinks";

import styles from "./MdxContent.module.scss";

interface MdxContentProps {
  children: ReactNode;
}

const ARTICLE_ID = "mdx-article";

export default function MdxContent({ children }: MdxContentProps) {
  return (
    <Container align="start" spacing="page">
      <div className={styles.layout}>
        <article id={ARTICLE_ID} className={styles.content}>
          {children}
        </article>
        <ArticleTableOfContents articleId={ARTICLE_ID} className={styles.toc} />
      </div>
      <CitationLinks articleId={ARTICLE_ID} />
    </Container>
  );
}
