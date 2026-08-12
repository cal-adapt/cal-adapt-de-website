import type { ReactNode } from "react";

import type { CustomizeFormKind } from "@/lib/data-download-tool";

import { tooltipByLabel as loca2CountyTooltips } from "./loca2-county";
import { tooltipByLabel as standardYearTooltips } from "./standard-year";
import { tooltipByLabel as typicalMetYearTooltips } from "./typical-met-year";
import { tooltipByLabel as xmyPersistTooltips } from "./xmy-persist";
import { tooltipByLabel as xmyShockTooltips } from "./xmy-shock";

export type TooltipMap = Partial<Record<string, ReactNode>>;

const TOOLTIPS_BY_KIND: Record<CustomizeFormKind, TooltipMap> = {
  "loca2-county": loca2CountyTooltips,
  "standard-year": standardYearTooltips,
  "typical-met-year": typicalMetYearTooltips,
  "xmy-persist": xmyPersistTooltips,
  "xmy-shock": xmyShockTooltips,
};

/** Hint/tooltip text keyed by field label for a given package kind. */
export function getTooltipsForKind(kind: CustomizeFormKind): TooltipMap {
  return TOOLTIPS_BY_KIND[kind];
}
