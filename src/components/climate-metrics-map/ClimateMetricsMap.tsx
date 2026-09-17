// ClimateMetricsMap
// Main wrapper for the interactive Climate Metrics Map tool.
// Manages metric selection, GWL (Global Warming Level) selection, and value type (absolute or delta).
// Loads appropriate data from the API and passes it to MapUI and MapboxMap components.

"use client";

import { useEffect, useState } from "react";

import Grid from "@mui/material/Unstable_Grid2";

import { metrics } from "@/data/climate-metrics-map/metrics";
import { calAdaptApi } from "@/lib/cal-adapt-api";

import MapboxMap from "./MapboxMap";
import MapUI from "./MapUI";

export type ValueType = "abs" | "del";

const DEFAULT_GWL = 1.5;

export default function ClimateMetricsMap() {
  const [selectedGwlIndex, setSelectedGwlIndex] = useState<number>(0);
  const [selectedMetricIndex, setSelectedMetricIndex] = useState<number>(0);
  const [valueType, setValueType] = useState<ValueType>("abs");
  const [gwlList, setGwlList] = useState<number[]>([]);

  // Fetch GWL data when selected metric or value type changes
  useEffect(() => {
    async function fetchGwlData() {
      if (selectedMetricIndex < 0) return;

      // Some metrics don't have a "del" (delta) product yet — fall back to "abs".
      const variableConfig =
        metrics[selectedMetricIndex][valueType] ?? metrics[selectedMetricIndex].abs;

      try {
        const gwlData = await calAdaptApi.map.getGwlInfo(
          variableConfig.mean,
          variableConfig.variable
        );

        if (gwlData.length > 0) {
          setGwlList(gwlData);
          const defaultGwlIndex = gwlData.indexOf(DEFAULT_GWL);
          setSelectedGwlIndex(defaultGwlIndex >= 0 ? defaultGwlIndex : 0);
        }
      } catch (error) {
        console.error("Failed to fetch GWL:", error);
      }
    }

    fetchGwlData();
  }, [selectedMetricIndex, valueType]);

  // When switching to a metric with no "del" product, reset to "abs" right
  // where the metric changes (not reactively in an effect, to avoid
  // cascading setState-in-effect renders).
  const handleMetricSelected = (metricId: number) => {
    setSelectedMetricIndex(metricId);
    const selectedMetric = metrics.find((m) => m.id === metricId);
    if (selectedMetric && !selectedMetric.del) {
      setValueType("abs");
    }
  };

  return (
    <Grid
      container
      sx={{
        height: "100%",
        flexDirection: "column",
        flexWrap: "nowrap",
        flexGrow: 1,
      }}
    >
      <MapUI
        globalWarmingLevels={gwlList}
        metrics={metrics}
        gwlSelected={selectedGwlIndex}
        setGwlSelected={setSelectedGwlIndex}
        metricSelected={selectedMetricIndex}
        setMetricSelected={handleMetricSelected}
        valueType={valueType}
        setValueType={setValueType}
      />
      <MapboxMap
        gwlSelected={selectedGwlIndex}
        metricSelected={selectedMetricIndex}
        globalWarmingLevels={gwlList}
        metrics={metrics}
        valueType={valueType}
      />
    </Grid>
  );
}
