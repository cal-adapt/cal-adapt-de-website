"use client";

import { useEffect } from "react";

const URL_PATTERN = /https?:\/\/\S+/;

interface CitationLinksProps {
  /** id of the article element to scan for bibliography entries */
  articleId: string;
}

/**
 * Pandoc's citeproc (used by the Cal-Adapt guidance site) automatically turns
 * DOIs/URLs in bibliography entries into links. rehype-citation, the citeproc-js
 * based plugin this app uses, renders them as plain text instead — there's no
 * config option for it. This mirrors that behavior after mount.
 */
export default function CitationLinks({ articleId }: CitationLinksProps) {
  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;

    const entries = article.querySelectorAll<HTMLElement>(".csl-right-inline");
    entries.forEach((entry) => {
      if (entry.dataset.linkified) return;
      entry.dataset.linkified = "true";

      Array.from(entry.childNodes).forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) return;

        const text = node.textContent ?? "";
        const match = text.match(URL_PATTERN);
        if (!match) return;

        let url = match[0];
        const start = text.indexOf(url);
        // A trailing "." is virtually always the citation's closing
        // punctuation, not part of the URL/DOI itself.
        let trailing = "";
        if (url.endsWith(".")) {
          trailing = ".";
          url = url.slice(0, -1);
        }

        const before = text.slice(0, start);
        const after = text.slice(start + url.length + trailing.length);

        const link = document.createElement("a");
        link.href = url;
        link.textContent = url;

        const frag = document.createDocumentFragment();
        if (before) frag.appendChild(document.createTextNode(before));
        frag.appendChild(link);
        if (trailing || after) frag.appendChild(document.createTextNode(trailing + after));

        node.replaceWith(frag);
      });
    });
  }, [articleId]);

  return null;
}
