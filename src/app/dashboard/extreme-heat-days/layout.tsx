import { notFound } from "next/navigation";

import type { ReactNode } from "react";

import { featureFlags } from "@/config/feature-flags";

export default function ExtremeHeatDaysLayout({ children }: { children: ReactNode }) {
  if (!featureFlags.__FF_EXTREME_HEAT_DAYS__) {
    notFound();
  }
  return children;
}
