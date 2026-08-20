// RenewablesVisualizer:
// This is the main component for the Renewables Visualizer tool. It displays a map for selecting a location, and once a location is selected, shows a heatmap of future resource droughts (solar or wind). It integrates Mapbox for location selection, a collapsible accordion, heatmap rendering, and a sidepanel with parameters.

"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import EditLocationOutlinedIcon from "@mui/icons-material/EditLocationOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Accordion, { AccordionSlots } from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";

import clsx from "clsx";

import InterpretSection from "@/components/common/content/InterpretSection";
import Alert from "@/components/common/ui/Alert";
import Button from "@/components/common/ui/Button";
import Link from "@/components/common/ui/Link";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import PageLayout from "@/components/dashboard/PageLayout";
import SidePanel from "@/components/dashboard/SidePanel";
import Heatmap from "@/components/renewables-visualizer/Heatmap/Heatmap";
import MapboxMap from "@/components/renewables-visualizer/MapboxMap";
import { navLinks } from "@/config/navigation";
import { useInstallationParams } from "@/context/InstallationParamsContext";
import { usePhotoConfig } from "@/context/PhotoConfigContext";
import { useRes } from "@/context/ResContext";
import { useSidePanel } from "@/context/SidePanelContext";
import { gwlYearEstimateData } from "@/data/renewables-visualizer/gwl-year-estimates";
import { calAdaptApi } from "@/lib/cal-adapt-api";

import VizParamsForm from "./VisualizationParamsForm";

import styles from "./RenewablesVisualizer.module.scss";

const MAP_HEIGHT = 550;
const HEATMAP_HEIGHT = 500;
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

// Type alias for coordinates
// Format: [longitude, latitude]
type Location = [number, number];
type apiParams = {
  res: number;
  point: Location | null;
  configQueryStr: string;
  installation: string;
};
type LocationStatus = "none" | "data" | "no-data";

// Format of returned data from API
interface QueriedData {
  data: number[][];
}

// Dropdown menu behavior
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

