"use client";

import Divider from "@/components/common/ui/Divider";
import LabelValueGrid from "@/components/common/ui/LabelValueGrid";
import type { CustomizeFormConfig, CustomizeSelections } from "@/lib/data-download-tool";

import { getPackageView } from "./package-views/registry";

import styles from "./CustomizeForm.module.scss";

export interface CustomizeFormProps {
  config: CustomizeFormConfig;
  value: CustomizeSelections;
  onChange: (next: CustomizeSelections) => void;
  /** When true (e.g. after a failed "continue"), show required errors on empty fields. */
  showFieldErrors?: boolean;
}

/**
 * Renders the Customize step for the current package kind. The fields layout and tooltip
 * copy live in a per-kind view module (see `package-views/`); this component just hosts
 * the shared Package-summary header and grid chrome.
 */
export default function CustomizeForm({
  config,
  value,
  onChange,
  showFieldErrors = false,
}: CustomizeFormProps) {
  const view = getPackageView(config.kind);
  const CustomizeFields = view.CustomizeFields;

  return (
    <div className={styles.root}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Package summary</h3>
        <LabelValueGrid
          rows={config.readOnlyFields.map((row) => ({
            ...row,
            hint: view.tooltipByLabel[row.label],
          }))}
        />
      </section>

      <Divider />

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Customize selections</h3>
        <div className={styles.editableGrid}>
          <CustomizeFields
            config={config}
            value={value}
            onChange={onChange}
            showFieldErrors={showFieldErrors}
          />
        </div>
      </section>
    </div>
  );
}
