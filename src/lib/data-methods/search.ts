import type { DataMethodsEntry, DataMethodsTag } from "@/config/data-methods";

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** True when `text` contains `term`, or its singular form when `term` ends in "s". */
function matchesTerm(text: string, term: string): boolean {
  return (
    text.includes(term) ||
    (term.length > 1 && term.endsWith("s") && text.includes(term.slice(0, -1)))
  );
}

/**
 * Entries matching every whitespace-separated term in `query` (case-insensitive
 * substring match against the page name, summary and keyword tags, with a trailing
 * "s" optional) and, when any `tags` are selected, carrying at least one of them.
 */
export function filterDataMethodsEntries(
  entries: readonly DataMethodsEntry[],
  query: string,
  tags: readonly DataMethodsTag[] = []
): readonly DataMethodsEntry[] {
  const terms = normalize(query).split(" ").filter(Boolean);

  return entries.filter((entry) => {
    if (tags.length > 0 && !entry.tags.some((tag) => tags.includes(tag))) return false;

    const text = normalize(`${entry.page.label} ${entry.summary} ${entry.tags.join(" ")}`);
    return terms.every((term) => matchesTerm(text, term));
  });
}
