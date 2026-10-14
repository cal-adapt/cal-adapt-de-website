// MapUI
// Side panel of controls for the Climate Metrics Map: value type, metric, and GWL selectors,
// plus the metric's fixed threshold.

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import ThermostatOutlinedIcon from "@mui/icons-material/ThermostatOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";

import { FormField, Select } from "@/components/common/form";
import LabelValue from "@/components/common/ui/LabelValue";
import Link from "@/components/common/ui/Link";
import { dataMethodsHref } from "@/config/data-methods";
import { isNavLinkEnabled, navLinks } from "@/config/navigation";
import type { Metric } from "@/data/climate-metrics-map/metrics";
import { tooltips } from "@/data/tooltips";
import type { ValueType } from "@/lib/climate-metrics-map/options";

import styles from "./MapUI.module.scss";

const VALUE_TYPE_OPTIONS = [
  {
    value: "abs",
    label: "Absolute",
    description: "Average expected value at the selected Global Warming Level",
  },
  {
    value: "del",
    label: "Delta",
    description: "Change from a 0.8°C world (approximately 1987-2016)",
  },
];

const VALUE_TYPE_HINT = "Show projected values or the change from the historical period.";

/** Icon shown next to each metric in the dropdown, keyed by metric slug. The heat
 *  metrics share the thermometer used for the Extreme Heat tool in the side nav. */
const METRIC_ICONS: Record<string, React.ReactNode> = {
  "extreme-heat": <ThermostatOutlinedIcon />,
  "warm-nights": <ThermostatOutlinedIcon />,
  "extreme-precipitation": <WaterDropOutlinedIcon />,
  "fire-weather": <LocalFireDepartmentOutlinedIcon />,
};

const THRESHOLD_HINT = "The threshold used to define an extreme event for this metric.";

type MapUIProps = {
  metricSelected: number;
  gwlSelected: number;
  setMetricSelected: (metric: number) => void;
  setGwlSelected: (gwl: number) => void;
  globalWarmingLevels: number[];
  metrics: Metric[];

  valueType: ValueType;
  setValueType: (valueType: ValueType) => void;
};

export default function MapUI({
  valueType,
  setValueType,
  metricSelected,
  gwlSelected,
  setMetricSelected,
  setGwlSelected,
  globalWarmingLevels,
  metrics,
}: MapUIProps) {
  const router = useRouter();
  const selectedMetric = metrics[metricSelected] ?? metrics[0];
  const methodsHref = dataMethodsHref(selectedMetric.methodsPage);
  const heatToolHref =
    selectedMetric.heatToolVariable && isNavLinkEnabled(navLinks.extremeHeatDays)
      ? selectedMetric.heatToolVariable === "extreme-heat-days"
        ? navLinks.extremeHeatDays.href
        : `${navLinks.extremeHeatDays.href}?variable=${selectedMetric.heatToolVariable}`
      : undefined;

  const handleMetricChange = (value: string) => {
    const index = Number(value);
    setMetricSelected(index);

    const params = new URLSearchParams(window.location.search);
    params.set("metric", metrics[index].slug);
    router.push(`?${params.toString()}`);
  };

  // Load query params into state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // set metric from URL if available
    const metricSlug = params.get("metric");
    if (metricSlug) {
      const index = metrics.findIndex((m) => m.slug === metricSlug);
      if (index === -1) console.warn(`Unknown metric selected: ${metricSlug}`);
      setMetricSelected(Math.max(index, 0));
    } else {
      setMetricSelected(0);
    }

    // GWL
    const gwlParam = params.get("gwl");
    if (gwlParam) {
      const gwlIndex = parseInt(gwlParam, 10);
      if (!isNaN(gwlIndex)) setGwlSelected(gwlIndex);
    }

    // Value type
    const valueParam = params.get("valueType");
    if (valueParam === "abs" || valueParam === "del") {
      setValueType(valueParam);
    }
  }, []);

  const gwlOptions = globalWarmingLevels.map((gwl, i) => ({
    value: String(i),
    label: `${gwl}°`,
  }));

  const metricOptions = metrics.map((metric, index) => ({
    value: String(index),
    label: metric.title,
    description: metric.summary,
    icon: METRIC_ICONS[metric.slug],
  }));

  return (
    <div className={styles.mapUI}>
      <h1 className={styles.title}>{navLinks.climateMetricsMap.label}</h1>
      <p className={styles.intro}>
        See how extreme heat, precipitation, and fire weather are projected to change across
        California. Drag to move the map, scroll or use the zoom buttons to zoom, and click the map
        to see values for a location.
      </p>
      <FormField
        label="Metric"
        hint={tooltips[1].long_text}
        hintVariant="tooltip"
        hintPlacement="bottom"
      >
        <Select
          value={String(metricSelected)}
          onChange={handleMetricChange}
          options={metricOptions}
        />
      </FormField>
      <FormField
        label="Data Type"
        hint={VALUE_TYPE_HINT}
        hintVariant="tooltip"
        hintPlacement="bottom"
      >
        <Select
          value={valueType}
          onChange={(value) => setValueType(value as ValueType)}
          options={VALUE_TYPE_OPTIONS}
        />
      </FormField>
      <FormField
        label="Global Warming Level"
        hint={tooltips[0].long_text}
        hintVariant="tooltip"
        hintPlacement="bottom"
      >
        <Select
          value={String(gwlSelected)}
          onChange={(value) => setGwlSelected(Number(value))}
          options={gwlOptions}
        />
      </FormField>
      <LabelValue
        className={styles.threshold}
        label="Threshold"
        hint={THRESHOLD_HINT}
        value={
          <>
            {selectedMetric.thresholdLabel}
            {heatToolHref && (
              <span className={styles.thresholdNote}>
                To explore other thresholds for counties and other regions, see the{" "}
                <Link href={heatToolHref}>{navLinks.extremeHeatDays.label} tool</Link>.
              </span>
            )}
          </>
        }
      />
      {methodsHref && (
        <p className={styles.methodsNote}>
          For details on how this metric is calculated, see the{" "}
          <Link href={methodsHref}>data methods</Link>.
        </p>
      )}
    </div>
  );
}
