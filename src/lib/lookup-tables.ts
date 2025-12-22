type LookupTable = {
  [key: string]: string;
};

interface FlagTable {
  value: string;
  flag: boolean;
}

export const variablesLookupTable: LookupTable = {
  pr: "Precipitation",
  rsds: "Surface downward solar shortwave radiation",
  tasmax: "Air temperature maximum",
  tasmin: "Air temperature minimum",
  uas: "10 m U component of wind speed",
  vas: "10 m V component of wind speed",
  wspeed: "10 m wind speed",
  hursmin: "Relative humidity minimum",
  hursmax: "Relative humidity maximum",
  huss: "Specific humidity",
};

export const scenariosLookupTable: LookupTable = {
  ssp585: "SSP5-8.5",
  ssp370: "SSP3-7.0",
  ssp245: "SSP2-4.5",
  historical: "Historical",
};

export const monthsLookupTable: LookupTable = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

export const modelsGenUseLookupTable: FlagTable[] = [
  { value: "ACCESS-CM2", flag: true },
  { value: "CESM2-LENS", flag: false },
  { value: "CNRM-ESM2-1", flag: true },
  { value: "EC-Earth3", flag: true },
  { value: "EC-Earth3-Veg", flag: false },
  { value: "FGOALS-g3", flag: true },
  { value: "GFDL-ESM4", flag: false },
  { value: "HadGEM3-GC31-LL", flag: false },
  { value: "INM-CM5-0", flag: false },
  { value: "IPSL-CM6A-LR", flag: false },
  { value: "KACE-1-0-G", flag: false },
  { value: "MIROC6", flag: false },
  { value: "MPI-ESM1-2-HR", flag: true },
  { value: "MRI-ESM2-0", flag: false },
  { value: "TaiESM1", flag: false },
];

/**
 * Filters a list of flags and returns a new list of values. This is a convenience function for use with filter ()
 *
 * @param list - The list to filter.
 * @param flagTable - The flag table to filter on. Must be an array of flags.
 *
 * @return { string [] } The filtered list of values. If there are no flags the array will be empty
 */
export function filterByFlag(list: FlagTable[]): string[] {
  return list.filter((item) => item.flag).map((item) => item.value);
}

// Create a lookup function that returns the value associated with a key in a lookup
export function lookupValue(key: string | number, table: LookupTable): string | undefined {
  return table[key];
}
