export const isExternalUrl = (url: string) => /^https?:\/\//.test(url);

/** Drop a single trailing slash (keeping root "/") for exact path comparisons. */
export function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/**
 * Browser downloads/fetch require web schemes. Convert STAC S3 URLs to HTTPS.
 * Example: s3://bucket/path/file.csv -> https://bucket.s3.amazonaws.com/path/file.csv
 */
export function normalizeDownloadUrl(url: string): string {
  if (!url.startsWith("s3://")) {
    return url;
  }

  const withoutScheme = url.slice("s3://".length);
  const firstSlash = withoutScheme.indexOf("/");
  if (firstSlash <= 0) {
    return url;
  }

  const bucket = withoutScheme.slice(0, firstSlash);
  const objectKey = withoutScheme.slice(firstSlash + 1);
  if (!bucket || !objectKey) {
    return url;
  }

  return `https://${bucket}.s3.amazonaws.com/${objectKey}`;
}

/**
 * Returns the filename segment of a URL: the last `/`-delimited path segment
 * with any query string and fragment stripped (e.g. presigned-URL params).
 */
export function extractFilenameFromURL(url: string): string {
  const path = url.replace(/[?#].*/, "");
  return path.split("/").at(-1) ?? "";
}

/** True when `path` is `base` or nested under it (`/a/b` is within `/a`, `/ab` is not). */
export function isPathWithin(path: string, base: string): boolean {
  const normalizedPath = normalizePath(path);
  const normalizedBase = normalizePath(base);
  if (normalizedBase === "/") return normalizedPath.startsWith("/");
  return normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`);
}
