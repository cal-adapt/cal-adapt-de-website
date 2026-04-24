import type { StacCollection, StacCollectionQueryables } from "@/lib/cal-adapt-api";

type CollectionWithExtent = StacCollection & {
  extent?: {
    temporal?: { interval?: [string, string][] };
  };
};

/** Display the collection's temporal extent as `YYYY – YYYY`. */
export function formatTimeSpanLabel(collection: StacCollection): string {
  const interval = (collection as CollectionWithExtent).extent?.temporal?.interval?.[0];
  if (!interval?.[0] || !interval?.[1]) {
    return "—";
  }
  const y0 = interval[0].slice(0, 4);
  const y1 = interval[1].slice(0, 4);
  return `${y0} – ${y1}`;
}

/** Title-case an underscore-separated token for select labels (`foo_bar` → `Foo Bar`). */
export function humanizeToken(id: string): string {
  return id.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Coerce anything that looks like a filename-safe segment. */
export function slugifyFilenameSegment(raw: string, max = 48): string {
  return raw
    .replace(/[^a-z0-9-]+/gi, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
    .slice(0, max);
}

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

/** Prefer non-empty `Collection.summaries[key]` (v1-style); otherwise use queryables enums (v2 / PgSTAC). */
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

/** STAC `file:size` (bytes) — APIs may emit a number or a numeric string. */
export function parseStacFileSizeBytes(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number.parseInt(value, 10);
    if (Number.isFinite(n) && n >= 0) {
      return n;
    }
  }
  return 0;
}

/** Bytes for one STAC Item `assets` entry — try common metadata keys (providers differ). */
export function parseStacAssetSizeBytes(raw: Record<string, unknown>): number {
  const keys = ["file:size", "file:byte_size", "size"] as const;
  for (const key of keys) {
    const n = parseStacFileSizeBytes(raw[key]);
    if (n > 0) {
      return n;
    }
  }
  return 0;
}

/** Takes a DOI in any format and returns a normalized DOI URL, or `undefined` if absent. */
export function formatDoiUrl(doi: string | undefined): string | undefined {
  const formatted = doi
    ?.trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .replace(/^\/+/, "");

  if (!formatted) {
    return undefined;
  }

  return `https://doi.org/${formatted}`;
}

/**
 * Build a stable, order-insensitive string key from a mix of scalars and string arrays.
 * Arrays are sorted so selection order doesn't invalidate the key; scalars pass through.
 * Used by adapter `searchFiltersKey` implementations.
 */
export function stableMultiKey(parts: readonly (string | readonly string[])[]): string {
  return parts.map((p) => (typeof p === "string" ? p : [...p].sort().join("|"))).join("\0");
}

/** Resolve labels for a list of option values (falling back to the raw value). */
export function joinOptionLabels(
  values: string[],
  options: { value: string; label: string }[] | undefined
): string {
  if (values.length === 0) {
    return "—";
  }
  return values.map((v) => options?.find((o) => o.value === v)?.label ?? v).join(", ");
}
