import { describe, expect, it } from "vitest";

import { DEFAULT_SELECTIONS as HDD_CDD_DEFAULTS } from "@/lib/hdd-cdd/options";

import { resolveStoryToolSelections, storyToolCharts, storyToolHref } from "./tool-charts";

describe("storyToolCharts", () => {
  it("registers a chart component for every tool", () => {
    for (const entry of Object.values(storyToolCharts)) {
      expect(entry.Chart).toBeTypeOf("function");
      expect(entry.navLink.href).toMatch(/^\/dashboard\//);
    }
  });
});

describe("resolveStoryToolSelections", () => {
  it("delegates to the tool's resolver", () => {
    const selections = resolveStoryToolSelections("extreme-heat-days", {
      location: "Imperial",
      threshold: "100F",
    });
    expect(selections.location).toBe("Imperial");
    expect(selections.threshold).toBe("100F");
    expect(resolveStoryToolSelections("hdd-cdd")).toEqual(HDD_CDD_DEFAULTS);
  });

  it("throws for values the tool does not offer", () => {
    expect(() => resolveStoryToolSelections("extreme-heat-days", { location: "Imperal" })).toThrow(
      /Imperal/
    );
  });
});

describe("storyToolHref", () => {
  it("adds only non-default selections to the tool href", () => {
    const selections = resolveStoryToolSelections("extreme-heat-days", {
      location: "Imperial",
      threshold: "100F",
    });
    expect(storyToolHref("extreme-heat-days", selections)).toBe(
      "/dashboard/extreme-heat-days?location=Imperial"
    );
  });

  it("returns the bare href for default selections", () => {
    expect(storyToolHref("hdd-cdd", resolveStoryToolSelections("hdd-cdd"))).toBe(
      "/dashboard/hdd-cdd"
    );
  });
});
