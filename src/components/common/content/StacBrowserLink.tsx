import type { ReactNode } from "react";

import Link from "@/components/common/ui/Link";
import { STAC_BROWSER_URL } from "@/config/constants";

interface StacBrowserLinkProps {
  /** STAC collection id, e.g. "eh-metrics-mm-boundary-csv". */
  collection: string;
  children: ReactNode;
}

/** Inline link to a collection's page in the Cal-Adapt STAC Browser (opens in a new tab). */
export default function StacBrowserLink({ collection, children }: StacBrowserLinkProps) {
  return <Link href={`${STAC_BROWSER_URL}/#/collections/${collection}`}>{children}</Link>;
}
