import { Suspense } from "react";
import type { Metadata } from "next";

import ClimateProfiles from "@/components/climate-profiles/ClimateProfiles";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navLinks.climateProfiles.label} - ${SITE_TITLE}`,
};

export default function ClimateProfilesPage() {
  // `ClimateProfiles` reads selections from the URL with `useSearchParams()`,
  // which must sit under a Suspense boundary for static export.
  return (
    <Suspense fallback={null}>
      <ClimateProfiles />
    </Suspense>
  );
}
