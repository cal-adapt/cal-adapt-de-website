import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

import StoryCitation, { type StoryCitationProps } from "./StoryCitation";

function isStoryCitationElement(child: ReactElement): child is ReactElement<StoryCitationProps> {
  return child.type === StoryCitation;
}

function elementChildren(child: ReactElement): ReactNode | undefined {
  if (typeof child.props !== "object" || child.props == null || !("children" in child.props)) {
    return undefined;
  }
  return child.props.children as ReactNode;
}

export function collectCitationKeys(node: ReactNode): string[] {
  const keys: string[] = [];

  function walk(current: ReactNode) {
    Children.forEach(current, (child) => {
      if (!isValidElement(child)) {
        return;
      }
      if (isStoryCitationElement(child)) {
        const key = child.props.citationKey;
        if (!keys.includes(key)) {
          keys.push(key);
        }
        return;
      }
      walk(elementChildren(child));
    });
  }

  walk(node);
  return keys;
}

export function injectCitationNumbers(node: ReactNode, citationKeys: readonly string[]): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) {
      return child;
    }
    if (isStoryCitationElement(child)) {
      return cloneElement(child, { n: citationKeys.indexOf(child.props.citationKey) + 1 });
    }
    const nested = elementChildren(child);
    if (nested == null) {
      return child;
    }
    return cloneElement(child, undefined, injectCitationNumbers(nested, citationKeys));
  });
}
