import { Suspense } from "react";
import type { Metadata } from "next";

import ClimateMetricsMap from "@/components/climate-metrics-map/ClimateMetricsMap";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navLinks.climateMetricsMap.label} - ${SITE_TITLE}`,
};

export default async function ClimateMetricsMapPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <LoadingSpinner />
        </div>
      }
    >
      <ClimateMetricsMap />
    </Suspense>
  );
}
