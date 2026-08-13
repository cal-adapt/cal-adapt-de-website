"use client";

import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Alert from "@/components/common/ui/Alert";
import Badge from "@/components/common/ui/Badge";
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
import { formatIsoDateLong } from "@/utils/date";

import ChartView from "./ChartView";
import Controls from "./Controls";

import styles from "./ExtremeHeatDays.module.scss";

type ViewMode = "chart" | "table";

const CHART_VIEW_TABS: readonly TabItem<ViewMode>[] = [
  { value: "chart", label: "Chart", tabId: "ehd-tab-chart", panelId: "ehd-panel-chart" },
  {
    value: "table",
    label: "Table",
    tabId: "ehd-tab-table",
    panelId: "ehd-panel-table",
    disabled: true,
    hint: "Coming soon",
  },
];

const CHART_TAB = CHART_VIEW_TABS[0];

const WHO_HEAT_HEALTH_URL =
  "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health";
const WHO_CITATION_LABEL = "Source: World Health Organization — Climate change, heat and health";

// Manually bump date when the tool is meaningfully updated
const LAST_UPDATED_ISO = "2026-08-13";

const INTRO_COPY_BY_VARIABLE: Record<string, ReactNode> = {
  "extreme-heat-days": (
    <>
      <p className={styles.introCopy}>
        A day in which the maximum temperature exceeds a defined threshold that poses a significant
        risk to human health, ecosystems, and infrastructure.
      </p>
      <p className={styles.introCopy}>
        Extreme heat is the deadliest weather-related hazard in many parts of the world
        <sup className={styles.footnoteRef}>
          <Link href={WHO_HEAT_HEALTH_URL} aria-label={WHO_CITATION_LABEL}>
            [1]
          </Link>
        </sup>
        . Tracking extreme heat days helps identify populations at risk, inform public health
        responses, and monitor how heat hazards are shifting under climate change in both intensity
        and frequency.
      </p>
    </>
  ),
  // TODO: Placeholder copy
  "warm-nights": (
    <>
      <p className={styles.introCopy}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </p>
      <p className={styles.introCopy}>
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur.
      </p>
    </>
  ),
};

export default function ExtremeHeatDays() {
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

  const seriesResult = useExtremeHeatSeries(selections);
  const isLoading = seriesResult.status === "loading";

  // Chart export plumbing; the button lives in the tabs row here but the
  // SVG it exports is rendered by `ChartView`.
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const canExportChart = hasRenderableSeries(seriesResult.data);
  const exportCountyLabel = seriesResult.data?.county || selections.county;
  const handleExportChart = useCallback(() => {
    const svg = chartContainerRef.current?.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    exportSvgAsPng(
      svg,
      formatChartExportFilename(selections.climateVariable, exportCountyLabel)
    ).catch((error) => {
      console.error("[extreme-heat-days] chart export failed:", error);
    });
  }, [selections.climateVariable, exportCountyLabel]);

  return (
    <PageLayout
      title={
        <>
          {navLinks.extremeHeatDays.label}
          <Badge variant="blue" size="lg" className={styles.betaBadge}>
            Beta
          </Badge>
        </>
      }
    >
      <Alert severity="info" className={styles.betaAlert} ariaLabel="Beta notice">
        <strong>This tool is in active development.</strong> This beta release supports Extreme Heat
        Days and Warm Nights at the county level. Upcoming updates will add more spatial
        aggregations (utilities, forecast zones, and electric balancing areas), custom temperature
        thresholds, and additional metrics. Suggestions, questions, and comments are welcome.
      </Alert>

      <div className={styles.intro}>{INTRO_COPY_BY_VARIABLE[selections.climateVariable]}</div>

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
            climateVariable={selections.climateVariable}
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

      <footer className={styles.pageFooter}>
        <p className={styles.lastUpdated}>
          Last updated:{" "}
          <time dateTime={LAST_UPDATED_ISO}>{formatIsoDateLong(LAST_UPDATED_ISO)}</time>
        </p>
      </footer>
    </PageLayout>
  );
}
