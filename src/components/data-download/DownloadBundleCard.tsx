import { Download } from "lucide-react";

import Button from "@/components/common/ui/Button";
import type { CustomizeFormKind, DownloadAssetRow, DownloadBundle } from "@/lib/data-download";

import DownloadVariableTable from "./DownloadVariableTable";
import { bundleMetaBlocks } from "./kindDisplay";

import styles from "./DownloadBundleCard.module.scss";

export interface DownloadBundleCardProps {
  bundle: DownloadBundle;
  onDownloadBundle: (bundle: DownloadBundle) => void | Promise<void>;
  onDownloadAsset: (asset: DownloadAssetRow) => void;
  disableActions?: boolean;
  /** When set, adjusts header labels to match the collection (e.g. SMY uses Location / GWLs / Percentile). */
  customizeFormKind?: CustomizeFormKind;
}

/**
 * One STAC item: collection-specific header (model/scenario/county or SMY dimensions) + per-variable downloads.
 */
export default function DownloadBundleCard({
  bundle,
  onDownloadBundle,
  onDownloadAsset,
  disableActions = false,
  customizeFormKind = "loca2-county",
}: DownloadBundleCardProps) {
  const headingId = `download-bundle-${bundle.stacItemId}-heading`;
  const metaBlocks = bundleMetaBlocks(customizeFormKind, bundle);

  return (
    <section className={styles.bundleCard} aria-labelledby={headingId}>
      <div className={styles.bundleTop}>
        <div className={styles.bundleMeta}>
          {metaBlocks.map((block, i) => (
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
        customizeFormKind={customizeFormKind}
      />
    </section>
  );
}
