/** Human-readable labels for shock type ids (STAC `shock_type` queryable on xmy-shock). */
const SHOCK_TYPE_LABELS: Readonly<Record<string, string>> = {
  cold: "Cold shock",
  hot: "Hot shock",
};

const SHOCK_TYPE_ORDER: ReadonlyMap<string, number> = new Map([
  ["cold", 0],
  ["hot", 1],
]);

export function labelShockType(id: string): string {
  return SHOCK_TYPE_LABELS[id.toLowerCase()] ?? id;
}

export function sortShockTypeIds(ids: readonly string[]): string[] {
  return [...ids].sort((a, b) => {
    const ai = SHOCK_TYPE_ORDER.get(a.toLowerCase()) ?? Number.POSITIVE_INFINITY;
    const bi = SHOCK_TYPE_ORDER.get(b.toLowerCase()) ?? Number.POSITIVE_INFINITY;
    return ai !== bi ? ai - bi : a.localeCompare(b);
  });
}
