import { describe, expect, it } from "vitest";

import { navLinks, toolLinks } from "@/config/navigation";

import { isToolId } from "./ToolIcon";

describe("isToolId", () => {
  it("recognizes every enabled tool", () => {
    for (const link of toolLinks) {
      expect(isToolId(link.id), link.id).toBe(true);
    }
  });

  it("rejects links that are not tools", () => {
    expect(isToolId(navLinks.dataMethods.id)).toBe(false);
    expect(isToolId(navLinks.allClimateStories.id)).toBe(false);
  });
});
