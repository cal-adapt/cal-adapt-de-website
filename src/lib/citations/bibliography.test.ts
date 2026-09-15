import { describe, expect, it } from "vitest";

import { formatBibliography, linkifyBibliographyUrls } from "./bibliography";

describe("formatBibliography", () => {
  it("formats selected keys with Nature CSL markup", async () => {
    const html = await formatBibliography(["heEffects2022"]);

    expect(html).toContain('id="refs"');
    expect(html).toContain('class="references csl-bib-body"');
    expect(html).toContain('id="bib-heeffects2022"');
    expect(html).toContain('class="csl-left-margin"');
    expect(html).toContain('class="csl-right-inline"');
    expect(html).toContain("He, C.");
    expect(html).toContain(
      '<a href="https://doi.org/10.1016/S2542-5196(22)00139-5">https://doi.org/10.1016/S2542-5196(22)00139-5</a>.'
    );
  });

  it("keeps requested key order", async () => {
    const html = await formatBibliography(["who-heat-health-2026", "heEffects2022"]);
    const whoIndex = html.indexOf("bib-who-heat-health-2026");
    const heIndex = html.indexOf("bib-heeffects2022");

    expect(whoIndex).toBeGreaterThan(-1);
    expect(heIndex).toBeGreaterThan(-1);
    expect(whoIndex).toBeLessThan(heIndex);
    expect(html).toContain("World Health Organization");
  });

  it("throws when a key is missing from references.bib", async () => {
    await expect(formatBibliography(["not-a-real-key"])).rejects.toThrow(
      "Unknown bibliography keys: not-a-real-key"
    );
  });
});

describe("linkifyBibliographyUrls", () => {
  it("wraps URLs and leaves a trailing period outside the href", () => {
    const html = linkifyBibliographyUrls(
      '<div class="csl-right-inline">See https://example.com/paper.</div>'
    );

    expect(html).toBe(
      '<div class="csl-right-inline">See <a href="https://example.com/paper">https://example.com/paper</a>.</div>'
    );
  });
});
