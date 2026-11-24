import Fuse from "fuse.js";

import type { DataMethodsEntry, DataMethodsTag } from "@/config/data-methods";

/**
 * Entries matching `query` and, when any `tags` are selected, carrying at least
 * one of them. Search is fuzzy (forgiving plurals and small typos) across the page
 * name, keyword tags and summary; every word in the query must match somewhere.
 * Results keep their display order.
 */
export function filterDataMethodsEntries(
  entries: readonly DataMethodsEntry[],
  query: string,
  tags: readonly DataMethodsTag[] = []
): readonly DataMethodsEntry[] {
  const tagged =
    tags.length > 0
      ? entries.filter((entry) => entry.tags.some((tag) => tags.includes(tag)))
      : entries;
  if (query.trim() === "") return tagged;

  const fuse = new Fuse(tagged, {
    keys: ["page.label", "tags", "summary"],
    threshold: 0.2,
    ignoreLocation: true,
    useTokenSearch: true,
    tokenMatch: "all",
  });
  const matches = new Set(fuse.search(query).map((result) => result.item));
  return tagged.filter((entry) => matches.has(entry));
}
