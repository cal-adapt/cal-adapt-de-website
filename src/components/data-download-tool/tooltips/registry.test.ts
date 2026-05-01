import { describe, expect, it } from "vitest";

import { PACKAGE_ADAPTERS } from "@/lib/data-download-tool";

import { getTooltipsForKind } from "./registry";

describe("tooltip registry", () => {
  it("every adapter field label has a matching tooltip entry", () => {
    for (const adapter of PACKAGE_ADAPTERS) {
      const tooltipByLabel = getTooltipsForKind(adapter.kind);
      for (const field of adapter.fields) {
        expect(
          tooltipByLabel,
          `${adapter.kind}: missing tooltip for field "${field.label}"`
        ).toHaveProperty(field.label);
      }
    }
  });
});
