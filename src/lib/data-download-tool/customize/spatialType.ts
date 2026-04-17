import type { StacCollection } from "@/lib/cal-adapt-api";

/**
 * Cal-Adapt STAC collection extension (from backend / STAC `Collection` JSON).
 *
 * - `"county"` — LOCA2 county-gridded products (boundary = county).
 * - `"point"` — Climate profile products (Standard / Typical Met Year): a fixed geospatial **point**
 *   (weather station, buoy, etc.). Replaces an older internal “station” field; same idea in GIS terms.
 *
 * @see {@link https://github.com/radiantearth/stac-spec/blob/master/collection-spec/collection-spec.md} STAC Collection
 */
export const CALADAPT_SPATIAL_TYPE_KEY = "caladapt:spatial_type" as const;

export type CaladaptSpatialType = "county" | "point" | (string & {});

export function readCaladaptSpatialType(
  collection: StacCollection
): CaladaptSpatialType | undefined {
  const raw = collection[CALADAPT_SPATIAL_TYPE_KEY];
  if (typeof raw !== "string" || raw.trim() === "") {
    return undefined;
  }
  return raw.trim().toLowerCase() as CaladaptSpatialType;
}

/**
 * Human-readable **Boundary type** summary value for the Data Download package summary.
 * Prefer STAC `caladapt:spatial_type` when present; otherwise use product-appropriate fallbacks.
 */
export function boundaryTypeSummaryValue(
  collection: StacCollection,
  profile: "loca2-county" | "climate-profile"
): string {
  const spatialType = readCaladaptSpatialType(collection);
  if (spatialType === "county") {
    return "County";
  }
  if (spatialType === "point") {
    return "Point";
  }
  return profile === "loca2-county" ? "County" : "Weather station";
}
