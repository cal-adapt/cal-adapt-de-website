// MapboxMap
// Interactive map component using Mapbox GL for the Climate Metrics Map tool.
// Displays raster climate tiles, supports point click interaction with popup values (min, max, mean),
// and includes responsive resizing, throttled point querying, and error suppression for tile issues.

"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";

import { throttle } from "lodash";
import {
  ErrorEvent,
  LngLatBoundsLike,
  Map,
  MapMouseEvent,
  MapRef,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/mapbox";

import GeocoderControl from "@/components/common/map/GeocoderControl";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import type { Metric } from "@/data/climate-metrics-map/metrics";
import { calAdaptApi, type TileJson } from "@/lib/cal-adapt-api";

import type { ValueType } from "./ClimateMetricsMap";
import MapLegend from "./MapLegend";
import MapPopup from "./MapPopup";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const INITIAL_VIEW_STATE = {
  longitude: -120,
  latitude: 37.4,
  zoom: 5,
} as const;

const MAP_BOUNDS: LngLatBoundsLike = [
  [-140, 20], // Southwest coordinates [lng, lat]
  [-100, 50], // Northeast coordinates [lng, lat]
];

const THROTTLE_DELAY = 100 as const;
const RASTER_TILE_LAYER_OPACITY = 0.8 as const;
const CALIFORNIA_GEOJSON = "/geojson/california.geojson" as const;

type MapProps = {
  metricSelected: number;
  gwlSelected: number;
  globalWarmingLevels: number[];
  metrics: Metric[];
  valueType: ValueType;
};

type GeocoderResult = {
  center?: [number, number];
  geometry?: {
    type: string;
    coordinates: [number, number];
  };
};

const throttledGetPoint = throttle(
  async (
    lng: number,
    lat: number,
    meanPath: string,
    minPath: string | undefined,
    maxPath: string | undefined,
    variable: string,
    gwlIndex: number,
    callback: (values: { min: number | null; max: number | null; value: number | null }) => void
  ) => {
    const results = await calAdaptApi.map.getPointGwlStats({
      lng,
      lat,
      meanPath,
      minPath,
      maxPath,
      variable,
      gwlIndex,
    });
    callback(results);
  },
  THROTTLE_DELAY,
  {
    leading: true, // Execute on the leading edge (immediate first call)
    trailing: true, // Execute on the trailing edge (final call)
  }
);

const MapboxMap = forwardRef<MapRef | undefined, MapProps>(
  ({ metricSelected, gwlSelected, globalWarmingLevels, metrics, valueType }, ref) => {
    const mapRef = useRef<MapRef | null>(null);
    useImperativeHandle(ref, () => mapRef.current || undefined);
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

    const [mounted, setMounted] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [tileJson, setTileJson] = useState<TileJson | null>(null);
    const [clickCoords, setClickCoords] = useState<{
      lng: number;
      lat: number;
      key?: number;
    } | null>(null);
    const [popupInfo, setPopupInfo] = useState<{
      longitude: number;
      latitude: number;
      min: number | null;
      max: number | null;
      value: number | null;
    } | null>(null);
    const [isPopupLoading, setIsPopupLoading] = useState(false);
    const [isDataValid, setIsDataValid] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const prevSettingsRef = useRef<{
      valueType: ValueType;
      metricSelected: number;
      gwlSelected: number;
    } | null>(null);

    // Derived state
    const currentVariableData: Metric = metrics[metricSelected];
    const paths = currentVariableData[`${valueType}`] as {
      colormap: string;
      mean: string;
      min_path?: string;
      max_path?: string;
      description: string;
      short_desc: string;
      variable: string;
      rescale: string;
    };

    if (!currentVariableData) {
      console.error("Invalid metric selected:", metricSelected);
    }

    const currentVariable = paths.variable;

    const currentGwl = globalWarmingLevels[gwlSelected] ?? globalWarmingLevels[0];
    const gwlIndex = gwlSelected;

    const isLoading = !mounted || !tileJson;

    useEffect(() => {
      setMounted(true);
      return () => {
        throttledGetPoint.cancel();
      };
    }, []);

    useEffect(() => {
      async function loadTileJson() {
        try {
          const data = await calAdaptApi.map.getTileJson({
            url: paths.mean,
            variable: currentVariable,
            datetime: String(currentGwl),
            rescale: paths.rescale,
            colormap: paths.colormap,
          });
          setTileJson(data);
        } catch (error) {
          console.error("Failed to get TileJSON:", error);
        }
      }

      loadTileJson();
    }, [metricSelected, gwlSelected, currentVariable, currentVariableData, currentGwl]);

    useEffect(() => {
      if (mapRef.current) {
        const map = mapRef.current.getMap();

        const handleMapboxError = (e: any) => {
          const error = e.error;

          // Suppress specific tile errors
          if (error && error.status === 404 && error.url?.includes("WebMercatorQuad")) {
            return;
          }

          // Optionally, suppress all errors related to tiles
          if (error && error.message?.includes("tile")) {
            return;
          }

          console.error("Map error:", error);
        };

        map.on("error", handleMapboxError);

        // Cleanup the event listener on component unmount
        return () => {
          map.off("error", handleMapboxError);
        };
      }
    }, [mapRef]);

    // Raster layer setup with California mask
    useEffect(() => {
      if (!mapLoaded || !tileJson || !mapInstanceRef.current) return;

      const map = mapInstanceRef.current;
      const sourceId = "raster-source";
      const layerId = "tile-layer";
      const maskSourceId = "california-mask-source";
      const maskLayerId = "california-mask";

      // Clean up existing layers and sources if present
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getLayer(maskLayerId)) {
        map.removeLayer(maskLayerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
      if (map.getSource(maskSourceId)) {
        map.removeSource(maskSourceId);
      }

      // Add new raster source
      map.addSource(sourceId, {
        type: "raster",
        tiles: tileJson.tiles,
        tileSize: tileJson.tileSize || 256,
      });

      const style = map.getStyle();
      const layers = style?.layers || [];

      // Find the first layer that is either a symbol or a road line
      const referenceLayer = layers.find(
        (layer) => layer.type === "symbol" || (layer.type === "line" && layer.id.includes("road"))
      )?.id;

      // Insert raster layer below reference layer
      map.addLayer(
        {
          id: layerId,
          type: "raster",
          source: sourceId,
          paint: {
            "raster-opacity": RASTER_TILE_LAYER_OPACITY,
          },
        },
        referenceLayer
      );

      fetch(CALIFORNIA_GEOJSON)
        .then((res) => res.json())
        .then((californiaGeoJson) => {
          // Create a polygon that spans the outer bounds of the world
          // and create a hole around California’s boundary
          const worldBounds: [number, number][] = [
            [-180, -90],
            [180, -90],
            [180, 90],
            [-180, 90],
            [-180, -90],
          ];

          const californiaCoords = californiaGeoJson.geometry.coordinates;

          // Create inverted mask; outer ring is world, inner rings are California polygons
          const invertedMask: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> = {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              // First ring is the outer boundary (world), subsequent rings are holes (California)
              coordinates: [
                worldBounds,
                // Flatten MultiPolygon into holes - take the outer ring of each polygon
                ...(californiaGeoJson.geometry.type === "MultiPolygon"
                  ? californiaCoords.map((poly: number[][][]) => poly[0])
                  : [californiaCoords[0]]),
              ],
            },
          };

          // Add mask source
          map.addSource(maskSourceId, {
            type: "geojson",
            data: invertedMask,
          });

          // Add mask layer above the raster layer to hide everything outside California
          map.addLayer(
            {
              id: maskLayerId,
              type: "fill",
              source: maskSourceId,
              paint: {
                "fill-color": "#f8f8f8",
                "fill-opacity": 1,
              },
            },
            referenceLayer
          );
        })
        .catch((err) => {
          console.error("Failed to load California mask:", err);
        });

      map.on("click", handleMapClick);
      return () => {
        map.off("click", handleMapClick);
      };
    }, [mapLoaded, tileJson]);

    // Fetch popup data for a given location
    const fetchPopupData = useCallback(
      (lng: number, lat: number, updateKey: boolean = false) => {
        setIsPopupLoading(true);

        if (updateKey) {
          const newClick = { lng, lat, key: Date.now() };
          setClickCoords(newClick);
        }

        throttledGetPoint(
          lng,
          lat,
          paths.mean,
          paths.min_path,
          paths.max_path,
          currentVariable,
          gwlIndex,
          (info) => {
            const isValid = info.value !== null || info.min !== null || info.max !== null;

            if (isValid) {
              setIsDataValid(true);
              setPopupInfo({ longitude: lng, latitude: lat, ...info });
            } else {
              setIsDataValid(false);
            }

            setIsPopupLoading(false);
          }
        );
      },
      [paths, currentVariable, gwlIndex]
    );

    // Refetch popup data when settings change
    useEffect(() => {
      const currentSettings = { valueType, metricSelected, gwlSelected };

      // Check if settings have changed
      const settingsChanged =
        !prevSettingsRef.current ||
        prevSettingsRef.current.valueType !== currentSettings.valueType ||
        prevSettingsRef.current.metricSelected !== currentSettings.metricSelected ||
        prevSettingsRef.current.gwlSelected !== currentSettings.gwlSelected;

      // Update ref with current settings
      prevSettingsRef.current = currentSettings;

      // Only refetch if settings have changed and there's an active popup
      if (settingsChanged && clickCoords && showPopup) {
        fetchPopupData(clickCoords.lng, clickCoords.lat, false);
      }
    }, [valueType, metricSelected, gwlSelected, clickCoords, showPopup, fetchPopupData]);

    const handleMapClick = (e: MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      setShowPopup(false);
      setPopupInfo(null);

      setShowPopup(true);
      fetchPopupData(lng, lat, true);
    };

    // Initialize prevSettingsRef on mount
    useEffect(() => {
      if (prevSettingsRef.current === null) {
        prevSettingsRef.current = { valueType, metricSelected, gwlSelected };
      }
    }, []);

    const handleMapLoad = (e: { target: import("mapbox-gl").Map }) => {
      if (!e.target) return;
      mapInstanceRef.current = e.target;
      setMapLoaded(true);

      mapInstanceRef.current.getCanvas().style.cursor = "pointer";

      const mapContainer = document.getElementById("map");

      if (mapContainer) {
        const resizeObserver = new ResizeObserver(() => {
          if (mapRef.current) {
            mapRef.current.resize(); // Resize the map when the container changes
          }
        });
        resizeObserver.observe(mapContainer);
      }
    };

    const handleMapError = (e: ErrorEvent) => {
      const error = e.error as { status?: number; url?: string };
      if (error.status === 404 && error.url?.includes("WebMercatorQuad")) {
        return;
      }
      console.error("Map error:", error);
    };

    // Conditional loading fallback
    if (!mounted) {
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
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <LoadingSpinner />
          </Box>
        </Grid>
      );
    }

    return (
      <Grid
        container
        sx={{
          height: "100%",
          flexDirection: "column",
          flexWrap: "nowrap",
          flexGrow: 1,
          position: "relative",
        }}
      >
        <Box
          sx={{ height: "100%", position: "relative" }}
          id="map"
          aria-label="Interactive map showing climate data"
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {isLoading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  zIndex: 9999,
                }}
                aria-live="polite"
              >
                <LoadingSpinner />
              </Box>
            )}
            <Map
              ref={mapRef}
              onLoad={handleMapLoad}
              onError={handleMapError}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
              initialViewState={INITIAL_VIEW_STATE}
              mapStyle="mapbox://styles/mapbox/light-v11"
              scrollZoom={true}
              dragRotate={false}
              pitchWithRotate={false}
              minPitch={0}
              maxPitch={0}
              touchZoomRotate={false}
              minZoom={3.5}
              maxBounds={MAP_BOUNDS}
              dragPan={true}
              style={{ width: "100%", height: "100%" }}
            >
              <GeocoderControl
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""}
                zoom={13}
                position="top-right"
                collapsed={true}
                clearOnBlur={true}
                onResult={(e: { result: GeocoderResult }) => {
                  const { result } = e;
                  const location =
                    result &&
                    (result.center ||
                      (result.geometry?.type === "Point" && result.geometry.coordinates));
                  if (location && mapRef.current) {
                    mapRef.current.flyTo({
                      center: location,
                      zoom: 10,
                    });
                  }
                }}
              />
              <NavigationControl position="top-right" showCompass={false} />
              <ScaleControl position="bottom-right" maxWidth={100} unit="metric" />
              {clickCoords && showPopup && (
                <MapPopup
                  key={clickCoords.key} // force rerender
                  longitude={clickCoords.lng}
                  latitude={clickCoords.lat}
                  min={popupInfo?.min || 0}
                  max={popupInfo?.max || 0}
                  value={popupInfo?.value || 0}
                  title={paths.short_desc}
                  isPopupLoading={isPopupLoading}
                  isDataValid={isDataValid}
                  onClose={() => {
                    setShowPopup(false);
                    setPopupInfo(null);
                  }}
                  aria-label={`Popup at longitude ${clickCoords.lng} and latitude ${clickCoords.lat}`}
                />
              )}
            </Map>
            <div
              style={{
                position: "absolute",
                bottom: 40,
                left: 40,
                zIndex: 2,
                maxWidth: 554,
              }}
            >
              <MapLegend
                colormap={paths.colormap}
                min={parseFloat(paths.rescale.split(",")[0])}
                max={parseFloat(paths.rescale.split(",")[1])}
                title={paths.description}
              />
            </div>
          </div>
        </Box>
      </Grid>
    );
  }
);

MapboxMap.displayName = "MapboxMap";

export default MapboxMap;
