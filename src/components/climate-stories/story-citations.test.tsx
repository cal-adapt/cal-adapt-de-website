import { createElement } from "react";

import { describe, expect, it } from "vitest";

import { collectCitationKeys, injectCitationNumbers } from "./story-citations";
import StoryCitation from "./StoryCitation";

describe("collectCitationKeys", () => {
  it("returns unique keys in first-appearance order", () => {
    const tree = createElement(
      "p",
      null,
      createElement(StoryCitation, { citationKey: "khatanaAssociation2022" }),
      createElement(StoryCitation, { citationKey: "heEffects2022" }),
      createElement(StoryCitation, { citationKey: "khatanaAssociation2022" })
    );

    expect(collectCitationKeys(tree)).toEqual(["khatanaAssociation2022", "heEffects2022"]);
  });

  it("walks through nested elements", () => {
    const tree = createElement(
      "section",
      null,
      createElement(
        "p",
        null,
        createElement(StoryCitation, { citationKey: "who-heat-health-2026" })
      )
    );

    expect(collectCitationKeys(tree)).toEqual(["who-heat-health-2026"]);
  });
});

describe("injectCitationNumbers", () => {
  it("stamps first-appearance numbers onto StoryCitation nodes", () => {
    const tree = createElement(
      "p",
      null,
      createElement(StoryCitation, { citationKey: "heEffects2022" })
    );
    const keys = collectCitationKeys(tree);
    const injected = injectCitationNumbers(tree, keys);
    const paragraph = Array.isArray(injected) ? injected[0] : injected;

    expect(paragraph).toMatchObject({
      props: {
        children: [
          expect.objectContaining({
            props: { citationKey: "heEffects2022", n: 1 },
          }),
        ],
      },
    });
  });
});
