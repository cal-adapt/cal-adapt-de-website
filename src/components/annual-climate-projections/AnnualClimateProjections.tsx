"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import BetaFeedbackAlert from "@/components/common/content/BetaFeedbackAlert";
import InterpretSection from "@/components/common/content/InterpretSection";
import Badge from "@/components/common/ui/Badge";
import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import PageLayout from "@/components/dashboard/PageLayout";
import { navLinks } from "@/config/navigation";
import { useStacSeries } from "@/hooks/use-stac-series";
import { formatChartExportFilename } from "@/lib/annual-climate-projections/format";
import {
  type AnnualClimateProjectionsSelections,
  DEFAULT_SELECTIONS,
  regionLabelFor,
  withEnsemble,
} from "@/lib/annual-climate-projections/options";
import {
  selectionsFromSearchParams,
  selectionsToSearchParams,
} from "@/lib/annual-climate-projections/search-params";
import {
  fetchAnnualSeries,
  hasRenderableSeries,
  searchFiltersKey,
} from "@/lib/annual-climate-projections/series";
import { exportSvgAsPng } from "@/utils/export-chart";

import ChartView from "./ChartView";
import Controls from "./Controls";

import styles from "./AnnualClimateProjections.module.scss";

export default function AnnualClimateProjections() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selections = useMemo(() => selectionsFromSearchParams(searchParams), [searchParams]);
  const locationLabel = regionLabelFor(selections);

  // Advanced view starts open when a shared link already uses an advanced selection.
  const [advanced, setAdvanced] = useState(
    selections.ensemble !== DEFAULT_SELECTIONS.ensemble ||
      selections.scenario !== DEFAULT_SELECTIONS.scenario
  );
  const [showSimulations, setShowSimulations] = useState(false);

  const handleSelectionsChange = useCallback(
    (next: AnnualClimateProjectionsSelections) => {
      const qs = selectionsToSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  // Turning advanced view off returns to the default ensemble and scenario.
  const handleAdvancedChange = useCallback(
    (on: boolean) => {
      setAdvanced(on);
      if (!on) {
        setShowSimulations(false);
        handleSelectionsChange(withEnsemble(selections, DEFAULT_SELECTIONS.ensemble));
      }
    },
    [handleSelectionsChange, selections]
  );

  const seriesResult = useStacSeries(searchFiltersKey(selections), (signal) =>
    fetchAnnualSeries(selections, { signal })
  );
  const isLoading = seriesResult.status === "loading";

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const canExportChart = hasRenderableSeries(seriesResult.data);
  const handleExportChart = useCallback(() => {
    const svg = chartContainerRef.current?.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    exportSvgAsPng(svg, formatChartExportFilename(selections.climateVariable, locationLabel)).catch(
      (error) => {
        console.error("[annual-climate-projections] chart export failed:", error);
      }
    );
  }, [selections.climateVariable, locationLabel]);

  return (
    <PageLayout
      title={
        <>
          {navLinks.annualClimateProjections.label}
          <Badge variant="blue" size="lg" className={styles.betaBadge}>
            Beta
          </Badge>
        </>
      }
      citationTitle={navLinks.annualClimateProjections.label}
    >
      <BetaFeedbackAlert />

      <div className={styles.intro}>{/* TODO: intro copy */}</div>

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
            selections={selections}
            series={seriesResult}
            chartContainerRef={chartContainerRef}
            showSimulations={showSimulations}
          />
        </div>
        <aside className={styles.controlsArea} aria-label="Chart controls">
          <Controls
            selections={selections}
            onChange={handleSelectionsChange}
            advanced={advanced}
            onAdvancedChange={handleAdvancedChange}
            showSimulations={showSimulations}
            onShowSimulationsChange={setShowSimulations}
            disabled={isLoading}
          />
        </aside>
      </div>

      <InterpretSection title="How to interpret this figure">
        {/* TODO: interpretation copy */}
        {null}
      </InterpretSection>
    </PageLayout>
  );
}
