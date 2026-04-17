"use client";

import { useMemo } from "react";

import Alert from "@/components/common/ui/Alert";
import LabelValueGrid from "@/components/common/ui/LabelValueGrid";
import type { UseStacDownloadSearchResult } from "@/hooks";
import {
  buildDownloadSummaryRows,
  type CustomizeSelections,
  type DataDownloadWorkspaceData,
  type DownloadAssetRow,
  type DownloadBundle,
  getPackageAdapterByKind,
} from "@/lib/data-download-tool";

import { getPackageView } from "./package-views/registry";
import DownloadBundleCard from "./DownloadBundleCard";

import styles from "./DownloadScreen.module.scss";

export interface DownloadScreenProps {
  workspace: DataDownloadWorkspaceData;
  selections: CustomizeSelections;
  search: UseStacDownloadSearchResult;
  onDownloadBundle: (bundle: DownloadBundle) => void | Promise<void>;
  onDownloadAsset: (asset: DownloadAssetRow) => void;
  downloadsDisabled?: boolean;
}

/**
 * Download step: summary + STAC-backed bundles (composed from `download/*` presentational parts).
 */
export default function DownloadScreen({
  workspace,
  selections,
  search,
  onDownloadBundle,
  onDownloadAsset,
  downloadsDisabled = false,
}: DownloadScreenProps) {
  const kind = workspace.customizeForm.kind;
  const adapter = getPackageAdapterByKind(kind);
  const view = getPackageView(kind);

  const summaryRows = useMemo(() => {
    const rows = buildDownloadSummaryRows(workspace, selections);
    return rows.map((row) => ({
      ...row,
      hint: view.tooltipByLabel[row.label],
    }));
  }, [workspace, selections, view]);

  return (
    <div className={styles.root}>
      <section className={styles.summarySection} aria-labelledby="download-package-summary-heading">
        <h3 id="download-package-summary-heading" className={styles.sectionTitle}>
          Package summary
        </h3>
        <LabelValueGrid rows={summaryRows} />
      </section>

      <div className={styles.rule} role="presentation" />

      {search.status === "loading" ? (
        <p className={styles.statusMessage}>Loading download manifest from catalog…</p>
      ) : null}

      {search.status === "error" && search.errorMessage ? (
        <Alert severity="error">{search.errorMessage}</Alert>
      ) : null}

      {search.status === "skipped" ? (
        <Alert severity="warning">{adapter.messages.skipped}</Alert>
      ) : null}

      {search.status === "success" && search.bundles.length === 0 ? (
        <Alert severity="info">{adapter.messages.empty}</Alert>
      ) : null}

      {search.status === "success" && search.bundles.length > 0 ? (
        <div className={styles.bundleList}>
          {search.bundles.map((bundle) => (
            <DownloadBundleCard
              key={bundle.stacItemId}
              bundle={bundle}
              customizeFormKind={kind}
              onDownloadBundle={onDownloadBundle}
              onDownloadAsset={onDownloadAsset}
              disableActions={downloadsDisabled}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
