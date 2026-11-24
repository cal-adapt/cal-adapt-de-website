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
  const locationOptions = locationOptionsFor(selections.spatialAggregation);
  const scenarioOptions = scenarioOptionsFor(selections.ensemble);

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
          options={locationOptions}
          // The state has only one location, California.
          disabled={disabled || locationOptions.length < 2}
        />
      </FormField>

      <Divider className={styles.divider} />

      <div className={styles.advanced}>
        <Switch
          label="Advanced view"
          hint={CONTROL_TOOLTIPS.advancedView}
          checked={advanced}
          onChange={onAdvancedChange}
        />

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
                options={scenarioOptions}
                // WRF only has SSP3-7.0, so there is nothing to choose.
                disabled={disabled || scenarioOptions.length < 2}
              />
            </FormField>
            <Switch
              label="Show individual models"
              hint={CONTROL_TOOLTIPS.individualModels}
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
