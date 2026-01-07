"use client";

import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import clsx from "clsx";

import Button from "@/components/common/ui/Button";

import styles from "./HeroSecondary.module.scss";

export default function HeroSecondary() {
  const isMobile = useMediaQuery("(max-width:992px)");

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
        <Typography variant="h2">Mapping Wildfire Weather</Typography>
        <Typography variant="body1">
          The Data Explorer Tool provides an interactive map to visualize key climate indicators,
          including the Fosberg Fire Weather Index (FFWI), helping users explore wildfire weather
          across California.
        </Typography>
        <Button
          variant="secondary"
          className={clsx({ hidden: isMobile })}
          href="/dashboard/data-explorer?metric=fire-weather"
        >
          See it in the Data Explorer
        </Button>
      </div>
    </div>
  );
}
