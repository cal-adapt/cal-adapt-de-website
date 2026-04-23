/** Human-readable labels for GWLs (STAC `time_period` queryable on station-profile collections). */
const GWL_LABELS: Readonly<Record<string, string>> = {
  "present-day": "Present Day (1.2°C)",
  "near-future": "Near-Future (1.5°C)",
  "mid-century": "Mid-Century (2.0°C)",
  "mid-late-century": "Mid-Late-Century (2.5°C)",
};

export function labelGwl(id: string): string {
  return GWL_LABELS[id.toLowerCase()] ?? id;
}
