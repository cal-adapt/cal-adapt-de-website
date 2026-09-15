/**
 * Location Compare Component
 *
 * Displays a side-by-side monthly comparison between two selected
 * locations at the current GWL selection, plus a per-month difference
 * column. Mirrors LocationInspector's data-fetching approach, but compares
 * two points instead of showing baseline-vs-future for one.
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
} from "@/data/renewables-visualizer/dataset-adapter";

import { fetchPointResponse, monthlySeriesForGwl } from "./point-data";

import styles from "./LocationInspector.module.scss";

type Coordinates = [number, number]; // [lng, lat]

interface LocationCompareProps {
  locationA: Coordinates;
  locationNameA: string;
  locationB: Coordinates;
  locationNameB: string;
  modeDefinition: ModeDefinition;
  gwlIndex: number;
  onClear: () => void;
}

type CompareRow = { month: string; a: number; b: number };

const COLOR_A = "#1967d2";
const COLOR_B = "#f97316";

export default function LocationCompare({
  locationA,
  locationNameA,
  locationB,
  locationNameB,
  modeDefinition,
  gwlIndex,
  onClear,
}: LocationCompareProps) {
  const dataset = modeDefinition.defaultDataset;

  const [rows, setRows] = useState<CompareRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCompareData() {
      setIsLoading(true);
      setError(null);

      try {
        const [responseA, responseB] = await Promise.all([
          fetchPointResponse(dataset, locationA[0], locationA[1]),
          fetchPointResponse(dataset, locationB[0], locationB[1]),
        ]);

        if (cancelled) return;

        const seriesA = monthlySeriesForGwl(responseA, gwlIndex);
        const seriesB = monthlySeriesForGwl(responseB, gwlIndex);

        setRows(
          MONTH_LABELS.map((month, i) => ({
            month,
            a: Math.round(seriesA[i] * 10) / 10,
            b: Math.round(seriesB[i] * 10) / 10,
          }))
        );
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load comparison data:", err);
          setError("Unable to load data for one or both locations.");
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCompareData();

    return () => {
      cancelled = true;
    };
  }, [locationA, locationB, dataset.s3Path, dataset.caTileVariable, gwlIndex]);

  const handleExportCSV = () => {
    const headers = ["Month", "Location A", "Location B", "Difference (A-B)"];
    const csvRows = rows.map((r) => [r.month, r.a, r.b, Math.round((r.a - r.b) * 10) / 10]);
    const csv = [headers, ...csvRows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `renewable-comparison-${locationNameA}-vs-${locationNameB}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box className={styles.container}>
      {/* Locations Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Comparing Locations
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: COLOR_A, fontWeight: 600 }}>
              ● Location A
            </Typography>
            <Typography variant="body2">{locationNameA}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: COLOR_B, fontWeight: 600 }}>
              ● Location B
            </Typography>
            <Typography variant="body2">{locationNameB}</Typography>
          </Box>
        </Stack>
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

      {/* Monthly Comparison Table */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Monthly Data ({dataset.units})
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 1 }}>
          Values at selected GWL ({GWL_LEVELS[gwlIndex] ?? GWL_LEVELS[0]}°C), averaged across years
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
                  <TableCell align="right" sx={{ color: COLOR_A }}>
                    A
                  </TableCell>
                  <TableCell align="right" sx={{ color: COLOR_B }}>
                    B
                  </TableCell>
                  <TableCell align="right">Diff (A−B)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const diff = Math.round((row.a - row.b) * 10) / 10;
                  return (
                    <TableRow key={row.month}>
                      <TableCell variant="head">{row.month}</TableCell>
                      <TableCell align="right">{row.a}</TableCell>
                      <TableCell align="right">{row.b}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            diff === 0 ? "text.primary" : diff > 0 ? "success.main" : "error.main",
                        }}
                      >
                        {diff > 0 ? "+" : ""}
                        {diff}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Divider />

      {/* Actions */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={handleExportCSV}
            disabled={rows.length === 0}
          >
            Export as CSV
          </Button>
          <Button variant="text" size="small" color="error" fullWidth onClick={onClear}>
            Clear Comparison
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
