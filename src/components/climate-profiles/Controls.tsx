"use client";

import { FormField, Select, type SelectOption } from "@/components/common/form";
import Divider from "@/components/common/ui/Divider";
import {
  type ClimateProfilesSelections,
  COLD_PERCENTILE_OPTIONS,
  type ColdPercentile,
  HOT_PERCENTILE_OPTIONS,
  type HotPercentile,
  MODEL_OPTIONS,
  type ModelId,
  PERIOD_OPTIONS,
  type PeriodId,
  VARIABLE_OPTIONS,
  type VariableId,
  XMY_OPTIONS,
  type XmyId,
} from "@/lib/climate-profiles/options";
import { CONTROL_TOOLTIPS } from "@/lib/climate-profiles/tooltips";

import Switch from "./Switch";

import styles from "./Controls.module.scss";

export interface ControlsProps {
  selections: ClimateProfilesSelections;
  onChange: (next: ClimateProfilesSelections) => void;
  /** Stations from STAC; empty while loading. */
  stationOptions: readonly SelectOption[];
  /** True when the station list request failed. */
  stationsFailed?: boolean;
  advanced: boolean;
  onAdvancedChange: (advanced: boolean) => void;
  /** Disables the controls that trigger a new download while data is loading. */
  disabled?: boolean;
}

export default function Controls({
  selections,
  onChange,
  stationOptions,
  stationsFailed = false,
  advanced,
  onAdvancedChange,
  disabled = false,
}: ControlsProps) {
  const set = (patch: Partial<ClimateProfilesSelections>) => onChange({ ...selections, ...patch });

  return (
    <div className={styles.root}>
      <FormField label="Location" hint={CONTROL_TOOLTIPS.location} hintVariant="tooltip">
        <Select
          value={selections.station}
          onChange={(station) => set({ station })}
          options={stationOptions}
          placeholder={stationsFailed ? "Couldn't load stations" : "Loading stations…"}
          disabled={disabled || stationOptions.length === 0}
        />
      </FormField>
      <FormField label="Compare TMY with" hint={CONTROL_TOOLTIPS.xmy} hintVariant="tooltip">
        <Select
          value={selections.xmy}
          onChange={(xmy) => set({ xmy: xmy as XmyId })}
          options={XMY_OPTIONS}
        />
      </FormField>
      <FormField label="Global warming level" hint={CONTROL_TOOLTIPS.period} hintVariant="tooltip">
        <Select
          value={selections.period}
          onChange={(period) => set({ period: period as PeriodId })}
          options={PERIOD_OPTIONS}
          disabled={disabled}
        />
      </FormField>
      <FormField label="Variable" hint={CONTROL_TOOLTIPS.variable} hintVariant="tooltip">
        <Select
          value={selections.variable}
          onChange={(variable) => set({ variable: variable as VariableId })}
          options={VARIABLE_OPTIONS}
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
            <FormField label="Model" hint={CONTROL_TOOLTIPS.model} hintVariant="tooltip">
              <Select
                value={selections.model}
                onChange={(model) => set({ model: model as ModelId })}
                options={MODEL_OPTIONS}
                disabled={disabled}
              />
            </FormField>
            <FormField
              label="Hot percentile"
              hint={CONTROL_TOOLTIPS.percentile}
              hintVariant="tooltip"
            >
              <Select
                value={selections.hotPercentile}
                onChange={(p) => set({ hotPercentile: p as HotPercentile })}
                options={HOT_PERCENTILE_OPTIONS}
                disabled={disabled}
              />
            </FormField>
            <FormField
              label="Cold percentile"
              hint={CONTROL_TOOLTIPS.percentile}
              hintVariant="tooltip"
            >
              <Select
                value={selections.coldPercentile}
                onChange={(p) => set({ coldPercentile: p as ColdPercentile })}
                options={COLD_PERCENTILE_OPTIONS}
                disabled={disabled}
              />
            </FormField>
          </>
        )}
      </div>
    </div>
  );
}
