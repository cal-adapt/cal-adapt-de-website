"use client";
import * as React from "react";

import useMediaQuery from "@mui/material/useMediaQuery";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import "@/styles/home/hero-secondary.scss";

function HeroSecondary() {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const path = event.currentTarget.getAttribute("data-path");
    if (path) {
      window.open(path, "_blank", "noopener,noreferrer");
    }
  };

  const isMobile = useMediaQuery("(max-width:992px)");

  return (
    <div className="secondary-hero">
      <div className="secondary-hero__bg">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="bg-video"
          //poster="/fallback-image.jpg"
        >
          <source src="/img/homepage-misc/wildfire-footage.webm" type="video/webm" />
          Your browser does not support the video tag
        </video>
      </div>
      <div className="secondary-hero__content">
        <Typography variant="h2">Mapping Wildfire Weather</Typography>
        <Typography variant="body1">
          The Data Explorer Tool provides an interactive map to visualize key climate indicators,
          including the Fosberg Fire Weather Index (FFWI), helping users explore wildfire weather
          across California.
        </Typography>
        <Button
          className={isMobile ? "hidden" : ""}
          data-path="/dashboard/data-explorer?metric=fire-weather"
          variant="contained"
          color="primary"
          onClick={handleClick}
        >
          See it in the Data Explorer
        </Button>
      </div>
    </div>
  );
}

export default HeroSecondary;
