// MapUI
// Side panel of controls for the Climate Metrics Map: value type, metric, and GWL selectors.

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

import { FormField, Select } from "@/components/common/form";
import type { Metric } from "@/data/climate-metrics-map/metrics";
import { tooltips } from "@/data/tooltips";

import type { ValueType } from "./ClimateMetricsMap";

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

  const handleMetricChange = (value: string) => {
    const newMetricId = Number(value);
    setMetricSelected(newMetricId);

    const selectedMetric = metrics.find((m) => m.id === newMetricId);
    if (selectedMetric) {
      const params = new URLSearchParams(window.location.search);
      params.set("metric", selectedMetric.slug);
      router.push(`?${params.toString()}`);
    }
  };

  // Load query params into state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // set metric from URL if available
    const metricSlug = params.get("metric");
    if (metricSlug) {
      const matchedMetric = metrics.find((m) => m.slug === metricSlug);
      if (matchedMetric) {
        setMetricSelected(matchedMetric.id);
      } else {
        console.warn(`Unknown metric selected: ${metricSlug}`);
        setMetricSelected(metrics[0].id);
      }
    } else {
      setMetricSelected(metrics[0].id);
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

  const metricOptions = metrics.map((metric) => ({
    value: String(metric.id),
    label: metric.title,
    description: metric.summary,
  }));

  return (
    <div className={styles.mapUI}>
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
    </div>
  );
}
