"use client";

import * as React from "react";
import Image from "next/image";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import "@/styles/home/image-text.scss";

function ImageText() {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const path = event.currentTarget.getAttribute("data-path");
    if (path) {
      window.open(path, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="image-text">
      <div className="image-text__img">
        <Image
          src="/img/homepage-misc/desert-landscape.webp"
          alt={"An image of a water stream in a desert landscape"}
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="image-text__content">
        <Typography variant="h2">Fueling Innovation</Typography>
        <Typography style={{ paddingLeft: "10px" }} variant="body1">
          The California Energy Commission supports research projects that
          advance climate data development and enhance Cal-Adapt for improved
          climate planning in California.
        </Typography>
        <Button
          data-path="https://cmip5.cal-adapt.org/grants"
          variant="contained"
          color="secondary"
          onClick={handleClick}
        >
          Learn About Our Grants
        </Button>
      </div>
    </div>
  );
}

export default ImageText;
