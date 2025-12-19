import dynamic from "next/dynamic";

import { ParallaxContext } from "@/context/Parallax";
import HeroMain from "@/components/home/HeroMain";

// Lazy-load the interactive homepage body
const HomeClient = dynamic(() => import("@/components/home/HomeClient"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <ParallaxContext>
        <HeroMain />
        <HomeClient />
      </ParallaxContext>
    </>
  );
}
