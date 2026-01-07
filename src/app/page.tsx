import HeroMain from "@/components/home/HeroMain";
import HomeClient from "@/components/home/HomeClient";
import { ParallaxContext } from "@/context/ParallaxContext";

export default function Home() {
  return (
    <ParallaxContext>
      <HeroMain />
      <HomeClient />
    </ParallaxContext>
  );
}
