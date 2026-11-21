import { Suspense } from "react";
import type { Metadata } from "next";

import AnnualClimateProjections from "@/components/annual-climate-projections/AnnualClimateProjections";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navLinks.annualClimateProjections.label} - ${SITE_TITLE}`,
};

export default function AnnualClimateProjectionsPage() {
  // `AnnualClimateProjections` calls `useSearchParams()`, which must live under
  // a Suspense boundary so the rest of the route can be statically rendered.
  return (
    <Suspense fallback={null}>
      <AnnualClimateProjections />
    </Suspense>
  );
}
