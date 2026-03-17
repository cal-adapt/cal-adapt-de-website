/** @type {import('orval').DefineConfig} */
module.exports = {
  stac: {
    input: {
      target: "https://stac.cal-adapt.org/openapi.json",
    },
    output: {
      workspace: "src/lib/cal-adapt-api/generated/stac",
      target: "./services",
      schemas: "./models",
      client: "fetch",
      baseUrl: "https://stac.cal-adapt.org",
      httpClient: "fetch",
      mock: { delay: 0 },
      mode: "split",
    },
  },
  map: {
    input: {
      target: "https://map.cal-adapt.org/openapi.json",
    },
    output: {
      workspace: "src/lib/cal-adapt-api/generated/map",
      target: "./services",
      schemas: "./models",
      client: "fetch",
      baseUrl: "https://map.cal-adapt.org",
      httpClient: "fetch",
      mock: { delay: 0 },
      mode: "split",
    },
  },
};
