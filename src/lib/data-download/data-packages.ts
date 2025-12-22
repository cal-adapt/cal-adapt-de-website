export const dataPackages = [
  {
    id: 0,
    name: "County Gridded Data",
    dataset: "LOCA2",
    scenarios: "historical, ssp370",
    models: "ACCESS-CM2, MPI-ESM1-2-HR, EC-Earth3, FGOALS-g3, CNRM-ESM2-1",
    vars: "tasmax, tasmin, pr",
    boundaryType: "County",
    frequency: "Monthly",
    dataFormat: "NetCDF",
    rangeStart: "1950",
    rangeEnd: "2100",
    units: "Source",
    disabled: false,
  },
];
