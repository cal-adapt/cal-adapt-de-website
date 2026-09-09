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

// TODO: copy pending -- placeholder left intentionally blank
const CHART_INFO = (
  <>
    <p>TEXT HERE</p>
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

      {/* TODO: copy pending -- placeholder left intentionally blank */}

      <div className={styles.workspace}>
        <div className={styles.viewArea}>
          <p className={styles.introCopy}>TEXT HERE</p>
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
