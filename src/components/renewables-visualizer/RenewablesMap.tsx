/**
 * Renewables Map Component
 *
 * Statewide Mapbox map with a click-to-select location picker. Cells with
 * no data (water or land-use restrictions) show a muted dark tint at rest,
 * darkening further on hover; everywhere else is left plain, implying data
 * is available. The underlying datasets have 3 non-spatial dimensions
 * (gwl, month, year), which catile's tile renderer can't rasterize (it
 * only supports selecting a single extra dimension), so there's no live
 * value-colored tile layer. Instead this loads a static, pre-generated
 * GeoJSON mask of just the no-data cells (one per dataset variable, see
 * public/data/renewables-visualizer/) built by polygonizing the exact
 * native WRF grid cell corners and merging contiguous no-data cells - so
 * boundaries are geometrically exact (not an approximated warp) while
 * staying far smaller than one polygon per native cell. Values for the
 * clicked point are fetched at full resolution and shown in the
 * LocationInspector.
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import mapboxgl from "mapbox-gl";
import { Map, MapRef, Marker, NavigationControl, ScaleControl } from "react-map-gl/mapbox";

import GeocoderControl from "@/components/common/map/GeocoderControl";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import { ModeDefinition, RenewableMode } from "@/data/renewables-visualizer/dataset-adapter";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import styles from "./RenewablesMap.module.scss";

type Coordinates = [number, number]; // [lng, lat]

interface RenewablesMapProps {
  selectedMode: RenewableMode;
  modeDefinition: ModeDefinition;
  gwlIndex: number;
  selectedLocation: Coordinates | null;
  onLocationSelect: (location: Coordinates, name?: string) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  /** When set, clicks/search results fill Location A/B instead of the single selection. */
  compareMode?: boolean;
  locationA?: Coordinates | null;
  locationB?: Coordinates | null;
  onCompareLocationSelect?: (location: Coordinates, name?: string) => void;
}

// California center
const INITIAL_VIEW_STATE = {
  longitude: -120.0,
  latitude: 37.5,
  zoom: 6,
};

const GRID_SOURCE_ID = "renewable-grid";
const GRID_FILL_LAYER_ID = "renewable-grid-fill";
const GRID_LINE_LAYER_ID = "renewable-grid-line";

// How gently a hover highlight eases in/out. Tune to taste.
const GRID_HOVER_TRANSITION_MS = 500;

// Visible at rest (a muted "no data here" tint) and darker/more opaque on hover.
const FILL_COLOR = "#1f2937";
const FILL_OPACITY_DEFAULT = 0.28;
const FILL_OPACITY_HOVER = 0.6;
const LINE_COLOR_DEFAULT = "rgba(31, 41, 55, 0.5)";
const LINE_COLOR_HOVER = "rgba(31, 41, 55, 0.9)";
const LINE_WIDTH_DEFAULT = 0.5;
const LINE_WIDTH_HOVER = 1.25;

const COMPARE_COLOR_A = "#1967d2";
const COMPARE_COLOR_B = "#f97316";

