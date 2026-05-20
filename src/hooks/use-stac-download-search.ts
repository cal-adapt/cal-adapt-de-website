import { useEffect, useState } from "react";

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
  const adapter = getPackageAdapterByKind(kind);
  const complete = adapter.validateSelections(selections);

  const shouldFetch = enabled && complete;

  // Effect key covers only the selection fields this package cares about, so unrelated
  // keystrokes in the customize form don't force the effect to re-register.
  const filtersKey = adapter.searchFiltersKey(selections);

  const [fetchResult, setFetchResult] = useState<UseStacDownloadSearchResult | null>(null);

  useEffect(() => {
    if (!shouldFetch) {
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
        const data = await calAdaptApi.stac.searchItems(filters);
        if (cancelled) {
          return;
        }
        const mapped = getPackageAdapterByKind(kind).mapItemsToBundles(
          data.features,
          selections,
          workspace.customizeForm
        );
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
    // `selections` is intentionally omitted: `filtersKey` derives from the subset of
    // `selections` that affects this package's search + mapping. Including the full
    // object would force the effect to re-register on every unrelated keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetch, workspace.collectionId, kind, filtersKey]);

  if (!enabled) {
    return empty;
  }
  if (!complete) {
    return skipped;
  }
  return fetchResult ?? empty;
}
