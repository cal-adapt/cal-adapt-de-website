import type { CarouselData } from "@/components/home/ToolCarousel";

export const analyticsCarouselData: CarouselData[] = [
  {
    id: 1,
    title: "Github",
    description:
      "Our open-source Python code for exploring, analyzing, and exporting the full Fifth Assessment dataset (~2.5 pB)",
    image: "/img/homepage-carousels/cal-satellite.png",
    imageAlt: "California seen from a satellite view",
    link: "https://github.com/cal-adapt/climakitae",
  },
  {
    id: 2,
    title: "ClimaKitAE Documentation",
    description:
      "Documentation explaining our code base, functions, methods, and approach to this work and analysis",
    image: "/img/homepage-carousels/fields-satellite.png",
    imageAlt: "California agricultural fields seen from a satellite view",
    link: "https://climakitae.readthedocs.io/en/latest/",
  },
  {
    id: 3,
    title: "Data Access",
    description:
      "Multiple methods for gaining access to the data for users with different needs and technical proficiency",
    image: "/img/homepage-carousels/fire-satellite.png",
    imageAlt:
      "A fire helicopter spraying an active wildfire, seen from satellite",
    link: "https://analytics.cal-adapt.org/data/access/",
  },
  {
    id: 4,
    title: "AE Login page (requires account)",
    description:
      "For users with access to the Cal-Adapt: Analytics Engine hub. (Limited availability due to computing costs for hub access)",
    image: "/img/homepage-carousels/rocks-ocean-satellite.png",
    imageAlt: "A rock cliff and sea seen from a satellite perspective",
    link: "https://analytics.cal-adapt.org/sign-in/",
  },
];

