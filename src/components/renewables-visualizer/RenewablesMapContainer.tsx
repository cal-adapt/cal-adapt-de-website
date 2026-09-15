/**
 * Renewables Map Container
 *
 * Main layout component combining:
 * - Map displaying statewide renewable resource data
 * - Location inspector panel (right drawer on desktop, bottom sheet on mobile)
 * - Loading, error, and empty states
 *
 * Responsive design ensures inspector doesn't hide map on small screens.
 */

"use client";

import React, { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import LocationOffIcon from "@mui/icons-material/LocationOff";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import Alert from "@/components/common/ui/Alert";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import { ModeDefinition, RenewableMode } from "@/data/renewables-visualizer/dataset-adapter";

import LocationCompare from "./LocationCompare";
import LocationInspector from "./LocationInspector";
import RenewablesMap from "./RenewablesMap";

import styles from "./RenewablesMapContainer.module.scss";

type Coordinates = [number, number]; // [lng, lat]

interface RenewablesMapContainerProps {
  selectedMode: RenewableMode;
  modeDefinition: ModeDefinition;
  selectedLocation: Coordinates | null;
  selectedLocationName: string | null;
  onLocationSelect: (location: Coordinates, name?: string) => void;
  inspectorOpen: boolean;
  onCloseInspector: () => void;
  onClearSelection: () => void;
  gwlIndex: number;
  onGwlChange: (index: number) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  error: string | null;
  onErrorChange: (error: string | null) => void;
  compareMode: boolean;
  onCompareToggle: (enabled: boolean) => void;
  locationA: Coordinates | null;
  locationNameA: string | null;
  locationB: Coordinates | null;
  locationNameB: string | null;
  onCompareLocationSelect: (location: Coordinates, name?: string) => void;
  onClearCompare: () => void;
}

export default function RenewablesMapContainer({
  selectedMode,
  modeDefinition,
  selectedLocation,
  selectedLocationName,
  onLocationSelect,
  inspectorOpen,
  onCloseInspector,
  onClearSelection,
  gwlIndex,
  onGwlChange,
  isLoading,
  onLoadingChange,
  error,
  onErrorChange,
  compareMode,
  onCompareToggle,
  locationA,
  locationNameA,
  locationB,
  locationNameB,
  onCompareLocationSelect,
  onClearCompare,
}: RenewablesMapContainerProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Map is ready immediately; no async load to simulate.
  const [mapReady] = useState(true);

  // Drawer variant changes based on screen size
  const drawerVariant = isDesktop ? ("permanent" as const) : ("temporary" as const);
  const inspectorWidth = 480;
  const inspectorTransitionMs = 600;

  const panelOpen = compareMode ? Boolean(locationA || locationB) : inspectorOpen;
  const panelTitle = compareMode ? "Compare Locations" : "Location Details";
  const hasAnySelection = compareMode ? Boolean(locationA || locationB) : Boolean(selectedLocation);
  const handleClear = compareMode ? onClearCompare : onClearSelection;
  const handleClosePanel = compareMode ? onClearCompare : onCloseInspector;

  const panelContent = compareMode ? (
    locationA && locationNameA && locationB && locationNameB ? (
      <LocationCompare
        locationA={locationA}
        locationNameA={locationNameA}
        locationB={locationB}
        locationNameB={locationNameB}
        modeDefinition={modeDefinition}
        gwlIndex={gwlIndex}
        onClear={onClearCompare}
      />
    ) : (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="textSecondary">
          {locationA
            ? "Location A set - click the map (or search) to pick Location B."
            : "Click the map (or search) to pick Location A, then Location B."}
        </Typography>
      </Box>
    )
  ) : (
    selectedLocation &&
    selectedLocationName && (
      <LocationInspector
        location={selectedLocation}
        locationName={selectedLocationName}
        mode={selectedMode}
        modeDefinition={modeDefinition}
        gwlIndex={gwlIndex}
      />
    )
  );

  return (
    <Box className={styles.container}>
      {/* Error Alert */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert variant="error" onClose={() => onErrorChange(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Main Layout - Map + Inspector */}
      <Box
        className={styles.mainLayout}
        sx={{
          display: "flex",
          gap: 2,
          height: "70vh",
          minHeight: "500px",
          "@media (max-width: 768px)": {
            height: "50vh",
          },
        }}
      >
        {/* Map Container */}
        <Box
          className={styles.mapContainer}
          sx={{
            flex: isDesktop && panelOpen ? `1 1 calc(100% - ${inspectorWidth}px)` : "1 1 100%",
            position: "relative",
            borderRadius: 1,
            overflow: "hidden",
            boxShadow: 1,
            transition: `flex ${inspectorTransitionMs}ms ease`,
          }}
        >
          {!mapReady ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <LoadingSpinner />
            </Box>
          ) : (
            <RenewablesMap
              selectedMode={selectedMode}
              modeDefinition={modeDefinition}
              gwlIndex={gwlIndex}
              selectedLocation={selectedLocation}
              onLocationSelect={onLocationSelect}
              onLoadingChange={onLoadingChange}
              isLoading={isLoading}
              compareMode={compareMode}
              locationA={locationA}
              locationB={locationB}
              onCompareLocationSelect={onCompareLocationSelect}
            />
          )}

          {/* Map toolbar - a "nav bar" row above the search bar: clear button
              (when a selection exists) and the compare-mode toggle as two
              separate fields. Pushed down out of the way is the Mapbox
              geocoder search box (see RenewablesMap.module.scss for the offset). */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {hasAnySelection && (
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<LocationOffIcon fontSize="small" />}
                onClick={handleClear}
                sx={{ boxShadow: 2 }}
              >
                {compareMode ? "Clear Comparison" : "Clear Selection"}
              </Button>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "background.paper",
                borderRadius: 1,
                boxShadow: 2,
                px: 1,
                py: 0.5,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={compareMode}
                    onChange={(e) => onCompareToggle(e.target.checked)}
                  />
                }
                label="Compare two locations"
                sx={{ mr: 0 }}
              />
            </Box>
          </Box>

          {/* Mobile Inspector Toggle Button (only show when closed on mobile) */}
          {!isDesktop && !panelOpen && hasAnySelection && (
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                right: 16,
                zIndex: 10,
              }}
            >
              <IconButton
                color="primary"
                variant="contained"
                sx={{
                  bgcolor: "background.paper",
                  boxShadow: 2,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={() => {
                  // Re-open inspector on mobile
                }}
              >
                <CloseIcon style={{ transform: "rotate(45deg)" }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Location Inspector / Compare Panel (Desktop) */}
        {isDesktop && (
          <Box
            className={styles.inspectorBox}
            sx={{
              width: panelOpen ? inspectorWidth : 0,
              opacity: panelOpen ? 1 : 0,
              transition: `width ${inspectorTransitionMs}ms ease, opacity ${inspectorTransitionMs}ms ease`,
              borderRadius: 1,
              boxShadow: 1,
              bgcolor: "background.paper",
              overflow: "auto",
              flexShrink: 0,
              "@media (max-width: 768px)": {
                display: "none",
              },
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>{panelTitle}</h3>
                <IconButton size="small" onClick={handleClosePanel}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            {panelContent}
          </Box>
        )}
      </Box>

      {/* Mobile Inspector / Compare Drawer */}
      {!isDesktop && (
        <Drawer
          anchor="bottom"
          open={panelOpen}
          onClose={handleClosePanel}
          className={styles.mobileDrawer}
          transitionDuration={{ enter: inspectorTransitionMs, exit: inspectorTransitionMs * 0.7 }}
          sx={{
            "& .MuiDrawer-paper": {
              maxHeight: "80vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>{panelTitle}</h3>
              <IconButton size="small" onClick={handleClosePanel}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          {panelContent}
        </Drawer>
      )}
    </Box>
  );
}
