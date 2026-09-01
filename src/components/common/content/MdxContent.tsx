import type { ReactNode } from "react";

import Container from "@/components/common/layout/Container";

import CitationLinks from "./CitationLinks";

import styles from "./MdxContent.module.scss";

interface MdxContentProps {
  children: ReactNode;
}

const ARTICLE_ID = "mdx-article";

export default function MdxContent({ children }: MdxContentProps) {
  return (
    <Container align="start" spacing="page">
      <article id={ARTICLE_ID} className={styles.content}>
        {children}
      </article>
      <CitationLinks articleId={ARTICLE_ID} />
    </Container>
  );
}
