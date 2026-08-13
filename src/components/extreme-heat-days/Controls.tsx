"use client";

import { FormField, Select } from "@/components/common/form";
import { featureFlags } from "@/config/feature-flags";
import {
  CLIMATE_VARIABLE_SELECT_OPTIONS,
  COUNTY_OPTIONS,
  defaultThresholdFor,
  type ExtremeHeatDaysSelections,
  getHeatMetric,
  INDICATOR_OPTIONS,
  thresholdOptionsFor,
} from "@/lib/extreme-heat-days/options";
import { CONTROL_TOOLTIPS } from "@/lib/extreme-heat-days/tooltips";

import styles from "./Controls.module.scss";

export interface ControlsProps {
  selections: ExtremeHeatDaysSelections;
  onChange: (next: ExtremeHeatDaysSelections) => void;
  /** When true, all controls are disabled (e.g. while data is loading). */
  disabled?: boolean;
}

export default function Controls({ selections, onChange, disabled = false }: ControlsProps) {
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
            // Reset threshold to the new metric's default; thresholds are
            // metric-specific (max-temp vs. min-temp), so the previous value is
            // typically invalid for the newly selected variable.
            onChange({
              ...selections,
              climateVariable,
              threshold: defaultThresholdFor(climateVariable),
            })
          }
          options={CLIMATE_VARIABLE_SELECT_OPTIONS}
          disabled={disabled}
        />
      </FormField>
      <FormField
        label="Threshold"
        hint={getHeatMetric(selections.climateVariable).thresholdTooltip}
        hintVariant="tooltip"
      >
        <Select
          value={selections.threshold}
          onChange={(threshold) => onChange({ ...selections, threshold })}
          options={thresholdOptionsFor(selections.climateVariable)}
          disabled={disabled}
        />
      </FormField>
      {featureFlags.__FF_EXTREME_HEAT_DAYS_INDICATOR__ && (
        <FormField label="Indicator" hint={CONTROL_TOOLTIPS.indicator} hintVariant="tooltip">
          <Select
            value={selections.indicator}
            onChange={(indicator) => onChange({ ...selections, indicator })}
            options={INDICATOR_OPTIONS}
            disabled={disabled}
          />
        </FormField>
      )}
      <FormField label="County" hint={CONTROL_TOOLTIPS.county} hintVariant="tooltip">
        <Select
          value={selections.county}
          onChange={(county) => onChange({ ...selections, county })}
          options={COUNTY_OPTIONS}
          disabled={disabled}
        />
      </FormField>
    </div>
  );
}
