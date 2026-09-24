import type { Metadata } from "next";

import PageLayout from "@/components/dashboard/PageLayout";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navLinks.glossary.label} - ${SITE_TITLE}`,
};

export default function GlossaryPage() {
  return (
    <PageLayout title={navLinks.glossary.label} citationTitle={false}>
      <p>Content coming soon.</p>
    </PageLayout>
  );
}
