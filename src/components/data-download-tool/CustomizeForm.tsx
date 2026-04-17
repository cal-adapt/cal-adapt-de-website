"use client";

import { Badge, FormField, MultiSelect, Select } from "@/components/common/form";
import Divider from "@/components/common/ui/Divider";
import LabelValueGrid from "@/components/common/ui/LabelValueGrid";
import type { CustomizeFormConfig, CustomizeSelections } from "@/lib/data-download-tool";

import { tooltipMapForKind } from "./kindDisplay";

import styles from "./CustomizeForm.module.scss";

const REQUIRED_FIELD_MESSAGE = "This field is required.";

export interface CustomizeFormProps {
  config: CustomizeFormConfig;
  value: CustomizeSelections;
  onChange: (next: CustomizeSelections) => void;
  /** When true (e.g. after a failed "continue"), show required errors on empty fields. */
  showFieldErrors?: boolean;
}

export default function CustomizeForm({
  config,
  value,
  onChange,
  showFieldErrors = false,
}: CustomizeFormProps) {
  const patch = (partial: Partial<CustomizeSelections>) => {
    onChange({ ...value, ...partial });
  };

  const requiredError = (isEmpty: boolean) =>
    showFieldErrors && isEmpty ? REQUIRED_FIELD_MESSAGE : undefined;

  const isSmy = config.kind === "standard-met-year";
  const isTmy = config.kind === "typical-met-year";
  const isClimateProfile = isSmy || isTmy;

  const tooltips = tooltipMapForKind(config.kind);

  return (
    <div className={styles.root}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Package summary</h3>
        <LabelValueGrid
          rows={config.readOnlyFields.map((row) => ({
            ...row,
            hint: tooltips[row.label],
          }))}
        />
      </section>

      <Divider />

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Customize selections</h3>
        <div className={styles.editableGrid}>
          {isClimateProfile ? (
            <>
              <div className={styles.editableCell}>
                <FormField
                  label="GWLs"
                  required
                  error={requiredError(value.timePeriods.length === 0)}
                  labelAccessory={
                    <Badge aria-live="polite">{value.timePeriods.length} selected</Badge>
                  }
                  hint={tooltips.GWLs}
                  hintVariant="tooltip"
                >
                  <MultiSelect
                    options={config.timePeriodOptions ?? []}
                    value={value.timePeriods}
                    onChange={(v) => patch({ timePeriods: v })}
                    placeholder="Choose GWLs…"
                  />
                </FormField>
              </div>

              {isSmy ? (
                <>
                  <div className={styles.editableCell}>
                    <FormField
                      label="Variables"
                      required
                      error={requiredError(value.variables.length === 0)}
                      labelAccessory={
                        <Badge aria-live="polite">{value.variables.length} selected</Badge>
                      }
                      hint={tooltips.Variables}
                      hintVariant="tooltip"
                    >
                      <MultiSelect
                        options={config.variableOptions}
                        value={value.variables}
                        onChange={(v) => patch({ variables: v })}
                        placeholder="Choose variables…"
                      />
                    </FormField>
                  </div>
                  <div className={styles.editableCell}>
                    <FormField
                      label="Percentiles"
                      required
                      error={requiredError(value.percentiles.length === 0)}
                      labelAccessory={
                        <Badge aria-live="polite">{value.percentiles.length} selected</Badge>
                      }
                      hint={tooltips.Percentiles}
                      hintVariant="tooltip"
                    >
                      <MultiSelect
                        options={config.percentileOptions ?? []}
                        value={value.percentiles}
                        onChange={(v) => patch({ percentiles: v })}
                        placeholder="Choose percentiles…"
                      />
                    </FormField>
                  </div>
                </>
              ) : (
                <div className={styles.editableCell}>
                  <FormField
                    label="Models"
                    required
                    error={requiredError(value.models.length === 0)}
                    labelAccessory={
                      <Badge aria-live="polite">{value.models.length} selected</Badge>
                    }
                    hint={tooltips.Models}
                    hintVariant="tooltip"
                  >
                    <MultiSelect
                      options={config.modelOptions}
                      value={value.models}
                      onChange={(v) => patch({ models: v })}
                      placeholder="Choose models…"
                    />
                  </FormField>
                </div>
              )}

              <div className={styles.editableCell}>
                <FormField
                  label="Location"
                  required
                  error={requiredError(value.counties.length === 0)}
                  labelAccessory={
                    <Badge aria-live="polite">{value.counties.length} selected</Badge>
                  }
                  hint={tooltips.Location}
                  hintVariant="tooltip"
                >
                  <MultiSelect
                    options={config.countyOptions}
                    value={value.counties}
                    onChange={(v) => patch({ counties: v })}
                    placeholder="Choose stations…"
                  />
                </FormField>
              </div>
            </>
          ) : (
            <>
              <div className={styles.editableCell}>
                <FormField
                  label="Variables"
                  required
                  error={requiredError(value.variables.length === 0)}
                  labelAccessory={
                    <Badge aria-live="polite">{value.variables.length} selected</Badge>
                  }
                  hint={tooltips.Variables}
                  hintVariant="tooltip"
                >
                  <MultiSelect
                    options={config.variableOptions}
                    value={value.variables}
                    onChange={(v) => patch({ variables: v })}
                    placeholder="Choose variables…"
                  />
                </FormField>
              </div>
              <div className={styles.editableCell}>
                <FormField
                  label="Models"
                  required
                  error={requiredError(value.models.length === 0)}
                  labelAccessory={<Badge aria-live="polite">{value.models.length} selected</Badge>}
                  hint={tooltips.Models}
                  hintVariant="tooltip"
                >
                  <MultiSelect
                    options={config.modelOptions}
                    value={value.models}
                    onChange={(v) => patch({ models: v })}
                    placeholder="Choose models…"
                  />
                </FormField>
              </div>
              <div className={styles.editableCell}>
                <FormField
                  label="Scenarios"
                  required
                  error={requiredError(value.scenarios.length === 0)}
                  labelAccessory={
                    <Badge aria-live="polite">{value.scenarios.length} selected</Badge>
                  }
                  hint={tooltips.Scenarios}
                  hintVariant="tooltip"
                >
                  <MultiSelect
                    options={config.scenarioOptions}
                    value={value.scenarios}
                    onChange={(v) => patch({ scenarios: v })}
                    placeholder="Choose scenarios…"
                  />
                </FormField>
              </div>
              <div className={styles.editableCell}>
                <FormField
                  label="Counties"
                  required
                  error={requiredError(value.counties.length === 0)}
                  labelAccessory={
                    <Badge aria-live="polite">{value.counties.length} selected</Badge>
                  }
                  hint={tooltips.Counties}
                  hintVariant="tooltip"
                >
                  <MultiSelect
                    options={config.countyOptions}
                    value={value.counties}
                    onChange={(v) => patch({ counties: v })}
                    placeholder="Choose counties…"
                  />
                </FormField>
              </div>
              <div className={styles.editableCell}>
                <FormField label="Frequency" hint={tooltips.Frequency} hintVariant="tooltip">
                  <Select
                    value={value.frequency}
                    onChange={(v) => patch({ frequency: v })}
                    options={config.frequencyOptions}
                  />
                </FormField>
              </div>
              <div className={styles.editableCell}>
                <FormField label="Aggregation" hint={tooltips.Aggregation} hintVariant="tooltip">
                  <Select
                    value={value.aggregation}
                    onChange={(v) => patch({ aggregation: v })}
                    options={config.aggregationOptions}
                  />
                </FormField>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
