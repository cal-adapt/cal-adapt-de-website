// MapUI
// UI controls for the Climate Metrics Map interface.
// Includes GWL and metric selectors, value type tabs, and tooltip help.

"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { FormControl } from "@mui/material";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Grid from "@mui/material/Grid";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

import HtmlTooltip from "@/components/common/ui/HtmlTooltip";
import { useLeftDrawer } from "@/context/LeftDrawerContext";
import type { Metric } from "@/data/climate-metrics-map/metrics";
import { tooltips } from "@/data/tooltips";

import type { ValueType } from "./ClimateMetricsMap";

import styles from "./MapUI.module.scss";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const SIDEBAR_WIDTH_OPEN = 275;
const SIDEBAR_WIDTH_COLLAPSED = 72;

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

const MenuProps: any = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "center",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "center",
  },
  variant: "menu",
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
  const { open, drawerWidth } = useLeftDrawer();

  const fullWidthUIItem = open ? `100%` : `calc(100% - ${drawerWidth} - 72px)`;
  const handleValueTypeChange = (event: React.SyntheticEvent, newValue: ValueType) => {
    setValueType(newValue);
  };

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMetricChange = (event: any) => {
    console.log("handleMetricChange");
    const newMetricId = event.target.value as number;
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

  return (
    <div
      className={styles.mapUI}
      style={{
        width: `calc(100% - ${open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_COLLAPSED}px)`,
        transition: "width 225ms cubic-bezier(0.4, 0, 0.6, 1)",
      }}
    >
      <Box sx={{ height: "80vh", display: "flex", flexDirection: "column" }}>
        <Grid container direction="column" sx={{ height: "100%" }}>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <div className={styles.parameterSelection}>
                <div className="container container--transparent">
                  <div className="option-group option-group--vertical">
                    <div className="option-group__title">
                      <Typography variant="body2" id="value-type-label">
                        Projections Type
                      </Typography>
                      <HtmlTooltip
                        textFragment={
                          <React.Fragment>
                            <p>{tooltips[3].long_text}</p>
                          </React.Fragment>
                        }
                        iconFragment={<InfoOutlinedIcon />}
                        TransitionComponent={Fade}
                        TransitionProps={{ timeout: 600 }}
                        placement="right-end"
                      />
                    </div>
                    <Box
                      sx={{
                        width: fullWidthUIItem,
                      }}
                    >
                      <Tabs
                        aria-labelledby="value-type-label"
                        value={valueType}
                        onChange={handleValueTypeChange}
                        centered
                      >
                        <Tab value="abs" label="Absolute" />
                        <Tab value="del" label="Delta" />
                      </Tabs>
                    </Box>
                  </div>
                </div>
                <div className="container container--transparent">
                  <div className="option-group option-group--vertical">
                    <div className="option-group__title">
                      <Typography variant="body2" id="gwl-label">
                        Global Warming Level
                      </Typography>
                      <HtmlTooltip
                        textFragment={
                          <React.Fragment>
                            <p>{tooltips[0].long_text}</p>
                          </React.Fragment>
                        }
                        iconFragment={<InfoOutlinedIcon />}
                        TransitionComponent={Fade}
                        TransitionProps={{ timeout: 600 }}
                        placement="right-end"
                      />
                    </div>

                    <FormControl>
                      <Select
                        aria-label="GWL"
                        id="gwl-select"
                        labelId="gwl-label"
                        value={gwlSelected}
                        onChange={(event: any) => {
                          setGwlSelected(event.target.value as number);
                        }}
                        MenuProps={MenuProps}
                        sx={{ mt: "15px", width: "200px" }}
                      >
                        {globalWarmingLevels.map((gwl, i) => {
                          return (
                            <MenuItem key={gwl} value={i}>
                              <ListItemText primary={`${gwl}°`} />
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </div>
                </div>
                <div className="container container--transparent">
                  <div className="option-group option-group--vertical">
                    <div className="option-group__title">
                      <Typography id="metric-label" variant="body2">
                        Metric
                      </Typography>
                      <HtmlTooltip
                        textFragment={
                          <React.Fragment>
                            <p>{tooltips[1].long_text}</p>
                          </React.Fragment>
                        }
                        iconFragment={<InfoOutlinedIcon />}
                        TransitionComponent={Fade}
                        TransitionProps={{ timeout: 600 }}
                        placement="right-end"
                      />
                    </div>

                    <FormControl>
                      <Select
                        aria-label="Metric"
                        id="metric-select"
                        labelId="metric-label"
                        value={metricSelected}
                        onChange={handleMetricChange}
                        MenuProps={MenuProps}
                        sx={{ mt: "15px", width: "220px" }}
                      >
                        {metrics.map((metric) => (
                          <MenuItem key={metric.id} value={metric.id}>
                            <ListItemText primary={metric.title} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={9}></Grid>
          </Grid>
          {/* Spacer */}
          <Grid item xs />
        </Grid>
      </Box>
    </div>
  );
}
