"use client";

import { useEffect, useState } from "react";

import clsx from "clsx";

import {
  parseThresholdNumber,
  type ThresholdKind,
  thresholdRangeFor,
  thresholdTokenFor,
} from "@/lib/extreme-heat-days/options";

import styles from "./ThresholdInput.module.scss";

export interface ThresholdInputProps {
  id?: string;
  kind: ThresholdKind;
  value: string;
  onChange: (threshold: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function ThresholdInput({
  id,
  kind,
  value,
  onChange,
  disabled = false,
  invalid = false,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
}: ThresholdInputProps) {
  const { min, max } = thresholdRangeFor(kind);
  const numeric = parseThresholdNumber(value) ?? min;
  const [draft, setDraft] = useState(String(numeric));

  useEffect(() => {
    setDraft(String(numeric));
  }, [numeric]);

  const commit = (raw: number) => {
    const next = clamp(Math.round(raw), min, max);
    setDraft(String(next));
    const token = thresholdTokenFor(kind, next);
    if (token !== value) onChange(token);
  };

  const unit = kind === "relative" ? "th percentile" : "°F";
  const sliderValue = Number.isFinite(Number(draft)) ? Number(draft) : numeric;
  const progress = ((clamp(sliderValue, min, max) - min) / (max - min)) * 100;

  return (
    <div className={styles.root}>
      <div className={styles.numberRow}>
        <input
          id={id}
          type="number"
          className={clsx(styles.number, invalid && styles.numberInvalid)}
          min={min}
          max={max}
          step={1}
          value={draft}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            const parsed = Number(draft);
            if (!Number.isFinite(parsed)) {
              setDraft(String(numeric));
              return;
            }
            commit(parsed);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.currentTarget.blur();
          }}
        />
        <span className={styles.unit}>{unit}</span>
      </div>
      <div
        className={styles.sliderBlock}
        style={{ ["--slider-progress" as string]: `${progress}%` }}
      >
        <div className={styles.sliderRow}>
          <span className={styles.endLabel} aria-hidden>
            {min}
          </span>
          <div className={styles.sliderCol}>
            <input
              type="range"
              className={styles.slider}
              min={min}
              max={max}
              step={1}
              value={sliderValue}
              disabled={disabled}
              aria-labelledby={id}
              onPointerUp={(event) => commit(Number(event.currentTarget.value))}
              onChange={(event) => setDraft(event.target.value)}
              onKeyUp={(event) => commit(Number(event.currentTarget.value))}
            />
          </div>
          <span className={styles.endLabel} aria-hidden>
            {max}
          </span>
        </div>
      </div>
    </div>
  );
}