export default function RenewablesViz() {
  // Context
  const { open, toggleOpen } = useSidePanel();
  const { resSelected, resList } = useRes();
  const { photoConfigSelected } = usePhotoConfig();
  const { installationSelected, installationList } = useInstallationParams();

  // Derived state
  const derivedConfigStr = useMemo(() => {
    return photoConfigSelected === "Utility Configuration" ? "srdu" : "srdd";
  }, [photoConfigSelected]);

  const derivedInstallationStr = useMemo(() => {
    return installationSelected == 0 ? "wrdn" : "wrdf";
  }, [installationSelected]);

  const maskStr = useMemo(() => {
    if (resSelected == 0) {
      // solar
      return photoConfigSelected === "Utility Configuration" ? "srdumask" : "srddmask";
    }
    // wind (resSelected == 1)
    return installationSelected == 0 ? "wrdnmask" : "wrdfmask";
  }, [resSelected, photoConfigSelected, installationSelected]);

  // Parameters state
  const [apiParams, setApiParams] = useState<apiParams>({
    res: resSelected,
    point: null,
    configQueryStr: derivedConfigStr,
    installation: derivedInstallationStr,
  });
  const [isColorRev] = useState<boolean>(false);

  const [gwlSelected, setGwlSelected] = useState<number>(0);
  const [globalWarmingLevelsList, setGlobalWarmingLevelsList] = useState<string[]>([]);

  // Map & location state
  const mapRef = useRef<any>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("none");
  const [mapMarker, setMapMarker] = useState<[number, number] | null>(null);

  // Heatmap state
  const heatmapContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      setHeatmapContainer(node);
    }
  }, []);
  const [heatmapContainer, setHeatmapContainer] = useState<HTMLDivElement | null>(null);
  const [heatmapWidth, setHeatmapWidth] = useState(0);
  const [queriedData, setQueriedData] = useState<QueriedData | null>(null);
  const [isPointValid, setIsPointValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // TEMP: for color ramp options
  const [currentColorMap] = useState<string>("PuBuGn");

  // UI state
  const [accordionExpanded, setAccordionExpanded] = useState(true);

  const handleAccordionChange = () => {
    if (apiParams.point !== null) {
      setAccordionExpanded(!accordionExpanded);
    }
  };

  const prevApiParams = useRef<apiParams>(apiParams);

  // Retrieve heatmap data
  const onFormDataSubmit = useCallback(async () => {
    if (!apiParams.point || locationStatus !== "data") {
      return;
    }

    setIsLoading(true);

    const [long, lat] = apiParams.point;

    let s3Url = "";
    let queryVar = "";
    if (apiParams.res == 0) {
      // Solar
      s3Url = `s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/gwl/${apiParams.configQueryStr}/d03`;
      queryVar = apiParams.configQueryStr;
    } else if (apiParams.res == 1) {
      // Wind
      s3Url = `s3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/gwl/${apiParams.installation}/d03`;
      queryVar = apiParams.installation;
    }

    if (s3Url && queryVar) {
      try {
        const newData = await calAdaptApi.map.getPoint<QueriedData>(long, lat, {
          url: s3Url,
          variable: queryVar,
        });
        setQueriedData(newData);
        setIsPointValid(true);
      } catch (err) {
        console.error("Failed to fetch point data:", err);
        setQueriedData(null);
        setIsPointValid(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("No S3 URL or variable has been defined");
    }
  }, [apiParams, locationStatus]);

  useEffect(() => {
    if (JSON.stringify(prevApiParams.current) !== JSON.stringify(apiParams)) {
      onFormDataSubmit();
    }
    prevApiParams.current = apiParams;
  }, [apiParams, onFormDataSubmit]);

  useEffect(() => {
    if (queriedData) {
      setIsLoading(false);
      setIsPointValid(true);
    }
  }, [queriedData]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  }, [accordionExpanded]);

  useEffect(() => {
    if (!heatmapContainer) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        setHeatmapWidth(newWidth);
      }
    });

    resizeObserver.observe(heatmapContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [heatmapContainer]);

  const checkLocationStatus = useCallback(
    (point: Location | null) => {
      if (!point) {
        setLocationStatus("none");
        return;
      }

      if (mapRef.current) {
        const lngLat = { lng: point[0], lat: point[1] };
        const screenPoint = mapRef.current.project(lngLat);
        const features = mapRef.current.queryRenderedFeatures(screenPoint, {
          layers: ["grid"],
        });

        if (features && features.length > 0) {
          const selectedFeature = features[0];
          const maskAttribute = maskStr;

          if (maskAttribute) {
            const gridValue = selectedFeature.properties?.[maskAttribute];

            const newStatus = gridValue ? "data" : "no-data";
            setLocationStatus(newStatus);

            if (newStatus === "data") {
              onFormDataSubmit();
            } else {
              setQueriedData(null);
              setIsPointValid(false);
            }
          } else {
            console.error("no mask attribute has been set");
          }
        } else {
          setLocationStatus("no-data");
          setQueriedData(null);
          setIsPointValid(false);
        }
      }
    },
    [mapRef, onFormDataSubmit]
  );

  // Check location status when photoConfigSelected or point changes
  useEffect(() => {
    if (apiParams.point) {
      checkLocationStatus(apiParams.point);
    }
  }, [apiParams, checkLocationStatus]);

  useEffect(() => {
    updateApiParams({ res: resSelected });
  }, [resSelected]);

  // Update apiParams when configStr changes (including when photoConfigSelected changes)
  useEffect(() => {
    updateApiParams({
      configQueryStr: derivedConfigStr,
    });
  }, [derivedConfigStr]);

  // Update apiParams when installation changes (including when installationSelected changes)
  useEffect(() => {
    updateApiParams({
      installation: derivedInstallationStr,
    });
  }, [derivedInstallationStr]);

  function setLocationSelected(point: Location | null) {
    if (!point) {
      setLocationStatus("none");
      updateApiParams({ point: null });
      return;
    }

    // Get the grid value at this point
    if (mapRef.current) {
      const mapboxPoint = mapRef.current.project(point);
      const features = mapRef.current.queryRenderedFeatures(mapboxPoint, {
        layers: ["grid"],
      });

      if (features && features.length > 0) {
        const selectedFeature = features[0];
        const maskAttribute = maskStr;

        if (maskAttribute) {
          const gridValue = selectedFeature.properties?.[maskAttribute];

          // Set status based on grid value
          setLocationStatus(gridValue ? "data" : "no-data");
          updateApiParams({ point });

          // Collapse accordion on selection
          setAccordionExpanded(false);
        } else {
          console.error("no mask attribute has been set");
        }
      }
    }
  }

  function updateApiParams(newParams: Partial<apiParams>) {
    setApiParams((prevParams) => ({
      ...prevParams,
      ...newParams,
    }));
  }

  const handleSummaryClick = (event: React.MouseEvent) => {
    if (apiParams.point === null) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  useEffect(() => {
    setGlobalWarmingLevelsList(gwlYearEstimateData.map((gwl) => gwl.name));
    setGwlSelected(1); // 1.5°
  }, []);

  return (
    <PageLayout title="Renewables Visualizer">
      <Box className={styles.intro} style={{ maxWidth: "860px" }}>
        <Typography variant="body1" aria-label="Description of the tool">
          This tool shows when there are likely to be significant reductions in solar or wind energy
          availability in the future. To be more specific, it shows the number of wind or solar
          resource drought days (less than 40% average generation) per month throughout a
          representative 30-year period.{" "}
        </Typography>
      </Box>

      <Grid container xs={12}>
        {/* Heatmap parameters section */}
        <Grid xs={12}>
          <Box>
            <Box className={styles.flexParams}>
              <Box className={styles.flexParamsItem}>
                <Typography
                  className={styles.optionGroupTitle}
                  variant="body2"
                  aria-label="Resource of interest"
                >
                  Resource
                </Typography>
                <Typography
                  variant="body1"
                  aria-label={`Selected Resource: ${resList[resSelected]}`}
                >
                  {resList[resSelected]}
                </Typography>
              </Box>
              <Box className={styles.flexParamsItem}>
                <Typography
                  className={styles.optionGroupTitle}
                  variant="body2"
                  aria-label="Global Warming Level"
                >
                  Global Warming Level
                </Typography>
                <Typography
                  variant="body1"
                  aria-label={`Selected Global Warming Level: ${globalWarmingLevelsList[gwlSelected]}`}
                >
                  {globalWarmingLevelsList[gwlSelected]}°
                </Typography>
              </Box>
              {resSelected == 0 && ( // Solar configuration
                <Box className={styles.flexParamsItem}>
                  <Typography
                    className={styles.optionGroupTitle}
                    variant="body2"
                    aria-label="Photovoltaic Configuration"
                  >
                    Photovoltaic Configuration
                  </Typography>
                  <Typography
                    variant="body1"
                    aria-label={`Selected Photovoltaic Configuration: ${photoConfigSelected}`}
                  >
                    {photoConfigSelected}
                  </Typography>
                </Box>
              )}
              {resSelected == 1 && ( // Wind installation
                <Box className={styles.flexParamsItem}>
                  <Typography
                    className={styles.optionGroupTitle}
                    variant="body2"
                    aria-label="Installation type"
                  >
                    Installation Design Parameters
                  </Typography>
                  <Typography
                    variant="body1"
                    aria-label={`Selected Installation Design: ${installationList[installationSelected]}`}
                  >
                    {installationList[installationSelected]}
                  </Typography>
                </Box>
              )}

              <Box className={styles.flexParamsItem}>
                <Typography
                  className={styles.inline}
                  variant="subtitle1"
                  aria-label="Edit parameters"
                >
                  Edit parameters
                </Typography>
                <IconButton
                  className={styles.inline}
                  onClick={toggleOpen}
                  aria-label="Open settings"
                >
                  <SettingsOutlinedIcon />
                </IconButton>
              </Box>
            </Box>
            {/* Global warming level information */}
            {queriedData && !isLoading && isPointValid && (
              <Box className={styles.alerts} sx={{ maxWidth: "100%" }}>
                <Alert ariaLabel="Global models estimate information">
                  Global models estimate that {gwlYearEstimateData[gwlSelected].name}° global
                  warming levels (GWL) will be reached between{" "}
                  <strong>{gwlYearEstimateData[gwlSelected].estimatedStartYear}</strong> and{" "}
                  <strong>{gwlYearEstimateData[gwlSelected].estimatedEndYear}</strong>
                  <div className={styles.cta}>
                    <Button
                      href="https://cmip5.cal-adapt.org/blog/understanding-warming-levels"
                      aria-label="Learn more about GWL"
                    >
                      Learn more about GWL
                    </Button>
                  </div>
                </Alert>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
      <Accordion
        expanded={accordionExpanded}
        onChange={handleAccordionChange}
        slots={{ transition: Fade as AccordionSlots["transition"] }}
        slotProps={{ transition: { timeout: 400 } }}
        sx={[
          accordionExpanded
            ? {
                "& .MuiAccordion-region": {
                  height: "auto",
                },
                "& .MuiAccordionDetails-root": {
                  display: "block",
                },
                "&.Mui-expanded": {
                  margin: 0,
                },
              }
            : {
                "& .MuiAccordion-region": {
                  height: 0,
                },
                "& .MuiAccordionDetails-root": {
                  display: "none",
                },
              },
        ]}
      >
        <Grid container xs={12} justifyContent="flex-end">
          {/* Locator map instruction section */}
          <Grid
            xs={12}
            sx={{
              display: "flex",
              justifyContent: accordionExpanded ? "flex-start" : "flex-end",
            }}
          >
            <Box sx={{ width: accordionExpanded ? "100%" : "auto" }}>
              <AccordionSummary
                onClick={handleSummaryClick}
                expandIcon={
                  apiParams.point !== null ? (
                    <ExpandMoreIcon className={styles.rotatedIcon} />
                  ) : null
                }
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{
                  "& .MuiAccordionSummary-content": {
                    marginTop: "20px",
                    marginBottom: "20px",
                    justifyContent: accordionExpanded ? "flex-start" : "flex-end",
                  },
                  width: "100%",
                }}
              >
                <EditLocationOutlinedIcon aria-label="Edit location" />
                <Typography
                  className={styles.inline}
                  variant="h5"
                  style={{
                    marginLeft: "10px",
                  }}
                  aria-label={
                    locationStatus !== "none" ? "Change your location" : "Select your location"
                  }
                >
                  {locationStatus !== "none" ? "Change your location" : "Select your location"}
                </Typography>
              </AccordionSummary>
            </Box>
          </Grid>

          {/* Heatmap section */}
          <Grid
            xs={accordionExpanded ? 0 : 8.5}
            sx={{
              maxWidth: "100%",
              pr: 4,
              marginLeft: "auto",
              paddingRight: 0,
            }}
          >
            {locationStatus === "no-data" && (
              <Box
                sx={{ marginBottom: "30px" }}
                style={{ display: accordionExpanded ? "none" : "block" }}
              >
                <Alert>
                  You have selected a location with land use or land cover restrictions. No data
                  will be returned.&nbsp;
                  <span
                    onClick={accordionExpanded ? undefined : handleAccordionChange}
                    aria-label="Select another location"
                  >
                    <strong>Select another location </strong>
                  </span>
                  to try again
                </Alert>
              </Box>
            )}
            {locationStatus === "data" && (
              <Box
                ref={heatmapContainerRef}
                className={clsx(styles.heatmap, {
                  [styles.loading]: isLoading,
                })}
                style={{ display: accordionExpanded ? "none" : "block" }}
              >
                {isLoading && (
                  <Box className={styles.loadingContainer}>
                    <LoadingSpinner aria-label="Loading heatmap data" />
                  </Box>
                )}
                {!isLoading && isPointValid && (
                  <Heatmap
                    width={heatmapWidth}
                    height={HEATMAP_HEIGHT}
                    data={queriedData}
                    gwlSelected={gwlSelected}
                    aria-label="Heatmap visualization"
                    currentColorMap={currentColorMap}
                    isColorRev={isColorRev}
                  />
                )}
              </Box>
            )}
          </Grid>

          {/* Locator map section */}
          <Grid xs={accordionExpanded ? 12 : 3.5} sx={{ alignItems: "flex-end" }}>
            <AccordionDetails className={styles.customAccordionDetails}>
              <Box className={styles.map}>
                <MapboxMap
                  mapMarker={mapMarker}
                  setMapMarker={setMapMarker}
                  ref={mapRef}
                  locationSelected={apiParams.point}
                  setLocationSelected={setLocationSelected}
                  height={MAP_HEIGHT}
                  aria-label="Map for selecting location of heatmap data"
                  maskStr={maskStr}
                />
              </Box>
            </AccordionDetails>
          </Grid>
        </Grid>
      </Accordion>

      <InterpretSection title="How to interpret this tool">
        <p>
          The Renewables Visualizer shows the reliability of solar and wind power generation
          potential at a given location. To be more specific, it shows the number of resource
          drought days (less than 50% of that location&apos;s average generation) per month
          throughout a representative 30-year period. See the{" "}
          <Link href={`${navLinks.renewablesVisualizer.href}/guidance`}>Guidance tab</Link> for more
          information on this tool.
        </p>
      </InterpretSection>

      <Box className={styles.sidepanel}>
        <SidePanel
          anchor="right"
          variant="temporary"
          open={open}
          onClose={toggleOpen}
          aria-label="Settings side panel"
        >
          <Tooltip
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
            title="Close the sidebar"
          >
            <IconButton onClick={toggleOpen} aria-label="Close settings sidebar">
              <CloseIcon />
            </IconButton>
          </Tooltip>
          <VizParamsForm
            onFormDataSubmit={onFormDataSubmit}
            globalWarmingLevelsList={globalWarmingLevelsList}
            gwlSelected={gwlSelected}
            setGwlSelected={setGwlSelected}
            toggleOpen={toggleOpen}
            aria-label="Visualization parameters form"
          ></VizParamsForm>
        </SidePanel>
      </Box>
    </PageLayout>
  );
}
