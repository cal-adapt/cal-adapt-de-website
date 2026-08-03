"use client";

import { useEffect, useState } from "react";

import Button from "@/components/common/ui/Button";
import Icon from "@/components/common/ui/Icon";
import Link from "@/components/common/ui/Link";
import { ANALYTICS_ENGINE_URL } from "@/config/constants";

import styles from "./SiteBanner.module.scss";

export default function SiteBanner() {
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
    <div className={styles.banner} role="region" aria-label="Site announcement">
      <p className={styles.message}>
        The Cal-Adapt: Analytics Engine website has a new look and improved navigation.{" "}
        <Link className={styles.link} href={ANALYTICS_ENGINE_URL}>
          Explore the new site!
        </Link>
      </p>
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
