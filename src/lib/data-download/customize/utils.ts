import type { StacCollectionQueryables } from "@/lib/cal-adapt-api";

/** `enum` list from a STAC Filter Extension queryables schema (`/collections/{id}/queryables`). */
export function enumStringsFromStacQueryables(
  queryables: StacCollectionQueryables | undefined,
  key: string
): string[] {
  const raw = queryables?.properties?.[key]?.enum;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((v) => String(v));
}

/**
 * Prefer non-empty `Collection.summaries[key]` (v1-style); otherwise use queryables enums (v2 / PgSTAC).
 */
export function coalesceSummaryOrQueryableEnum(
  summaries: Record<string, string[]>,
  queryables: StacCollectionQueryables | undefined,
  summaryKey: string
): string[] {
  const fromSummary = summaries[summaryKey];
  if (Array.isArray(fromSummary) && fromSummary.length > 0) {
    return fromSummary;
  }
  return enumStringsFromStacQueryables(queryables, summaryKey);
}
