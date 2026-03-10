import type { CarouselData } from "@/components/home/ToolCarousel";

export const genCarouselData: CarouselData[] = [
  {
    id: 1,
    title: "Extreme heat days",
    description: "Understand how many extreme heat days will occur in the future",
    image: "/img/homepage-carousels/extreme-heat.png",
    imageAlt: "California agricultural workers on a field",
    link: "/dashboard/climate-metrics-map?metric=extreme-heat",
  },
  {
    id: 2,
    title: "Availability of renewable resources",
    description:
      "For wind and solar energy generation, explore what future availability looks like",
    image: "/img/homepage-carousels/renewables.png",
    imageAlt: "Wind turbines to represent renewable data visualization",
    link: "/dashboard/renewables-visualizer",
  },
  {
    id: 3,
    title: "Fire weather risk",
    description:
      "See the Fosberg Fire Weather Risk Weather Index for the projected futures across California",
    image: "/img/homepage-carousels/wildfire.png",
    imageAlt: "A fire helicopter spraying an active wildfire",
    link: "/dashboard/climate-metrics-map?metric=fire-weather",
  },
  {
    id: 4,
    title: "Extreme precipitation",
    description:
      "Show the top 1% of precipitation that will occur in the future and how much it will rain there",
    image: "/img/homepage-carousels/extreme-precip.png",
    imageAlt: "People with umbrellas in San Francisco on a rainy day",
    link: "/dashboard/climate-metrics-map?metric=extreme-precipitation",
  },
  {
    id: 5,
    title: "CMIP6 data packages",
    description:
      "Download aggregated climate data from the most modern datasets downscaled to California",
    image: "/img/homepage-carousels/data-packages.png",
    imageAlt: "The california coast",
    link: "/dashboard/data-download-tool",
  },
];
