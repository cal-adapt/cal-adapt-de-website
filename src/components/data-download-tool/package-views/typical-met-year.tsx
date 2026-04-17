"use client";

import { tooltipByLabel } from "../tooltips/typical-met-year";

import MultiSelectField from "./MultiSelectField";
import type { CustomizeFieldsProps, PackageView } from "./types";

import styles from "../CustomizeForm.module.scss";

const REQUIRED_FIELD_MESSAGE = "This field is required.";

function TmyCustomizeFields({
  config,
  value,
  onChange,
  showFieldErrors = false,
}: CustomizeFieldsProps) {
  const patch = (partial: Partial<typeof value>) => onChange({ ...value, ...partial });
  const requiredError = (isEmpty: boolean) =>
    showFieldErrors && isEmpty ? REQUIRED_FIELD_MESSAGE : undefined;

  return (
    <>
      <div className={styles.editableCell}>
        <MultiSelectField
          label="GWLs"
          required
          error={requiredError(value.timePeriods.length === 0)}
          hint={tooltipByLabel.GWLs}
          options={config.timePeriodOptions ?? []}
          value={value.timePeriods}
          onChange={(v) => patch({ timePeriods: v })}
          placeholder="Choose GWLs…"
        />
      </div>
      <div className={styles.editableCell}>
        <MultiSelectField
          label="Models"
          required
          error={requiredError(value.models.length === 0)}
          hint={tooltipByLabel.Models}
          options={config.modelOptions}
          value={value.models}
          onChange={(v) => patch({ models: v })}
          placeholder="Choose models…"
        />
      </div>
      <div className={styles.editableCell}>
        <MultiSelectField
          label="Location"
          required
          error={requiredError(value.counties.length === 0)}
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

export const typicalMetYearView: PackageView = {
  kind: "typical-met-year",
  CustomizeFields: TmyCustomizeFields,
  tooltipByLabel,
};
