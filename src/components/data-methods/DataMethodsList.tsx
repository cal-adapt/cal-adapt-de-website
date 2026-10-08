"use client";

import { useId, useState } from "react";

import clsx from "clsx";

import Badge from "@/components/common/ui/Badge";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import {
  DATA_METHODS_TAGS,
  type DataMethodsEntry,
  type DataMethodsTag,
} from "@/config/data-methods";
import { filterDataMethodsEntries } from "@/lib/data-methods/search";

import styles from "./DataMethodsList.module.scss";

interface DataMethodsListProps {
  entries: readonly DataMethodsEntry[];
}

/** Searchable, stacked list of data methods pages. Keyword chips narrow the list
 * alongside the search box. */
export default function DataMethodsList({ entries }: DataMethodsListProps) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<readonly DataMethodsTag[]>([]);

  // Only offer keywords that at least one listed entry carries.
  const tags = DATA_METHODS_TAGS.filter((tag) => entries.some((entry) => entry.tags.includes(tag)));
  const results = filterDataMethodsEntries(entries, query, selectedTags);

  const toggleTag = (tag: DataMethodsTag) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.search}>
        <label htmlFor={searchId} className="sr-only">
          Search data methods by climate variable
        </label>
        <Icon variant="search" className={styles.searchIcon} aria-hidden />
        <input
          id={searchId}
          type="search"
          className={styles.searchInput}
          placeholder="Search climate variables, e.g. heat waves"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </div>

      {tags.length > 1 ? (
        <div className={styles.tags} role="group" aria-label="Filter by keyword">
          {tags.map((tag) => {
            const selected = selectedTags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                className={clsx(styles.tag, selected && styles.tagSelected)}
                aria-pressed={selected}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {results.length === entries.length
          ? `${entries.length} topics`
          : `${results.length} of ${entries.length} topics`}
      </p>

      {results.length > 0 ? (
        <ul className={styles.list}>
          {results.map((entry) => (
            <li key={entry.page.id}>
              <Link className={styles.item} href={entry.page.href}>
                <div className={styles.itemHeader}>
                  <h2 className={styles.title}>{entry.page.label}</h2>
                  <div className={styles.itemTags}>
                    {entry.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                </div>
                <p className={styles.summary}>{entry.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>No data methods match your search.</p>
      )}
    </div>
  );
}
