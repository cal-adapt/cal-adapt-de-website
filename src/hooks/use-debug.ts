"use client";

import { useMemo } from "react";

import { featureFlags } from "@/config/feature-flags";

import useIsClient from "./use-is-client";

export default function useDebug() {
  const isClient = useIsClient();

  const isDebug = useMemo(() => {
    if (!isClient) return false;
    const queryParams = new URLSearchParams(window.location.search);
    return featureFlags.__FF_DEBUG__ && queryParams.has("debug");
  }, [isClient]);

  return isDebug;
}
