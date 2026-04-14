"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import Container from "@/components/common/layout/Container";

import styles from "./ToolPageLayout.module.scss";

export interface ToolPageLayoutProps {
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}

export default function ToolPageLayout({ title, children, className }: ToolPageLayoutProps) {
  return (
    <Container align="start" spacing="page">
      <div className={clsx(styles.toolPageLayout, className)}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.inner}>{children}</div>
      </div>
    </Container>
  );
}
