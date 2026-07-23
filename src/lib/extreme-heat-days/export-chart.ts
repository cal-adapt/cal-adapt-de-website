export interface ExportSvgAsPngOptions {
  /** Pixel-density multiplier for the output PNG. 2 ≈ retina-quality. */
  pixelRatio?: number;
  /** Background fill under the SVG. */
  background?: string;
}

/**
 * Rasterize an in-DOM SVG element to PNG and trigger a browser download.
 * Throws on canvas / image / blob failures so callers can surface a toast.
 * Only safe to call client-side.
 */
export async function exportSvgAsPng(
  svg: SVGSVGElement,
  filename: string,
  options: ExportSvgAsPngOptions = {}
): Promise<void> {
  const { pixelRatio = 2, background = "#ffffff" } = options;

  const { width: cssWidth, height: cssHeight } = measureSvg(svg);
  const pngWidth = Math.max(1, Math.round(cssWidth * pixelRatio));
  const pngHeight = Math.max(1, Math.round(cssHeight * pixelRatio));

  const svgMarkup = serializeWithInlinedStyles(svg, cssWidth, cssHeight);

  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const img = await loadImage(svgUrl);

    const canvas = document.createElement("canvas");
    canvas.width = pngWidth;
    canvas.height = pngHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to acquire a 2D canvas context for chart export");
    }
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, pngWidth, pngHeight);
    ctx.drawImage(img, 0, 0, pngWidth, pngHeight);

    const pngBlob = await canvasToBlob(canvas, "image/png");
    triggerDownload(pngBlob, filename);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

/** Minimal set of relevant computed style props to carry over to the standalone SVG. */
const STYLE_PROPS = [
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "opacity",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-anchor",
  "dominant-baseline",
  "shape-rendering",
  "letter-spacing",
] as const;

function measureSvg(svg: SVGSVGElement): { width: number; height: number } {
  // `getBoundingClientRect` gives the size the SVG actually occupies on
  // the page (after `width: 100%` + `viewBox` scaling)
  const rect = svg.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return { width: rect.width, height: rect.height };
  }
  // Fallback for off-screen / detached SVGs: trust the viewBox.
  const viewBox = svg.viewBox.baseVal;
  return {
    width: viewBox.width > 0 ? viewBox.width : 800,
    height: viewBox.height > 0 ? viewBox.height : 420,
  };
}

function serializeWithInlinedStyles(svg: SVGSVGElement, width: number, height: number): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  // Explicit width/height + xmlns so the `<img>` rasterizer knows the
  // intrinsic size and the file parses standalone.
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  inlineComputedStyles(svg, clone);

  const xml = new XMLSerializer().serializeToString(clone);
  // XML declaration helps older WebKit rasterize the blob reliably.
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${xml}`;
}

function inlineComputedStyles(source: Element, target: Element): void {
  // `<title>` and `<desc>` are metadata — no styles to inline, no children.
  const tag = source.tagName.toLowerCase();
  if (tag === "title" || tag === "desc") return;

  const computed = window.getComputedStyle(source);
  let cssText = "";
  for (const prop of STYLE_PROPS) {
    const value = computed.getPropertyValue(prop);
    if (value) {
      cssText += `${prop}:${value};`;
    }
  }
  if (cssText) {
    // Preserve any inline style already on the target (e.g. `transform`).
    const existing = target.getAttribute("style") ?? "";
    target.setAttribute("style", existing ? `${existing};${cssText}` : cssText);
  }

  const sourceChildren = source.children;
  const targetChildren = target.children;
  // Length guard: a malformed clone could throw here; just stop walking that
  // branch rather than failing the whole export.
  const n = Math.min(sourceChildren.length, targetChildren.length);
  for (let i = 0; i < n; i++) {
    inlineComputedStyles(sourceChildren[i], targetChildren[i]);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Failed to load serialized SVG into an Image for rasterization"));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error(`canvas.toBlob(${type}) returned null`));
    }, type);
  });
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Give the browser a tick to start the download before revoking
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
