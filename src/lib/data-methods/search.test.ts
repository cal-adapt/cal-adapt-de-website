import { describe, expect, it } from "vitest";

import type { DataMethodsEntry, DataMethodsTag } from "@/config/data-methods";

import { filterDataMethodsEntries } from "./search";

function entry(id: string, label: string, details: Omit<DataMethodsEntry, "page">) {
  return { page: { id, label, href: `/dashboard/data-methods/${id}` }, ...details };
}

const ENTRIES: readonly DataMethodsEntry[] = [
  entry("extreme-heat-days", "Extreme Heat Days", {
    summary: "Days per year above a daytime high temperature threshold.",
    tags: ["Extreme heat"],
    keywords: ["GWL", "maximum daily air temperature"],
  }),
  entry("warm-nights", "Warm Nights", {
    summary: "Nights per year above an overnight low temperature threshold.",
    tags: ["Extreme heat"],
    keywords: ["GWL", "minimum daily air temperature"],
  }),
  entry("cooling-degree-days", "Cooling Degree Days", {
    summary: "How much daily average temperatures exceed 65 °F.",
    tags: ["Energy demand"],
    keywords: ["CDD", "SSP3-7.0"],
  }),
];

function ids(query: string, tags: DataMethodsTag[] = []): string[] {
  return filterDataMethodsEntries(ENTRIES, query, tags).map((e) => e.page.id);
}

describe("filterDataMethodsEntries", () => {
  it("returns every entry for a blank query", () => {
    expect(ids("")).toHaveLength(ENTRIES.length);
    expect(ids("   ")).toHaveLength(ENTRIES.length);
  });

  it("matches the page name case-insensitively", () => {
    expect(ids("warm NIGHTS")).toEqual(["warm-nights"]);
  });

  it("matches the summary and keywords", () => {
    expect(ids("overnight")).toEqual(["warm-nights"]);
    expect(ids("maximum")).toEqual(["extreme-heat-days"]);
    expect(ids("ssp3")).toEqual(["cooling-degree-days"]);
    expect(ids("gwl")).toEqual(["extreme-heat-days", "warm-nights"]);
  });

  it("requires every term to match, in any order", () => {
    expect(ids("threshold nights")).toEqual(["warm-nights"]);
    expect(ids("nights cdd")).toEqual([]);
  });

  it("returns nothing when no entry matches", () => {
    expect(ids("precipitation")).toEqual([]);
  });

  it("keeps entries carrying any selected tag", () => {
    expect(ids("", ["Energy demand"])).toEqual(["cooling-degree-days"]);
    expect(ids("", ["Extreme heat"])).toEqual(["extreme-heat-days", "warm-nights"]);
    expect(ids("", ["Extreme heat", "Energy demand"])).toHaveLength(ENTRIES.length);
    expect(ids("", ["Renewable energy"])).toEqual([]);
  });

  it("combines tags with the search query", () => {
    expect(ids("nights", ["Extreme heat"])).toEqual(["warm-nights"]);
    expect(ids("nights", ["Energy demand"])).toEqual([]);
  });
});
