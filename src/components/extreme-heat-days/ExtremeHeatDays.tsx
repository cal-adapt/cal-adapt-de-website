"use client";

import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import InterpretSection from "@/components/common/content/InterpretSection";
import Alert from "@/components/common/ui/Alert";
import Badge from "@/components/common/ui/Badge";
import Button from "@/components/common/ui/Button";
import Citation from "@/components/common/ui/Citation";
import Icon from "@/components/common/ui/Icon";
import Tabs, { type TabItem } from "@/components/common/ui/Tabs";
import PageLayout from "@/components/dashboard/PageLayout";
import { navLinks } from "@/config/navigation";
import { useExtremeHeatSeries } from "@/hooks/use-extreme-heat-series";
import { exportSvgAsPng } from "@/lib/extreme-heat-days/export-chart";
import { formatChartExportFilename, formatViewTitle } from "@/lib/extreme-heat-days/format";
import { type ExtremeHeatDaysSelections, regionLabelFor } from "@/lib/extreme-heat-days/options";
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

const CHART_INFO = (
  <>
    <p>
      The bar chart shows how the number of extreme heat days per year is projected to change as
      global warming increases, based on the location and threshold selected. Each bar represents a
      different global warming level (GWL).
    </p>
    <p>
      Looking from left to right, the axis shows an increasing amount of global warming. The
      specific year that a given GWL will be reached depends on future emissions and societal
      decisions.
    </p>
  </>
);

const WHO_HEAT_HEALTH_URL =
  "https://www.who.int/news-room/fact-sheets/detail/climate-change-heat-and-health";
const HE_EFFECTS_URL = "https://linkinghub.elsevier.com/retrieve/pii/S2542519622001395";

// Populate as more citations are added; the References section only renders
// when this is non-empty. `n` must match the corresponding `Citation`'s `n`
// prop where it's cited in the page.
const CHART_REFERENCES = [
  {
    n: 1,
    href: WHO_HEAT_HEALTH_URL,
    text: "World Health Organization. (2026). Heat and health. World Health Organization.",
  },
  {
    n: 2,
    href: HE_EFFECTS_URL,
    text: "He, C., Kim, H., Hashizume, M., et al. (2022). The effects of night-time warming on mortality burden under future climate change scenarios: A modelling study. The Lancet Planetary Health, 6(8), e648–e657.",
  },
];

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
        <Citation
          n={1}
          href={WHO_HEAT_HEALTH_URL}
          label="Source: World Health Organization — Climate change, heat and health"
        />
        . Tracking extreme heat days helps identify populations at risk, inform public health
        responses, and monitor how heat hazards are shifting under climate change in both intensity
        and frequency.
      </p>
    </>
  ),
  "warm-nights": (
    <>
      <p className={styles.introCopy}>
        A night in which the minimum temperature exceeds a defined threshold. Extreme heat days
        accompanied by warm nights have been shown to increase risk of heat-related mortality, yield
        reduction in common crops, and strain the electrical grid
        <Citation
          n={2}
          href={HE_EFFECTS_URL}
          label="Source: He et al. — The effects of night-time warming on mortality burden under future climate change scenarios"
        />
        .
      </p>
      <p className={styles.introCopy}>
        Tracking warm nights can inform how communities implement public safety announcements,
        emergency personnel, and manage their crops and electrical assets.
      </p>
    </>
  ),
};

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
  const locationLabel = regionLabelFor(selections);

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
  const exportLocationLabel = seriesResult.data?.location || selections.location;
  const handleExportChart = useCallback(() => {
    const svg = chartContainerRef.current?.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    exportSvgAsPng(
      svg,
      formatChartExportFilename(selections.climateVariable, exportLocationLabel)
    ).catch((error) => {
      console.error("[extreme-heat-days] chart export failed:", error);
    });
  }, [selections.climateVariable, exportLocationLabel]);

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
        <strong>This tool is in beta.</strong> Suggestions for improvements, questions, and general
        comments are all welcome.
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

      {view === "chart" && (
        <InterpretSection title="How to interpret this figure">
          {CHART_INFO}

          {CHART_REFERENCES.length > 0 && (
            <>
              <h3 className={styles.referencesTitle}>References</h3>
              <ol className={styles.references}>
                {CHART_REFERENCES.map((reference) => (
                  <li key={reference.href} className={styles.referenceEntry}>
                    <span className={styles.referenceNumber} aria-hidden="true">
                      {reference.n}.
                    </span>
                    <span className={styles.referenceText}>
                      {reference.text}{" "}
                      <a href={reference.href} target="_blank" rel="noopener noreferrer">
                        {reference.href}
                      </a>
                      .
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </InterpretSection>
      )}

      <footer className={styles.pageFooter}>
        <p className={styles.lastUpdated}>
          Last updated:{" "}
          <time dateTime={LAST_UPDATED_ISO}>{formatIsoDateLong(LAST_UPDATED_ISO)}</time>
        </p>
      </footer>
    </PageLayout>
  );
}
