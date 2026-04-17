import type { ComponentType, ReactNode } from "react";

import type {
  CustomizeFormConfig,
  CustomizeFormKind,
  CustomizeSelections,
} from "@/lib/data-download-tool";

export interface CustomizeFieldsProps {
  config: CustomizeFormConfig;
  value: CustomizeSelections;
  onChange: (next: CustomizeSelections) => void;
  /** When true (e.g. after a failed "continue"), show required errors on empty fields. */
  showFieldErrors?: boolean;
}

/**
 * Component-layer per-package view bundle: the Customize step's field layout, plus tooltip
 * copy (ReactNode, can't live in `lib/`). Register one per `CustomizeFormKind`.
 */
export interface PackageView {
  kind: CustomizeFormKind;
  CustomizeFields: ComponentType<CustomizeFieldsProps>;
  /** Tooltip/hint text keyed by the label used in readOnly / select rows. */
  tooltipByLabel: Partial<Record<string, ReactNode>>;
}
