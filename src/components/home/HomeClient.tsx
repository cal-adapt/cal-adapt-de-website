"use client";

import { useEffect } from "react";

import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import AOS from "aos";
import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";

import Footer from "@/components/common/layout/Footer";
import Alert from "@/components/common/ui/Alert";
import Card from "@/components/common/ui/Card";
import { analyticsCarouselData } from "@/data/home/analytics-carousel-data";
import { genCarouselData } from "@/data/home/gen-carousel-data";

import HeroSecondary from "./HeroSecondary";
import ImageText from "./ImageText";
import ToolCarousel from "./ToolCarousel";

import "aos/dist/aos.css";
import styles from "./HomeClient.module.scss";

export default function HomeClient() {
  useEffect(() => {
    AOS.init({
      // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
      delay: 0, // values from 0 to 3000, with step 50ms
      duration: 800, // values from 0 to 3000, with step 50ms
      easing: "ease-out-cubic",
    });
  }, []);

  const isMobile = useMediaQuery("(max-width:992px)");

  const carouselsStyle = isMobile
    ? {
        maxWidth: "90vw",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
      }
    : { display: "flex", alignItems: "flex-start", flexDirection: "column" };

  const cardsCarouselClass = isMobile ? "hidden no-height" : `${styles.cards}`;

  const cardsMobileCarouselClass = isMobile ? `${styles["cards-mobile"]}` : "hidden no-height";

  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    skipSnaps: false,
    loop: true, // or true if you want infinite
  });
  return (
    <div className={styles.container}>
      <section>
        <Typography
          sx={{
            textAlign: "center",
            padding: isMobile ? "0 30px" : "0 20vw",
            margin: "0 auto",
          }}
          variant="body1"
        >
          The new Cal-Adapt has been revamped to offer a more modern and intuitive experience for
          exploring peer-reviewed <strong>5th Assessment</strong> climate data. Our platform
          provides interactive visualizations, downloadable datasets, the Analytics Engine and the
          Cal-Adapt API, helping you analyze how climate change may impact California at both state
          and local levels.
        </Typography>
        <div>
          <div className={cardsCarouselClass}>
            <Card
              description="Analyze extreme heat, precipitation, fire weather, and other emerging trends shaping California’s uncertain climate future."
              title="tools"
              cta="#tools"
              img="/img/homepage-cards/card_1.png"
              isNewTab={false}
            />
            <Card
              description="Gain clarity on key concepts like uncertainty, Global Warming Levels, and other essential terms."
              title="guidance"
              cta="https://analytics.cal-adapt.org/guidance/"
              img="/img/homepage-cards/card_2.png"
              isNewTab={true}
            />
            <Card
              description="Learn about the data sources, methods, analyses, and how to access them."
              title="data"
              cta="https://analytics.cal-adapt.org/data/"
              img="/img/homepage-cards/card_3.png"
              isNewTab={true}
            />
          </div>
          <div className={cardsMobileCarouselClass}>
            <div style={{ padding: "0 30px" }}>
              <div className="embla" ref={emblaRef}>
                <div className="embla__container">
                  <div className="embla__slide">
                    <Card
                      description="Analyze extreme heat, precipitation, fire weather, and other emerging trends shaping California’s uncertain climate future."
                      title="tools"
                      cta="#tools"
                      img="/img/homepage-cards/card_1.png"
                      isNewTab={false}
                    />
                  </div>
                  <div className="embla__slide">
                    <Card
                      description="Gain clarity on key concepts like uncertainty, Global Warming Levels, and other essential terms."
                      title="guidance"
                      cta="https://analytics.cal-adapt.org/guidance/"
                      img="/img/homepage-cards/card_2.png"
                      isNewTab={true}
                    />
                  </div>
                  <div className="embla__slide">
                    <Card
                      description="Learn about the data sources, methods, analyses, and how to access them."
                      title="data"
                      cta="https://analytics.cal-adapt.org/data/"
                      img="/img/homepage-cards/card_3.png"
                      isNewTab={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="tools"
        className="blue carousels"
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div className="content" style={carouselsStyle}>
          <Typography variant="h2" style={{ marginBottom: "60px" }}>
            Cal-Adapt&#39;s Tool Array
          </Typography>
          <Typography variant="h4" style={{ marginBottom: "20px" }}>
            Climate Insights for Everyone
          </Typography>
          <Alert
            className={clsx({ "hidden no-height": !isMobile })}
            variant="infoYellow"
            style={{ marginBottom: 26 }}
          >
            Cal-Adapt&#39;s Tools are available on desktop devices only
          </Alert>
          <div style={{ alignSelf: "center" }}>
            <ToolCarousel data={genCarouselData} />
          </div>
          <Typography variant="h4" style={{ marginBottom: "20px", marginTop: "40px" }}>
            Analytics for Advanced Users
          </Typography>
          <div style={{ alignSelf: "center" }}>
            <ToolCarousel data={analyticsCarouselData} />
          </div>
        </div>
      </section>
      <section>
        <HeroSecondary />
      </section>
      <section>
        <ImageText />
      </section>
      <Footer />
    </div>
  );
}
