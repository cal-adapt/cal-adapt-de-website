import { describe, expect, it } from "vitest";

import { CUSTOM_COLORMAPS } from "@/components/climate-metrics-map/colormap";

import { metrics } from "./metrics";

describe("metrics", () => {
  // The tile server only knows its built-in colormap names, so a layer using a
  // custom colormap must be binned (its tiles are sent as intervals instead).
  it("bins every layer that uses a custom colormap", () => {
    const layers = metrics.flatMap((metric) => [metric.abs, ...(metric.del ? [metric.del] : [])]);
    for (const layer of layers) {
      if (layer.colormap in CUSTOM_COLORMAPS) {
        expect(layer.bins, `${layer.variable} uses ${layer.colormap}`).toBeGreaterThan(0);
      }
    }
  });
});
