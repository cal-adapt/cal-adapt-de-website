import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";

import Callout from "@/components/common/content/Callout";
import MdxContent from "@/components/common/content/MdxContent";
import SignatureRule from "@/components/common/content/SignatureRule";
import Spec from "@/components/common/content/Spec";
import Specs from "@/components/common/content/Specs";
import Stat from "@/components/common/content/Stat";
import StatGrid from "@/components/common/content/StatGrid";
import Step from "@/components/common/content/Step";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => <MdxContent>{children}</MdxContent>,
    h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
      <>
        <h1 {...props}>{children}</h1>
        <SignatureRule />
      </>
    ),
    Step,
    Callout,
    Stat,
    StatGrid,
    Specs,
    Spec,
    ...components,
  };
}
