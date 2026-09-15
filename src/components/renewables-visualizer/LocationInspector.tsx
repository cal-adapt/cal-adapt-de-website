/**
 * Location Inspector Component
 *
 * Displays detailed analysis for a selected location:
 * - Monthly profile chart (baseline vs future)
 * - Model summary and uncertainty
 * - Data table
 * - Export actions (CSV, image, etc.)
 * - Provenance and method information
 */

"use client";

import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import {
  GWL_LEVELS,
  ModeDefinition,
  MONTH_LABELS,
  RenewableMode,
} from "@/data/renewables-visualizer/dataset-adapter";

import { BASELINE_GWL_INDEX, fetchPointResponse, monthlySeriesForGwl } from "./point-data";

import styles from "./LocationInspector.module.scss";

type Coordinates = [number, number]; // [lng, lat]

interface LocationInspectorProps {
  location: Coordinates;
  locationName: string;
  mode: RenewableMode;
  modeDefinition: ModeDefinition;
  gwlIndex: number;
}

type MonthlyRow = { month: string; baseline: number; future: number };

export default function LocationInspector({
  location,
  locationName,
  mode,
  modeDefinition,
  gwlIndex,
}: LocationInspectorProps) {
  const [lng, lat] = location;
  const dataset = modeDefinition.defaultDataset;

  const [monthlyData, setMonthlyData] = useState<MonthlyRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPointData() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchPointResponse(dataset, lng, lat);

        if (cancelled) return;

        const baselineSeries = monthlySeriesForGwl(response, BASELINE_GWL_INDEX);
        const futureSeries = monthlySeriesForGwl(response, gwlIndex);

        setMonthlyData(
          MONTH_LABELS.map((month, i) => ({
            month,
            baseline: Math.round(baselineSeries[i] * 10) / 10,
            future: Math.round(futureSeries[i] * 10) / 10,
          }))
        );
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load point data:", err);
          setError("Unable to load data for this location.");
          setMonthlyData([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPointData();

    return () => {
      cancelled = true;
    };
  }, [lng, lat, dataset, gwlIndex]);

  const handleExportCSV = () => {
    const headers = ["Month", "Baseline", "Future"];
    const rows = monthlyData.map((d) => [d.month, d.baseline, d.future]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `renewable-data-${locationName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box className={styles.container}>
      {/* Location Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Selected Location
        </Typography>
        <Typography variant="h6" component="h3">
          {locationName}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {lat.toFixed(4)}°, {lng.toFixed(4)}°
        </Typography>
      </Box>

      <Divider />

      {/* Mode & Dataset Info */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Analysis Mode
        </Typography>
        <Typography variant="body2">{modeDefinition.label}</Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 0.5 }}>
          {dataset.label}
        </Typography>
      </Box>

      <Divider />

      {/* Monthly Data Table */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Monthly Data ({dataset.units})
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 1 }}>
          Baseline ({GWL_LEVELS[BASELINE_GWL_INDEX]}°C) vs. selected GWL (
          {GWL_LEVELS[gwlIndex] ?? GWL_LEVELS[BASELINE_GWL_INDEX]}°C), averaged across years
        </Typography>
        {isLoading && (
          <Typography variant="body2" color="textSecondary">
            Loading data…
          </Typography>
        )}
        {error && !isLoading && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        {!isLoading && !error && (
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Baseline</TableCell>
                  <TableCell align="right">Future</TableCell>
                  <TableCell align="right">Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyData.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell variant="head">{row.month}</TableCell>
                    <TableCell align="right">{row.baseline}</TableCell>
                    <TableCell align="right">{row.future}</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: row.future < row.baseline ? "error.main" : "success.main",
                      }}
                    >
                      {row.future - row.baseline > 0 ? "+" : ""}
                      {Math.round((row.future - row.baseline) * 10) / 10}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Divider />

      {/* Dataset Metadata */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Data & Methods
        </Typography>
        <Stack spacing={1}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Source
            </Typography>
            <Typography variant="body2">{dataset.metadata.source}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Spatial Grid
            </Typography>
            <Typography variant="body2">{dataset.metadata.spatialGrid}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Time Resolution
            </Typography>
            <Typography variant="body2">{dataset.metadata.timeResolution}</Typography>
          </Box>
          {dataset.metadata.processingMethod && (
            <Box>
              <Typography variant="caption" color="textSecondary">
                Method
              </Typography>
              <Typography variant="body2">{dataset.metadata.processingMethod}</Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <Divider />

      {/* Export Actions */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Export
        </Typography>
        <Stack spacing={1}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={handleExportCSV}
            disabled={!monthlyData || monthlyData.length === 0}
          >
            Export as CSV
          </Button>
          <Button variant="outlined" size="small" fullWidth disabled>
            Export as Image
          </Button>
          <Button variant="outlined" size="small" fullWidth disabled>
            Copy Shareable URL
          </Button>
        </Stack>
      </Box>

      <Divider />

      {/* Citation & Provenance */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="textSecondary">
          {dataset.metadata.citation} (v{dataset.metadata.datasetVersion})
        </Typography>
      </Box>
    </Box>
  );
}
