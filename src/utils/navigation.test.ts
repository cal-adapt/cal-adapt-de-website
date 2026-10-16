import { describe, expect, it } from "vitest";

import type { NavLink } from "@/config/navigation";

import { findActiveChildLink, findActiveNavLink } from "./navigation";
import { isPathWithin } from "./url";

const stories: NavLink = {
  id: "stories",
  label: "Stories",
  href: "/dashboard/stories",
  children: [
    { id: "stories-index", label: "Stories", href: "/dashboard/stories" },
    { id: "heat", label: "Heat", href: "/dashboard/stories/heat" },
  ],
};
const heat: NavLink = { id: "heat", label: "Heat", href: "/dashboard/stories/heat" };
const map: NavLink = { id: "map", label: "Map", href: "/dashboard/map" };
const external: NavLink = {
  id: "docs",
  label: "Docs",
  href: "https://example.org/dashboard/map",
  external: true,
};

describe("isPathWithin", () => {
  it("matches the base path and paths nested under it", () => {
    expect(isPathWithin("/dashboard/map", "/dashboard/map")).toBe(true);
    expect(isPathWithin("/dashboard/map/", "/dashboard/map")).toBe(true);
    expect(isPathWithin("/dashboard/map/methods", "/dashboard/map")).toBe(true);
  });

  it("does not match sibling paths that share a prefix", () => {
    expect(isPathWithin("/dashboard/mapping", "/dashboard/map")).toBe(false);
  });

  it("treats the root as containing every path", () => {
    expect(isPathWithin("/dashboard", "/")).toBe(true);
  });
});

describe("findActiveNavLink", () => {
  it("prefers the most specific matching link", () => {
    expect(findActiveNavLink([stories, heat, map], "/dashboard/stories/heat")).toBe(heat);
    expect(findActiveNavLink([heat, stories, map], "/dashboard/stories/heat")).toBe(heat);
  });

  it("falls back to a parent link for nested routes without their own link", () => {
    expect(findActiveNavLink([stories, map], "/dashboard/map/methods")).toBe(map);
  });

  it("ignores external links", () => {
    expect(findActiveNavLink([external], "/dashboard/map")).toBeUndefined();
  });

  it("returns undefined when nothing matches", () => {
    expect(findActiveNavLink([stories, map], "/dashboard")).toBeUndefined();
  });
});

describe("findActiveChildLink", () => {
  it("returns the child at exactly the current path", () => {
    expect(findActiveChildLink(stories, "/dashboard/stories/heat")?.id).toBe("heat");
  });

  it("ignores a child that repeats the parent's href", () => {
    expect(findActiveChildLink(stories, "/dashboard/stories")).toBeUndefined();
  });

  it("returns undefined for links without children", () => {
    expect(findActiveChildLink(map, "/dashboard/map")).toBeUndefined();
  });
});
