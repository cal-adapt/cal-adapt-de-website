"use client";

// PROTOTYPE: throwaway variant switcher. Never rendered in production builds.

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface PrototypeVariant {
  key: string;
  name: string;
}

export function usePrototypeVariant(variants: readonly PrototypeVariant[]): string {
  const value = useSearchParams().get("variant");
  return variants.some((v) => v.key === value) ? value! : variants[0].key;
}

export default function PrototypeSwitcher({ variants }: { variants: readonly PrototypeVariant[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = usePrototypeVariant(variants);
  const index = variants.findIndex((v) => v.key === current);

  const go = useCallback(
    (step: number) => {
      const next = variants[(index + step + variants.length) % variants.length];
      const params = new URLSearchParams(searchParams.toString());
      params.set("variant", next.key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [index, pathname, router, searchParams, variants]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable], [role='listbox']")) return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (process.env.NODE_ENV === "production") return null;

  const buttonStyle = {
    background: "transparent",
    border: "none",
    color: "inherit",
    cursor: "pointer",
    fontSize: 18,
    padding: "0 8px",
  } as const;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "6px 10px",
        borderRadius: 999,
        background: "#111",
        color: "#fff",
        font: "600 13px/1.2 system-ui, sans-serif",
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
      }}
    >
      <button
        type="button"
        aria-label="Previous variant"
        style={buttonStyle}
        onClick={() => go(-1)}
      >
        ←
      </button>
      <span>
        PROTOTYPE · {variants[index].key} ({variants[index].name})
      </span>
      <button type="button" aria-label="Next variant" style={buttonStyle} onClick={() => go(1)}>
        →
      </button>
    </div>
  );
}
