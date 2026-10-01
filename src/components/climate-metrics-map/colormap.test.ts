import * as d3 from "d3";
import { describe, expect, it } from "vitest";

import {
  binColors,
  binEdges,
  buildColorScale,
  buildIntervalColormap,
  CUSTOM_COLORMAPS,
} from "./colormap";

describe("binEdges", () => {
  it("splits the range into equal-width bins", () => {
    expect(binEdges(0, 30, 6)).toEqual([0, 5, 10, 15, 20, 25, 30]);
  });
});

describe("buildIntervalColormap", () => {
  const intervals = JSON.parse(buildIntervalColormap("gist_heat_r", 0, 30, 6)) as [
    [number, number],
    [number, number, number, number],
  ][];

  it("has one interval per bin, open at both ends", () => {
    expect(intervals).toHaveLength(6);
    expect(intervals[0][0][0]).toBeLessThan(-1e9);
    expect(intervals[0][0][1]).toBe(5);
    expect(intervals[2][0]).toEqual([10, 15]);
    expect(intervals[5][0][1]).toBeGreaterThan(1e9);
  });

  it("uses the same colors as the legend (bin midpoints)", () => {
    const colors = binColors("gist_heat_r", 6);
    intervals.forEach(([, [r, g, b, a]], i) => {
      expect(colors[i]).toBe(buildColorScale("gist_heat_r")((i + 0.5) / 6));
      expect(`rgb(${r}, ${g}, ${b})`).toBe(colors[i]);
      expect(a).toBe(255);
    });
  });
});

describe("custom colormaps", () => {
  it("runs from the first anchor to the last", () => {
    for (const [name, anchors] of Object.entries(CUSTOM_COLORMAPS)) {
      const scale = buildColorScale(name);
      expect(scale(0)).toBe(d3.rgb(anchors[0]).toString());
      expect(scale(1)).toBe(d3.rgb(anchors[anchors.length - 1]).toString());
    }
  });
});
