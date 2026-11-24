import { describe, expect, it } from "vitest";

import {
  dashboardPages,
  enabledNavSections,
  isNavLinkEnabled,
  navLinks,
  navMenus,
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

  it("marks only the beta tools section as beta", () => {
    const betaIds = allSections.filter((section) => section.beta).map((section) => section.id);
    expect(betaIds).toEqual([navSections.betaTools.id]);
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

describe("navMenus", () => {
  const menuSections = navMenus.flatMap((menu) => [menu, ...menu.subsections]);

  it("places every enabled section in exactly one menu, in sidebar order", () => {
    const sectionIds = menuSections
      .filter((section) => section.links.length > 0)
      .map((section) => section.id);
    expect(sectionIds).toEqual(enabledNavSections.map((section) => section.id));
  });

  it("nests beta tools under the Tools menu", () => {
    const tools = navMenus.find((menu) => menu.id === navSections.tools.id);
    expect(tools?.subsections.map((section) => section.id)).toEqual([navSections.betaTools.id]);
  });

  it("omits empty subsections", () => {
    for (const menu of navMenus) {
      expect(
        menu.subsections.every((section) => section.links.length > 0),
        menu.id
      ).toBe(true);
    }
  });

  it("only gives Climate Stories a landing page, which is one of its own links", () => {
    for (const menu of navMenus) {
      if (menu.id === navSections.climateStories.id) {
        expect(menu.links).toContain(menu.landing);
      } else {
        expect(menu.landing, menu.id).toBeUndefined();
      }
    }
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
