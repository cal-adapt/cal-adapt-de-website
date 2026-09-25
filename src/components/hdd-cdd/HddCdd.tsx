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
import { getMetric, type HddCddSelections, regionLabelFor, SSP370 } from "@/lib/hdd-cdd/options";
import { selectionsFromSearchParams, selectionsToSearchParams } from "@/lib/hdd-cdd/search-params";
import { hasRenderableSeries } from "@/lib/hdd-cdd/series";
import { exportSvgAsPng } from "@/utils/export-chart";

import ChartView from "./ChartView";
import Controls from "./Controls";

import styles from "./HddCdd.module.scss";

const CHART_INFO = (
  <>
    <p>
      This time series chart shows how annual cooling degree days (CDD) or heating degree days
      (HDD), calculated from climate model simulations, are projected to change through the
      twenty-first century, based on the location selected.
    </p>
    <p>
      Looking from left to right, the axis shows time increasing from 1980 to 2100. The shaded area
      shows the range in values modeled for each year to visualize the uncertainty in these HDD/CDD
      estimates.
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
  const canExportChart = hasRenderableSeries(seriesResult.data, selections.climateVariable);
  const handleExportChart = useCallback(() => {
    const svg = chartContainerRef.current?.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    exportSvgAsPng(svg, formatChartExportFilename(selections.climateVariable, locationLabel)).catch(
      (error) => {
        console.error("[hdd-cdd] chart export failed:", error);
      }
    );
  }, [selections.climateVariable, locationLabel]);

  return (
    <PageLayout title="Heating/Cooling Degree Days">
      <BetaFeedbackAlert />

      <div className={styles.intro}>
        <p className={styles.introCopy}>
          Heating Degree Days (HDDs) and Cooling Degree Days (CDDs) are measures of the average
          daily temperature departure from a 65°F threshold. These metrics are used to translate
          outdoor temperatures into estimated energy demand. HDDs quantify how much and how long
          outdoor temperatures fall below 65°F, reflecting demand for indoor heating. CDDs quantify
          how much and how long outdoor temperatures exceed 65°F, reflecting demand for indoor
          cooling.
        </p>
        <p className={styles.introCopy}>
          Cooling is a major driver of peak electricity demand in California, so looking at
          projected HDD and CDD values can help energy utilities understand how peak demand will
          change in the future.
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
            climateVariable={selections.climateVariable}
            locationLabel={locationLabel}
            scenarioLabel={SSP370.label}
            scenarioColor={getMetric(selections.climateVariable).color}
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
