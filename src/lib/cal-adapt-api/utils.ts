/**
 * Asserts a `@hey-api/openapi-ts` client response is successful (2xx) with a body.
 * Throws on errors or missing data.
 */
export function assertOk<T>(
  res: {
    data?: unknown;
    error?: unknown;
    response?: Response;
  },
  apiName: string
): T {
  if (res.error !== undefined && res.error !== null) {
    const status = res.response?.status ?? "Something went wrong. Please try again";
    throw new Error(`${apiName} Error: ${status}`);
  }
  if (res.response && !res.response.ok) {
    throw new Error(`${apiName} Error: ${res.response.status}`);
  }
  if (res.data === undefined) {
    throw new Error(`${apiName} Error: Empty response`);
  }
  return res.data as T;
}
