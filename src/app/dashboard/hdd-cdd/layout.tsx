import { notFound } from "next/navigation";

import type { ReactNode } from "react";

import { featureFlags } from "@/config/feature-flags";

export default function HddCddLayout({ children }: { children: ReactNode }) {
  if (!featureFlags.__FF_HDD_CDD__) {
    notFound();
  }
  return children;
}
