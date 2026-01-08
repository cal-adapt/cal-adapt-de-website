import { mapObject } from "@/utils/object";

// Should mirror the breakpoint values defined in `styles/abstracts/_breakpoints.scss`
export const breakpoints = {
  xxsmall: 320,
  xsmall: 576,
  small: 640,
  medium: 768,
  large: 1024,
  xlarge: 1280,
  xxlarge: 1440,
} as const;

export const mediaQueries = {
  min: mapObject(breakpoints, (n) => `(min-width: ${n}px)`),
  max: mapObject(breakpoints, (n) => `(max-width: ${n}px)`),
};
