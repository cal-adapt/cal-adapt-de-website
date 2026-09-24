import type { Metadata } from "next";

import PageLayout from "@/components/dashboard/PageLayout";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navLinks.electricityAssetPlanning.label} - ${SITE_TITLE}`,
};

export default function ElectricityAssetPlanningPage() {
  return (
    <PageLayout title={navLinks.electricityAssetPlanning.label} citationTitle={false} beta>
      <p>Content coming soon.</p>
    </PageLayout>
  );
}
