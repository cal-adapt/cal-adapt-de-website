import type { MDXComponents } from "mdx/types";

import MdxContent from "@/components/common/content/MdxContent";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => <MdxContent>{children}</MdxContent>,
    ...components,
  };
}
