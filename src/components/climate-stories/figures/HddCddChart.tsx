"use client";

import { withStacSeries } from "@/components/common/charts/withStacSeries";
import ChartView from "@/components/hdd-cdd/ChartView";
import { fetchHddCddSeries, searchFiltersKey } from "@/lib/hdd-cdd/series";

export default withStacSeries(ChartView, fetchHddCddSeries, searchFiltersKey);
