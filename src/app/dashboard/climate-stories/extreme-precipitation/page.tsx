import type { Metadata } from "next";

import PageLayout from "@/components/dashboard/PageLayout";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navLinks.extremePrecipitationStory.label} - ${SITE_TITLE}`,
};

export default function ExtremePrecipitationStoryPage() {
  return (
    <PageLayout title={navLinks.extremePrecipitationStory.label} citationTitle={false}>
      <p>Content coming soon.</p>
    </PageLayout>
  );
}
