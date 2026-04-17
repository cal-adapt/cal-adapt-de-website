import { calAdaptApi, isStacV2CollectionId } from "@/lib/cal-adapt-api";

import type { DataDownloadWorkspaceData } from "../types";

import { mapStacCollectionToWorkspace } from "./fromCollection";

/**
 * Server-only: fetch STAC collection (+ queryables for v2 — summaries are often empty; enums come from queryables).
 */
export async function loadDataDownloadWorkspace(
  collectionId: string
): Promise<DataDownloadWorkspaceData> {
  const collection = await calAdaptApi.stac.getCollection(collectionId);
  const queryables = isStacV2CollectionId(collectionId)
    ? await calAdaptApi.stac.getCollectionQueryables(collectionId)
    : undefined;
  return mapStacCollectionToWorkspace(collection, collectionId, { queryables });
}
