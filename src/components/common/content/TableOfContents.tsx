"use client";

import { useEffect, useState } from "react";

import clsx from "clsx";

import { mixSignatureColor } from "@/lib/color/signature-scale";

import styles from "./TableOfContents.module.scss";

interface HeadingItem {
  id: string;
  text: string;
  color: string;
}

interface TableOfContentsProps {
  /** id of the article element to scan for h2 headings */
  articleId: string;
  /** id of the scrollable ancestor to observe against (defaults to the window) */
  scrollContainerId?: string;
}

export default function TableOfContents({ articleId, scrollContainerId }: TableOfContentsProps) {
  const [items, setItems] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;

    const headingEls = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2")).filter(
      (el) => el.id
    );

    const total = headingEls.length;
    if (total === 0) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- headings come from the rendered DOM, not props/state
    setItems(
      headingEls.map((el, i) => ({
        id: el.id,
        text: el.textContent ?? "",
        color: mixSignatureColor(total > 1 ? i / (total - 1) : 0),
      }))
    );
    setActiveId(headingEls[0].id);

    const root = scrollContainerId ? document.getElementById(scrollContainerId) : null;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveId(topMost.target.id);
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [articleId, scrollContainerId]);

  if (items.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.eyebrow}>On this page</p>
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <a
              href={`#${item.id}`}
              className={clsx(styles.link, activeId === item.id && styles.active)}
              style={{ "--dot-color": item.color } as React.CSSProperties}
              aria-current={activeId === item.id ? "location" : undefined}
            >
              <span className={styles.dot} aria-hidden="true" />
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
