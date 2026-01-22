import { Suspense } from "react";
import type { Metadata } from "next";

import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import DataExplorer from "@/components/data-explorer/DataExplorer";
import { SITE_TITLE } from "@/config/constants";

export const metadata: Metadata = {
  title: `Data Explorer - ${SITE_TITLE}`,
};

export default async function DataExplorerPage() {
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
      <DataExplorer />
    </Suspense>
  );
}
