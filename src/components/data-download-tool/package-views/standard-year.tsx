"use client";

import { tooltipByLabel } from "../tooltips/standard-year";

import MultiSelectField from "./MultiSelectField";
import type { CustomizeFieldsProps, PackageView } from "./types";

import styles from "../CustomizeForm.module.scss";

function StandardYearCustomizeFields({
  config,
  value,
  onChange,
  showFieldErrors = false,
}: CustomizeFieldsProps) {
  const patch = (partial: Partial<typeof value>) => onChange({ ...value, ...partial });

  return (
    <>
      <div className={styles.editableCell}>
        <MultiSelectField
          label="GWLs"
          required
          showFieldErrors={showFieldErrors}
          hint={tooltipByLabel.GWLs}
          options={config.timePeriodOptions ?? []}
          value={value.timePeriods}
          onChange={(v) => patch({ timePeriods: v })}
          placeholder="Choose GWLs…"
        />
      </div>
      <div className={styles.editableCell}>
        <MultiSelectField
          label="Variables"
          required
          showFieldErrors={showFieldErrors}
          hint={tooltipByLabel.Variables}
          options={config.variableOptions}
          value={value.variables}
          onChange={(v) => patch({ variables: v })}
          placeholder="Choose variables…"
        />
      </div>
      <div className={styles.editableCell}>
        <MultiSelectField
          label="Percentiles"
          required
          showFieldErrors={showFieldErrors}
          hint={tooltipByLabel.Percentiles}
          options={config.percentileOptions ?? []}
          value={value.percentiles}
          onChange={(v) => patch({ percentiles: v })}
          placeholder="Choose percentiles…"
        />
      </div>
      <div className={styles.editableCell}>
        <MultiSelectField
          label="Location"
          required
          showFieldErrors={showFieldErrors}
          hint={tooltipByLabel.Location}
          options={config.countyOptions}
          value={value.counties}
          onChange={(v) => patch({ counties: v })}
          placeholder="Choose stations…"
        />
      </div>
    </>
  );
}

export const standardYearView: PackageView = {
  kind: "standard-year",
  CustomizeFields: StandardYearCustomizeFields,
  tooltipByLabel,
};
