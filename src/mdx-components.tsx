import type { MDXComponents } from "mdx/types";

import Callout from "@/components/common/content/Callout";
import MdxContent from "@/components/common/content/MdxContent";
import SectionDivider from "@/components/common/content/SectionDivider";
import Spec from "@/components/common/content/Spec";
import Specs from "@/components/common/content/Specs";
import Stat from "@/components/common/content/Stat";
import StatGrid from "@/components/common/content/StatGrid";
import Step from "@/components/common/content/Step";
import TurbinePowerCurve from "@/components/common/content/TurbinePowerCurve";
import WarmingLevelTimeIndex from "@/components/common/content/WarmingLevelTimeIndex";
import WindFarmLayout from "@/components/common/content/WindFarmLayout";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => <MdxContent>{children}</MdxContent>,
    Step,
    Callout,
    Stat,
    StatGrid,
    SectionDivider,
    Specs,
    Spec,
    TurbinePowerCurve,
    WindFarmLayout,
    WarmingLevelTimeIndex,
    ...components,
  };
}
