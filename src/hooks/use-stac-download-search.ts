import { useEffect, useMemo, useState } from "react";

import { calAdaptApi } from "@/lib/cal-adapt-api";
import {
  type CustomizeSelections,
  type DataDownloadWorkspaceData,
  type DownloadBundle,
  getPackageAdapterByKind,
  getPackageAdapterByStacCollectionId,
} from "@/lib/data-download-tool";

export type StacDownloadSearchStatus = "idle" | "loading" | "success" | "error" | "skipped";

export interface UseStacDownloadSearchResult {
  status: StacDownloadSearchStatus;
  bundles: DownloadBundle[];
  totalBytes: number;
  allHrefs: string[];
  errorMessage: string | null;
}

const empty: UseStacDownloadSearchResult = {
  status: "idle",
  bundles: [],
  totalBytes: 0,
  allHrefs: [],
  errorMessage: null,
};

const skipped: UseStacDownloadSearchResult = {
  status: "skipped",
  bundles: [],
  totalBytes: 0,
  allHrefs: [],
  errorMessage: null,
};

/**
 * Runs STAC `/search` when `enabled` and maps results into download bundles.
 */
export function useStacDownloadSearch(
  workspace: Pick<DataDownloadWorkspaceData, "collectionId" | "customizeForm">,
  selections: CustomizeSelections,
  enabled: boolean
): UseStacDownloadSearchResult {
  const kind = workspace.customizeForm.kind;
  const complete = useMemo(
    () => getPackageAdapterByKind(kind).validateSelections(selections),
    [selections, kind]
  );

  const shouldFetch = enabled && complete;

  const [fetchResult, setFetchResult] = useState<UseStacDownloadSearchResult | null>(null);

  useEffect(() => {
    if (!shouldFetch) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale async results when fetch is no longer needed
      setFetchResult(null);
      return;
    }

    let cancelled = false;

    setFetchResult({
      status: "loading",
      bundles: [],
      totalBytes: 0,
      allHrefs: [],
      errorMessage: null,
    });

    (async () => {
      try {
        const filters = getPackageAdapterByStacCollectionId(
          workspace.collectionId
        ).buildSearchFilters(selections);
        const data = await calAdaptApi.stac.searchItems(filters, {
          collectionId: workspace.collectionId,
        });
        if (cancelled) {
          return;
        }
        const mapped = getPackageAdapterByKind(kind).mapItemsToBundles(data.features, selections);
        setFetchResult({
          status: "success",
          bundles: mapped.bundles,
          totalBytes: mapped.totalBytes,
          allHrefs: mapped.allHrefs,
          errorMessage: null,
        });
      } catch (e) {
        if (cancelled) {
          return;
        }
        setFetchResult({
          status: "error",
          bundles: [],
          totalBytes: 0,
          allHrefs: [],
          errorMessage: e instanceof Error ? e.message : "Search failed",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shouldFetch, workspace.collectionId, kind, selections]);

  if (!enabled) {
    return empty;
  }
  if (!complete) {
    return skipped;
  }
  return fetchResult ?? empty;
}
