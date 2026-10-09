import { describe, expect, it } from "vitest";

import {
  filterGlossaryEntries,
  glossaryEntries,
  glossaryEntryLabel,
  groupGlossaryEntriesByLetter,
  isGlossaryLinkEnabled,
} from "./glossary";

describe("glossaryEntries", () => {
  it("uses unique ids", () => {
    const ids = glossaryEntries.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is sorted alphabetically by term", () => {
    const terms = glossaryEntries.map((entry) => entry.term);
    expect(terms).toEqual([...terms].sort((a, b) => a.localeCompare(b)));
  });
});

describe("glossary links", () => {
  it("lists only links whose feature flag is on", () => {
    for (const entry of glossaryEntries) {
      for (const link of entry.links ?? []) {
        expect(isGlossaryLinkEnabled(link), `${entry.id} -> ${link.href}`).toBe(true);
      }
    }
  });
});

describe("glossaryEntryLabel", () => {
  it("appends the abbreviation when there is one", () => {
    expect(
      glossaryEntryLabel({ id: "a", term: "Alpha beta", abbreviation: "AB", definition: "" })
    ).toBe("Alpha beta (AB)");
    expect(glossaryEntryLabel({ id: "a", term: "Alpha beta", definition: "" })).toBe("Alpha beta");
  });
});

describe("filterGlossaryEntries", () => {
  it("returns every entry for an empty query", () => {
    expect(filterGlossaryEntries(glossaryEntries, "  ")).toEqual(glossaryEntries);
  });

  it("matches the abbreviation and definition text, ignoring case", () => {
    expect(filterGlossaryEntries(glossaryEntries, "cdds").map((entry) => entry.id)).toEqual([
      "cooling-degree-days",
    ]);
    expect(
      filterGlossaryEntries(glossaryEntries, "indoor COOLING").map((entry) => entry.id)
    ).toEqual(["cooling-degree-days"]);
  });

  it("returns nothing when a word matches no entry", () => {
    expect(filterGlossaryEntries(glossaryEntries, "cooling zzz")).toEqual([]);
  });
});

describe("groupGlossaryEntriesByLetter", () => {
  it("groups consecutive entries under their first letter", () => {
    const groups = groupGlossaryEntriesByLetter([
      { id: "a1", term: "apple", definition: "" },
      { id: "a2", term: "Avocado", definition: "" },
      { id: "b1", term: "Banana", definition: "" },
    ]);

    expect(groups.map((group) => [group.letter, group.entries.map((entry) => entry.id)])).toEqual([
      ["A", ["a1", "a2"]],
      ["B", ["b1"]],
    ]);
  });
});
