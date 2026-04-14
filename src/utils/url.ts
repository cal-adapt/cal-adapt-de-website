export const isExternalUrl = (url: string) => /^https?:\/\//.test(url);

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

export function extractFilenameFromURL(url: string): string {
  // Split the URL by '/' to get the parts
  const parts = url.split("/");

  // Get the last part of the URL which contains the filename
  const filename = parts[parts.length - 1];

  // Return the filename
  return filename;
}

export function extractSegment(
  url: string,
  startDelimiter: string,
  endDelimiter: string
): string | null {
  // Find the start index of the segment
  const startIndex = url.indexOf(startDelimiter);

  // If start delimiter is not found, return null
  if (startIndex === -1) {
    return null;
  }

  // Adjust the start index to the beginning of the segment
  const segmentStartIndex = startIndex + startDelimiter.length;

  // Find the end index of the segment
  const endIndex = url.indexOf(endDelimiter, segmentStartIndex);

  // Extract the segment from the URL
  // If end delimiter is not found, extract until the end of the string
  const segment =
    endIndex === -1 ? url.substring(segmentStartIndex) : url.substring(segmentStartIndex, endIndex);

  return segment;
}
