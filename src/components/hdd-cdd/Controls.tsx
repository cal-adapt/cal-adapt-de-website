"use client";

import { FormField, Select } from "@/components/common/form";
import {
  CLIMATE_VARIABLE_OPTIONS,
  defaultLocationFor,
  type HddCddSelections,
  locationOptionsFor,
  SPATIAL_AGGREGATION_OPTIONS,
} from "@/lib/hdd-cdd/options";
import { CONTROL_TOOLTIPS } from "@/lib/hdd-cdd/tooltips";

import styles from "./Controls.module.scss";

export interface ControlsProps {
  selections: HddCddSelections;
  onChange: (next: HddCddSelections) => void;
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
          onChange={(climateVariable) => onChange({ ...selections, climateVariable })}
          options={CLIMATE_VARIABLE_OPTIONS}
          disabled={disabled}
        />
      </FormField>
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
