const WORD_REGEX = /[\p{L}\p{N}]+/gu; // Any sequence of letters and numbers

export function splitToWords(input: string): string[] {
  return input.trim().match(WORD_REGEX) ?? [];
}

export function toKebabCase(str: string) {
  return splitToWords(str.toLowerCase()).join("-");
}

export function toSentenceCase(input: string): string {
  const trimmed = input.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export function stringToArray(inputString: string): string[] {
  const arrayResult: string[] = inputString.split(",");
  const trimmedArray: string[] = arrayResult.map((item) => item.trim());
  return trimmedArray;
}

export function arrayToCommaSeparatedString(arr: string[]): string {
  return arr.join(", ");
}

export function splitStringByPeriod(inputString: string): string[] {
  return inputString.split(".");
}
