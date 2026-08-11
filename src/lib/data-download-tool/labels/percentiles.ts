/** Human-readable labels for percentile ids (STAC `percentile` queryable on station-profile collections). */
const PERCENTILE_LABELS: Readonly<Record<string, string>> = {
  "05ptile": "5th percentile",
  "10ptile": "10th percentile",
  "40ptile": "40th percentile",
  "50ptile": "50th percentile",
  "60ptile": "60th percentile",
  "90ptile": "90th percentile",
  "95ptile": "95th percentile",
};

export function labelPercentile(id: string): string {
  return PERCENTILE_LABELS[id.toLowerCase()] ?? id;
}

/** Numeric rank of a percentile id (`95ptile` → 95); non-percentile ids sort to the end. */
function percentileRank(id: string): number {
  const match = /^(\d+)ptile$/i.exec(id.trim());
  return match ? Number.parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
}

/** Sort percentile ids ascending by their numeric value (`05ptile` before `95ptile`). */
export function sortPercentileIds(ids: readonly string[]): string[] {
  return [...ids].sort((a, b) => {
    const ra = percentileRank(a);
    const rb = percentileRank(b);
    return ra !== rb ? ra - rb : a.localeCompare(b);
  });
}
