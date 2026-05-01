import { describe, expect, it } from "vitest";

import type { PackageId } from "../types";

import { loca2CountyPackage } from "./loca2-county";
import { getPackageAdapter, PACKAGE_ADAPTERS, STAC_API_V2_HOST_COLLECTION_IDS } from "./registry";
import { standardYearPackage } from "./standard-year";
import { typicalMetYearPackage } from "./typical-met-year";

describe("package registry", () => {
  it("registers every package and keeps the v2 host set in sync with useStacV2", () => {
    expect(new Set(PACKAGE_ADAPTERS)).toEqual(
      new Set([loca2CountyPackage, standardYearPackage, typicalMetYearPackage])
    );
    for (const adapter of PACKAGE_ADAPTERS) {
      expect(STAC_API_V2_HOST_COLLECTION_IDS.has(adapter.stacCollectionId)).toBe(adapter.useStacV2);
    }
  });

  it("resolves adapters by id and throws on unknown ids", () => {
    for (const adapter of PACKAGE_ADAPTERS) {
      expect(getPackageAdapter(adapter.id)).toBe(adapter);
    }
    expect(() => getPackageAdapter("nope" as PackageId)).toThrow(/No package adapter/);
  });
});
