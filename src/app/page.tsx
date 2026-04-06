import HeroMain from "@/components/home/HeroMain";
import HomeClient from "@/components/home/HomeClient";
import { ParallaxProvider } from "@/context/ParallaxProvider";

export default function Home() {
  return (
    <ParallaxProvider>
      <HeroMain />
      <HomeClient />
    </ParallaxProvider>
  );
}
