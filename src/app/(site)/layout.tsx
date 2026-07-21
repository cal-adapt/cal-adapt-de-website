import type { ReactNode } from "react";

import Header from "@/components/common/layout/Header";

interface SiteLayoutProps {
  children: ReactNode;
}

/**
 * Layout for marketing/content routes. These share the floating site `Header`
 * (positioned over the page hero). Dashboard routes live outside this group so
 * they render their own chrome without the global header overlaying it.
 */
export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      <Header />
      <main id="main-content">{children}</main>
    </>
  );
}
