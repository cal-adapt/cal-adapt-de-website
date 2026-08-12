// Builders for CQL2-text filter expressions — the query dialect Cal-Adapt's
// STAC `/search` endpoint understands. Lives in the API layer (not `utils/`)
// because the output syntax is specific to STAC/CQL2, not general-purpose.

/**
 * Build a CQL2 "any of" clause: a parenthesized OR over equality checks on a
 * single property, e.g. `(model='A' or model='B')`. Returns an empty string
 * for an empty `values` list so callers can omit the clause entirely.
 */
export function orFilter(propertyName: string, values: string[]): string {
  if (values.length === 0) {
    return "";
  }

  const orStatements = values.map((value) => `${propertyName}='${value}'`);
  return `(${orStatements.join(" or ")})`;
}

/**
 * Similar to `orFilter` but emits unquoted numeric literals, e.g.
 * `(centered_year=2015 or centered_year=2025)`. Use for STAC item properties
 * stored as JSON numbers. Non-numeric values are skipped.
 */
export function orFilterNumeric(propertyName: string, values: string[]): string {
  const numeric = values.filter((v) => v.trim() !== "" && Number.isFinite(Number(v)));
  if (numeric.length === 0) {
    return "";
  }

  const orStatements = numeric.map((value) => `${propertyName}=${Number(value)}`);
  return `(${orStatements.join(" or ")})`;
}
