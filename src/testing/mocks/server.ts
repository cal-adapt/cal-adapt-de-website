import { setupServer } from "msw/node";

/**
 * Default MSW server with no handlers. Tests call `server.use(...)` to register routes.
 * (Previously used Orval-generated MSW helpers; `@hey-api/openapi-ts` does not emit MSW mocks.)
 */
export const server = setupServer();
