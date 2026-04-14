"use client";

import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

import type { IconVariant } from "@/components/common/ui/Icon";
import Icon from "@/components/common/ui/Icon";
import OctagonAlertFilled from "@/components/common/ui/OctagonAlertFilled";

import styles from "./Alert.module.scss";

export type AlertSeverity = "info" | "warning" | "error" | "success";

const SEVERITY_ICON: Record<AlertSeverity, IconVariant> = {
  info: "alertInfo",
  warning: "alertWarning",
  error: "alertError",
  success: "alertSuccess",
};

export interface AlertProps {
  severity?: AlertSeverity;
  /** Optional control (e.g. button or link) shown below the message, aligned with the text. */
  action?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ariaLabel?: string;
}

export default function Alert({
  severity = "info",
  action,
  className,
  style,
  children,
  ariaLabel,
}: AlertProps) {
  const role = severity === "error" ? "alert" : ariaLabel ? "region" : undefined;
  const iconVariant = SEVERITY_ICON[severity];

  return (
    <div
      className={clsx(styles.alert, styles[severity], className)}
      style={style}
      aria-label={ariaLabel}
      role={role}
    >
      <span className={styles.icon} aria-hidden>
        {severity === "error" ? <OctagonAlertFilled size={20} /> : <Icon variant={iconVariant} />}
      </span>
      <div className={styles.children}>{children}</div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
