"use client";

// PROTOTYPE: throwaway summary radial bar chart for the Extreme Heat story.
// Question: what should a one-glance "0.8°C baseline vs 3.0°C" summary of a
// location's heat metrics look like? Three variants on the story route,
// switchable via `?variant=A|B|C`. CDD/HDD deliberately left out.

import { type ReactNode, useId, useState } from "react";

import { arc as d3Arc } from "d3";

import { Select } from "@/components/common/form";
import PrototypeSwitcher, {
  type PrototypeVariant,
  usePrototypeVariant,
} from "@/components/common/prototype/PrototypeSwitcher";
import { useStacSeries } from "@/hooks/use-stac-series";
import { fetchHeatChartData } from "@/lib/extreme-heat-days/chart-data";
import { COLOR_BY_GLOBAL_WARMING_LEVEL } from "@/lib/extreme-heat-days/format";
import { type ExtremeHeatDaysSelections, resolveSelections } from "@/lib/extreme-heat-days/options";
import { summarizeFrequentSeason } from "@/lib/extreme-heat-days/season";
import { COUNTY_OPTIONS } from "@/lib/spatial-aggregations";

const BASELINE_GWL = 0.8;
const FUTURE_GWL = 3.0;
const BASE_COLOR = COLOR_BY_GLOBAL_WARMING_LEVEL[BASELINE_GWL];
const FUTURE_COLOR = COLOR_BY_GLOBAL_WARMING_LEVEL[FUTURE_GWL];
const INK = "#1f2933";
const MUTED = "#6b7785";
const TRACK = "#eef1f4";

interface SummaryMetricDef {
  key: string;
  label: string;
  detail: string;
  unit: string;
  selections: Partial<ExtremeHeatDaysSelections>;
}

const SUMMARY_METRICS: readonly SummaryMetricDef[] = [
  {
    key: "ehd",
    label: "Extreme heat days",
    detail: "max ≥ 100°F",
    unit: "days/yr",
    selections: { climateVariable: "extreme-heat-days", threshold: "100F" },
  },
  {
    key: "wn",
    label: "Warm nights",
    detail: "min ≥ 70°F",
    unit: "nights/yr",
    selections: { climateVariable: "warm-nights", threshold: "70F" },
  },
  {
    key: "hwf",
    label: "Heat waves",
    detail: "5+ days ≥ 100°F",
    unit: "per yr",
    selections: { climateVariable: "heat-wave-frequency", threshold: "100F", duration: "5" },
  },
  {
    key: "hwl",
    label: "Heat wave length",
    detail: "≥ 100°F",
    unit: "days",
    selections: { climateVariable: "heat-wave-length", threshold: "100F" },
  },
  {
    key: "ehs",
    label: "Extreme heat season",
    detail: ">50% chance ≥ 95°F",
    unit: "days",
    selections: { climateVariable: "extreme-heat-season", threshold: "95F" },
  },
];

interface SummaryValue {
  def: SummaryMetricDef;
  baseline: number | null;
  future: number | null;
  error?: string;
}

async function fetchSummary(location: string, signal: AbortSignal): Promise<SummaryValue[]> {
  const settled = await Promise.allSettled(
    SUMMARY_METRICS.map(async (def): Promise<SummaryValue> => {
      const selections = resolveSelections({
        ...def.selections,
        spatialAggregation: "ca_counties",
        location,
      });
      const data = await fetchHeatChartData(selections, { signal });
      const pick = (gwl: number): number | null => {
        if (data.kind === "bar") {
          const i = data.series.globalWarmingLevels.indexOf(gwl);
          const v = i >= 0 ? data.series.median[i] : NaN;
          return Number.isFinite(v) ? v : null;
        }
        const i = data.season.globalWarmingLevels.indexOf(gwl);
        if (i < 0) return null;
        return summarizeFrequentSeason(data.season.frequencyPercent[i])?.dayCount ?? 0;
      };
      return { def, baseline: pick(BASELINE_GWL), future: pick(FUTURE_GWL) };
    })
  );
  return settled.map((result, i) =>
    result.status === "fulfilled"
      ? result.value
      : {
          def: SUMMARY_METRICS[i],
          baseline: null,
          future: null,
          error: String(result.reason),
        }
  );
}

