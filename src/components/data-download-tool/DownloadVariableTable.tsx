import { Download } from "lucide-react";

import Button from "@/components/common/ui/Button";
import type { CustomizeFormKind, DownloadAssetRow } from "@/lib/data-download-tool";

import { variableTableHeaders } from "./kindDisplay";

import styles from "./DownloadVariableTable.module.scss";

export interface DownloadVariableTableProps {
  assets: DownloadAssetRow[];
  /** Triggered for a single variable row (direct NetCDF download). */
  onDownloadAsset: (asset: DownloadAssetRow) => void;
  disableActions?: boolean;
  customizeFormKind?: CustomizeFormKind;
}

/**
 * Variable × download button table inside a bundle card.
 */
export default function DownloadVariableTable({
  assets,
  onDownloadAsset,
  disableActions = false,
  customizeFormKind = "loca2-county",
}: DownloadVariableTableProps) {
  const headers = variableTableHeaders(customizeFormKind);

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