export default function RenewablesMap({
  modeDefinition,
  selectedLocation,
  onLocationSelect,
  isLoading,
  onLoadingChange,
  compareMode = false,
  locationA = null,
  locationB = null,
  onCompareLocationSelect,
}: RenewablesMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const hoveredIdRef = useRef<number | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    onLoadingChange(false);
  }, [onLoadingChange]);

  const handleSelect = useCallback(
    (location: Coordinates, name?: string) => {
      if (compareMode) {
        onCompareLocationSelect?.(location, name);
      } else {
        onLocationSelect(location, name);
      }
    },
    [compareMode, onCompareLocationSelect, onLocationSelect]
  );

  const handleMapClick = useCallback(
    (e: any) => {
      if (!mapRef.current) return;

      const [lng, lat] = [e.lngLat.lng, e.lngLat.lat];
      handleSelect([lng, lat]);
    },
    [handleSelect]
  );

  // Load the static, geometrically-exact availability mask for the current dataset variable.
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const map = mapRef.current.getMap();
    if (!map) return;

    let cancelled = false;

    async function loadGridMask() {
      onLoadingChange(true);
      try {
        const variable = modeDefinition.defaultDataset.caTileVariable;
        const response = await fetch(`/data/renewables-visualizer/grid-mask-${variable}.geojson`);
        if (!response.ok) throw new Error(`Grid mask not found for ${variable}`);
        const geojson = await response.json();
        if (cancelled) return;

        geojson.features.forEach((feature: any, i: number) => {
          feature.id = i;
        });

        const source = map.getSource(GRID_SOURCE_ID) as
          | { setData: (data: unknown) => void }
          | undefined;

        if (source) {
          source.setData(geojson);
          return;
        }

        map.addSource(GRID_SOURCE_ID, { type: "geojson", data: geojson });
        const style = map.getStyle();
        const referenceLayer = style?.layers?.find((layer: any) => layer.type === "symbol")?.id;

        // Muted "no data" tint visible at rest, darkening further on hover
        // with a gentle ease in/out.
        map.addLayer(
          {
            id: GRID_FILL_LAYER_ID,
            type: "fill",
            source: GRID_SOURCE_ID,
            paint: {
              "fill-color": FILL_COLOR,
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                FILL_OPACITY_HOVER,
                FILL_OPACITY_DEFAULT,
              ],
              "fill-opacity-transition": { duration: GRID_HOVER_TRANSITION_MS, delay: 0 },
            },
          },
          referenceLayer
        );

        map.addLayer(
          {
            id: GRID_LINE_LAYER_ID,
            type: "line",
            source: GRID_SOURCE_ID,
            paint: {
              "line-color": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                LINE_COLOR_HOVER,
                LINE_COLOR_DEFAULT,
              ],
              "line-color-transition": { duration: GRID_HOVER_TRANSITION_MS, delay: 0 },
              "line-width": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                LINE_WIDTH_HOVER,
                LINE_WIDTH_DEFAULT,
              ],
              "line-width-transition": { duration: GRID_HOVER_TRANSITION_MS, delay: 0 },
            },
          },
          referenceLayer
        );

        popupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 6,
        });

        map.on("mousemove", GRID_FILL_LAYER_ID, (e) => {
          if (!e.features?.length) return;
          const feature = e.features[0];

          if (hoveredIdRef.current !== null) {
            map.setFeatureState(
              { source: GRID_SOURCE_ID, id: hoveredIdRef.current },
              { hover: false }
            );
          }
          hoveredIdRef.current = feature.id as number;
          map.setFeatureState(
            { source: GRID_SOURCE_ID, id: hoveredIdRef.current },
            { hover: true }
          );

          map.getCanvas().style.cursor = "not-allowed";
          popupRef.current?.setLngLat(e.lngLat).setHTML("No data available").addTo(map);
        });

        map.on("mouseleave", GRID_FILL_LAYER_ID, () => {
          if (hoveredIdRef.current !== null) {
            map.setFeatureState(
              { source: GRID_SOURCE_ID, id: hoveredIdRef.current },
              { hover: false }
            );
            hoveredIdRef.current = null;
          }
          map.getCanvas().style.cursor = "";
          popupRef.current?.remove();
        });
      } catch (error) {
        console.error("Failed to load renewable grid mask:", error);
      } finally {
        if (!cancelled) onLoadingChange(false);
      }
    }

    loadGridMask();

    return () => {
      cancelled = true;
    };
  }, [mapLoaded, modeDefinition, onLoadingChange]);

  return (
    <Box className={styles.mapRoot} sx={{ width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-left" />
        <ScaleControl />
        <GeocoderControl
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""}
          position="top-right"
          zoom={9}
          placeholder="Search for a location in California"
          collapsed={false}
          clearOnBlur
          onResult={(e: {
            result: {
              center?: [number, number];
              place_name?: string;
              geometry?: { type: string; coordinates: [number, number] };
            };
          }) => {
            const { result } = e;
            const location =
              result?.center ??
              (result?.geometry?.type === "Point" ? result.geometry.coordinates : undefined);
            if (location) {
              handleSelect(location, result?.place_name);
            }
          }}
        />

        {/* Selected location marker(s) */}
        {!compareMode && selectedLocation && (
          <Marker
            longitude={selectedLocation[0]}
            latitude={selectedLocation[1]}
            color="#1967d2"
            scale={1.2}
          />
        )}
        {compareMode && locationA && (
          <Marker
            longitude={locationA[0]}
            latitude={locationA[1]}
            color={COMPARE_COLOR_A}
            scale={1.2}
          />
        )}
        {compareMode && locationB && (
          <Marker
            longitude={locationB[0]}
            latitude={locationB[1]}
            color={COMPARE_COLOR_B}
            scale={1.2}
          />
        )}
      </Map>

      {/* Loading indicator - shown while the no-data grid mask fetches */}
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            bgcolor: "rgba(255, 255, 255, 0.85)",
            zIndex: 10,
          }}
        >
          <LoadingSpinner label="Loading map data" />
          <Typography variant="body2" color="textSecondary">
            Loading map data…
          </Typography>
        </Box>
      )}
    </Box>
  );
}
