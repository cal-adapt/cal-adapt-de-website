"use client";

import { useEffect, useState } from "react";

import type { ReactNode } from "react";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";

import styles from "./SiteBanner.module.scss";

export interface SiteBannerProps {
  children: ReactNode;
  ariaLabel?: string;
}

export default function SiteBanner({ children, ariaLabel = "announcement" }: SiteBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissed) return;

    const root = document.documentElement;
    root.style.setProperty("--banner-height", "0px");
    return () => {
      root.style.removeProperty("--banner-height");
    };
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className={styles.banner} role="region" aria-label={ariaLabel}>
      <p className={styles.message}>{children}</p>
      <Button
        variant="tertiary"
        size="small"
        svgOnly
        className={styles.dismiss}
        ariaLabel="Dismiss announcement"
        onClick={() => setDismissed(true)}
      >
        <Icon variant="close" className={styles.dismissIcon} aria-hidden />
      </Button>
    </div>
  );
}
