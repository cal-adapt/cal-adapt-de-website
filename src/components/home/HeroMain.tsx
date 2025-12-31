"use client";

import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";

import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import { ParallaxBanner, ParallaxBannerLayer } from "react-scroll-parallax";

import mouse from "../../../public/img/homepage-hero/mouse.webp";
import rocks from "../../../public/img/homepage-hero/rocks.webp";
import sky from "../../../public/img/homepage-hero/sky.webp";

import "@/styles/home/hero-main.scss";

function HeroMain() {
  const introTextRef = useRef<HTMLDivElement | null>(null);
  const secTextRef = useRef<HTMLDivElement | null>(null);

  const isMobile = useMediaQuery("(max-width:992px)");

  const handleScroll = useCallback((e: Event): void => {
    const introNode = introTextRef.current;
    if (!introNode) return;

    const secNode = secTextRef.current;
    if (!secNode) return;

    const scrollY = window.scrollY;

    if (scrollY > 119.5) {
      introNode.classList.add("hidden");
      secNode.classList.add("visible");
    } else {
      introNode.classList.remove("hidden");
      secNode.classList.remove("visible");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  return (
    <div className="homepage-hero">
      <ParallaxBanner style={{ height: "100vh" }}>
        <ParallaxBannerLayer speed={isMobile ? 10 : -8}>
          <img
            width={2560}
            height={1440}
            src={sky.src}
            className="layer joshua-hero"
            alt="sky hero"
          />
        </ParallaxBannerLayer>
        <ParallaxBannerLayer expanded={false} speed={isMobile ? 6 : 12}>
          <div className="rocks-container">
            <img
              width={2560}
              height={1440}
              src={rocks.src}
              className="layer rocks"
              alt="joshua tree hero"
            />
          </div>
        </ParallaxBannerLayer>
        <ParallaxBannerLayer>
          <div className="layer text">
            <div ref={introTextRef} className="intro">
              <Typography className="intro__title" variant="h2">
                Explore <nobr>Next-Gen</nobr> Climate Data
              </Typography>
              <Typography className="intro__p">
                Cal-Adapt delivers critical climate data and cutting-edge tools to empower
                communities, researchers, and decision-makers to take action now. As climate impacts
                intensify, we provide the insights needed to adapt, build resilience, and drive
                urgent solutions for a sustainable future.
              </Typography>
              <div className="intro__scroll">
                <Typography variant="caption">Scroll</Typography>
                <Image
                  src={mouse}
                  className="mouse"
                  alt="mouse symbol guiding the user to scroll down"
                />
              </div>
            </div>
            <div ref={secTextRef} className="secondary hidden">
              <Typography className="secondary__title" variant="h2">
                Data Driven Tools for a Resilient Future
              </Typography>
            </div>
          </div>
        </ParallaxBannerLayer>
      </ParallaxBanner>
    </div>
  );
}

export default HeroMain;
