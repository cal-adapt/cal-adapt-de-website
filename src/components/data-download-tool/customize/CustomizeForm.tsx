"use client";

import Divider from "@/components/common/ui/Divider";
import LabelValueGrid from "@/components/common/ui/LabelValueGrid";
import {
  type CustomizeFormConfig,
  type CustomizeSelections,
  getPackageAdapterByKind,
} from "@/lib/data-download-tool";

import { getTooltipsForKind } from "../tooltips/registry";

import CustomizeFieldsRenderer from "./CustomizeFieldsRenderer";

import styles from "./CustomizeForm.module.scss";

export interface CustomizeFormProps {
  config: CustomizeFormConfig;
  value: CustomizeSelections;
  onChange: (next: CustomizeSelections) => void;
  /** When true (e.g. after a failed "continue"), show required errors on empty fields. */
  showFieldErrors?: boolean;
}

/**
 * Renders the Customize step for the current package kind. Field layout comes from the
 * adapter (`lib/`); tooltip copy comes from the component-layer tooltip registry.
 */
export default function CustomizeForm({
  config,
  value,
  onChange,
  showFieldErrors = false,
}: CustomizeFormProps) {
  const adapter = getPackageAdapterByKind(config.kind);
  const tooltipByLabel = getTooltipsForKind(config.kind);

  return (
    <div className={styles.root}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Package summary</h3>
        <LabelValueGrid
          rows={config.readOnlyFields.map((row) => ({
            ...row,
            hint: tooltipByLabel[row.label],
          }))}
        />
      </section>

      <Divider />

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Customize selections</h3>
        <div className={styles.editableGrid}>
          <CustomizeFieldsRenderer
            fields={adapter.fields}
            tooltipByLabel={tooltipByLabel}
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
