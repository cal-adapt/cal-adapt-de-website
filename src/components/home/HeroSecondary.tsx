"use client";

import useMediaQuery from "@mui/material/useMediaQuery";

import clsx from "clsx";

import Button from "@/components/common/ui/Button";
import { mediaQueries } from "@/utils/styles";

import styles from "./HeroSecondary.module.scss";

export default function HeroSecondary() {
  const isMobile = useMediaQuery(mediaQueries.max.large);

  return (
    <div className={styles.heroSecondary}>
      <div className={styles.background}>
        <video
          autoPlay
          muted
          loop
          playsInline
          //poster="/fallback-image.jpg"
        >
          <source src="/img/homepage-misc/wildfire-footage.webm" type="video/webm" />
          Your browser does not support the video tag
        </video>
      </div>
      <div className={styles.content}>
        <h2>Mapping Wildfire Weather</h2>
        <p>
          The Climate Metrics Map tool provides an interactive map to visualize key climate
          indicators, including the Fosberg Fire Weather Index (FFWI), helping users explore
          wildfire weather across California.
        </p>
        <Button
          variant="secondary"
          className={clsx({ hidden: isMobile })}
          href="/dashboard/climate-metrics-map?metric=fire-weather"
        >
          See it in the Climate Metrics Map
        </Button>
      </div>
    </div>
  );
}
