const GWL_LABELS: Readonly<Record<string, string>> = {
  historical: "Historical",
  "present-day": "Present Day (1.2°C)",
  "near-future": "Near-Future (1.5°C)",
  "mid-century": "Mid-Century (2.0°C)",
  "mid-late-century": "Mid-Late-Century (2.5°C)",
  "time-based": "Time-based (years)",
};

const GWL_ORDER: ReadonlyMap<string, number> = new Map(
  Object.keys(GWL_LABELS).map((id, index) => [id, index])
);

export function labelGwl(id: string): string {
  return GWL_LABELS[id.toLowerCase()] ?? id;
}

export function compareGwl(a: string, b: string): number {
  const ai = GWL_ORDER.get(a.toLowerCase()) ?? Number.POSITIVE_INFINITY;
  const bi = GWL_ORDER.get(b.toLowerCase()) ?? Number.POSITIVE_INFINITY;
  if (ai !== bi) {
    return ai - bi;
  }
  return a.localeCompare(b);
}

export function sortGwlIds(ids: readonly string[]): string[] {
  return [...ids].sort(compareGwl);
}
