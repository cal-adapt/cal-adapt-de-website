import { Suspense } from "react";
import type { Metadata } from "next";

import HddCdd from "@/components/hdd-cdd/HddCdd";
import { SITE_TITLE } from "@/config/constants";
import { navLinks } from "@/config/navigation";

export const metadata: Metadata = {
  title: `${navLinks.hddCdd.label} - ${SITE_TITLE}`,
};

export default function HddCddPage() {
  // `HddCdd` calls `useSearchParams()` to source selections from the URL.
  // This hook must live under a Suspense boundary so the rest of the route can
  // still be statically rendered.
  return (
    <Suspense fallback={null}>
      <HddCdd />
    </Suspense>
  );
}
