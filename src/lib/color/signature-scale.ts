type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// The signature blue → orange → red accent scale (blue-4, orange-3, red-4 in
// src/styles/abstracts/_variables.scss), kept as hex here so the two stay
// trivially comparable.
const STOPS: Rgb[] = ["#007dec", "#c56907", "#b71c1c"].map(hexToRgb);

/** Interpolate a color along the signature scale. `t` ranges from 0 to 1. */
export function mixSignatureColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const segments = STOPS.length - 1;
  const scaled = clamped * segments;
  const index = Math.min(segments - 1, Math.floor(scaled));
  const localT = scaled - index;

  const [r1, g1, b1] = STOPS[index];
  const [r2, g2, b2] = STOPS[index + 1];
  const r = Math.round(r1 + (r2 - r1) * localT);
  const g = Math.round(g1 + (g2 - g1) * localT);
  const b = Math.round(b1 + (b2 - b1) * localT);

  return `rgb(${r}, ${g}, ${b})`;
}
