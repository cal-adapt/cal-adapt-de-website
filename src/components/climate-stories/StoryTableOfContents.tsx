import Panel from "@/components/common/content/Panel";

import styles from "./StoryTableOfContents.module.scss";

export interface StorySection {
  id: string;
  title: string;
}

interface StoryTableOfContentsProps {
  sections: readonly StorySection[];
  className?: string;
}

export default function StoryTableOfContents({ sections, className }: StoryTableOfContentsProps) {
  return (
    <Panel as="nav" eyebrow="Table of contents" className={className}>
      <ol className={styles.list}>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.title}</a>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
