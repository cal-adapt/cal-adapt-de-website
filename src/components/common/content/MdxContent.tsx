import type { ReactNode } from "react";

import Container from "@/components/common/layout/Container";

import styles from "./MdxContent.module.scss";

interface MdxContentProps {
  children: ReactNode;
}

export default function MdxContent({ children }: MdxContentProps) {
  return (
    <Container align="start" spacing="page">
      <article className={styles.content}>{children}</article>
    </Container>
  );
}
