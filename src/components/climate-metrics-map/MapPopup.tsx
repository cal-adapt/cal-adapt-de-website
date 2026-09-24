// MapPopup
// A styled popup component displayed on the Mapbox map.
// Shows mean/min/max climate data values at the clicked point, or a loading spinner / no-data alert based on state.

"use client";

import { useMemo } from "react";

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";

import { Popup } from "react-map-gl/mapbox";

import Alert from "@/components/common/ui/Alert";
import LoadingSpinner from "@/components/common/ui/LoadingSpinner";

import styles from "./MapPopup.module.scss";

type StatLabels = {
  min: string;
  mean: string;
  max: string;
};

const DEFAULT_STAT_LABELS: StatLabels = {
  min: "Min*",
  mean: "Mean*",
  max: "Max*",
};

type MapPopupProps = {
  longitude: number;
  latitude: number;
  value: number | null;
  min: number | null;
  max: number | null;
  title: string;
  statLabels?: StatLabels;
  isPopupLoading: boolean;
  onClose: () => void;
  isDataValid: boolean;
};

export default function MapPopup({
  longitude,
  latitude,
  value,
  min,
  max,
  title,
  statLabels = DEFAULT_STAT_LABELS,
  isPopupLoading,
  onClose,
  isDataValid,
}: MapPopupProps) {
  const formattedMin = useMemo(() => min?.toFixed(2), [min]);
  const formattedValue = useMemo(() => value?.toFixed(2), [value]);
  const formattedMax = useMemo(() => max?.toFixed(2), [max]);

  return (
    <Popup
      className={styles.mapPopup}
      longitude={longitude}
      latitude={latitude}
      closeButton={false}
      anchor="bottom"
      aria-label={`Climate data popup for coordinates ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
    >
      <div className={styles.inner}>
        {isPopupLoading && <LoadingSpinner />}

        {!isPopupLoading && isDataValid && (
          <>
            <div className={styles.description}>
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
            <div className={styles.values}>
              {min != null && (
                <div className={styles.value}>
                  <Typography variant="h5">{formattedMin}</Typography>
                  <Typography variant="body2">{statLabels.min}</Typography>
                </div>
              )}
              {value != null && (
                <div className={styles.value}>
                  <Typography variant="h4">{formattedValue}</Typography>
                  <Typography variant="body2">{statLabels.mean}</Typography>
                </div>
              )}
              {max != null && (
                <div className={styles.value}>
                  <Typography variant="h5">{formattedMax}</Typography>
                  <Typography variant="body2">{statLabels.max}</Typography>
                </div>
              )}
            </div>

            <div className={styles.title}>
              <Typography variant="caption">*Value across models</Typography>
            </div>
          </>
        )}

        {!isPopupLoading && !isDataValid && (
          <Alert style={{ marginBottom: 0 }}>No data is available for this location</Alert>
        )}
      </div>
    </Popup>
  );
}
