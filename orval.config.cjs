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
      client: "react-query",
      baseUrl: "https://stac.cal-adapt.org",
      httpClient: "fetch",
      mock: true,
      mode: "split",
      override: {
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
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
      client: "react-query",
      baseUrl: "https://map.cal-adapt.org",
      httpClient: "fetch",
      mock: true,
      mode: "split",
      override: {
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
};
