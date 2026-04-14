import { downloadZip } from "client-zip";

import { extractFilenameFromURL, normalizeDownloadUrl } from "@/utils/url";

/**
 * Triggers a browser download for a URL (remote or blob) with a specified filename.
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

const STAGGER_MS = 450;

async function downloadUrlsAsSeparateFiles(urls: string[]): Promise<void> {
  for (let i = 0; i < urls.length; i++) {
    downloadFile(urls[i], extractFilenameFromURL(urls[i]));
    if (i < urls.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, STAGGER_MS));
    }
  }
}

export type DownloadUrlsAsZipResult = {
  /** `true` if a single .zip was built; `false` if fetch failed (e.g. no CORS) and files were downloaded individually. */
  usedZip: boolean;
};

/**
 * Fetches remote URLs, builds a zip in-memory, and triggers a browser download.
 * Falls back to sequential individual downloads when `fetch` fails (commonly
 * due to missing CORS headers on the data host).
 */
export async function downloadUrlsAsZip(
  urls: string[],
  zipFilename: string
): Promise<DownloadUrlsAsZipResult> {
  if (urls.length === 0) {
    return { usedZip: false };
  }

  const normalized = urls.map(normalizeDownloadUrl);

  try {
    const responses = await Promise.all(
      normalized.map(async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        return res;
      })
    );

    const files = await Promise.all(
      responses.map(async (res) => {
        const blob = await res.blob();
        return { name: extractFilenameFromURL(res.url), input: blob };
      })
    );

    const blob = await downloadZip(files).blob();
    const blobUrl = URL.createObjectURL(blob);
    downloadFile(blobUrl, zipFilename);
    URL.revokeObjectURL(blobUrl);

    return { usedZip: true };
  } catch (e) {
    if (e instanceof TypeError) {
      await downloadUrlsAsSeparateFiles(normalized);
      return { usedZip: false };
    }
    throw e;
  }
}
