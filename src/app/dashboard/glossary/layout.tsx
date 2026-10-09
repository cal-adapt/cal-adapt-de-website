import { notFound } from "next/navigation";

import type { ReactNode } from "react";

import { featureFlags } from "@/config/feature-flags";

export default function GlossaryLayout({ children }: { children: ReactNode }) {
  if (!featureFlags.__FF_GLOSSARY__) {
    notFound();
  }
  return children;
}
