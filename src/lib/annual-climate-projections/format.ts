import { formatLocalIsoDate } from "@/utils/date";
import { toKebabCase } from "@/utils/string";

import {
  type AnnualClimateProjectionsSelections,
  getScenario,
  getVariable,
  regionLabelFor,
} from "./options";

/** Chart colors (blue palette from the approved mockup). */
export const CHART_COLORS = {
  range: "#b9deff",
  mean: "#33658a",
  simulations: "#4d9de0",
  observed: "#c56907",
} as const;

export function formatViewTitle(selections: AnnualClimateProjectionsSelections): string {
  const variable = getVariable(selections.climateVariable);
  const scenario = getScenario(selections.ensemble, selections.scenario);
  return `${variable.titleLabel} in ${regionLabelFor(selections)}, ${scenario.label}`;
}

/** One decimal place, or an em dash for non-finite values. */
export function formatValue(value: number, unit: string): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(1)} ${unit}`;
}

/**
 * File name used when the user downloads the chart as a PNG, e.g.
 * `max-temperature_alameda-county_2026-11-18.png`.
 */
export function formatChartExportFilename(
  climateVariable: string,
  location: string,
  date: Date = new Date()
): string {
  const locationSlug = toKebabCase(location) || "unknown";
  return `${climateVariable}_${locationSlug}_${formatLocalIsoDate(date)}.png`;
}
