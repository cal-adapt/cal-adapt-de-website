import type { Metadata } from "next";

import PageLayout from "@/components/dashboard/PageLayout";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navLinks.extremeHeatStory.label} - ${SITE_TITLE}`,
};

export default function ExtremeHeatStoryPage() {
  return (
    <PageLayout title={navLinks.extremeHeatStory.label} citationTitle={false}>
      <p>Content coming soon.</p>
    </PageLayout>
  );
}
