import { formatLocalIsoDate } from "@/utils/date";
import { toKebabCase } from "@/utils/string";

import {
  type ClimateProfilesSelections,
  getVariable,
  modelLabel,
  MONTH_LABELS,
  periodLabel,
} from "./options";
import { hourOfYear, monthOfHour } from "./profiles";

/** "Jul" for an hour of year. */
export function formatMonth(hour: number): string {
  return MONTH_LABELS[monthOfHour(hour) - 1];
}

/** "Jul 16, 14:00" for an hour of year. */
export function formatHour(hour: number): string {
  const month = monthOfHour(hour);
  const day = Math.floor(hour / 24) - Math.floor(hourOfYear(month, 1, 0) / 24) + 1;
  return `${MONTH_LABELS[month - 1]} ${day}, ${String(hour % 24).padStart(2, "0")}:00`;
}

export function formatValue(value: number, units: string): string {
  if (!Number.isFinite(value)) return "No data";
  const digits = Math.abs(value) >= 1000 ? 0 : 1;
  const separator = units === "%" || units.startsWith("°") ? "" : " ";
  const number = value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
  return `${number}${separator}${units}`;
}

/** e.g. "Air temperature at Sacramento Executive Airport (KSAC)". */
export function formatChartTitle(
  selections: ClimateProfilesSelections,
  stationLabel: string
): string {
  return `${getVariable(selections.variable).label} at ${stationLabel}`;
}

/** e.g. "MPI-ESM1-2-HR, Mid-century (2.0°C)". */
export function formatChartSubtitle(selections: ClimateProfilesSelections): string {
  return [modelLabel(selections.model), periodLabel(selections.period)].join(", ");
}

/**
 * File name for the chart PNG:
 * `<variable>_tmy-vs-<xmy>_<station-slug>_<YYYY-MM-DD>.png`
 * (e.g. `temperature_tmy-vs-hot-shock_sacramento-executive-airport-ksac_2026-11-25.png`).
 */
export function formatChartExportFilename(
  selections: ClimateProfilesSelections,
  stationLabel: string,
  date: Date = new Date()
): string {
  const station = toKebabCase(stationLabel) || "unknown";
  return `${selections.variable}_tmy-vs-${selections.xmy}_${station}_${formatLocalIsoDate(date)}.png`;
}
