import type { MDXComponents } from "mdx/types";

import Callout from "@/components/common/content/Callout";
import MdxContent from "@/components/common/content/MdxContent";
import S3FolderLink from "@/components/common/content/S3FolderLink";
import ShownIn from "@/components/common/content/ShownIn";
import Spec from "@/components/common/content/Spec";
import Specs from "@/components/common/content/Specs";
import StacBrowserLink from "@/components/common/content/StacBrowserLink";
import Step from "@/components/common/content/Step";
import TurbinePowerCurve from "@/components/common/content/TurbinePowerCurve";
import WindFarmLayout from "@/components/common/content/WindFarmLayout";
import CitationBox from "@/components/common/ui/CitationBox";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => <MdxContent>{children}</MdxContent>,
    Step,
    Callout,
    CitationBox,
    Specs,
    Spec,
    ShownIn,
    StacBrowserLink,
    S3FolderLink,
    TurbinePowerCurve,
    WindFarmLayout,
    ...components,
  };
}
