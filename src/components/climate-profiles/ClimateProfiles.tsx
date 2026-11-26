"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ChartFrame from "@/components/common/charts/ChartFrame";
import Badge from "@/components/common/ui/Badge";
import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import PageLayout from "@/components/dashboard/PageLayout";
import { navLinks } from "@/config/navigation";
import { useStacSeries } from "@/hooks/use-stac-series";
import {
  formatChartExportFilename,
  formatChartSubtitle,
  formatChartTitle,
} from "@/lib/climate-profiles/format";
import {
  type ClimateProfilesSelections,
  getVariable,
  profileColor,
  type ProfileId,
  profileLabel,
  STATIONS_COLLECTION,
  usesAdvancedSelections,
  withDefaultAdvanced,
} from "@/lib/climate-profiles/options";
import { fetchProfiles, type ProfileSet, searchFiltersKey } from "@/lib/climate-profiles/profiles";
import {
  selectionsFromSearchParams,
  selectionsToSearchParams,
} from "@/lib/climate-profiles/search-params";
import { fetchStationOptions, stationLabelFor } from "@/lib/climate-profiles/stations";
import { exportSvgAsPng } from "@/utils/export-chart";

import Controls from "./Controls";
import ProfileChart, { type ChartSeries } from "./ProfileChart";

import styles from "./ClimateProfiles.module.scss";

const CHART_SOURCE = "Source: Cal-Adapt\nData: Climate Profiles (Eagle Rock Analytics)";

function toSeries(
  set: ProfileSet,
  id: ProfileId,
  selections: ClimateProfilesSelections
): ChartSeries | null {
  const values = set.profiles[id]?.[selections.variable];
  if (!values) return null;
  return { id, label: profileLabel(id, selections), color: profileColor(id), values };
}

/** TMY first so the XMY draws on top, like the white paper's figures. */
function buildSeries(set: ProfileSet | null, selections: ClimateProfilesSelections): ChartSeries[] {
  if (!set) return [];
  return (["tmy", selections.xmy] as const)
    .map((id) => toSeries(set, id, selections))
    .filter((s): s is ChartSeries => s != null);
}

export default function ClimateProfiles() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selections = useMemo(() => selectionsFromSearchParams(searchParams), [searchParams]);
  const handleSelectionsChange = useCallback(
    (next: ClimateProfilesSelections) => {
      const qs = selectionsToSearchParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  // Advanced view starts open when a shared link already uses an advanced selection.
  const [advanced, setAdvanced] = useState(() => usesAdvancedSelections(selections));
  // Turning advanced view off returns its selections to their defaults.
  const handleAdvancedChange = useCallback(
    (on: boolean) => {
      setAdvanced(on);
      if (!on) handleSelectionsChange(withDefaultAdvanced(selections));
    },
    [handleSelectionsChange, selections]
  );

  const result = useStacSeries(searchFiltersKey(selections), (signal) =>
    fetchProfiles(selections, { signal })
  );
  const series = useMemo(() => buildSeries(result.data, selections), [result.data, selections]);
  const variable = getVariable(selections.variable);
  const stations = useStacSeries(STATIONS_COLLECTION, () =>
    fetchStationOptions(STATIONS_COLLECTION)
  );
  const stationOptions = stations.data ?? [];
  const stationLabel = stationLabelFor(selections.station, stationOptions);
  const title = formatChartTitle(selections, stationLabel);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const canExportChart = result.status === "success" && series.length > 0;
  const handleExportChart = useCallback(() => {
    const svg = chartContainerRef.current?.querySelector<SVGSVGElement>("svg");
    if (!svg) return;
    exportSvgAsPng(svg, formatChartExportFilename(selections, stationLabel), {
      footnote: CHART_SOURCE,
    }).catch((error) => {
      console.error("[climate-profiles] chart export failed:", error);
    });
  }, [selections, stationLabel]);

  return (
    <PageLayout
      title={
        <>
          {navLinks.climateProfiles.label}
          <Badge variant="blue" size="lg" className={styles.betaBadge}>
            Beta
          </Badge>
        </>
      }
      citationTitle={navLinks.climateProfiles.label}
    >
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
          <ChartFrame
            status={result.status}
            hasData={series.length > 0}
            errorMessage={result.errorMessage}
            onRetry={result.retry}
            loadingLabel="Loading climate profiles"
            errorContent={
              result.timedOut
                ? `Loading climate profiles for ${stationLabel} is taking longer than expected. Try again.`
                : `We couldn't load climate profiles for ${stationLabel}. Check your connection and try again.`
            }
            noDataContent={`No ${variable.label.toLowerCase()} data is available for these selections.`}
            source={CHART_SOURCE}
            chartContainerRef={chartContainerRef}
            ariaLabel={title}
          >
            <ProfileChart
              series={series}
              units={variable.units}
              yAxisLabel={`${variable.label} (${variable.units})`}
              title={title}
              subtitle={formatChartSubtitle(selections)}
            />
          </ChartFrame>
        </div>
        <aside className={styles.controlsArea} aria-label="Chart controls">
          <Controls
            selections={selections}
            onChange={handleSelectionsChange}
            stationOptions={stationOptions}
            stationsFailed={stations.status === "error"}
            advanced={advanced}
            onAdvancedChange={handleAdvancedChange}
            disabled={result.status === "loading"}
          />
        </aside>
      </div>
    </PageLayout>
  );
}
