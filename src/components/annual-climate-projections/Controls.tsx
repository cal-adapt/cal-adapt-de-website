"use client";

import { FormField, Select } from "@/components/common/form";
import Divider from "@/components/common/ui/Divider";
import {
  type AnnualClimateProjectionsSelections,
  ENSEMBLE_OPTIONS,
  isEnsemble,
  locationOptionsFor,
  scenarioOptionsFor,
  SPATIAL_AGGREGATION_OPTIONS,
  toolDefaultLocationFor,
  variableOptionsFor,
  withEnsemble,
} from "@/lib/annual-climate-projections/options";
import { CONTROL_TOOLTIPS } from "@/lib/annual-climate-projections/tooltips";

import Switch from "./Switch";

import styles from "./Controls.module.scss";

export interface ControlsProps {
  selections: AnnualClimateProjectionsSelections;
  onChange: (next: AnnualClimateProjectionsSelections) => void;
  advanced: boolean;
  onAdvancedChange: (advanced: boolean) => void;
  showSimulations: boolean;
  onShowSimulationsChange: (show: boolean) => void;
  /** When true, all controls are disabled (e.g. while data is loading). */
  disabled?: boolean;
}

export default function Controls({
  selections,
  onChange,
  advanced,
  onAdvancedChange,
  showSimulations,
  onShowSimulationsChange,
  disabled = false,
}: ControlsProps) {
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
          options={variableOptionsFor(selections.ensemble)}
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
              location: toolDefaultLocationFor(spatialAggregation),
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

      <Divider />

      <div className={styles.advanced}>
        <Switch label="Advanced view" checked={advanced} onChange={onAdvancedChange} />
        {/* TODO: advanced view description copy */}

        {advanced && (
          <>
            <FormField label="Ensemble type" hint={CONTROL_TOOLTIPS.ensemble} hintVariant="tooltip">
              <Select
                value={selections.ensemble}
                onChange={(ensemble) => {
                  if (isEnsemble(ensemble)) onChange(withEnsemble(selections, ensemble));
                }}
                options={ENSEMBLE_OPTIONS}
                disabled={disabled}
              />
            </FormField>
            <FormField label="Scenario" hint={CONTROL_TOOLTIPS.scenario} hintVariant="tooltip">
              <Select
                value={selections.scenario}
                onChange={(scenario) => onChange({ ...selections, scenario })}
                options={scenarioOptionsFor(selections.ensemble)}
                disabled={disabled}
              />
            </FormField>
            {/* TODO: individual models tooltip copy (CONTROL_TOOLTIPS.individualModels) */}
            <Switch
              label="Show individual models"
              checked={showSimulations}
              onChange={onShowSimulationsChange}
              subtle
            />
          </>
        )}
      </div>
    </div>
  );
}
