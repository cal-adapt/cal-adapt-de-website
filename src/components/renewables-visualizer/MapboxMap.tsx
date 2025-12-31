"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Fade from "@mui/material/Fade";

import * as turf from "@turf/turf";

import { Map, MapMouseEvent, MapRef, Marker, NavigationControl, ScaleControl } from "react-map-gl";

import { useInstallationPrms } from "@/context/InstallationParamsContext";
import { usePhotoConfig } from "@/context/PhotoConfigContext";
import { useRes } from "@/context/ResContext";

import HtmlTooltip from "../global/HtmlTooltip";

import GeocoderControl from "./GeocoderControl";

import "mapbox-gl/dist/mapbox-gl.css";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "@/styles/dashboard/mapbox-map.scss";

const INITIAL_VIEW_STATE = {
  longitude: -120.4542,
  latitude: 37.4,
  zoom: 7,
};

const GRID_FILL_COLOR = "rgba(118, 150, 190, 0.8)";

type Location = [number, number];

type MapboxMapProps = {
  locationSelected: Location | null;
  setLocationSelected: (locationSelected: Location | null) => void;
  mapMarker: [number, number] | null;
  setMapMarker: (marker: [number, number] | null) => void;
  width?: number;
  height: number;
  maskStr: string;
};

const MapboxMap = forwardRef<MapRef | null, MapboxMapProps>(
  ({ locationSelected, setLocationSelected, mapMarker, setMapMarker, height, maskStr }, ref) => {
    const { photoConfigSelected } = usePhotoConfig();
    const { installationSelected } = useInstallationPrms();
    const { resSelected } = useRes();

    const mapRef = useRef<MapRef | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const initialViewState = INITIAL_VIEW_STATE;

    // Forward the internal ref to the parent using useImperativeHandle
    useImperativeHandle(ref, () => mapRef.current as MapRef);

    const handleMapLoad = (e: any) => {
      const map = e.target;
      mapRef.current = map;
      setMapLoaded(true);
    };

    // Resize workaround to maintain map center
    const handleMapResize = () => {
      if (mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        mapRef.current.setCenter(currentCenter);
      }
    };

    useEffect(() => {
      if (mapRef.current) {
        mapRef.current.on("resize", handleMapResize);
      }

      return () => {
        if (mapRef.current) {
          mapRef.current.off("resize", handleMapResize);
        }
      };
    }, []);

    // Location update logic from click or marker drag
    const handleLocationUpdate = (coordinates: [number, number]) => {
      if (mapRef.current) {
        const point = mapRef.current.project(coordinates);
        const features = mapRef.current.queryRenderedFeatures(point, {
          layers: ["grid"],
        });

        if (features && features.length > 0) {
          const selectedFeature = features[0];
          const centroid = turf.centroid(selectedFeature).geometry.coordinates;
          setMapMarker([centroid[0], centroid[1]]);
          setLocationSelected(centroid as [number, number]);
        } else {
          console.error("No features found at the clicked location.");
        }
      }
    };

    const handleMapClick = (e: MapMouseEvent) => {
      handleLocationUpdate([e.lngLat.lng, e.lngLat.lat]);
    };

    const handleMarkerDragEnd = (e: { lngLat: { lng: number; lat: number } }) => {
      handleLocationUpdate([e.lngLat.lng, e.lngLat.lat]);
    };

    // Update grid layer nodata cells based on photoConfigSelected and resource
    useEffect(() => {
      if (mapRef.current && mapLoaded) {
        const map = mapRef.current as unknown as mapboxgl.Map; // Type assertion to Mapbox GL JS Map
        const maskAttribute = maskStr;

        if (map) {
          map.setPaintProperty("grid", "fill-color", [
            "case",
            ["==", ["get", maskAttribute], false],
            GRID_FILL_COLOR,
            "rgba(0, 0, 0, 0)",
          ]);
        }
      }
    }, [photoConfigSelected, installationSelected, resSelected, mapLoaded]);

    return (
      <div
        className="map-container"
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        <div id="map">
          <Map
            onLoad={handleMapLoad}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            initialViewState={initialViewState}
            style={{ width: "100%", height }}
            mapStyle="mapbox://styles/cal-adapt/cmabls6jp00lz01qo7uax38cx"
            interactiveLayerIds={["grid"]}
            onClick={handleMapClick}
            scrollZoom={false}
            attributionControl={false}
            minZoom={7}
          >
            {mapMarker && (
              <Marker
                longitude={mapMarker[0]}
                latitude={mapMarker[1]}
                draggable={true}
                onDragEnd={handleMarkerDragEnd}
              />
            )}
            <NavigationControl position="bottom-left" />
            <ScaleControl position="bottom-right" maxWidth={100} unit="metric" />
            <GeocoderControl
              zoom={13}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""}
              position="top-left"
            />
          </Map>
        </div>
        {/* Legend Overlay */}
        <div className="map-container__legend">
          <div className="map-container__legend-color-box"></div>
          <p>Location with land restrictions</p>
          <HtmlTooltip
            textFragment={
              <React.Fragment>
                <p>
                  This location has land use or land cover restrictions. No data will be returned if
                  selected.
                </p>
              </React.Fragment>
            }
            iconFragment={<InfoOutlinedIcon />}
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
            placement="right-end"
          />
        </div>
      </div>
    );
  }
);

MapboxMap.displayName = "MapboxMap";

export default MapboxMap;
