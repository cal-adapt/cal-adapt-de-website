"use client";

import { useMemo } from "react";

import { featureFlags } from "@/config/feature-flags";

import useIsClient from "./use-is-client";

export default function useDebug() {
  const isClient = useIsClient();

  const envDebug = process.env.NEXT_PUBLIC_FF_DEBUG === "true";

  const isDebug = useMemo(() => {
    if (!featureFlags.__FF_DEBUG__) return false;
    if (envDebug) return true;
    if (!isClient) return false;
    return new URLSearchParams(window.location.search).has("debug");
  }, [isClient, envDebug]);

  return isDebug;
}
