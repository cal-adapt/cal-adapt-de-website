import { notFound } from "next/navigation";

import type { ReactNode } from "react";

import { featureFlags } from "@/config/feature-flags";

export default function ClimateStoriesLayout({ children }: { children: ReactNode }) {
  if (!featureFlags.__FF_CLIMATE_STORIES__) {
    notFound();
  }
  return children;
}
