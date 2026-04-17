import { Download } from "lucide-react";

import Button from "@/components/common/ui/Button";
import type { DownloadAssetRow } from "@/lib/data-download-tool";

import styles from "./DownloadVariableTable.module.scss";

export interface DownloadVariableTableProps {
  assets: DownloadAssetRow[];
  /** Triggered for a single variable row (direct NetCDF / CSV download). */
  onDownloadAsset: (asset: DownloadAssetRow) => void;
  disableActions?: boolean;
  /** Column headers — supplied by the active package adapter. */
  headers: { metric: string; download: string };
}

/**
 * Variable × download button table inside a bundle card. Presentational only;
 * column headers come from the package adapter.
 */
export default function DownloadVariableTable({
  assets,
  onDownloadAsset,
  disableActions = false,
  headers,
}: DownloadVariableTableProps) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHead}>
        <span className={styles.tableHeadMetric}>{headers.metric}</span>
        <span className={styles.tableHeadKind}>{headers.download}</span>
      </div>
      {assets.map((asset) => (
        <div key={`${asset.variableId}-${asset.href}`} className={styles.tableRow}>
          <span className={styles.varName}>{asset.label}</span>
          <Button
            type="button"
            variant="primary"
            size="small"
            disabled={disableActions}
            prefix={<Download size={16} strokeWidth={2} aria-hidden />}
            onClick={() => onDownloadAsset(asset)}
          >
            Download
          </Button>
        </div>
      ))}
    </div>
  );
}