function fmt(v: number | null): string {
  if (v == null) return "–";
  return v >= 10 ? Math.round(v).toString() : v.toFixed(1);
}

/** Per-metric axis max so metrics with different units can share one chart. */
function niceMax(...values: (number | null)[]): number {
  const max = Math.max(1, ...values.map((v) => v ?? 0));
  const step = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / step) * step;
}

const polar = (r: number, angle: number) => ({ x: r * Math.sin(angle), y: -r * Math.cos(angle) });

const arcPath = (inner: number, outer: number, start: number, end: number, corner = 0) =>
  d3Arc().cornerRadius(corner)({
    innerRadius: inner,
    outerRadius: outer,
    startAngle: start,
    endAngle: end,
  }) ?? "";

/** Wedge with a constant-width gap to its neighbours, so wedges stay distinct at the centre. */
const wedgePath = (outer: number, start: number, end: number) =>
  d3Arc().padRadius(100).padAngle(0.08)({
    innerRadius: 12,
    outerRadius: outer,
    startAngle: start,
    endAngle: end,
  }) ?? "";

function Legend() {
  const swatch = (color: string) => ({
    display: "inline-block",
    width: 12,
    height: 12,
    borderRadius: 3,
    background: color,
    border: "1px solid rgba(0,0,0,0.25)",
    marginRight: 6,
    verticalAlign: "-1px",
  });
  return (
    <div style={{ display: "flex", gap: 20, fontSize: 13, color: INK }}>
      <span>
        <span style={swatch(BASE_COLOR)} />
        0.8°C · Historical baseline
      </span>
      <span>
        <span style={swatch(FUTURE_COLOR)} />
        3.0°C · End of century
      </span>
    </div>
  );
}

// ─── Variant A: radial grouped bars ──────────────────────────────────────────
// Each metric owns a wedge; baseline and 3.0°C bars sit side by side, growing
// outward on that metric's own scale.
function VariantA({ values }: { values: SummaryValue[] }) {
  const size = 560;
  const r0 = 70;
  const R = 200;
  const n = values.length;
  const sector = (2 * Math.PI) / n;
  const barWidth = sector * 0.3;

  return (
    <svg
      viewBox={`${-size / 2 - 110} ${-size / 2} ${size + 220} ${size}`}
      width="100%"
      style={{ maxWidth: 780 }}
    >
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <circle
          key={t}
          r={r0 + t * (R - r0)}
          fill="none"
          stroke="#d9dee3"
          strokeDasharray={t === 1 ? undefined : "2 4"}
        />
      ))}
      <circle r={r0} fill="#fff" stroke="#d9dee3" />
      {values.map((v, i) => {
        const max = niceMax(v.baseline, v.future);
        const center = i * sector;
        const len = (x: number | null) => r0 + ((x ?? 0) / max) * (R - r0);
        const label = polar(R + 34, center);
        const anchor = Math.abs(label.x) < 20 ? "middle" : label.x > 0 ? "start" : "end";
        return (
          <g key={v.def.key}>
            <path
              d={arcPath(r0, len(v.baseline), center - barWidth - 0.02, center - 0.02, 3)}
              fill={BASE_COLOR}
              stroke="rgba(0,0,0,0.25)"
            />
            <path
              d={arcPath(r0, len(v.future), center + 0.02, center + barWidth + 0.02, 3)}
              fill={FUTURE_COLOR}
            />
            <text
              x={label.x}
              y={label.y - 8}
              textAnchor={anchor}
              fontSize={13}
              fontWeight={600}
              fill={INK}
            >
              {v.def.label}
            </text>
            <text x={label.x} y={label.y + 8} textAnchor={anchor} fontSize={12} fill={MUTED}>
              {fmt(v.baseline)} → {fmt(v.future)} {v.def.unit}
            </text>
            <text x={label.x} y={label.y + 22} textAnchor={anchor} fontSize={10} fill={MUTED}>
              {v.def.detail} · axis 0–{max}
            </text>
          </g>
        );
      })}
      <text textAnchor="middle" y={-4} fontSize={12} fill={MUTED}>
        0.8°C → 3.0°C
      </text>
      <text textAnchor="middle" y={12} fontSize={11} fill={MUTED}>
        warming
      </text>
    </svg>
  );
}

