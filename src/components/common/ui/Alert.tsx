"use client";

import MuiAlert, { AlertColor } from "@mui/material/Alert";

import clsx from "clsx";

import styles from "./Alert.module.scss";

export type AlertVariant = "info" | "primaryBlue" | "infoYellow" | "secondaryReversed" | "grey";
export type AlertSeverity = "info" | "warning" | "error" | "success";

export interface AlertProps {
  variant?: AlertVariant;
  severity?: AlertSeverity;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  ariaLabel?: string;
}

export default function Alert({
  variant = "info",
  severity = "info",
  className,
  style,
  children,
  ariaLabel,
}: AlertProps) {
  return (
    <MuiAlert
      className={clsx(styles.alert, className)}
      variant="filled"
      severity={severity}
      color={variant as AlertColor}
      style={style}
      aria-label={ariaLabel}
    >
      <div className={styles.children}>{children}</div>
    </MuiAlert>
  );
}
