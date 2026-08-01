"use client";

import { useEffect, useRef, useState } from "react";

import CloseIcon from "@mui/icons-material/Close";

import Link from "@/components/common/ui/Link";
import { ANALYTICS_ENGINE_URL } from "@/config/constants";

import styles from "./SiteBanner.module.scss";

export default function SiteBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (dismissed) {
      root.style.setProperty("--banner-height", "0px");
      return;
    }

    const element = ref.current;
    if (!element) return;

    const updateHeight = () => {
      root.style.setProperty("--banner-height", `${element.offsetHeight}px`);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div ref={ref} className={styles.banner} role="region" aria-label="Site announcement">
      <p className={styles.message}>
        The Cal-Adapt: Analytics Engine website has a new look and improved navigation.{" "}
        <Link className={styles.link} href={ANALYTICS_ENGINE_URL}>
          Explore the new site!
        </Link>
      </p>
      <button
        type="button"
        className={styles.dismiss}
        aria-label="Dismiss announcement"
        onClick={() => setDismissed(true)}
      >
        <CloseIcon fontSize="small" />
      </button>
    </div>
  );
}
