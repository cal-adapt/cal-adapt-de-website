type ValueOf<T> = T[keyof T];

// Creates a new object populated with the results of calling a provided
// function on every item in the object.
export const mapObject = <T extends object, U>(obj: T, fn: (v: ValueOf<T>) => U) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));
