import { Suspense } from "react";
import type { Metadata } from "next";

import ExtremeHeatDays from "@/components/extreme-heat-days/ExtremeHeatDays";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navLinks.extremeHeatDays.label} - ${SITE_TITLE}`,
};

export default function ExtremeHeatDaysPage() {
  // `ExtremeHeatDays` calls `useSearchParams()` to source selections from the URL.
  // This hook must live under a Suspense boundary so the rest of the route can
  // still be statically rendered.
  return (
    <Suspense fallback={null}>
      <ExtremeHeatDays />
    </Suspense>
  );
}
