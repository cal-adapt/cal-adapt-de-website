import type {
  CustomizeSelections,
  DataDownloadWorkspaceData,
} from "@/lib/data-download-tool/types";

/**
 * Read-only summary rows for the download step (package defaults + user selections).
 * Hint/tooltip copy is applied at the component layer via per-package tooltip maps.
 */
export function buildDownloadSummaryRows(
  workspace: DataDownloadWorkspaceData,
  selections: CustomizeSelections
): { label: string; value: string }[] {
  if (workspace.customizeForm.kind === "standard-met-year") {
    const locLabels = selections.counties
      .map((v) => workspace.customizeForm.countyOptions.find((o) => o.value === v)?.label ?? v)
      .join(", ");
    const gwlLabels = selections.timePeriods
      .map((v) => workspace.customizeForm.timePeriodOptions?.find((o) => o.value === v)?.label ?? v)
      .join(", ");
    const varLabels = selections.variables
      .map((v) => workspace.customizeForm.variableOptions.find((o) => o.value === v)?.label ?? v)
      .join(", ");
    const pctLabels = selections.percentiles
      .map((v) => workspace.customizeForm.percentileOptions?.find((o) => o.value === v)?.label ?? v)
      .join(", ");
    return [
      ...workspace.customizeForm.readOnlyFields,
      { label: "Location", value: locLabels || "—" },
      { label: "GWLs", value: gwlLabels || "—" },
      { label: "Variables", value: varLabels || "—" },
      { label: "Percentiles", value: pctLabels || "—" },
    ];
  }
  if (workspace.customizeForm.kind === "typical-met-year") {
    const locLabels = selections.counties
      .map((v) => workspace.customizeForm.countyOptions.find((o) => o.value === v)?.label ?? v)
      .join(", ");
    const gwlLabels = selections.timePeriods
      .map((v) => workspace.customizeForm.timePeriodOptions?.find((o) => o.value === v)?.label ?? v)
      .join(", ");
    const modelLabels = selections.models
      .map((v) => workspace.customizeForm.modelOptions.find((o) => o.value === v)?.label ?? v)
      .join(", ");

    return [
      ...workspace.customizeForm.readOnlyFields,
      { label: "Location", value: locLabels || "—" },
      { label: "GWLs", value: gwlLabels || "—" },
      { label: "Models", value: modelLabels || "—" },
    ];
  }

  const form = workspace.customizeForm;
  const varLabels = selections.variables
    .map((v) => form.variableOptions.find((o) => o.value === v)?.label ?? v)
    .join(", ");
  const modelLabels = selections.models
    .map((v) => form.modelOptions.find((o) => o.value === v)?.label ?? v)
    .join(", ");
  const scenarioLabels = selections.scenarios
    .map((v) => form.scenarioOptions.find((o) => o.value === v)?.label ?? v)
    .join(", ");
  const countyLabels = selections.counties
    .map((v) => form.countyOptions.find((o) => o.value === v)?.label ?? v)
    .join(", ");
  const freq = form.frequencyOptions.find((o) => o.value === selections.frequency);
  const agg = form.aggregationOptions.find((o) => o.value === selections.aggregation);

  return [
    ...form.readOnlyFields,
    { label: "Variables", value: varLabels || "—" },
    { label: "Models", value: modelLabels || "—" },
    { label: "Scenarios", value: scenarioLabels || "—" },
    { label: "Counties", value: countyLabels || "—" },
    { label: "Frequency", value: freq?.label ?? selections.frequency },
    { label: "Aggregation", value: agg?.label ?? selections.aggregation },
  ];
}
