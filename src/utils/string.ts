export function stringToArray(inputString: string): string[] {
  // Split the input string by commas
  const arrayResult: string[] = inputString.split(",");

  // Trim any leading or trailing whitespaces from each element
  const trimmedArray: string[] = arrayResult.map((item) => item.trim());

  return trimmedArray;
}

export function arrayToCommaSeparatedString(arr: string[]): string {
  return arr.join(", ");
}

export function splitStringByPeriod(inputString: string): string[] {
  return inputString.split(".");
}
