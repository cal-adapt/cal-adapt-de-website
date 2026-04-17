import type { StacCollection, StacCollectionQueryables } from "@/lib/cal-adapt-api";

import { getPackageAdapterByStacCollectionId } from "../packages/registry";
import type { DataDownloadWorkspaceData } from "../types";

export type MapStacCollectionToWorkspaceOptions = {
  /** v2: `/collections/{id}/queryables` enums when `summaries` is empty (LOCA2 county, Standard/Typical Met Year). */
  queryables?: StacCollectionQueryables;
};

/**
 * Maps a STAC `Collection` response into the workspace view-model used by `DataDownload`.
 * The package adapter (chosen by `collectionId`) drives customize-form construction.
 */
export function mapStacCollectionToWorkspace(
  collection: StacCollection,
  collectionId: string,
  options?: MapStacCollectionToWorkspaceOptions
): DataDownloadWorkspaceData {
  const adapter = getPackageAdapterByStacCollectionId(collectionId);

  return {
    collectionId,
    datasetTitle: collection.title?.trim() || collection.id,
    datasetDescription: collection.description?.trim() || "",
    summaries: collection.summaries ?? {},
    license: collection.license,
    catalogPackageId: adapter.id,
    customizeForm: adapter.buildCustomizeForm(collection, options?.queryables),
  };
}
