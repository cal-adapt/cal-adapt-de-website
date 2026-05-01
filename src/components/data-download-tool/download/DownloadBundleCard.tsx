import { Download } from "lucide-react";

import Button from "@/components/common/ui/Button";
import type { CustomizeFormKind, DownloadAssetRow, DownloadBundle } from "@/lib/data-download-tool";
import { getPackageAdapterByKind } from "@/lib/data-download-tool";

import DownloadVariableTable from "./DownloadVariableTable";

import styles from "./DownloadBundleCard.module.scss";

export interface DownloadBundleCardProps {
  bundle: DownloadBundle;
  onDownloadBundle: (bundle: DownloadBundle) => void | Promise<void>;
  onDownloadAsset: (asset: DownloadAssetRow) => void;
  disableActions?: boolean;
  /** Kind of the active package — drives per-variable table headers. */
  customizeFormKind: CustomizeFormKind;
}

/**
 * One STAC item (or grouped bundle): collection-specific header blocks (from the bundle) +
 * per-variable/per-filetype downloads.
 */
export default function DownloadBundleCard({
  bundle,
  onDownloadBundle,
  onDownloadAsset,
  disableActions = false,
  customizeFormKind,
}: DownloadBundleCardProps) {
  const headingId = `download-bundle-${bundle.stacItemId}-heading`;
  const tableHeaders = getPackageAdapterByKind(customizeFormKind).messages.variableTableHeaders;

  return (
    <section className={styles.bundleCard} aria-labelledby={headingId}>
      <div className={styles.bundleTop}>
        <div className={styles.bundleMeta}>
          {bundle.metaBlocks.map((block, i) => (
            <div key={block.label} className={styles.metaBlock}>
              <div className={styles.fieldLabel}>{block.label}</div>
              <p className={styles.fieldValue} id={i === 0 ? headingId : undefined}>
                {block.value}
              </p>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="large"
          disabled={disableActions || bundle.assets.length === 0}
          prefix={<Download size={16} strokeWidth={2} aria-hidden />}
          onClick={() => onDownloadBundle(bundle)}
        >
          Download
        </Button>
      </div>

      <DownloadVariableTable
        assets={bundle.assets}
        onDownloadAsset={onDownloadAsset}
        disableActions={disableActions}
        headers={tableHeaders}
      />
    </section>
  );
}
