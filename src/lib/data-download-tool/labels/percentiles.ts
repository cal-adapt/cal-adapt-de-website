/** Human-readable labels for percentile ids (STAC `percentile` queryable on station-profile collections). */
const PERCENTILE_LABELS: Readonly<Record<string, string>> = {
  "05ptile": "5th percentile",
  "50ptile": "50th percentile",
  "95ptile": "95th percentile",
};

export function labelPercentile(id: string): string {
  return PERCENTILE_LABELS[id.toLowerCase()] ?? id;
}
