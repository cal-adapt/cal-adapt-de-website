// MapPopup
// A styled popup component displayed on the Mapbox map.
// Shows mean/min/max climate data values at the clicked point, or a loading spinner / no-data alert based on state.

"use client";

import { useMemo } from "react";

import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { Popup } from "react-map-gl/mapbox";

import LoadingSpinner from "@/components/global/LoadingSpinner";

import "@/styles/dashboard/mapbox-map.scss";

type MapPopupProps = {
  longitude: number;
  latitude: number;
  value: number;
  min: number | null;
  max: number | null;
  title: string;
  isPopupLoading: boolean;
  onClose: () => void;
  isDataValid: boolean;
};

export const MapPopup = ({
  longitude,
  latitude,
  value,
  min,
  max,
  title,
  isPopupLoading,
  onClose,
  isDataValid,
}: MapPopupProps) => {
  const formattedMin = useMemo(() => min?.toFixed(2), [min]);
  const formattedValue = useMemo(() => value.toFixed(2), [value]);
  const formattedMax = useMemo(() => max?.toFixed(2), [max]);

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      closeButton={false}
      anchor="bottom"
      className="map-popup"
      aria-label={`Popup with information for [${longitude},${latitude}`}
    >
      <div className="map-popup_container">
        {isPopupLoading && <LoadingSpinner />}

        {!isPopupLoading && isDataValid && (
          <>
            <div className="description">
              <Typography variant="body2">{title}</Typography>
            </div>
            <div
              className="close"
              style={{
                position: "absolute",
                float: "right",
                top: "10px",
                right: "10px",
              }}
            >
              <IconButton size="small" onClick={onClose} aria-label="Close popup">
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
            <div className="values">
              {min != null && (
                <div className="value">
                  <Typography variant="h5">{formattedMin}</Typography>
                  <Typography variant="body2">Min*</Typography>
                </div>
              )}
              {min != null && (
                <div className="value">
                  <Typography variant="h4">{formattedValue}</Typography>
                  <Typography variant="body2">Mean*</Typography>
                </div>
              )}
              {max != null && (
                <div className="value">
                  <Typography variant="h5">{formattedMax}</Typography>
                  <Typography variant="body2">Max*</Typography>
                </div>
              )}
            </div>

            <div className="title">
              <Typography variant="caption">*Value across models</Typography>
            </div>
          </>
        )}

        {!isPopupLoading && !isDataValid && (
          <Alert
            className="alerts alerts-100"
            style={{ marginBottom: "0" }}
            variant="filled"
            severity="info"
            color="secondaryReversed"
          >
            No data is available for this location
          </Alert>
        )}
      </div>
    </Popup>
  );
};
