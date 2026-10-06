"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { MDXComponents, MDXContent } from "mdx/types";

import BetaFeedbackAlert from "@/components/common/content/BetaFeedbackAlert";
import CitationLinks from "@/components/common/content/CitationLinks";
import InterpretSection from "@/components/common/content/InterpretSection";
import Badge from "@/components/common/ui/Badge";
import Button from "@/components/common/ui/Button";
import CitationBox from "@/components/common/ui/CitationBox";
import Icon from "@/components/common/ui/Icon";
import Tabs, { type TabItem } from "@/components/common/ui/Tabs";
import PageLayout from "@/components/dashboard/PageLayout";
import { navLinks } from "@/config/navigation";
import { useExtremeHeatSeries } from "@/hooks/use-extreme-heat-series";
import {
  formatChartExportFilename,
  formatViewSubtitle,
  formatViewTitle,
} from "@/lib/extreme-heat-days/format";
import { type ExtremeHeatDaysSelections, regionLabelFor } from "@/lib/extreme-heat-days/options";
import {
  selectionsFromSearchParams,
  selectionsToSearchParams,
} from "@/lib/extreme-heat-days/search-params";
import { hasRenderableSeries } from "@/lib/extreme-heat-days/series";
import { formatIsoDateLong } from "@/utils/date";
import { exportSvgAsPng } from "@/utils/export-chart";

import ExtremeHeatDaysCopy from "./copy/extreme-heat-days.mdx";
import HeatWaveFrequencyCopy from "./copy/heat-wave-frequency.mdx";
import HeatWaveLengthCopy from "./copy/heat-wave-length.mdx";
import WarmNightsCopy from "./copy/warm-nights.mdx";
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

/** Per-variable "About" and "How to interpret" copy, authored in MDX so
 *  `[@key]` citations resolve against `public/references.bib` at build time. */
const COPY_BY_VARIABLE: Record<string, MDXContent> = {
  "extreme-heat-days": ExtremeHeatDaysCopy,
  "warm-nights": WarmNightsCopy,
  "heat-wave-frequency": HeatWaveFrequencyCopy,
  "heat-wave-length": HeatWaveLengthCopy,
};

// Render the copy inline: skip the site-wide MDX wrapper (page container + article).
const COPY_MDX_COMPONENTS: MDXComponents = {
  wrapper: ({ children }) => <>{children}</>,
  InterpretSection,
};

const COPY_ID = "ehd-variable-copy";

// Manually bump date when the tool is meaningfully updated
const LAST_UPDATED_ISO = "2026-09-01";

export default function ExtremeHeatDays() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selections = useMemo(() => selectionsFromSearchParams(searchParams), [searchParams]);
  const viewTitle = formatViewTitle(selections);
  const viewSubtitle = formatViewSubtitle(selections);
  const locationLabel = regionLabelFor(selections);
  const VariableCopy =
    COPY_BY_VARIABLE[selections.climateVariable] ?? COPY_BY_VARIABLE["extreme-heat-days"];

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
  const handleExportChart = useCallback(() => {
    const svg = chartContainerRef.current?.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    exportSvgAsPng(svg, formatChartExportFilename(selections)).catch((error) => {
      console.error("[extreme-heat-days] chart export failed:", error);
    });
  }, [selections]);

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
      <BetaFeedbackAlert />

      <div className={styles.intro}>
        <p className={styles.introCopy}>
          Explore how extreme heat in California is projected to change as the climate warms. Choose
          a heat metric, a temperature threshold, and a location to see how often that heat is
          projected to occur each year at different levels of global warming.
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
            subtitle={viewSubtitle}
            series={seriesResult.data}
            status={seriesResult.status}
            errorMessage={seriesResult.errorMessage}
            timedOut={seriesResult.timedOut}
            onRetry={seriesResult.retry}
            climateVariable={selections.climateVariable}
            threshold={selections.threshold}
            locationLabel={locationLabel}
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

      <div id={COPY_ID} className={styles.variableCopy}>
        <VariableCopy components={COPY_MDX_COMPONENTS} />
      </div>
      {/* Keyed so it re-linkifies bibliography URLs after each variable switch. */}
      <CitationLinks key={selections.climateVariable} articleId={COPY_ID} />

      <footer className={styles.pageFooter}>
        <CitationBox title={navLinks.extremeHeatDays.label} bordered={false} />
        <p className={styles.lastUpdated}>
          Last updated:{" "}
          <time dateTime={LAST_UPDATED_ISO}>{formatIsoDateLong(LAST_UPDATED_ISO)}</time>
        </p>
      </footer>
    </PageLayout>
  );
}
