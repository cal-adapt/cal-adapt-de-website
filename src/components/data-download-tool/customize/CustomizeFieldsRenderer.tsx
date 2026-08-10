"use client";

import { FormField, Select } from "@/components/common/form";
import type {
  CustomizeFieldConfig,
  CustomizeFormConfig,
  CustomizeSelections,
} from "@/lib/data-download-tool";

import type { TooltipMap } from "../tooltips/registry";

import MultiSelectField from "./MultiSelectField";

import styles from "./CustomizeForm.module.scss";

export interface CustomizeFieldsRendererProps {
  fields: readonly CustomizeFieldConfig[];
  tooltipByLabel: TooltipMap;
  config: CustomizeFormConfig;
  value: CustomizeSelections;
  onChange: (next: CustomizeSelections) => void;
  /** When true (e.g. after a failed "continue"), show required errors on empty fields. */
  showFieldErrors?: boolean;
}

interface FieldRenderContext {
  config: CustomizeFormConfig;
  value: CustomizeSelections;
  onChange: (next: CustomizeSelections) => void;
  showFieldErrors: boolean;
  tooltipByLabel: TooltipMap;
}

/**
 * Case-exhaustive renderer — TS forces us to add a branch here for every new
 * `CustomizeFieldConfig.kind`.
 */
function renderField(field: CustomizeFieldConfig, ctx: FieldRenderContext) {
  const patch = (partial: Partial<CustomizeSelections>) =>
    ctx.onChange({ ...ctx.value, ...partial });
  const hint = ctx.tooltipByLabel[field.label];

  switch (field.kind) {
    case "multi":
      return (
        <MultiSelectField
          label={field.label}
          required={field.required ?? true}
          showFieldErrors={ctx.showFieldErrors}
          hint={hint}
          options={field.options(ctx.config, ctx.value)}
          value={field.value(ctx.value)}
          onChange={(next) => patch(field.patch(next, ctx.value))}
          placeholder={field.placeholder ?? ""}
        />
      );
    case "single":
      return (
        <FormField label={field.label} hint={hint} hintVariant="tooltip">
          <Select
            value={field.value(ctx.value)}
            onChange={(next) => patch(field.patch(next, ctx.value))}
            options={field.options(ctx.config, ctx.value)}
          />
        </FormField>
      );
    default: {
      const _exhaustive: never = field;
      return _exhaustive;
    }
  }
}

/**
 * Iterates an adapter's `fields` array and renders each row in the shared
 * `editableCell` grid slot, using `tooltipByLabel` for hint copy. The `fields`
 * data comes from `lib/` (adapter) and tooltips from `components/` (ReactNode) —
 * this component is where the two meet.
 */
export default function CustomizeFieldsRenderer({
  fields,
  tooltipByLabel,
  config,
  value,
  onChange,
  showFieldErrors = false,
}: CustomizeFieldsRendererProps) {
  const ctx: FieldRenderContext = {
    config,
    value,
    onChange,
    showFieldErrors,
    tooltipByLabel,
  };
  return (
    <>
      {fields
        .filter((field) => field.visible?.(value) ?? true)
        .map((field) => (
          <div key={field.label} className={styles.editableCell}>
            {renderField(field, ctx)}
          </div>
        ))}
    </>
  );
}
