"use client";

import type { ReactNode } from "react";

import { Badge, FormField, MultiSelect, type MultiSelectOption } from "@/components/common/form";

export interface MultiSelectFieldProps {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  hint?: ReactNode;
  required?: boolean;
  error?: string;
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
}: MultiSelectFieldProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      labelAccessory={<Badge aria-live="polite">{value.length} selected</Badge>}
      hint={hint}
      hintVariant="tooltip"
    >
      <MultiSelect options={options} value={value} onChange={onChange} placeholder={placeholder} />
    </FormField>
  );
}
