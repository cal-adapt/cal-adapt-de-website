import clsx from "clsx";
import { ChevronRight } from "lucide-react";

import Link from "@/components/common/ui/Link";

import {
  getPackage,
  PACKAGE_RAIL_DISPLAY_ORDER,
  PACKAGE_RAIL_SECTION_TITLE,
  type PackageId,
} from "./packages";

import styles from "./PackageRail.module.scss";

export const DATA_DOWNLOAD_PAGE_PATH = "/dashboard/data-download-tool";

export interface PackageRailProps {
  /** Which catalog package is active for this workspace (driven by STAC collection mapping). */
  activePackageId: PackageId;
}

function packageHref(packageId: PackageId): string {
  return `${DATA_DOWNLOAD_PAGE_PATH}/${encodeURIComponent(packageId)}`;
}

export default function PackageRail({ activePackageId }: PackageRailProps) {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <p className={styles.headerTitle}>{PACKAGE_RAIL_SECTION_TITLE}</p>
      </div>
      <hr className={styles.divider} role="presentation" />
      {PACKAGE_RAIL_DISPLAY_ORDER.map((id) => {
        const pkg = getPackage(id);
        const selected = id === activePackageId;
        return (
          <div key={id}>
            <Link
              href={packageHref(id)}
              className={clsx(selected ? styles.rowSelected : styles.row, styles.rowLink)}
              aria-current={selected ? "page" : undefined}
            >
              <span className={styles.rowTitle}>{pkg.title}</span>
              {selected ? (
                <ChevronRight className={styles.chevron} size={24} strokeWidth={2} aria-hidden />
              ) : null}
            </Link>
            <hr className={styles.divider} role="presentation" />
          </div>
        );
      })}
    </div>
  );
}
