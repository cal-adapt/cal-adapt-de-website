type Vec3 = [number, number, number];

function hexToRgb(hex: string): Vec3 {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function srgbToLinear(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const clamped = Math.min(1, Math.max(0, c));
  const n = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.round(n * 255);
}

// Björn Ottosson's OKLab conversion (https://bottosson.github.io/posts/oklab/).
function linearRgbToOklab([r, g, b]: Vec3): Vec3 {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

function oklabToLinearRgb([L, a, b]: Vec3): Vec3 {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

interface Oklch {
  l: number;
  c: number;
  h: number;
}

function toOklch(hex: string): Oklch {
  const linear = hexToRgb(hex).map(srgbToLinear) as Vec3;
  const [l, a, b] = linearRgbToOklab(linear);
  return { l, c: Math.hypot(a, b), h: (Math.atan2(b, a) * 180) / Math.PI };
}

function fromOklch({ l, c, h }: Oklch): string {
  const rad = (h * Math.PI) / 180;
  const [r, g, b] = oklabToLinearRgb([l, c * Math.cos(rad), c * Math.sin(rad)]).map(linearToSrgb);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Shortest circular path between two hues, matching CSS's default `shorter
 * hue` interpolation for gradients. */
function lerpHue(h1: number, h2: number, t: number): number {
  const delta = ((((h2 - h1) % 360) + 540) % 360) - 180;
  return h1 + delta * t;
}

// The signature blue → orange → red accent scale (blue-4, orange-3, red-4 in
// src/styles/abstracts/_variables.scss). Interpolated in OKLCH, matching the
// `in oklch` gradient in MdxContent.module.scss, so the two stay visually
// in sync rather than diverging through sRGB's muddy midpoint.
const STOPS: Oklch[] = ["#007dec", "#c56907", "#b71c1c"].map(toOklch);

/** Interpolate a color along the signature scale. `t` ranges from 0 to 1. */
export function mixSignatureColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const segments = STOPS.length - 1;
  const scaled = clamped * segments;
  const index = Math.min(segments - 1, Math.floor(scaled));
  const localT = scaled - index;

  const a = STOPS[index];
  const b = STOPS[index + 1];

  return fromOklch({
    l: a.l + (b.l - a.l) * localT,
    c: a.c + (b.c - a.c) * localT,
    h: lerpHue(a.h, b.h, localT),
  });
}
