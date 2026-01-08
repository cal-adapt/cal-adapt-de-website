"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Fab from "@mui/material/Fab";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";

import { mediaQueries } from "@/utils/styles";

import styles from "./ToolCarousel.module.scss";

export type CarouselData = {
  id: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  link: string;
};

type ToolCarouselProps = {
  data: CarouselData[];
};

export default function ToolCarousel({ data }: ToolCarouselProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbHeight, setThumbHeight] = useState("0px");
  const [thumbTop, setThumbTop] = useState("0px");
  const trackRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery(mediaQueries.max.large);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const path = event.currentTarget.getAttribute("data-path");
    if (path) {
      window.open(path, "_blank", "noopener,noreferrer");
    }
  };

  const scrollToItem = (index: number) => {
    const el = listRef.current?.children[index] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const updateScrollbar = () => {
    const listEl = listRef.current;
    const trackEl = trackRef.current;

    if (!listEl || !trackEl) return;

    const totalItems = data.length;
    const trackHeight = trackEl.clientHeight;

    const thumbH = trackHeight / totalItems;
    const thumbT = (activeIndex / totalItems) * trackHeight;

    setThumbHeight(`${thumbH}px`);
    setThumbTop(`${thumbT}px`);
  };

  useEffect(() => {
    updateScrollbar();
  }, [activeIndex]);

  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    skipSnaps: false,
    loop: true, // or true if you want infinite
  });

  if (isMobile) {
    return (
      <div className={clsx(styles.exploreContainer, styles.mobile)} style={{ padding: "0 30px" }}>
        <Typography className={styles.leftPanelTitle} variant="h5">
          Explore
        </Typography>
        <div className="embla" ref={emblaRef} style={{ padding: "30px 0" }}>
          <div className="embla__container">
            {data.map((item) => (
              <div key={item.title} className="embla__slide">
                <div className={styles.rightPanel}>
                  <div className={styles.rightPanelImage}>
                    <Image src={item.image} alt={item.imageAlt} fill />
                  </div>

                  <div className={styles.rightPanelPreviewBox}>
                    <div className={styles.content}>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography variant="body1">{item.description}</Typography>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.exploreContainer}>
        <div className={styles.leftPanel}>
          <Typography variant="h5">Explore</Typography>
          <div className={styles.listContainer}>
            <div className={styles.scrollableList} ref={listRef}>
              {data.map((item, index) => (
                <div
                  key={item.id}
                  className={clsx(styles.listItem, {
                    [styles.active]: index === activeIndex,
                  })}
                  onClick={() => {
                    setActiveIndex(index);
                    scrollToItem(index);
                  }}
                >
                  {item.title}
                </div>
              ))}
            </div>

            <div className={styles.scrollWrapper}>
              <button
                className={styles.scrollArrow}
                onClick={() => {
                  if (activeIndex > 0) {
                    const newIndex = activeIndex - 1;
                    setActiveIndex(newIndex);
                    scrollToItem(newIndex);
                  }
                }}
              >
                <KeyboardArrowUpIcon />
              </button>

              <div className={styles.scrollbarTrack} ref={trackRef}>
                <div
                  className={styles.scrollbarThumb}
                  style={{ height: thumbHeight, top: thumbTop }}
                />
              </div>

              <button
                className={styles.scrollArrow}
                onClick={() => {
                  if (activeIndex < data.length - 1) {
                    const newIndex = activeIndex + 1;
                    setActiveIndex(newIndex);
                    scrollToItem(newIndex);
                  }
                }}
              >
                <KeyboardArrowDownIcon />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.rightPanelImage}>
            <Image src={data[activeIndex].image} alt={data[activeIndex].imageAlt} fill />
          </div>

          <div className={styles.rightPanelPreviewBox}>
            <div className={styles.content}>
              <Typography variant="h6">{data[activeIndex].title}</Typography>
              <Typography variant="body1">{data[activeIndex].description}</Typography>
            </div>
            <Fab
              className={styles.linkButton}
              data-path={data[activeIndex].link}
              color="primaryBlue"
              onClick={handleClick}
              sx={{ float: "right" }}
              aria-label="Explore metric"
              size="medium"
            >
              <ArrowForwardOutlinedIcon />
            </Fab>
          </div>
        </div>
      </div>
    );
  }
}
