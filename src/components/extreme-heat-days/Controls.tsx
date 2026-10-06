"use client";

import { FormField, Select } from "@/components/common/form";
import {
  CLIMATE_VARIABLE_SELECT_OPTIONS,
  defaultLocationFor,
  defaultThresholdFor,
  defaultThresholdForKind,
  DURATION_OPTIONS,
  type ExtremeHeatDaysSelections,
  getHeatMetric,
  isAllowedThreshold,
  locationOptionsFor,
  SPATIAL_AGGREGATION_OPTIONS,
  THRESHOLD_KIND_OPTIONS,
  thresholdKindFor,
} from "@/lib/extreme-heat-days/options";
import { CONTROL_TOOLTIPS } from "@/lib/extreme-heat-days/tooltips";

import ThresholdInput from "./ThresholdInput";

import styles from "./Controls.module.scss";

export interface ControlsProps {
  selections: ExtremeHeatDaysSelections;
  onChange: (next: ExtremeHeatDaysSelections) => void;
  /** When true, all controls are disabled (e.g. while data is loading). */
  disabled?: boolean;
}

export default function Controls({ selections, onChange, disabled = false }: ControlsProps) {
  const thresholdKind = thresholdKindFor(selections.threshold);

  return (
    <div className={styles.root}>
      <FormField
        label="Climate variable"
        hint={CONTROL_TOOLTIPS.climateVariable}
        hintVariant="tooltip"
      >
        <Select
          value={selections.climateVariable}
          onChange={(climateVariable) =>
            onChange({
              ...selections,
              climateVariable,
              threshold: isAllowedThreshold(selections.threshold, climateVariable)
                ? selections.threshold
                : defaultThresholdFor(climateVariable),
            })
          }
          options={CLIMATE_VARIABLE_SELECT_OPTIONS}
          disabled={disabled}
        />
      </FormField>
      <FormField label="Threshold Type" hint={CONTROL_TOOLTIPS.thresholdType} hintVariant="tooltip">
        <Select
          value={thresholdKind}
          onChange={(kind) =>
            onChange({
              ...selections,
              threshold: defaultThresholdForKind(
                selections.climateVariable,
                kind === "relative" ? "relative" : "absolute"
              ),
            })
          }
          options={THRESHOLD_KIND_OPTIONS}
          disabled={disabled}
        />
      </FormField>
      <FormField
        label="Threshold"
        hint={getHeatMetric(selections.climateVariable).thresholdTooltip}
        hintVariant="tooltip"
      >
        <ThresholdInput
          kind={thresholdKind}
          climateVariable={selections.climateVariable}
          value={selections.threshold}
          onChange={(threshold) => onChange({ ...selections, threshold })}
          disabled={disabled}
        />
      </FormField>
      {getHeatMetric(selections.climateVariable).usesDuration && (
        <FormField label="Duration" hint={CONTROL_TOOLTIPS.duration} hintVariant="tooltip">
          <Select
            value={selections.duration}
            onChange={(duration) => onChange({ ...selections, duration })}
            options={DURATION_OPTIONS}
            disabled={disabled}
          />
        </FormField>
      )}
      <FormField
        label="Spatial aggregation"
        hint={CONTROL_TOOLTIPS.spatialAggregation}
        hintVariant="tooltip"
      >
        <Select
          value={selections.spatialAggregation}
          onChange={(spatialAggregation) =>
            onChange({
              ...selections,
              spatialAggregation,
              location: defaultLocationFor(spatialAggregation),
            })
          }
          options={SPATIAL_AGGREGATION_OPTIONS}
          disabled={disabled}
        />
      </FormField>
      <FormField label="Location">
        <Select
          value={selections.location}
          onChange={(location) => onChange({ ...selections, location })}
          options={locationOptionsFor(selections.spatialAggregation)}
          disabled={disabled}
        />
      </FormField>
    </div>
  );
}
