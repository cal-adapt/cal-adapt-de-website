import type { PackageId } from "@/lib/data-download-tool";

export type { PackageId };

/** Left rail section heading (above the package list). */
export const PACKAGE_RAIL_SECTION_TITLE = "Select a package preset from the options listed below.";

/**
 * Visual order in the package rail (design / UX order, independent of API wiring order).
 */
export const PACKAGE_RAIL_DISPLAY_ORDER: readonly PackageId[] = [
  "typical-met-year",
  "standard-year",
  "loca2-county",
] as const;

export type FlowStep = "customize" | "download";

export interface ViewMetric {
  label: string;
  value: string;
}

export interface DownloadPackage {
  id: PackageId;
  title: string;
  /** One-line blurb in the package rail. */
  listDescription: string;
  /** Short intro on the View screen. */
  viewLead: string;
  /** Compact summary row (Pencil: horizontal stat band). */
  viewMetrics: ViewMetric[];
  /** Read-only default fields. */
  viewDefaults: { label: string; value: string }[];
}

export const DOWNLOAD_PACKAGES: DownloadPackage[] = [
  {
    id: "loca2-county",
    title: "LOCA2 county",
    listDescription: "Gridded climate projections by county.",
    viewLead:
      "Default export uses the LOCA downscaled ensemble with daily timesteps. Review the preset boundaries and variables before customizing or downloading.",
    viewMetrics: [
      { label: "Dataset", value: "LOCA2" },
      { label: "Frequency", value: "Daily" },
      { label: "Variables", value: "6 selected" },
      { label: "Boundary", value: "County" },
      { label: "Units", value: "Metric" },
    ],
    viewDefaults: [
      { label: "Scenario", value: "RCP 8.5 (default)" },
      { label: "Models", value: "Ensemble mean" },
      { label: "Time span", value: "1985–2100" },
    ],
  },
  {
    id: "typical-met-year",
    title: "Typical meteorological year",
    listDescription: "Representative year climate profiles for analysis.",
    viewLead:
      "These defaults define a Typical Meteorological Year bundle suitable for building energy and compliance workflows. Adjust selections on the next step if you need a different scope.",
    viewMetrics: [
      { label: "Dataset", value: "LOCA2" },
      { label: "Frequency", value: "Hourly" },
      { label: "Variables", value: "4 selected" },
      { label: "Boundary", value: "Point" },
      { label: "Units", value: "Metric" },
    ],
    viewDefaults: [
      { label: "Scenario", value: "Historical + RCP 4.5" },
      { label: "Reference period", value: "1981–2010" },
      { label: "File layout", value: "One file per variable" },
    ],
  },
  {
    id: "standard-year",
    title: "Standard year",
    listDescription: "Standard Met Year profiles at stations (8760 hourly, CSV).",
    viewLead:
      "Standard-year summaries aggregate multiple models for a consistent planning window. Use customize to narrow models or scenarios.",
    viewMetrics: [
      { label: "Dataset", value: "LOCA2" },
      { label: "Frequency", value: "Monthly" },
      { label: "Variables", value: "5 selected" },
      { label: "Boundary", value: "State" },
      { label: "Units", value: "Metric" },
    ],
    viewDefaults: [
      { label: "Scenario", value: "RCP 8.5" },
      { label: "Models", value: "12 models" },
      { label: "Time span", value: "2030–2055" },
    ],
  },
];

export function getPackage(id: PackageId): DownloadPackage {
  const found = DOWNLOAD_PACKAGES.find((p) => p.id === id);
  if (found == null) {
    throw new Error(`Unknown package id: ${id}`);
  }
  return found;
}
