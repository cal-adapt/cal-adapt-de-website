"use client";

import { useEffect, useState } from "react";

import TableOfContents, { type TocSection } from "./TableOfContents";

interface ArticleTableOfContentsProps {
  /** id of the element to scan for headings */
  articleId: string;
  className?: string;
}

/**
 * Table of contents built after mount from an article's `h2` headings, with
 * any `h3`s (e.g. `Step` titles) nested under them. Headings need an id.
 */
export default function ArticleTableOfContents({
  articleId,
  className,
}: ArticleTableOfContentsProps) {
  const [sections, setSections] = useState<readonly TocSection[]>([]);

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;

    // Read the headings on the next frame, once the article has painted.
    const frame = requestAnimationFrame(() => {
      const headings = article.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]");
      setSections(
        Array.from(headings, (heading) => {
          // Link to the section a heading labels when that section has its own id.
          const section = heading.closest("section");
          const labelsSection = section?.getAttribute("aria-labelledby") === heading.id;

          return {
            id: labelsSection && section?.id ? section.id : heading.id,
            title: heading.textContent ?? "",
            nested: heading.tagName === "H3",
          };
        })
      );
    });

    return () => cancelAnimationFrame(frame);
  }, [articleId]);

  if (sections.length === 0) return null;

  return <TableOfContents sections={sections} className={className} />;
}
