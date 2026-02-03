"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import useMediaQuery from "@mui/material/useMediaQuery";

import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";

import Button from "@/components/common/ui/Button";
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
        <h5 className={styles.leftPanelTitle}>Explore</h5>
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
                      <h6>{item.title}</h6>
                      <p>{item.description}</p>
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
          <h5>Explore</h5>
          <div className={styles.listContainer}>
            <div className={styles.scrollableList} ref={listRef}>
              {data.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={clsx(styles.listItem, {
                    [styles.active]: index === activeIndex,
                  })}
                  onClick={() => {
                    setActiveIndex(index);
                    scrollToItem(index);
                  }}
                  aria-pressed={index === activeIndex}
                  aria-label={`View ${item.title}`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            <div className={styles.scrollWrapper}>
              <Button
                className={styles.scrollArrow}
                onClick={() => {
                  if (activeIndex > 0) {
                    const newIndex = activeIndex - 1;
                    setActiveIndex(newIndex);
                    scrollToItem(newIndex);
                  }
                }}
                ariaLabel="Previous item"
                disabled={activeIndex === 0}
              >
                <KeyboardArrowUpIcon aria-hidden="true" />
              </Button>

              <div className={styles.scrollbarTrack} ref={trackRef}>
                <div
                  className={styles.scrollbarThumb}
                  style={{ height: thumbHeight, top: thumbTop }}
                />
              </div>

              <Button
                className={styles.scrollArrow}
                onClick={() => {
                  if (activeIndex < data.length - 1) {
                    const newIndex = activeIndex + 1;
                    setActiveIndex(newIndex);
                    scrollToItem(newIndex);
                  }
                }}
                ariaLabel="Next item"
                disabled={activeIndex === data.length - 1}
              >
                <KeyboardArrowDownIcon aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.rightPanelImage}>
            <Image src={data[activeIndex].image} alt={data[activeIndex].imageAlt} fill />
          </div>

          <div className={styles.rightPanelPreviewBox}>
            <div className={styles.content}>
              <h6>{data[activeIndex].title}</h6>
              <p>{data[activeIndex].description}</p>
            </div>
            <Button
              className={styles.linkButton}
              data-path={data[activeIndex].link}
              variant="floating"
              onClick={handleClick}
              ariaLabel={`Open ${data[activeIndex].title} in new tab`}
            >
              <ArrowForwardOutlinedIcon aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
