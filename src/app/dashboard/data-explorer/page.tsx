import { Suspense } from "react";

import DataExplorer from "@/components/data-explorer/DataExplorer";
import LoadingSpinner from "@/components/global/LoadingSpinner";

import "@/styles/dashboard/data-explorer.scss";

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
