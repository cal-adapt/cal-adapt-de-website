import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";

import type { ReactNode } from "react";

import ToolPill from "@/components/common/ui/ToolPill";
import type { NavLink } from "@/config/navigation";

import styles from "./StoryToolLink.module.scss";

export interface StoryToolLinkTarget {
  /** The tool to open; supplies the label and icon. */
  navLink: NavLink;
  /** Link to the tool, opened on the figure's selections. */
  href: string;
}

/** Further reading on another site, e.g. a blog post. */
export interface StoryRelatedLink {
  label: string;
  href: string;
}

interface StoryToolLinkProps {
  links: readonly StoryToolLinkTarget[];
  relatedLinks?: readonly StoryRelatedLink[];
  children: ReactNode;
}

/** Puts links to the tools a figure can be explored in, and any further
 * reading, above its top right corner. */
export default function StoryToolLink({ links, relatedLinks = [], children }: StoryToolLinkProps) {
  return (
    <div className={styles.root}>
      <p className={styles.row}>
        <span className={styles.label}>Open in</span>
        {links.map(({ navLink, href }) => (
          <ToolPill key={href} navLink={navLink} href={href} />
        ))}
      </p>
      {relatedLinks.length > 0 ? (
        <p className={styles.row}>
          <span className={styles.label}>Read more</span>
          {relatedLinks.map(({ label, href }) => (
            <ToolPill key={href} label={label} href={href} icon={<ArrowOutwardOutlinedIcon />} />
          ))}
        </p>
      ) : null}
      {children}
    </div>
  );
}
