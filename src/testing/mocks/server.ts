import { setupServer } from "msw/node";

import { getCaladaptTilerMock } from "@/lib/cal-adapt-api/generated/map/services/caladaptTiler.msw";
import { getCalAdaptSTACAPIMock } from "@/lib/cal-adapt-api/generated/stac/services/calAdaptSTACAPI.msw";

export const server = setupServer(...getCalAdaptSTACAPIMock(), ...getCaladaptTilerMock());
