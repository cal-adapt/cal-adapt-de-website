export function getPropertyValueById(
  items: any[],
  itemId: number,
  propertyName: keyof any,
): any | undefined {
  const foundItem = items.find((item) => item.id === itemId);

  if (foundItem) {
    return foundItem[propertyName];
  }

  return undefined;
}

export function searchObject(obj: any, targetValue: any): boolean {
  for (const key in obj) {
    if (obj[key] === targetValue) {
      return true;
    }

    if (typeof obj[key] === "object" && obj[key] !== null) {
      // Recursively search nested objects
      if (searchObject(obj[key], targetValue)) {
        return true;
      }
    }
  }

  return false;
}
