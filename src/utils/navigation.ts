import type { NavLink } from "@/config/navigation";
import { isPathWithin, normalizePath } from "@/utils/url";

/**
 * The internal link that best matches `pathname`: the one whose href is the
 * longest path prefix of it, so `/a/b` beats `/a`. External links never match.
 */
export function findActiveNavLink<T extends NavLink>(
  links: readonly T[],
  pathname: string
): T | undefined {
  let best: T | undefined;
  for (const link of links) {
    if (link.external || !isPathWithin(pathname, link.href)) continue;
    if (!best || normalizePath(link.href).length > normalizePath(best.href).length) best = link;
  }
  return best;
}

/** The child page of `link` at exactly `pathname`, ignoring a child that repeats the parent's href. */
export function findActiveChildLink(link: NavLink, pathname: string): NavLink | undefined {
  const current = normalizePath(pathname);
  const parent = normalizePath(link.href);
  return link.children?.find((child) => {
    const childPath = normalizePath(child.href);
    return childPath === current && childPath !== parent;
  });
}
