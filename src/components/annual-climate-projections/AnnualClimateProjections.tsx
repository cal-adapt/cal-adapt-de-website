"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import BetaFeedbackAlert from "@/components/common/content/BetaFeedbackAlert";
import Callout from "@/components/common/content/Callout";
import InterpretSection from "@/components/common/content/InterpretSection";
import Badge from "@/components/common/ui/Badge";
import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import PageLayout from "@/components/dashboard/PageLayout";
import GlossaryTerm from "@/components/glossary/GlossaryTerm";
import { navLinks } from "@/config/navigation";
import { useStacSeries } from "@/hooks/use-stac-series";
import { formatChartExportFilename } from "@/lib/annual-climate-projections/format";
import {
  type AnnualClimateProjectionsSelections,
  DEFAULT_SELECTIONS,
  ENSEMBLES,
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
    exportSvgAsPng(svg, formatChartExportFilename(selections.climateVariable, locationLabel), {
      footnote: ENSEMBLES[selections.ensemble].chartSource,
    }).catch((error) => {
      console.error("[annual-climate-projections] chart export failed:", error);
    });
  }, [selections.climateVariable, selections.ensemble, locationLabel]);

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

      <div className={styles.intro}>
        <p className={styles.introCopy}>
          Explore how annual temperature and precipitation in California are projected to change
          through the end of this century.
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
        <p>
          This time series chart shows annual average temperature or total annual precipitation for
          the selected location, calculated from climate model simulations. The line shows the model
          mean, and the shaded area shows the range between the lowest and highest simulation in
          each year, which reflects uncertainty in the projections.
        </p>
        <p>
          The observed line shows a reconstruction of historical weather from 1981 to 2019, produced
          by combining observations with a weather model (ERA5 reanalysis,{" "}
          <GlossaryTerm id="dynamical-downscaling">dynamically downscaled</GlossaryTerm> with WRF).
          It can be used to check whether past conditions fall within the range of the simulations.
        </p>
        <Callout kind="note">
          <p>
            Climate models are designed to capture long-term trends and the range of conditions a
            place may experience, not the weather in any specific year. Simulated values for a
            single year shouldn’t be expected to match historical weather, and they don’t predict
            what will happen in a particular future year. Each simulation produces its own{" "}
            <GlossaryTerm id="internal-variability">internal variability</GlossaryTerm>, so warm,
            cool, wet and dry years fall at different times in each model. Looking across an
            ensemble of many simulations, through the model mean and the range around it, gives a
            fuller picture of possible future conditions.
          </p>
        </Callout>
      </InterpretSection>
    </PageLayout>
  );
}
