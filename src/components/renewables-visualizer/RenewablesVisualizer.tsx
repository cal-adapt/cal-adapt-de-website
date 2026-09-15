/**
 * Renewables Visualizer - Map-First Edition
 *
 * Redesigned as a map-first planning tool for renewable resource stress analysis.
 * Supports three modes:
 * 1. Seasonal generation potential
 * 2. Low-generation days
 * 3. Coincident solar & wind stress (signature feature)
 *
 * Users start with a statewide map showing a meaningful default layer,
 * then select a location to see details in a responsive inspector panel.
 */

"use client";

import React, { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import PageLayout from "@/components/dashboard/PageLayout";
import {
  getMode,
  RENEWABLE_MODES,
  RenewableMode,
} from "@/data/renewables-visualizer/dataset-adapter";

import ModeSelector from "./ModeSelector";
import RenewablesMapContainer from "./RenewablesMapContainer";

import styles from "./RenewablesVisualizer.module.scss";

type Coordinates = [number, number]; // [lng, lat]

export default function RenewablesVisualizer() {
  // Mode selection
  const [selectedMode, setSelectedMode] = useState<RenewableMode>("seasonal-generation");
  const modeDefinition = useMemo(() => getMode(selectedMode), [selectedMode]);

  // Location selection
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [selectedLocationName, setSelectedLocationName] = useState<string | null>(null);

  // Global warming level (for now, 1.5°C is default)
  const [gwlIndex, setGwlIndex] = useState<number>(1);

  // Loading states
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Inspector panel visibility (auto-open on desktop, user-controlled on mobile)
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Compare mode: pick two locations and see how they differ from each other
  const [compareMode, setCompareMode] = useState(false);
  const [locationA, setLocationA] = useState<Coordinates | null>(null);
  const [locationNameA, setLocationNameA] = useState<string | null>(null);
  const [locationB, setLocationB] = useState<Coordinates | null>(null);
  const [locationNameB, setLocationNameB] = useState<string | null>(null);

  const handleModeChange = (newMode: RenewableMode) => {
    setSelectedMode(newMode);
    // Clear selection when switching modes
    setSelectedLocation(null);
    setSelectedLocationName(null);
    setInspectorOpen(false);
  };

  const handleLocationSelect = (location: Coordinates, name?: string) => {
    setSelectedLocation(location);
    setSelectedLocationName(name || `${location[1].toFixed(2)}, ${location[0].toFixed(2)}`);
    setInspectorOpen(true);
  };

  const handleCloseInspector = () => {
    setInspectorOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    setSelectedLocationName(null);
    setInspectorOpen(false);
  };

  const handleClearCompare = () => {
    setLocationA(null);
    setLocationNameA(null);
    setLocationB(null);
    setLocationNameB(null);
  };

  const handleCompareToggle = (enabled: boolean) => {
    setCompareMode(enabled);
    if (enabled) {
      // Carry over an existing single selection as Location A instead of
      // discarding it, so users don't lose their place when switching modes.
      if (selectedLocation) {
        setLocationA(selectedLocation);
        setLocationNameA(selectedLocationName);
      }
      setSelectedLocation(null);
      setSelectedLocationName(null);
      setInspectorOpen(false);
    } else {
      handleClearCompare();
    }
  };

  const handleCompareLocationSelect = (location: Coordinates, name?: string) => {
    const label = name || `${location[1].toFixed(2)}, ${location[0].toFixed(2)}`;
    // Fill A first, then B; once both are set, further picks replace B so A stays anchored.
    if (!locationA) {
      setLocationA(location);
      setLocationNameA(label);
    } else if (!locationB) {
      setLocationB(location);
      setLocationNameB(label);
    } else {
      setLocationB(location);
      setLocationNameB(label);
    }
  };

  return (
    <PageLayout title="Renewables Visualizer">
      <Box className={styles.container}>
        {/* Introduction Section */}
        <Box className={styles.introSection}>
          <Container maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom>
              Renewable Resource Stress
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Explore how solar and wind generation potential changes across California under
              different climate scenarios. Select a location to see seasonal patterns,
              low-generation risk periods, and times when renewable resources coincide.
            </Typography>
          </Container>
        </Box>

        {/* Mode Selector */}
        <Box className={styles.modeSelector}>
          <Container maxWidth="lg">
            <ModeSelector
              selectedMode={selectedMode}
              onModeChange={handleModeChange}
              modes={RENEWABLE_MODES}
            />
          </Container>
        </Box>

        {/* Main Map & Inspector Layout */}
        <Box className={styles.mainContent}>
          <RenewablesMapContainer
            selectedMode={selectedMode}
            modeDefinition={modeDefinition}
            selectedLocation={selectedLocation}
            selectedLocationName={selectedLocationName}
            onLocationSelect={handleLocationSelect}
            inspectorOpen={inspectorOpen}
            onCloseInspector={handleCloseInspector}
            onClearSelection={handleClearSelection}
            gwlIndex={gwlIndex}
            onGwlChange={setGwlIndex}
            isLoading={isLoadingMap}
            onLoadingChange={setIsLoadingMap}
            error={mapError}
            onErrorChange={setMapError}
            compareMode={compareMode}
            onCompareToggle={handleCompareToggle}
            locationA={locationA}
            locationNameA={locationNameA}
            locationB={locationB}
            locationNameB={locationNameB}
            onCompareLocationSelect={handleCompareLocationSelect}
            onClearCompare={handleClearCompare}
          />
        </Box>
      </Box>
    </PageLayout>
  );
}
