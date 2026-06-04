"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import Tabs, { type TabItem } from "@/components/common/ui/Tabs";
import PageLayout from "@/components/dashboard/PageLayout";
import { navLinks } from "@/config/navigation";
import { useExtremeHeatSeries } from "@/hooks/use-extreme-heat-series";
import { exportSvgAsPng } from "@/lib/extreme-heat-days/export-chart";
import { formatChartExportFilename, formatViewTitle } from "@/lib/extreme-heat-days/format";
import type { ExtremeHeatDaysSelections } from "@/lib/extreme-heat-days/options";
import {
  selectionsFromSearchParams,
  selectionsToSearchParams,
} from "@/lib/extreme-heat-days/search-params";
import { hasRenderableSeries } from "@/lib/extreme-heat-days/series";

import ChartView from "./ChartView";
import Controls from "./Controls";

import styles from "./ExtremeHeatDays.module.scss";

type ViewMode = "chart";

const CHART_VIEW_TABS: readonly TabItem<ViewMode>[] = [
  { value: "chart", label: "Chart", tabId: "ehd-tab-chart", panelId: "ehd-panel-chart" },
];

const CHART_TAB = CHART_VIEW_TABS[0];

const WHO_HEAT_HEALTH_URL =
  "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health";
const WHO_CITATION_LABEL = "Source: World Health Organization — Climate change, heat and health";

export default function ExtremeHeatDays() {
  // Selections live in the URL so deep links and back/forward "just work".
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selections = useMemo(() => selectionsFromSearchParams(searchParams), [searchParams]);
  const viewTitle = formatViewTitle(selections);

  const handleSelectionsChange = useCallback(
    (next: ExtremeHeatDaysSelections) => {
      const qs = selectionsToSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const [view, setView] = useState<ViewMode>("chart");

  // Re-runs only when a selection that affects the API call changes (currently: county)
  const seriesResult = useExtremeHeatSeries(selections);
  const isLoading = seriesResult.status === "loading";

  // Chart export plumbing; the button lives in the tabs row here but the
  // SVG it exports is rendered by `ChartView`.
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const canExportChart = hasRenderableSeries(seriesResult.data, selections.threshold);
  const exportCountyLabel = seriesResult.data?.county || selections.county;
  const handleExportChart = useCallback(() => {
    const svg = chartContainerRef.current?.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    exportSvgAsPng(svg, formatChartExportFilename(exportCountyLabel)).catch((error) => {
      console.error("[extreme-heat-days] chart export failed:", error);
    });
  }, [exportCountyLabel]);

  return (
    <PageLayout title={navLinks.extremeHeatDays.label}>
      <div className={styles.intro}>
        <p className={styles.introCopy}>
          A day in which the maximum temperature exceeds a defined threshold that poses a
          significant risk to human health, ecosystems, and infrastructure.
        </p>
        <p className={styles.introCopy}>
          Extreme heat is the deadliest weather-related hazard in many parts of the world
          <sup className={styles.footnoteRef}>
            <Link href={WHO_HEAT_HEALTH_URL} aria-label={WHO_CITATION_LABEL}>
              [1]
            </Link>
          </sup>
          . Tracking extreme heat days helps identify populations at risk, inform public health
          responses, and monitor how heat hazards are shifting under climate change in both
          intensity and frequency.
        </p>
      </div>

      <div className={styles.workspace}>
        <div className={styles.viewArea}>
          <div className={styles.tabsRow}>
            <Tabs value={view} onChange={setView} tabs={CHART_VIEW_TABS} label="Chart view" />
            {view === "chart" && (
              <div className={styles.tabsRowActions}>
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
            )}
          </div>
          <ChartView
            id={CHART_TAB.panelId}
            labelledBy={CHART_TAB.tabId}
            title={viewTitle}
            series={seriesResult.data}
            status={seriesResult.status}
            errorMessage={seriesResult.errorMessage}
            onRetry={seriesResult.retry}
            threshold={selections.threshold}
            county={selections.county}
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
    </PageLayout>
  );
}
