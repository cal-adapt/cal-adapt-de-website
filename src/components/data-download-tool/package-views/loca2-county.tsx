"use client";

import { FormField, Select } from "@/components/common/form";

import { tooltipByLabel } from "../tooltips/loca2-county";

import MultiSelectField from "./MultiSelectField";
import type { CustomizeFieldsProps, PackageView } from "./types";

import styles from "../CustomizeForm.module.scss";

const REQUIRED_FIELD_MESSAGE = "This field is required.";

function Loca2CountyCustomizeFields({
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
          label="Variables"
          required
          error={requiredError(value.variables.length === 0)}
          hint={tooltipByLabel.Variables}
          options={config.variableOptions}
          value={value.variables}
          onChange={(v) => patch({ variables: v })}
          placeholder="Choose variables…"
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
          label="Scenarios"
          required
          error={requiredError(value.scenarios.length === 0)}
          hint={tooltipByLabel.Scenarios}
          options={config.scenarioOptions}
          value={value.scenarios}
          onChange={(v) => patch({ scenarios: v })}
          placeholder="Choose scenarios…"
        />
      </div>
      <div className={styles.editableCell}>
        <MultiSelectField
          label="Counties"
          required
          error={requiredError(value.counties.length === 0)}
          hint={tooltipByLabel.Counties}
          options={config.countyOptions}
          value={value.counties}
          onChange={(v) => patch({ counties: v })}
          placeholder="Choose counties…"
        />
      </div>
      <div className={styles.editableCell}>
        <FormField label="Frequency" hint={tooltipByLabel.Frequency} hintVariant="tooltip">
          <Select
            value={value.frequency}
            onChange={(v) => patch({ frequency: v })}
            options={config.frequencyOptions}
          />
        </FormField>
      </div>
      <div className={styles.editableCell}>
        <FormField label="Aggregation" hint={tooltipByLabel.Aggregation} hintVariant="tooltip">
          <Select
            value={value.aggregation}
            onChange={(v) => patch({ aggregation: v })}
            options={config.aggregationOptions}
          />
        </FormField>
      </div>
    </>
  );
}

export const loca2CountyView: PackageView = {
  kind: "loca2-county",
  CustomizeFields: Loca2CountyCustomizeFields,
  tooltipByLabel,
};
