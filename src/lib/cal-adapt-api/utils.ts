type OrvalResponse = { data: unknown; status: number };

/**
 * Asserts an Orval-generated response is successful (2xx).
 * Throws error on non-2xx status codes.
 */
export function assertOk<T>(res: OrvalResponse, apiName: string): T {
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`$ {apiName} error: ${res.status}`);
  }
  return res.data as T;
}