// ─── Variant B: concentric progress rings ────────────────────────────────────
// One 270° ring per metric, labels in the open quadrant. The 3.0°C arc is the
// track's fill; the baseline arc is an inset bar on top of it.
function VariantB({ values }: { values: SummaryValue[] }) {
  const size = 560;
  const R = 230;
  const ring = 26;
  const gap = 10;
  const sweep = 1.5 * Math.PI;

  return (
    <svg
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      width="100%"
      style={{ maxWidth: 620 }}
    >
      {values.map((v, i) => {
        const outer = R - i * (ring + gap);
        const inner = outer - ring;
        const max = niceMax(v.baseline, v.future);
        const angle = (x: number | null) => ((x ?? 0) / max) * sweep;
        return (
          <g key={v.def.key}>
            <path d={arcPath(inner, outer, 0, sweep, ring / 2)} fill={TRACK} />
            <path d={arcPath(inner, outer, 0, angle(v.future), ring / 2)} fill={FUTURE_COLOR} />
            <path
              d={arcPath(inner + 6, outer - 6, 0, angle(v.baseline), (ring - 12) / 2)}
              fill={BASE_COLOR}
              stroke="rgba(0,0,0,0.25)"
            />
            <text
              x={-10}
              y={-(inner + ring / 2) + 4}
              textAnchor="end"
              fontSize={12.5}
              fontWeight={600}
              fill={INK}
            >
              {v.def.label}{" "}
              <tspan fontWeight={400} fill={MUTED}>
                {fmt(v.baseline)} → {fmt(v.future)} {v.def.unit}
              </tspan>
            </text>
          </g>
        );
      })}
      <text x={-10} y={-R - 12} textAnchor="end" fontSize={11} fill={MUTED}>
        each ring on its own scale (full ring = axis max)
      </text>
    </svg>
  );
}

// ─── Variant C: change rose + table ──────────────────────────────────────────
// Wedges show 3.0°C as a multiple of the 0.8°C baseline (yellow ×1 wedge).
// A ratio only means something when the baseline is non-zero, so each metric
// is classified first and the awkward cases get their own rendering:
//   new     baseline ≈ 0, future > 0 → hatched wedge to the cap, "+N unit"
//   capped  ratio > RATIO_CAP        → solid wedge to the cap + arrow, "≥×CAP"
//   zero    both ≈ 0                 → no wedges, "0 → 0"
//   missing fetch failed / no value  → no wedges, "no data"

/** Values at or below this display as 0.0, so they can't anchor a ratio. */
const ZERO_EPS = 0.05;
/** Beyond this the multiplier is mostly noise from a tiny baseline. */
const RATIO_CAP = 6;

type ChangeKind =
  | { kind: "ratio"; ratio: number }
  | { kind: "capped"; ratio: number }
  | { kind: "new" }
  | { kind: "zero" }
  | { kind: "missing" };

function classifyChange({ baseline, future }: SummaryValue): ChangeKind {
  if (baseline == null || future == null) return { kind: "missing" };
  const baseZero = baseline <= ZERO_EPS;
  const futureZero = future <= ZERO_EPS;
  if (baseZero && futureZero) return { kind: "zero" };
  if (baseZero) return { kind: "new" };
  const ratio = future / baseline;
  return ratio > RATIO_CAP ? { kind: "capped", ratio } : { kind: "ratio", ratio };
}

function formatDelta(v: SummaryValue): string {
  const delta = (v.future ?? 0) - (v.baseline ?? 0);
  return `${delta >= 0 ? "+" : "−"}${fmt(Math.abs(delta))} ${v.def.unit}`;
}

function changeLabel(change: ChangeKind, v: SummaryValue): { main: string; sub?: string } {
  switch (change.kind) {
    case "ratio":
      return { main: `×${change.ratio.toFixed(1)}` };
    case "capped":
      return { main: `≥×${RATIO_CAP}`, sub: `${fmt(v.baseline)} → ${fmt(v.future)} ${v.def.unit}` };
    case "new":
      return { main: "new", sub: `${formatDelta(v)} from 0` };
    case "zero":
      return { main: "0 → 0", sub: "none at either level" };
    case "missing":
      return { main: "no data" };
  }
}

