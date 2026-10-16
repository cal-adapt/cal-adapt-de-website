"use client";

import { useId, useState } from "react";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import ToolButton from "@/components/common/ui/ToolButton";
import {
  filterGlossaryEntries,
  type GlossaryEntry,
  glossaryEntryLabel,
  type GlossaryLink,
  groupGlossaryEntriesByLetter,
} from "@/config/glossary";
import { navLinks, toolLinks } from "@/config/navigation";

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
  // Pages on this site (tools, data methods) are listed apart from outside reading.
  const links = entry.links ?? [];
  const siteLinks = links.filter((link) => link.href.startsWith("/"));
  const outsideLinks = links.filter((link) => !link.href.startsWith("/"));

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
        {siteLinks.length + outsideLinks.length > 0 ? (
          <div className={styles.links}>
            <GlossaryLinkRow label="Open in" links={siteLinks} />
            <GlossaryLinkRow label="Read more" links={outsideLinks} />
          </div>
        ) : null}
      </dd>
    </div>
  );
}

function GlossaryLinkRow({ label, links }: { label: string; links: readonly GlossaryLink[] }) {
  if (links.length === 0) return null;

  return (
    <p className={styles.linkRow}>
      <span className={styles.linkRowLabel}>{label}</span>
      {links.map((link) => {
        const tool = toolLinks.find((toolLink) => toolLink.id === link.id);
        if (tool) return <ToolButton key={link.href} navLink={tool} href={link.href} />;

        // Data Methods keeps its page icon; anything else is marked as leaving the page.
        const icon =
          link.id === navLinks.dataMethods.id ? (
            <DescriptionOutlinedIcon />
          ) : (
            <Icon variant="externalLink" />
          );
        return (
          <Button key={link.href} variant="outline" size="compact" href={link.href} prefix={icon}>
            {link.label}
          </Button>
        );
      })}
    </p>
  );
}
