import type { CustomizeFormKind } from "@/lib/data-download-tool";

import { loca2CountyView } from "./loca2-county";
import { standardMetYearView } from "./standard-met-year";
import type { PackageView } from "./types";
import { typicalMetYearView } from "./typical-met-year";

const VIEWS: Record<CustomizeFormKind, PackageView> = {
  "loca2-county": loca2CountyView,
  "standard-met-year": standardMetYearView,
  "typical-met-year": typicalMetYearView,
};

export function getPackageView(kind: CustomizeFormKind): PackageView {
  return VIEWS[kind];
}

export type { CustomizeFieldsProps, PackageView } from "./types";
