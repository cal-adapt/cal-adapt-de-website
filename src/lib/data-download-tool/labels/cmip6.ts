/** Human-readable labels for CMIP6 experiment ids (`cmip6:experiment_id`). */
export const CMIP6_SCENARIO_LABELS: Record<string, string> = {
  historical: "Historical",
  ssp245: "SSP2-4.5",
  ssp370: "SSP3-7.0",
  ssp585: "SSP5-8.5",
};

export function labelCmip6Scenario(id: string): string {
  return CMIP6_SCENARIO_LABELS[id] ?? id;
}
