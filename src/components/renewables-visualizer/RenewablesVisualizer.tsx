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
import { RENEWABLE_MODES, RenewableMode, getMode } from "@/data/renewables-visualizer/dataset-adapter";

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
            gwlIndex={gwlIndex}
            onGwlChange={setGwlIndex}
            isLoading={isLoadingMap}
            onLoadingChange={setIsLoadingMap}
            error={mapError}
            onErrorChange={setMapError}
          />
        </Box>
      </Box>
    </PageLayout>
  );
}
