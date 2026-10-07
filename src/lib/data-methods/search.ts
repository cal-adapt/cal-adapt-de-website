import type { DataMethodsEntry, DataMethodsTag } from "@/config/data-methods";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Entries matching every whitespace-separated term in `query` (case-insensitive
 * substring match against the page name, summary, and keywords) and, when any
 * `tags` are selected, carrying at least one of them.
 */
export function filterDataMethodsEntries(
  entries: readonly DataMethodsEntry[],
  query: string,
  tags: readonly DataMethodsTag[] = []
): readonly DataMethodsEntry[] {
  const terms = normalize(query).split(" ").filter(Boolean);

  return entries.filter((entry) => {
    if (tags.length > 0 && !entry.tags.some((tag) => tags.includes(tag))) return false;

    const text = normalize([entry.page.label, entry.summary, ...entry.keywords].join(" "));
    return terms.every((term) => text.includes(term));
  });
}
