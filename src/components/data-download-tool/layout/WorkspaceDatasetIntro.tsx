"use client";

import Link from "@/components/common/ui/Link";
import { type DataDownloadWorkspaceData, getPackageAdapter } from "@/lib/data-download-tool";

import styles from "./WorkspaceDatasetIntro.module.scss";

export interface WorkspaceDatasetIntroProps {
  workspace: Pick<DataDownloadWorkspaceData, "datasetDescription" | "catalogPackageId">;
}

/**
 * Dataset description — shown below the step heading (Customize / Download) in the
 * `StepLayout.belowHeading` slot.
 */
export default function WorkspaceDatasetIntro({ workspace }: WorkspaceDatasetIntroProps) {
  const description = workspace.datasetDescription.trim();
  const { methodsUrl } = getPackageAdapter(workspace.catalogPackageId);

  if (description.length === 0) {
    return null;
  }

  return (
    <div className={styles.root}>
      <p className={styles.copy}>{description}</p>
      <p className={styles.methodsLine}>
        To find more information about this dataset and methods, visit the documentation page{" "}
        <Link href={methodsUrl}>here</Link>.
      </p>
    </div>
  );
}
