"use client";

import type { ReactNode } from "react";

import Link from "@/components/common/ui/Link";

const dataFormat = (
  <>
    <Link href="https://www.unidata.ucar.edu/software/netcdf/">
      NetCDF (Network Common Data Form)
    </Link>{" "}
    is a machine-independent data array-oriented format for scientific data
  </>
);

const models = (
  <>
    Global Circulation Models (
    <Link href="https://www.ipcc-data.org/guidelines/pages/gcm_guide.html">GCMs</Link>) from the{" "}
    <Link href="https://esgf-node.llnl.gov/projects/cmip6/">
      Coupled Model Intercomparison Project, Phase 6
    </Link>{" "}
    represent physical processes in the atmosphere, ocean, cryosphere, and land surface. For
    guidance on how to select models, please refer to the{" "}
    <Link href="https://analytics.cal-adapt.org/guidance/using_in_decision_making/guidelines">
      the guidance page
    </Link>{" "}
    on the Analytics Engine website.
  </>
);

const scenarios = (
  <>
    Shared Socioeconomic Pathways (
    <Link href="https://www.carbonbrief.org/explainer-how-shared-socioeconomic-pathways-explore-future-climate-change/">
      SSPs
    </Link>
    ) describe potential pathways the world could take.
    <br />
    SSP2-4.5: a middle of the road global emissions scenario.
    <br />
    SSP3-7.0: high global emissions scenario.
    <br />
    SSP5-8.5: very high global emissions scenario.
  </>
);

export const tooltipByLabel: Partial<Record<string, ReactNode>> = {
  Dataset:
    "LOCA2 (Localized Constructed Analogs) hybrid-statistically downscaled CMIP6 climate projections",
  "Data format": dataFormat,
  "Boundary type":
    "Data is natively represented in 3km grids. Selecting a boundary layer (e.g., county), provides data for grid cells that are intersected by the boundary file.",
  Units: "Unit of measurement for dataset",
  "Time span": "Data is available over the time period 1950 - 2100",
  License: undefined,
  Variables:
    "A specific, quantifiable measure used to assess and understand different aspects of climate change",
  Models: models,
  Scenarios: scenarios,
  Counties: "California counties used as the spatial boundary for aggregating gridded data.",
  Frequency:
    "The timescale of the data. All LOCA2 data is downscaled at a native daily resolution. A pre-aggregated version at a monthly resolution is also available.",
  Aggregation:
    "Statistical method used to summarize grid-cell values within each county boundary (e.g. mean, min, max).",
};
