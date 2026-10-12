import clsx from "clsx";
import type { ReactNode } from "react";

import { getDashboardToolByNavId } from "@/components/dashboard/tools";
import type { NavLink } from "@/config/navigation";

import Link from "./Link";

import styles from "./ToolPill.module.scss";

interface ToolPillBaseProps {
  href: string;
  size?: "small" | "large";
}

/** Opens a tool; the tool supplies the label and icon. */
interface ToolPillNavLinkProps extends ToolPillBaseProps {
  navLink: NavLink;
}

/** Opens anything else, e.g. a blog post. */
interface ToolPillLabelProps extends ToolPillBaseProps {
  label: string;
  icon?: ReactNode;
}

export type ToolPillProps = ToolPillNavLinkProps | ToolPillLabelProps;

/** A small bordered link with an icon, quieter than a `Button`. */
export default function ToolPill({ href, size = "small", ...content }: ToolPillProps) {
  const label = "navLink" in content ? content.navLink.label : content.label;
  const icon =
    "navLink" in content ? getDashboardToolByNavId(content.navLink.id)?.sidebarIcon : content.icon;

  return (
    <Link className={clsx(styles.pill, size === "large" && styles.large)} href={href}>
      {icon ? (
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      ) : null}
      {label}
    </Link>
  );
}
