"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import Container from "@/components/common/layout/Container";
import Alert from "@/components/common/ui/Alert";
import Badge from "@/components/common/ui/Badge";
import CitationBox from "@/components/common/ui/CitationBox";
import Link from "@/components/common/ui/Link";
import { FEEDBACK_URL } from "@/config/constants";
import { analytics } from "@/lib/analytics";

import styles from "./PageLayout.module.scss";

export interface PageLayoutProps {
  title: ReactNode;
  /**
   * Plain-text citation title, e.g. navLinks.dataDownload.label. Defaults to `title`
   * when it's a plain string; pass explicitly if `title` is JSX (e.g. includes a badge),
   * or pass `false` to skip the citation box entirely.
   */
  citationTitle?: string | false;
  /** Beta tools get a "Beta" badge next to the title and a feedback notice above the content. */
  beta?: boolean;
  children?: ReactNode;
  className?: string;
}

/**
 * Shared page layout for any page under `/dashboard/*`: wraps children in the global
 * `<Container>` (max-width, page padding) and renders an h1 tool title at the top.
 */
export default function PageLayout({
  title,
  citationTitle,
  beta = false,
  children,
  className,
}: PageLayoutProps) {
  const resolvedCitationTitle = citationTitle ?? (typeof title === "string" ? title : undefined);

  return (
    <Container align="start" spacing="page">
      <div className={clsx(styles.pageLayout, className)}>
        <h1 className={styles.title}>
          {title}
          {beta && (
            <Badge variant="blue" size="lg" className={styles.betaBadge}>
              Beta
            </Badge>
          )}
        </h1>
        <div className={styles.inner}>
          {beta && (
            <Alert severity="info" className={styles.betaAlert} ariaLabel="Beta notice">
              Suggestions for improvements, questions, and general comments are all welcome. Fill
              out the feedback form{" "}
              <Link
                href={FEEDBACK_URL}
                onClick={() => analytics.trackExternalLink(FEEDBACK_URL, "feedback survey")}
              >
                here
              </Link>
              .
            </Alert>
          )}
          {children}
        </div>
        {resolvedCitationTitle ? <CitationBox title={resolvedCitationTitle} /> : null}
      </div>
    </Container>
  );
}