function VariantC({ values }: { values: SummaryValue[] }) {
  const hatchId = useId();
  const size = 440;
  const R = 180;
  const n = values.length;
  const sector = (2 * Math.PI) / n;
  const changes = values.map(classifyChange);
  const offScale = changes.some((c) => c.kind === "capped" || c.kind === "new");
  const plain = changes.flatMap((c) => (c.kind === "ratio" ? [c.ratio] : []));
  const maxRatio = offScale ? RATIO_CAP : Math.max(2, Math.ceil(Math.max(1, ...plain)));
  // sqrt scale so wedge *area* tracks the multiplier
  const rScale = (ratio: number) => Math.sqrt(Math.min(ratio, maxRatio) / maxRatio) * R;
  const ticks = [1, ...[2, 3, 4, 6].filter((t) => t <= maxRatio)];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
      <svg
        viewBox={`${-size / 2 - 130} ${-size / 2 - 10} ${size + 260} ${size + 40}`}
        width="100%"
        style={{ maxWidth: 620, flex: "1 1 380px" }}
      >
        <defs>
          <pattern
            id={hatchId}
            width={6}
            height={6}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width={6} height={6} fill="#fff" />
            <rect width={3} height={6} fill={FUTURE_COLOR} fillOpacity={0.55} />
          </pattern>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <circle r={rScale(t)} fill="none" stroke="#d9dee3" strokeDasharray="2 4" />
            <text x={4} y={-rScale(t) - 3} fontSize={10} fill={MUTED}>
              {t === maxRatio && offScale ? `≥×${t}` : `×${t}`}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const change = changes[i];
          const start = i * sector;
          const end = (i + 1) * sector;
          const mid = (start + end) / 2;
          const label = polar(R + 30, mid);
          const anchor = Math.abs(label.x) < 20 ? "middle" : label.x > 0 ? "start" : "end";
          const { main, sub } = changeLabel(change, v);

          const baseWedge = (
            <path
              key="base"
              d={wedgePath(rScale(1), start, end)}
              fill={BASE_COLOR}
              stroke="rgba(0,0,0,0.3)"
            />
          );
          let wedges: ReactNode = null;
          if (change.kind === "ratio") {
            const future = (
              <path
                key="future"
                d={wedgePath(rScale(change.ratio), start, end)}
                fill={FUTURE_COLOR}
                fillOpacity={0.85}
              />
            );
            // A decrease would otherwise be hidden under the baseline wedge.
            wedges = change.ratio >= 1 ? [future, baseWedge] : [baseWedge, future];
          } else if (change.kind === "capped") {
            const tip = polar(R + 12, mid);
            const left = polar(R + 3, mid - 0.06);
            const right = polar(R + 3, mid + 0.06);
            wedges = [
              <path
                key="future"
                d={wedgePath(R, start, end)}
                fill={FUTURE_COLOR}
                fillOpacity={0.85}
              />,
              baseWedge,
              <path
                key="arrow"
                d={`M${left.x},${left.y}L${tip.x},${tip.y}L${right.x},${right.y}Z`}
                fill={FUTURE_COLOR}
              />,
            ];
          } else if (change.kind === "new") {
            wedges = (
              <path
                d={wedgePath(R, start, end)}
                fill={`url(#${hatchId})`}
                stroke={FUTURE_COLOR}
                strokeDasharray="4 3"
              />
            );
          }

          return (
            <g key={v.def.key}>
              {wedges}
              <text
                x={label.x}
                y={label.y}
                textAnchor={anchor}
                fontSize={12}
                fontWeight={600}
                fill={INK}
              >
                {v.def.label}
              </text>
              <text
                x={label.x}
                y={label.y + 14}
                textAnchor={anchor}
                fontSize={12}
                fill={change.kind === "zero" || change.kind === "missing" ? MUTED : FUTURE_COLOR}
              >
                {main}
              </text>
              {sub ? (
                <text x={label.x} y={label.y + 27} textAnchor={anchor} fontSize={10} fill={MUTED}>
                  {sub}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <table style={{ fontSize: 13, borderCollapse: "collapse", flex: "1 1 240px", color: INK }}>
        <thead>
          <tr style={{ textAlign: "left", color: MUTED, fontSize: 12 }}>
            <th style={{ padding: "4px 8px" }}>Metric</th>
            <th style={{ padding: "4px 8px", textAlign: "right" }}>0.8°C</th>
            <th style={{ padding: "4px 8px", textAlign: "right" }}>3.0°C</th>
          </tr>
        </thead>
        <tbody>
          {values.map((v) => (
            <tr key={v.def.key} style={{ borderTop: "1px solid #e5e8eb" }}>
              <td style={{ padding: "6px 8px" }}>
                {v.def.label}
                <div style={{ fontSize: 11, color: MUTED }}>{v.def.detail}</div>
              </td>
              <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(v.baseline)}</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>
                {fmt(v.future)} <span style={{ color: MUTED, fontWeight: 400 }}>{v.def.unit}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const EDGE_CASES = "__edge-cases__";

/** One metric per Variant C rendering branch. */
const EDGE_CASE_VALUES: readonly SummaryValue[] = [
  { def: SUMMARY_METRICS[0], baseline: 20, future: 45 }, // ratio ×2.3
  { def: SUMMARY_METRICS[1], baseline: 0, future: 4 }, // new
  { def: SUMMARY_METRICS[2], baseline: 0.1, future: 3 }, // capped (×30)
  { def: SUMMARY_METRICS[3], baseline: 0, future: 0 }, // zero → zero
  { def: SUMMARY_METRICS[4], baseline: 40, future: 30 }, // decrease ×0.75
];

const LOCATION_OPTIONS = [
  { value: EDGE_CASES, label: "⚠ Edge cases (mock data)" },
  ...COUNTY_OPTIONS,
];

const VARIANTS: readonly PrototypeVariant[] = [
  { key: "A", name: "Radial grouped bars" },
  { key: "B", name: "Concentric rings" },
  { key: "C", name: "Change rose + table" },
];

export default function HeatSummaryRadialPrototype() {
  const variant = usePrototypeVariant(VARIANTS);
  const [location, setLocation] = useState("Sacramento");
  const summary = useStacSeries(`heat-summary|${location}`, (signal) =>
    location === EDGE_CASES
      ? Promise.resolve([...EDGE_CASE_VALUES])
      : fetchSummary(location, signal)
  );
  const values = summary.data;

  return (
    <section
      style={{
        border: "2px dashed #c2410c",
        borderRadius: 8,
        padding: 16,
        margin: "24px 0",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", letterSpacing: 0.5 }}>
        PROTOTYPE · heat summary radial chart · variant {variant}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        <strong style={{ fontSize: 18 }}>
          Extreme heat at a glance:{" "}
          {location === EDGE_CASES ? "edge cases (mock)" : `${location} County`}
        </strong>
        <div style={{ minWidth: 220 }}>
          <Select options={LOCATION_OPTIONS} value={location} onChange={setLocation} />
        </div>
      </div>
      <Legend />
      {summary.status === "loading" || summary.status === "idle" ? <p>Loading…</p> : null}
      {summary.status === "error" ? <p>Error: {summary.errorMessage}</p> : null}
      {values ? (
        <>
          {variant === "A" && <VariantA values={values} />}
          {variant === "B" && <VariantB values={values} />}
          {variant === "C" && <VariantC values={values} />}
          {values.some((v) => v.error) ? (
            <pre style={{ fontSize: 11, color: "#b91c1c", whiteSpace: "pre-wrap" }}>
              {values
                .filter((v) => v.error)
                .map((v) => `${v.def.label}: ${v.error}`)
                .join("\n")}
            </pre>
          ) : null}
          <details>
            <summary style={{ fontSize: 12, color: MUTED }}>Raw values</summary>
            <pre style={{ fontSize: 11 }}>
              {JSON.stringify(
                values.map(({ def, baseline, future }) => ({ metric: def.key, baseline, future })),
                null,
                2
              )}
            </pre>
          </details>
        </>
      ) : null}
      <PrototypeSwitcher variants={VARIANTS} />
    </section>
  );
}
