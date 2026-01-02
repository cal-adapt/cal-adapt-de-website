import HeroMain from "@/components/home/HeroMain";
import HomeClient from "@/components/home/HomeClient";
import { ParallaxContext } from "@/context/Parallax";

export default function Home() {
  return (
    <ParallaxContext>
      <HeroMain />
      <HomeClient />
    </ParallaxContext>
  );
}
