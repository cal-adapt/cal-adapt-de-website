import { describe, expect, it } from "vitest";

import {
  dashboardPages,
  enabledNavSections,
  isNavLinkEnabled,
  navLinks,
  type NavSection,
  navSections,
  toolLinks,
} from "./navigation";

const allSections: readonly NavSection[] = Object.values(navSections);
const sectionLinks = allSections.flatMap((section) => section.links);

describe("navSections", () => {
  it("lists each link in at most one section", () => {
    const ids = sectionLinks.map((link) => link.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only contains links enabled in this environment", () => {
    expect(sectionLinks.every(isNavLinkEnabled)).toBe(true);
  });

  it("makes every breadcrumb page reachable from a section", () => {
    const sectionHrefs = new Set(sectionLinks.map((link) => link.href));
    for (const page of dashboardPages) {
      expect(sectionHrefs, page.id).toContain(page.href);
    }
  });
});

describe("enabledNavSections", () => {
  it("omits empty sections and keeps display order", () => {
    const expectedIds = allSections
      .filter((section) => section.links.length > 0)
      .map((section) => section.id);
    expect(enabledNavSections.map((section) => section.id)).toEqual(expectedIds);
  });
});

describe("toolLinks", () => {
  it("lists stable tools before beta tools", () => {
    expect(toolLinks).toEqual([...navSections.tools.links, ...navSections.betaTools.links]);
  });

  it("always includes the unflagged tools", () => {
    expect(toolLinks).toContain(navLinks.climateMetricsMap);
    expect(toolLinks).toContain(navLinks.dataDownload);
    expect(toolLinks).toContain(navLinks.renewablesVisualizer);
  });
});
