"use client";

import ChartView from "@/components/hdd-cdd/ChartView";
import { useStacSeries } from "@/hooks/use-stac-series";
import type { HddCddSelections } from "@/lib/hdd-cdd/options";
import { fetchHddCddSeries, searchFiltersKey } from "@/lib/hdd-cdd/series";

export default function HddCddChart({ selections }: { selections: HddCddSelections }) {
  const series = useStacSeries(searchFiltersKey(selections), (signal) =>
    fetchHddCddSeries(selections, { signal })
  );
  return <ChartView selections={selections} series={series} />;
}
