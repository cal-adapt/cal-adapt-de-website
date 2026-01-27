"use client";

import { useEffect, useRef, useState } from "react";

import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import clsx from "clsx";
import { ParallaxBanner, ParallaxBannerLayer } from "react-scroll-parallax";

import Icon from "@/components/common/ui/Icon";
import { mediaQueries } from "@/utils/styles";

import rocks from "../../../public/img/homepage-hero/rocks.webp";
import sky from "../../../public/img/homepage-hero/sky.webp";

import styles from "./HeroMain.module.scss";

export default function HeroMain() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [showSecondary, setShowSecondary] = useState(false);

  const isMobile = useMediaQuery(mediaQueries.max.large);

  useEffect(() => {
    const sentinelNode = sentinelRef.current;
    if (!sentinelNode) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSecondary(!entry.isIntersecting);
      },
      { threshold: 1, rootMargin: "100px 0px 0px 0px" }
    );

    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.heroMain}>
      <div ref={sentinelRef} className={styles.sentinel} />
      <ParallaxBanner style={{ height: "100vh" }}>
        <ParallaxBannerLayer speed={isMobile ? 10 : -8}>
          <img className={styles.layer} width={2560} height={1440} src={sky.src} alt="sky hero" />
        </ParallaxBannerLayer>
        <ParallaxBannerLayer expanded={true} speed={isMobile ? 3 : 6}>
          <div className={styles.rocksContainer}>
            <img
              width={2560}
              height={1440}
              src={rocks.src}
              className={clsx(styles.layer, styles.rocks)}
              alt="joshua tree hero"
            />
          </div>
        </ParallaxBannerLayer>
        <ParallaxBannerLayer>
          <div className={styles.layer}>
            <div className={clsx(styles.intro, { hidden: showSecondary })}>
              <h2 className={styles.headline}>Explore Next-Gen Climate Data</h2>
              <p className={styles.description}>
                Cal-Adapt delivers critical climate data and cutting-edge tools to empower
                communities, researchers, and decision-makers to take action now. As climate impacts
                intensify, we provide the insights needed to adapt, build resilience, and drive
                urgent solutions for a sustainable future.
              </p>
              <div className={styles.scroll}>
                <span className={styles.caption}>Scroll</span>
                <Icon className={styles.mouse} variant="mouse">
                  <title>mouse symbol guiding the user to scroll down</title>
                </Icon>
              </div>
            </div>
            <div className={clsx(styles.secondary, "hidden", { visible: showSecondary })}>
              <h2 className={styles.headline}>Data Driven Tools for a Resilient Future</h2>
            </div>
          </div>
        </ParallaxBannerLayer>
      </ParallaxBanner>
    </div>
  );
}
