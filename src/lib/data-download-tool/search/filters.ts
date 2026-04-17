import type { ItemSearchFilters } from "@/lib/cal-adapt-api";
import type { CustomizeSelections } from "@/lib/data-download-tool/types";
import { createOrStatement } from "@/utils/query";

import { isV2StationProfileCollection, LOCA2_COUNTY_STAC_COLLECTION_ID } from "../catalog/ids";

/**
 * Builds STAC `/search` CQL2 filter fragments.
 * LOCA2 county v2: `county_name`, `cmip6:*`; v1: `countyname`. Standard Met Year: `location`, `variable`, …
 */
export function buildItemSearchFilters(
  collectionId: string,
  selections: CustomizeSelections
): ItemSearchFilters {
  const collectionFilter = `collection='${collectionId}'`;

  if (isV2StationProfileCollection(collectionId)) {
    const locationFilter =
      selections.counties.length > 0 ? createOrStatement("location", selections.counties) : "";
    const isTmyCollection = collectionId === "typical-met-year";
    const modelFilter =
      isTmyCollection && selections.models.length > 0
        ? createOrStatement("model", selections.models)
        : "";
    const variableFilter =
      !isTmyCollection && selections.variables.length > 0
        ? createOrStatement("variable", selections.variables)
        : "";
    const percentileFilter =
      !isTmyCollection && selections.percentiles.length > 0
        ? createOrStatement("percentile", selections.percentiles)
        : "";
    const timePeriodFilter =
      selections.timePeriods.length > 0
        ? createOrStatement("time_period", selections.timePeriods)
        : "";

    return {
      collectionFilter,
      locationFilter: locationFilter || undefined,
      modelFilter: modelFilter || undefined,
      variableFilter: variableFilter || undefined,
      percentileFilter: percentileFilter || undefined,
      timePeriodFilter: timePeriodFilter || undefined,
    };
  }

  const countyProperty =
    collectionId === LOCA2_COUNTY_STAC_COLLECTION_ID ? "county_name" : "countyname";
  const countyFilter =
    selections.counties.length > 0 ? createOrStatement(countyProperty, selections.counties) : "";

  const scenarioFilter =
    selections.scenarios.length > 0
      ? createOrStatement("cmip6:experiment_id", selections.scenarios)
      : "";

  const modelFilter =
    selections.models.length > 0 ? createOrStatement("cmip6:source_id", selections.models) : "";

  const cmip6TableIdFilter =
    collectionId === LOCA2_COUNTY_STAC_COLLECTION_ID && selections.frequency === "monthly"
      ? "cmip6:table_id = 'mon'"
      : undefined;

  return {
    collectionFilter,
    countyFilter: countyFilter || undefined,
    scenarioFilter: scenarioFilter || undefined,
    modelFilter: modelFilter || undefined,
    cmip6TableIdFilter,
  };
}
