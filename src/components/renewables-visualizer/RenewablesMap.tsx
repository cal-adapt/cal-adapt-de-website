/**
 * Renewables Map Component
 *
 * Displays renewable resource data on a statewide Mapbox map.
 * Supports point selection for location inspection.
 * Shows appropriate layer based on selected mode.
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import { Map, NavigationControl, ScaleControl, Marker, MapRef } from "react-map-gl/mapbox";

import GeocoderControl from "@/components/common/map/GeocoderControl";
import { ModeDefinition, RenewableMode } from "@/data/renewables-visualizer/dataset-adapter";

import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";

type Coordinates = [number, number]; // [lng, lat]

interface RenewablesMapProps {
  selectedMode: RenewableMode;
  modeDefinition: ModeDefinition;
  gwlIndex: number;
  selectedLocation: Coordinates | null;
  onLocationSelect: (location: Coordinates, name?: string) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

// California center
const INITIAL_VIEW_STATE = {
  longitude: -120.0,
  latitude: 37.5,
  zoom: 6,
};

export default function RenewablesMap({
  selectedMode,
  modeDefinition,
  gwlIndex,
  selectedLocation,
  onLocationSelect,
  isLoading,
  onLoadingChange,
}: RenewablesMapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    onLoadingChange(false);
  }, [onLoadingChange]);

  const handleMapClick = useCallback(
    (e: any) => {
      if (!mapRef.current) return;

      const [lng, lat] = [e.lngLat.lng, e.lngLat.lat];
      onLocationSelect([lng, lat]);
    },
    [onLocationSelect]
  );

  // For MVP, we'll just show a basic map with controls
  // The full implementation would load the renewable data layer from catile
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onLoad={handleMapLoad}
        onClick={handleMapClick}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-left" />
        <ScaleControl />
        <GeocoderControl
          position="top-right"
          onResult={(result: any) => {
            if (result.result?.geometry?.coordinates) {
              const [lng, lat] = result.result.geometry.coordinates;
              onLocationSelect([lng, lat], result.result?.place_name);
            }
          }}
        />

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            longitude={selectedLocation[0]}
            latitude={selectedLocation[1]}
            color="#1967d2"
            scale={1.2}
          />
        )}
      </Map>

      {/* Loading indicator placeholder */}
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
            bgcolor: "rgba(255, 255, 255, 0.8)",
            zIndex: 10,
          }}
        >
          Loading map data...
        </Box>
      )}
    </Box>
  );
}
