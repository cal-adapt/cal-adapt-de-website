"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import Container from "@/components/common/layout/Container";
import CitationBox from "@/components/common/ui/CitationBox";

import styles from "./PageLayout.module.scss";

export interface PageLayoutProps {
  title: ReactNode;
  /**
   * Plain-text citation title, e.g. navLinks.dataDownload.label. Defaults to `title`
   * when it's a plain string; pass explicitly if `title` is JSX (e.g. includes a badge),
   * or pass `false` to skip the citation box entirely.
   */
  citationTitle?: string | false;
  children?: ReactNode;
  className?: string;
}

/**
 * Shared page layout for any page under `/dashboard/*`: wraps children in the global
 * `<Container>` (max-width, page padding) and renders an h1 tool title at the top.
 */
export default function PageLayout({ title, citationTitle, children, className }: PageLayoutProps) {
  const resolvedCitationTitle = citationTitle ?? (typeof title === "string" ? title : undefined);

  return (
    <Container align="start" spacing="page">
      <div className={clsx(styles.pageLayout, className)}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.inner}>{children}</div>
        {resolvedCitationTitle ? <CitationBox title={resolvedCitationTitle} /> : null}
      </div>
    </Container>
  );
}
