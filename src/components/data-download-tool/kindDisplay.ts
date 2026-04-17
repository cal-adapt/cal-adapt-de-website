import type { ReactNode } from "react";

import type { CustomizeFormKind, DownloadBundle } from "@/lib/data-download-tool";

import { loca2CountyTooltipByLabel, smyTooltipByLabel, tmyTooltipByLabel } from "./tooltips";

function assertNever(x: never): never {
  throw new Error(`Unhandled kind: ${x}`);
}

export function bundleMetaBlocks(
  kind: CustomizeFormKind,
  bundle: DownloadBundle
): { label: string; value: string }[] {
  switch (kind) {
    case "standard-met-year":
      return [
        { label: "Location", value: bundle.countyName },
        { label: "GWLs", value: bundle.scenarioLabel },
        { label: "Percentile", value: bundle.model },
      ];
    case "typical-met-year":
      return [
        { label: "Location", value: bundle.countyName },
        { label: "GWLs", value: bundle.scenarioLabel },
        { label: "Model", value: bundle.model },
      ];
    case "loca2-county":
      return [
        { label: "Model", value: bundle.model },
        { label: "Scenario", value: bundle.scenarioLabel },
        { label: "Boundary", value: bundle.countyName },
      ];
    default:
      return assertNever(kind);
  }
}

export function downloadSkippedMessage(kind: CustomizeFormKind): string {
  switch (kind) {
    case "standard-met-year":
      return "Select at least one location, GWL, variables, and percentiles on the previous step to fetch files.";
    case "typical-met-year":
      return "Select at least one location, GWL, and model on the previous step to fetch files.";
    case "loca2-county":
      return "Select at least one county, model, scenario, and variables on the previous step to fetch files.";
    default:
      return assertNever(kind);
  }
}

export function downloadEmptyMessage(kind: CustomizeFormKind): string {
  switch (kind) {
    case "standard-met-year":
      return "No files matched your selections. Try broadening location, GWL, variables, or percentiles.";
    case "typical-met-year":
      return "No files matched your selections. Try broadening location, GWL, or model choices.";
    case "loca2-county":
      return "No files matched your selections. Try broadening counties, models, or variables.";
    default:
      return assertNever(kind);
  }
}

export function variableTableHeaders(kind: CustomizeFormKind): {
  metric: string;
  download: string;
} {
  switch (kind) {
    case "typical-met-year":
      return { metric: "File type", download: "Single file" };
    case "standard-met-year":
    case "loca2-county":
      return { metric: "Metric", download: "Single variable" };
    default:
      return assertNever(kind);
  }
}

export function tooltipMapForKind(kind: CustomizeFormKind): Partial<Record<string, ReactNode>> {
  switch (kind) {
    case "standard-met-year":
      return smyTooltipByLabel;
    case "typical-met-year":
      return tmyTooltipByLabel;
    case "loca2-county":
      return loca2CountyTooltipByLabel;
    default:
      return assertNever(kind);
  }
}
