import { describe, expect, it } from "vitest";

import { DEFAULT_SELECTIONS, withEnsemble } from "./options";
import { csvUrl, parseBoundaryCsv, parseObservedCsv, PROTOTYPE_DATA_BASE } from "./series";

describe("csvUrl", () => {
  it("builds the boundary and observed file names", () => {
    expect(csvUrl(DEFAULT_SELECTIONS, "boundary")).toBe(
      `${PROTOTYPE_DATA_BASE}/wrf/Alameda_County_t2max_ssp370.csv`
    );
    expect(csvUrl(DEFAULT_SELECTIONS, "observed")).toBe(
      `${PROTOTYPE_DATA_BASE}/wrf/Alameda_County_t2max_era5.csv`
    );
  });

  it("uses the ensemble's own variable id", () => {
    const loca2 = { ...withEnsemble(DEFAULT_SELECTIONS, "loca2"), scenario: "ssp245" };
    expect(csvUrl(loca2, "boundary")).toBe(
      `${PROTOTYPE_DATA_BASE}/loca2/Alameda_County_tasmax_ssp245.csv`
    );
  });
});

describe("parseBoundaryCsv", () => {
  it("reads the summary columns and treats the rest as simulations", () => {
    const text = "year,mean,min,max,MIROC6,TaiESM1\n2000,60,59,61,59,61\n1999,58,57,59,57,";
    const { rows, simulationNames } = parseBoundaryCsv(text);
    expect(simulationNames).toEqual(["MIROC6", "TaiESM1"]);
    expect(rows.map((row) => row.year)).toEqual([1999, 2000]);
    expect(rows[1]).toEqual({
      year: 2000,
      mean: 60,
      min: 59,
      max: 61,
      simulations: { MIROC6: 59, TaiESM1: 61 },
    });
    expect(rows[0].simulations.TaiESM1).toBeNaN();
  });
});

describe("parseObservedCsv", () => {
  it("reads year and value", () => {
    expect(parseObservedCsv("year,value\n1981,59.03\n1982,56.39")).toEqual([
      { year: 1981, value: 59.03 },
      { year: 1982, value: 56.39 },
    ]);
  });
});
