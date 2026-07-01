import type { ReactNode } from "react";

import Container from "@/components/common/layout/Container";

import styles from "./MdxContent.module.scss";

interface MdxContentProps {
  children: ReactNode;
}

/** Shared layout + prose styling for MDX content pages under `/dashboard/*`. */
export default function MdxContent({ children }: MdxContentProps) {
  return (
    <Container align="start" spacing="page">
      <article className={styles.content}>{children}</article>
    </Container>
  );
}
