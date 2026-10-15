import { type Metric, metrics } from "@/data/climate-metrics-map/metrics";

export type ValueType = "abs" | "del";

export const DEFAULT_GWL = 1.5;

export interface ClimateMetricsMapSelections {
  metric: Metric["slug"];
  valueType: ValueType;
  /** Global warming level in °C, e.g. 1.5. */
  gwl: number;
}

export const DEFAULT_SELECTIONS: ClimateMetricsMapSelections = {
  metric: metrics[0].slug,
  valueType: "abs",
  gwl: DEFAULT_GWL,
};

/** The GWL list comes from the API, so `gwl` is only checked for shape here. */
export function resolveSelections(
  overrides: Partial<ClimateMetricsMapSelections>
): ClimateMetricsMapSelections {
  const metric = overrides.metric ?? DEFAULT_SELECTIONS.metric;
  if (!metrics.some((m) => m.slug === metric)) {
    throw new Error(`Unknown Climate Metrics Map metric: "${metric}"`);
  }
  const valueType = overrides.valueType ?? DEFAULT_SELECTIONS.valueType;
  if (valueType !== "abs" && valueType !== "del") {
    throw new Error(`Unknown Climate Metrics Map value type: "${valueType}"`);
  }
  const gwl = overrides.gwl ?? DEFAULT_SELECTIONS.gwl;
  if (!Number.isFinite(gwl) || gwl <= 0) {
    throw new Error(`Invalid global warming level: "${gwl}"`);
  }
  return { metric, valueType, gwl };
}

/** No `gwl`; the tool reads `gwl` as a list index and resets it once the list loads anyway */
export function selectionsToSearchParams(selections: ClimateMetricsMapSelections): URLSearchParams {
  const params = new URLSearchParams();
  if (selections.metric !== DEFAULT_SELECTIONS.metric) {
    params.set("metric", selections.metric);
  }
  if (selections.valueType !== DEFAULT_SELECTIONS.valueType) {
    params.set("valueType", selections.valueType);
  }
  return params;
}
