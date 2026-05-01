import { calAdaptApi } from "@/lib/cal-adapt-api";

import { getPackageAdapterByStacCollectionId } from "../packages/registry";
import type { DataDownloadWorkspaceData } from "../types";

import { mapStacCollectionToWorkspace } from "./fromCollection";

/**
 * Server-only: fetch STAC collection (+ queryables when the package adapter needs them —
 * v2 PgSTAC typically leaves `summaries` empty; enums come from queryables).
 */
export async function loadDataDownloadWorkspace(
  collectionId: string
): Promise<DataDownloadWorkspaceData> {
  const adapter = getPackageAdapterByStacCollectionId(collectionId);

  const collection = await calAdaptApi.stac.getCollection(collectionId);
  const queryables = adapter.needsQueryables
    ? await calAdaptApi.stac.getCollectionQueryables(collectionId)
    : undefined;

  return mapStacCollectionToWorkspace(collection, collectionId, { queryables });
}
