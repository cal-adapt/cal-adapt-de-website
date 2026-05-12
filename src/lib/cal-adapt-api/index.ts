/**
 *  Cal-Adapt API Client
 */

import * as map from "./map-api";
import * as stac from "./stac-api";

export const calAdaptApi = { map, stac };

export type { TileJson } from "./map-api";
export type {
  ItemSearchFilters,
  StacAsset,
  StacCollection,
  StacCollectionQueryables,
  StacItem,
  StacItemCollection,
} from "./stac-api";
export { getCollectionQueryables } from "./stac-api";
