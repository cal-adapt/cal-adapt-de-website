export function createOrStatement(parameterName: string, values: string[]): string {
  if (values.length === 0) {
    //throw new Error('Values array must not be empty');
    return "";
  }

  const orStatements = values.map((value) => `${parameterName}='${value}'`);
  const fullOrStatement = orStatements.join(" or ");

  return `(${fullOrStatement})`;
}
