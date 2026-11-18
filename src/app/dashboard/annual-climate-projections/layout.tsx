import { notFound } from "next/navigation";

import type { ReactNode } from "react";

import { featureFlags } from "@/config/feature-flags";

export default function AnnualClimateProjectionsLayout({ children }: { children: ReactNode }) {
  if (!featureFlags.__FF_ANNUAL_CLIMATE_PROJECTIONS__) {
    notFound();
  }
  return children;
}
