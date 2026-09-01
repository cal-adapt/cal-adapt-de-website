"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import Container from "@/components/common/layout/Container";

import styles from "./PageLayout.module.scss";

export interface PageLayoutProps {
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Shared page layout for any page under `/dashboard/*`: wraps children in the global
 * `<Container>` (max-width, page padding) and renders an h1 tool title at the top.
 */
export default function PageLayout({ title, children, className }: PageLayoutProps) {
  return (
    <Container align="start" spacing="page">
      <div className={clsx(styles.pageLayout, className)}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.inner}>{children}</div>
      </div>
    </Container>
  );
}
