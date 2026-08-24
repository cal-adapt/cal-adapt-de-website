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

import React, { useEffect, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import LoadingSpinner from "@/components/common/ui/LoadingSpinner";
import Alert from "@/components/common/ui/Alert";
import { ModeDefinition, RenewableMode } from "@/data/renewables-visualizer/dataset-adapter";

import RenewablesMap from "./RenewablesMap";
import LocationInspector from "./LocationInspector";

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
  gwlIndex: number;
  onGwlChange: (index: number) => void;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  error: string | null;
  onErrorChange: (error: string | null) => void;
}

export default function RenewablesMapContainer({
  selectedMode,
  modeDefinition,
  selectedLocation,
  selectedLocationName,
  onLocationSelect,
  inspectorOpen,
  onCloseInspector,
  gwlIndex,
  onGwlChange,
  isLoading,
  onLoadingChange,
  error,
  onErrorChange,
}: RenewablesMapContainerProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // For demonstration, we'll track if the map is ready
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Simulate map loading
    setMapReady(true);
  }, []);

  // Drawer variant changes based on screen size
  const drawerVariant = isDesktop ? ("permanent" as const) : ("temporary" as const);
  const inspectorWidth = 360;

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
            flex: isDesktop && inspectorOpen ? `1 1 calc(100% - ${inspectorWidth}px)` : "1 1 100%",
            position: "relative",
            borderRadius: 1,
            overflow: "hidden",
            boxShadow: 1,
            transition: "flex 0.3s ease",
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
            />
          )}

          {/* Mobile Inspector Toggle Button (only show when closed on mobile) */}
          {!isDesktop && !inspectorOpen && selectedLocation && (
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

        {/* Location Inspector Panel (Desktop) */}
        {isDesktop && (
          <Box
            className={styles.inspectorBox}
            sx={{
              width: inspectorWidth,
              display: inspectorOpen ? "block" : "none",
              borderRadius: 1,
              boxShadow: 1,
              bgcolor: "background.paper",
              overflow: "auto",
              "@media (max-width: 768px)": {
                display: "none",
              },
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>Location Details</h3>
                <IconButton size="small" onClick={onCloseInspector}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            {selectedLocation && selectedLocationName && (
              <LocationInspector
                location={selectedLocation}
                locationName={selectedLocationName}
                mode={selectedMode}
                modeDefinition={modeDefinition}
                gwlIndex={gwlIndex}
              />
            )}
          </Box>
        )}
      </Box>

      {/* Mobile Inspector Drawer */}
      {!isDesktop && (
        <Drawer
          anchor="bottom"
          open={inspectorOpen}
          onClose={onCloseInspector}
          className={styles.mobileDrawer}
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
              <h3 style={{ margin: 0 }}>Location Details</h3>
              <IconButton size="small" onClick={onCloseInspector}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          {selectedLocation && selectedLocationName && (
            <LocationInspector
              location={selectedLocation}
              locationName={selectedLocationName}
              mode={selectedMode}
              modeDefinition={modeDefinition}
              gwlIndex={gwlIndex}
            />
          )}
        </Drawer>
      )}
    </Box>
  );
}
