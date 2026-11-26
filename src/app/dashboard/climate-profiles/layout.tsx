import { notFound } from "next/navigation";

import type { ReactNode } from "react";

import { featureFlags } from "@/config/feature-flags";

export default function ClimateProfilesLayout({ children }: { children: ReactNode }) {
  if (!featureFlags.__FF_CLIMATE_PROFILES__) {
    notFound();
  }
  return children;
}
