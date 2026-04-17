import { getPackageAdapterByKind } from "../packages/registry";
import type { CustomizeSelections, DataDownloadWorkspaceData } from "../types";

/**
 * Read-only summary rows for the download step (package defaults + user selections).
 * Hint/tooltip copy is applied at the component layer via per-package tooltip maps.
 */
export function buildDownloadSummaryRows(
  workspace: DataDownloadWorkspaceData,
  selections: CustomizeSelections
): { label: string; value: string }[] {
  return getPackageAdapterByKind(workspace.customizeForm.kind).buildSummaryRows(
    workspace,
    selections
  );
}
