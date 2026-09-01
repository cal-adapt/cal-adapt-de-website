"use client";

import { useSearchParams } from "next/navigation";

import MuiLink from "@mui/material/Link";

interface BreadcrumbToolLinkProps {
  href: string;
  label: string;
}

/**
 * Breadcrumb link which carries the current query string so URL-encoded tool
 * selections persist through sub-page navigation.
 */
export default function BreadcrumbToolLink({ href, label }: BreadcrumbToolLinkProps) {
  const search = useSearchParams().toString();

  return (
    <MuiLink underline="hover" color="inherit" href={search ? `${href}?${search}` : href}>
      {label}
    </MuiLink>
  );
}
