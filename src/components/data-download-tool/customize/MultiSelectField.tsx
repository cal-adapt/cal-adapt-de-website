"use client";

import type { ReactNode } from "react";

import { Badge, FormField, MultiSelect, type MultiSelectOptions } from "@/components/common/form";

const REQUIRED_FIELD_MESSAGE = "This field is required.";

export interface MultiSelectFieldProps {
  label: string;
  options: MultiSelectOptions;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  hint?: ReactNode;
  required?: boolean;
  /** Caller-supplied error; takes precedence over the internal required-empty check. */
  error?: string;
  /** When true, show the required-empty error on required fields with no selections. */
  showFieldErrors?: boolean;
}

export default function MultiSelectField({
  label,
  options,
  value,
  onChange,
  placeholder,
  hint,
  required,
  error,
  showFieldErrors = false,
}: MultiSelectFieldProps) {
  const resolvedError =
    error ??
    (required && showFieldErrors && value.length === 0 ? REQUIRED_FIELD_MESSAGE : undefined);

  return (
    <FormField
      label={label}
      required={required}
      error={resolvedError}
      labelAccessory={<Badge aria-live="polite">{value.length} selected</Badge>}
      hint={hint}
      hintVariant="tooltip"
    >
      <MultiSelect options={options} value={value} onChange={onChange} placeholder={placeholder} />
    </FormField>
  );
}
