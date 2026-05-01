"use client";

import type { DataDownloadWorkspaceData } from "@/lib/data-download-tool";

import styles from "./WorkspaceDatasetIntro.module.scss";

export interface WorkspaceDatasetIntroProps {
  workspace: Pick<DataDownloadWorkspaceData, "datasetDescription">;
}

/**
 * Dataset description — shown below the step heading (Customize / Download) in the
 * `StepLayout.belowHeading` slot.
 */
export default function WorkspaceDatasetIntro({ workspace }: WorkspaceDatasetIntroProps) {
  const description = workspace.datasetDescription.trim();
  if (description.length === 0) {
    return null;
  }

  return (
    <div className={styles.root}>
      <p className={styles.copy}>{description}</p>
    </div>
  );
}
