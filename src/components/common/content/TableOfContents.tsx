import clsx from "clsx";

import Panel from "@/components/common/content/Panel";

import styles from "./TableOfContents.module.scss";

export interface TocSection {
  id: string;
  title: string;
  /** Renders the entry indented under the section before it. */
  nested?: boolean;
}

interface TableOfContentsProps {
  sections: readonly TocSection[];
  className?: string;
}

export default function TableOfContents({ sections, className }: TableOfContentsProps) {
  return (
    <Panel as="nav" eyebrow="Table of contents" className={className}>
      <ol className={styles.list}>
        {sections.map((section) => (
          <li key={section.id} className={clsx(section.nested && styles.nested)}>
            <a href={`#${section.id}`}>{section.title}</a>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
