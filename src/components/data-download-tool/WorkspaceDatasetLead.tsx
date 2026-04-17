"use client";

import type { DataDownloadWorkspaceData } from "@/lib/data-download-tool";

import styles from "./WorkspaceDatasetLead.module.scss";

export interface WorkspaceDatasetLeadProps {
  workspace: Pick<DataDownloadWorkspaceData, "datasetDescription">;
}

/**
 * Dataset description — shown below the step heading (Customize / Download).
 */
export default function WorkspaceDatasetLead({ workspace }: WorkspaceDatasetLeadProps) {
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
