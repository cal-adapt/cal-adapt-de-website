"use client";

import { useId, useState } from "react";

import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import { getDashboardToolByNavId } from "@/components/dashboard/tools";
import {
  filterGlossaryEntries,
  type GlossaryEntry,
  glossaryEntryLabel,
  groupGlossaryEntriesByLetter,
} from "@/config/glossary";

import styles from "./GlossaryList.module.scss";

interface GlossaryListProps {
  entries: readonly GlossaryEntry[];
}

/**
 * Searchable A–Z glossary, laid out like a dictionary: a row of letters to jump
 * to, then each letter in the margin beside its terms and their definitions.
 */
export default function GlossaryList({ entries }: GlossaryListProps) {
  const searchId = useId();
  const [query, setQuery] = useState("");

  const results = filterGlossaryEntries(entries, query);
  const groups = groupGlossaryEntriesByLetter(results);

  return (
    <div className={styles.root}>
      <div className={styles.search}>
        <label htmlFor={searchId} className="sr-only">
          Search glossary terms
        </label>
        <Icon variant="search" className={styles.searchIcon} aria-hidden />
        <input
          id={searchId}
          type="search"
          className={styles.searchInput}
          placeholder="Search terms, e.g. cooling degree days"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
        />
      </div>

      <p className="sr-only" aria-live="polite">
        {results.length === entries.length
          ? `${entries.length} terms`
          : `${results.length} of ${entries.length} terms`}
      </p>

      {groups.length > 0 ? (
        <>
          <nav className={styles.jump} aria-label="Jump to letter">
            {groups.map((group) => (
              <Link key={group.letter} className={styles.jumpLink} href={`#letter-${group.letter}`}>
                {group.letter}
              </Link>
            ))}
          </nav>
          {groups.map((group) => (
            <section
              key={group.letter}
              id={`letter-${group.letter}`}
              className={styles.group}
              aria-label={group.letter}
            >
              <h2 className={styles.letter}>{group.letter}</h2>
              <dl className={styles.entries}>
                {group.entries.map((entry) => (
                  <GlossaryListEntry key={entry.id} entry={entry} />
                ))}
              </dl>
            </section>
          ))}
        </>
      ) : (
        <p className={styles.empty}>No glossary terms match your search.</p>
      )}
    </div>
  );
}

function GlossaryListEntry({ entry }: { entry: GlossaryEntry }) {
  return (
    <div id={entry.id} className={styles.entry}>
      <dt className={styles.term}>
        {/* Links to the entry's own anchor, so a term's URL can be copied or shared. */}
        <Link className={styles.termLink} href={`#${entry.id}`}>
          {glossaryEntryLabel(entry)}
        </Link>
      </dt>
      <dd className={styles.definition}>
        <p className={styles.text}>{entry.definition}</p>
        {entry.links && entry.links.length > 0 ? (
          <p className={styles.seeAlso}>
            <span className={styles.seeAlsoLabel}>See also</span>
            {entry.links.map((link) => (
              <Link key={link.href} className={styles.seeAlsoLink} href={link.href}>
                <span className={styles.seeAlsoIcon} aria-hidden>
                  {/* A tool shows its sidebar icon; anything else is marked as leaving the page. */}
                  {getDashboardToolByNavId(link.id ?? null)?.sidebarIcon ?? (
                    <Icon variant="externalLink" />
                  )}
                </span>
                {link.label}
              </Link>
            ))}
          </p>
        ) : null}
      </dd>
    </div>
  );
}
