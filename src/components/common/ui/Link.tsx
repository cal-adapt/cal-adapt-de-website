import NextLink from "next/link";

import clsx from "clsx";
import type { AnchorHTMLAttributes } from "react";

import { isExternalUrl } from "@/utils/url";

import styles from "./Link.module.scss";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  openInNewTab?: boolean;
}

export default function Link({ href, children, className, openInNewTab, ...props }: LinkProps) {
  const isExternal = href && isExternalUrl(href);
  const shouldOpenInNewTab = openInNewTab || isExternal;
  const linkClasses = clsx(styles.link, className);

  if (shouldOpenInNewTab) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} className={linkClasses} {...props}>
      {children}
    </NextLink>
  );
}
