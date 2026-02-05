export const isExternalUrl = (url: string) => /^https?:\/\//.test(url);

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

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  cookie?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

export function buildUrlWithParams(url: string, params?: RequestOptions["params"]): string {
  if (!params) return url;

  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
  );

  if (Object.keys(filteredParams).length === 0) return url;

  const queryString = new URLSearchParams(filteredParams as Record<string, string>).toString();

  return `${url}?${queryString}`;
}
