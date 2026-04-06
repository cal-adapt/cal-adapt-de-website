"use client";

import { ParallaxProvider as ReactScrollParallaxProvider } from "react-scroll-parallax";

export function ParallaxProvider({ children }: { children: React.ReactNode }) {
  return <ReactScrollParallaxProvider>{children}</ReactScrollParallaxProvider>;
}
