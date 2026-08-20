import type { ReactNode } from "react";

import Container from "@/components/common/layout/Container";

import CitationLinks from "./CitationLinks";
import TableOfContents from "./TableOfContents";

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
        <TableOfContents articleId={ARTICLE_ID} scrollContainerId="main-content" />
      </div>
      <CitationLinks articleId={ARTICLE_ID} />
    </Container>
  );
}
