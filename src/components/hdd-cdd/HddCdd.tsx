"use client";

import { useCallback, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import BetaFeedbackAlert from "@/components/common/content/BetaFeedbackAlert";
import InterpretSection from "@/components/common/content/InterpretSection";
import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import PageLayout from "@/components/dashboard/PageLayout";
import { useHddCddSeries } from "@/hooks/use-hdd-cdd-series";
import { formatChartExportFilename, formatViewTitle } from "@/lib/hdd-cdd/format";
import { type HddCddSelections, regionLabelFor, SSP370 } from "@/lib/hdd-cdd/options";
import { selectionsFromSearchParams, selectionsToSearchParams } from "@/lib/hdd-cdd/search-params";
import { hasRenderableSeries } from "@/lib/hdd-cdd/series";
import { exportSvgAsPng } from "@/utils/export-chart";

import ChartView from "./ChartView";
import Controls from "./Controls";

import styles from "./HddCdd.module.scss";

const CHART_INFO = (
  <>
    <p>
      The line chart shows the annual total for the selected metric (HDD or CDD) at the selected
      location, from 1981 through 2099. The gray line and shaded band show the historical period
      through 2014; the colored line and band show the SSP3-7.0 projection from 2015 onward.
    </p>
    <p>
      The solid line is the mean across the 4 climate models used in this tool. The shaded band
      around it shows the full range between the lowest and highest model value for that year — a
      wider band means the models disagree more about that year&apos;s value. Use the legend below
      the chart to toggle the historical and projected series on and off.
    </p>
    <p>
      A rising CDD trend generally indicates growing cooling demand as the climate warms; a falling
      HDD trend generally indicates easing heating demand. The rate and timing of these trends vary
      by location.
    </p>
  </>
);

export default function HddCdd() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selections = useMemo(() => selectionsFromSearchParams(searchParams), [searchParams]);
  const viewTitle = formatViewTitle(selections);
  const locationLabel = regionLabelFor(selections);

  const handleSelectionsChange = useCallback(
    (next: HddCddSelections) => {
      const qs = selectionsToSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const seriesResult = useHddCddSeries(selections);
  const isLoading = seriesResult.status === "loading";

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const canExportChart = hasRenderableSeries(seriesResult.data, selections.metric);
  const handleExportChart = useCallback(() => {
    const svg = chartContainerRef.current?.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    exportSvgAsPng(svg, formatChartExportFilename(selections.metric, locationLabel)).catch(
      (error) => {
        console.error("[hdd-cdd] chart export failed:", error);
      }
    );
  }, [selections.metric, locationLabel]);

  return (
    <PageLayout title="Heating/Cooling Degree Days">
      <BetaFeedbackAlert />

      <div className={styles.intro}>
        <p className={styles.introCopy}>
          Heating degree days (HDD) and cooling degree days (CDD) measure how much outdoor
          temperature departs from a 65°F baseline, and are the standard way the energy sector
          estimates heating and cooling demand. The threshold is fixed at 65°F for this initial
          release.
        </p>
        <p className={styles.introCopy}>
          As California&apos;s climate changes, cooling demand is generally expected to rise and
          heating demand to ease, though the pace differs by location. Tracking these trends over
          time helps identify where electricity demand from heating and cooling is shifting fastest.
        </p>
      </div>

      <div className={styles.workspace}>
        <div className={styles.viewArea}>
          <div className={styles.chartActions}>
            <Button
              type="button"
              variant="secondary"
              size="small"
              prefix={<Icon variant="download" aria-hidden />}
              onClick={handleExportChart}
              disabled={!canExportChart}
              title={
                canExportChart
                  ? "Download chart as PNG"
                  : "Download is available once the chart data loads"
              }
            >
              Download
            </Button>
          </div>
          <ChartView
            title={viewTitle}
            series={seriesResult.data}
            status={seriesResult.status}
            errorMessage={seriesResult.errorMessage}
            onRetry={seriesResult.retry}
            metric={selections.metric}
            locationLabel={locationLabel}
            scenarioLabel={SSP370.label}
            scenarioColor={SSP370.color}
            chartContainerRef={chartContainerRef}
          />
        </div>
        <aside className={styles.controlsArea} aria-label="Chart controls">
          <Controls
            selections={selections}
            onChange={handleSelectionsChange}
            disabled={isLoading}
          />
        </aside>
      </div>

      <InterpretSection title="How to interpret this figure">{CHART_INFO}</InterpretSection>
    </PageLayout>
  );
}
