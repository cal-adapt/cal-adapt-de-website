import { Suspense } from "react";

import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import DataExplorer from "@/components/data-explorer/DataExplorer";

export default async function DataExplorerWrapper() {
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
      <DataExplorer></DataExplorer>
    </Suspense>
  );
}
