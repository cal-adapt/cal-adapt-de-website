"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import AOS from "aos";
import "aos/dist/aos.css";
import useEmblaCarousel from "embla-carousel-react";
import useMediaQuery from "@mui/material/useMediaQuery";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

import styles from "@/app/page.module.scss";
import HeroSecondary from "./HeroSecondary";
import Card from "./Card";
import ImageText from "./ImageText";
import { genCarouselData } from "./../../lib/home/gen-carousel-data";
import { analyticsCarouselData } from "./../../lib/home/analytics-carousel-data";

const ToolCarousel = dynamic(() => import("./ToolCarousel"), { ssr: false });
const Footer = dynamic(() => import("./Footer"), { ssr: false });

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
          exploring <nobr>peer-reviewed</nobr> <strong>5th Assessment</strong> climate data. Our
          platform provides interactive visualizations, downloadable datasets, the Analytics Engine
          and the Cal-Adapt API, helping you analyze how climate change may impact California at
          both state and local levels.
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
            className={isMobile ? `alerts alerts-100` : "hidden no-height"}
            sx={{ mb: "26px" }}
            variant="filled"
            severity="info"
            color="infoYellow"
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
      <section className="secondary-hero marginless">
        <HeroSecondary />
      </section>
      <section className="grants">
        <ImageText />
      </section>
      <Footer />
    </div>
  );
}
