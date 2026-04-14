import type { StacCollection, StacCollectionQueryables } from "@/lib/cal-adapt-api";

import { catalogPackageIdForStacCollection } from "../catalog/ids";
import { buildCustomizeFormConfigFromStacCollection } from "../customize/loca2";
import type { DataDownloadWorkspaceData } from "../types";

export type MapStacCollectionToWorkspaceOptions = {
  /** v2: `/collections/{id}/queryables` enums when `summaries` is empty (LOCA2 county, Standard/Typical Met Year). */
  queryables?: StacCollectionQueryables;
};

/**
 * Maps a STAC `Collection` response into the workspace view-model used by `DataDownload`.
 */
export function mapStacCollectionToWorkspace(
  collection: StacCollection,
  collectionId: string,
  options?: MapStacCollectionToWorkspaceOptions
): DataDownloadWorkspaceData {
  const catalogPackageId = catalogPackageIdForStacCollection(collectionId);

  return {
    collectionId,
    datasetTitle: collection.title?.trim() || collection.id,
    datasetDescription: collection.description?.trim() || "",
    summaries: collection.summaries ?? {},
    license: collection.license,
    catalogPackageId,
    customizeForm: buildCustomizeFormConfigFromStacCollection(
      collection,
      catalogPackageId,
      options?.queryables != null ? { queryables: options.queryables } : undefined
    ),
  };
}
