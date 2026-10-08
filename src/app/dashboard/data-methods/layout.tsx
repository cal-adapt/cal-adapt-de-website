import { notFound } from "next/navigation";

import type { ReactNode } from "react";

import { featureFlags } from "@/config/feature-flags";

export default function DataMethodsLayout({ children }: { children: ReactNode }) {
  if (!featureFlags.__FF_DATA_METHODS__) {
    notFound();
  }
  return children;
}
