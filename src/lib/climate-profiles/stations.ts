import type { SelectOption } from "@/components/common/form";
import { calAdaptApi } from "@/lib/cal-adapt-api";
import { stationLabelsFromCollection } from "@/lib/data-download-tool/packages/shared";

/**
 * HadISD station options for a climate profiles collection, from its
 * `caladapt:station_labels` (STAC `location` id → display label), sorted by label.
 */
export async function fetchStationOptions(collectionId: string): Promise<SelectOption[]> {
  const collection = await calAdaptApi.stac.getCollection(collectionId);
  return Array.from(stationLabelsFromCollection(collection), ([value, label]) => ({
    value,
    label,
  })).sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Station ids go into a CQL2 filter, so only accept STAC-style slugs from the
 * URL (e.g. `burbank-glendale-pasadena_airport_kbur`).
 */
export function isStationId(raw: string): boolean {
  return /^[a-z0-9_-]+$/.test(raw);
}

export function stationLabelFor(station: string, options: readonly SelectOption[]): string {
  return options.find((o) => o.value === station)?.label ?? station;
}
