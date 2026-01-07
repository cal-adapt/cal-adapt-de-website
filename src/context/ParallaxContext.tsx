"use client";

import { ParallaxProvider } from "react-scroll-parallax";

export function ParallaxContext({ children }: { children: React.ReactNode }) {
  return <ParallaxProvider>{children}</ParallaxProvider>;
}
