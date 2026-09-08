"use client";

import { FormField, Select } from "@/components/common/form";
import {
  defaultLocationFor,
  type HddCddSelections,
  locationOptionsFor,
  METRIC_OPTIONS,
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
      <FormField label="Metric" hint={CONTROL_TOOLTIPS.metric} hintVariant="tooltip">
        <Select
          value={selections.metric}
          onChange={(metric) => onChange({ ...selections, metric })}
          options={METRIC_OPTIONS}
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
