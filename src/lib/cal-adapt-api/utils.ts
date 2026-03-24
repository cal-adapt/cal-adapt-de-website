/**
 * Asserts an Orval-generated response is successful (2xx).
 * Throws error on non-2xx status codes.
 */
export function assertOk<T>(res: { data: unknown; status: number }, apiName: string): T {
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`${apiName} Error: ${res.status}`);
  }
  return res.data as T;
}
