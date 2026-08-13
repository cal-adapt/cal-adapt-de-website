/** Format a date as a `YYYY-MM-DD` string in the user's local timezone rather than UTC */
export function formatLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based, so we add 1
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const LONG_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * Format a `YYYY-MM-DD` string as a long human label, e.g. "August 13, 2026".
 * Parses the string parts directly (no `Date`), so it's timezone-independent and
 * safe to render identically on the server and client. Returns the input
 * unchanged if it isn't a well-formed `YYYY-MM-DD`.
 */
export function formatIsoDateLong(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const monthName = LONG_MONTHS[month - 1];
  if (!year || !monthName || !day) return iso;
  return `${monthName} ${day}, ${year}`;
}
