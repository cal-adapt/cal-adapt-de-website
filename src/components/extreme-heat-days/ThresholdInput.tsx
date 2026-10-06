"use client";

import { useEffect, useState } from "react";

import { Select } from "@/components/common/form";
import { formatThresholdLabel } from "@/lib/extreme-heat-days/format";
import {
  isContiguous,
  parseThresholdNumber,
  type ThresholdKind,
  thresholdTokenFor,
  thresholdValuesFor,
} from "@/lib/extreme-heat-days/options";

import styles from "./ThresholdInput.module.scss";

export interface ThresholdInputProps {
  id?: string;
  kind: ThresholdKind;
  climateVariable: string;
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
  climateVariable,
  value,
  onChange,
  disabled = false,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
}: ThresholdInputProps) {
  const values = thresholdValuesFor(kind, climateVariable);

  // A sparse set (e.g. only the 95th and 99th percentiles) can't be a 1-step
  // slider without landing on unavailable values, so offer a dropdown instead.
  if (!isContiguous(values)) {
    return (
      <Select
        id={id}
        value={value}
        onChange={onChange}
        options={values.map((n) => {
          const token = thresholdTokenFor(kind, n);
          return { value: token, label: formatThresholdLabel(token) };
        })}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-required={ariaRequired}
      />
    );
  }

  return (
    <ThresholdSlider
      id={id}
      kind={kind}
      min={values[0]}
      max={values[values.length - 1]}
      value={value}
      onChange={onChange}
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      aria-required={ariaRequired}
    />
  );
}

interface ThresholdSliderProps extends Omit<ThresholdInputProps, "climateVariable" | "invalid"> {
  min: number;
  max: number;
}

function ThresholdSlider({
  id,
  kind,
  min,
  max,
  value,
  onChange,
  disabled = false,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
}: ThresholdSliderProps) {
  const numeric = parseThresholdNumber(value) ?? min;
  const [draft, setDraft] = useState(numeric);

  useEffect(() => {
    setDraft(numeric);
  }, [numeric]);

  const commit = (raw: number) => {
    const next = clamp(Math.round(raw), min, max);
    setDraft(next);
    const token = thresholdTokenFor(kind, next);
    if (token !== value) onChange(token);
  };

  const sliderValue = Number.isFinite(draft) ? draft : numeric;
  const progress = ((clamp(sliderValue, min, max) - min) / (max - min)) * 100;
  const valueText =
    kind === "relative" ? `${sliderValue}th percentile` : `${sliderValue} degrees Fahrenheit`;

  return (
    <div className={styles.root} style={{ ["--slider-progress" as string]: `${progress}%` }}>
      <span className={styles.endLabel} aria-hidden>
        {min}
      </span>
      <div className={styles.sliderCol}>
        <div className={styles.valueLane} aria-hidden>
          <span className={styles.value}>
            {formatThresholdLabel(thresholdTokenFor(kind, sliderValue))}
          </span>
        </div>
        <div className={styles.ticks} aria-hidden>
          {tickValues(min, max).map((tick) => (
            <span
              key={tick}
              className={styles.tick}
              style={{ left: `${((tick - min) / (max - min)) * 100}%` }}
            />
          ))}
        </div>
        <input
          id={id}
          type="range"
          className={styles.slider}
          min={min}
          max={max}
          step={1}
          value={sliderValue}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          aria-valuetext={valueText}
          onPointerUp={(event) => commit(Number(event.currentTarget.value))}
          onChange={(event) => setDraft(Number(event.target.value))}
          onKeyUp={(event) => commit(Number(event.currentTarget.value))}
        />
      </div>
      <span className={styles.endLabel} aria-hidden>
        {max}
      </span>
    </div>
  );
}

function tickValues(min: number, max: number): number[] {
  const step = 5;
  const ticks: number[] = [];
  const start = Math.ceil(min / step) * step;
  for (let tick = start; tick <= max; tick += step) {
    ticks.push(tick);
  }
  return ticks;
}
