"use client";

import { withStacSeries } from "@/components/common/charts/withStacSeries";
import ChartView from "@/components/extreme-heat-days/ChartView";
import { fetchExtremeHeatSeries, searchFiltersKey } from "@/lib/extreme-heat-days/series";

export default withStacSeries(ChartView, fetchExtremeHeatSeries, searchFiltersKey);
