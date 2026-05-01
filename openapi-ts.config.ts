import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig([
  {
    input: "https://map.cal-adapt.org/openapi.json",
    output: "src/lib/cal-adapt-api/generated/map",
    plugins: ["@hey-api/typescript", "@hey-api/sdk", "@hey-api/client-fetch"],
  },
  {
    input: "https://stac.cal-adapt.org/openapi.json",
    output: "src/lib/cal-adapt-api/generated/stac",
    plugins: ["@hey-api/typescript", "@hey-api/sdk", "@hey-api/client-fetch"],
  },
  {
    input: "https://8dawjspn5g.execute-api.us-west-2.amazonaws.com/openapi.json",
    output: "src/lib/cal-adapt-api/generated/stacV2",
    plugins: ["@hey-api/typescript", "@hey-api/sdk", "@hey-api/client-fetch"],
  },
]);
