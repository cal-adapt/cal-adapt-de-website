import { describe, expect, it } from "vitest";

import type { PackageId } from "../types";

import { loca2CountyPackage } from "./loca2-county";
import { getPackageAdapter, PACKAGE_ADAPTERS } from "./registry";
import { standardYearPackage } from "./standard-year";
import { typicalMetYearPackage } from "./typical-met-year";
import { xmyPersistPackage } from "./xmy-persist";
import { xmyShockPackage } from "./xmy-shock";

describe("package registry", () => {
  it("registers every package adapter", () => {
    expect(new Set(PACKAGE_ADAPTERS)).toEqual(
      new Set([
        loca2CountyPackage,
        standardYearPackage,
        typicalMetYearPackage,
        xmyPersistPackage,
        xmyShockPackage,
      ])
    );
  });

  it("resolves adapters by id and throws on unknown ids", () => {
    for (const adapter of PACKAGE_ADAPTERS) {
      expect(getPackageAdapter(adapter.id)).toBe(adapter);
    }
    expect(() => getPackageAdapter("nope" as PackageId)).toThrow(/No package adapter/);
  });
});
