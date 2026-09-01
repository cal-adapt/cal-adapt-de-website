"use client";

import styles from "./WarmingLevelTimeIndex.module.scss";

// Illustrative example (matches the guidance text): two models reach the same
// +1.75°C warming level in different calendar years, so the multi-model mean
// re-indexes each model's 30-year window to a shared synthetic time axis
// (-15 to +14 years around the target) instead of calendar years. The
// highlighted band around each target tick represents that window — one tick
// either side, matching the original diagram's bracket.
const MODELS = [
  {
    name: "Model A",
    levels: [1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75],
    years: [2025, 2032, 2040, 2047, 2055, 2062, 2080],
    targetIndex: 2,
  },
  {
    name: "Model B",
    levels: [1.25, 1.37, 1.5, 1.62, 1.75, 1.87, 2.0],
    years: [2025, 2032, 2040, 2047, 2055, 2062, 2080],
    targetIndex: 4,
  },
];

const WIDTH = 640;
const ROW_HEIGHT = 90;
const MARGIN = { top: 24, left: 90, right: 24 };
const TRACK_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const HEIGHT = MARGIN.top + MODELS.length * ROW_HEIGHT + 120;
const BAND_HEIGHT = 22;

/** Two models reaching the same warming level in different years, aligned to
 * one synthetic time index — see "Time Frame" in the guidance text. */
export default function WarmingLevelTimeIndex() {
  const bracketBottom = MARGIN.top + MODELS.length * ROW_HEIGHT + 10;
  const zeroX = MARGIN.left + (15 / 29) * TRACK_WIDTH;

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Diagram showing Model A reaching +1.75°C warming in 2040 and Model B reaching +1.75°C warming in 2055 — different calendar years for the same warming level. Each model's 30-year averaging window (highlighted, one tick either side of the target) is aligned to a shared synthetic time index running from -15 to +14 years around the warming level, rather than calendar year."
      >
        {MODELS.map((model, rowIndex) => {
          const y = MARGIN.top + rowIndex * ROW_HEIGHT;
          const stepWidth = TRACK_WIDTH / (model.levels.length - 1);
          const targetX = MARGIN.left + model.targetIndex * stepWidth;
          const bandStartX = MARGIN.left + (model.targetIndex - 1) * stepWidth;
          const bandEndX = MARGIN.left + (model.targetIndex + 1) * stepWidth;

          return (
            <g key={model.name}>
              <text className={styles.rowLabel} x={0} y={y + 5} aria-hidden="true">
                {model.name}
              </text>

              {/* The 30-year window around the target — one tick either side. */}
              <rect
                className={styles.window}
                x={bandStartX}
                y={y - BAND_HEIGHT / 2}
                width={bandEndX - bandStartX}
                height={BAND_HEIGHT}
                rx={BAND_HEIGHT / 2}
                aria-hidden="true"
              />

              <line
                className={styles.track}
                x1={MARGIN.left}
                x2={MARGIN.left + TRACK_WIDTH}
                y1={y}
                y2={y}
                aria-hidden="true"
              />

              {model.levels.map((level, i) => {
                const x = MARGIN.left + i * stepWidth;
                const isTarget = i === model.targetIndex;
                return (
                  <g key={level}>
                    <circle
                      className={isTarget ? styles.tickTarget : styles.tick}
                      cx={x}
                      cy={y}
                      r={isTarget ? 5 : 3}
                      aria-hidden="true"
                    />
                    <text
                      className={isTarget ? styles.levelLabelTarget : styles.levelLabel}
                      x={x}
                      y={y - 14}
                      textAnchor="middle"
                      aria-hidden="true"
                    >
                      {level.toFixed(2)}°
                    </text>
                    {rowIndex === MODELS.length - 1 && (
                      <text
                        className={styles.yearLabel}
                        x={x}
                        y={y + 26}
                        textAnchor="middle"
                        aria-hidden="true"
                      >
                        {model.years[i]}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Bracket: the window's edges converge to a point below,
                  carrying the highlighted range down to the merge point. */}
              <path
                className={styles.bracket}
                d={`M${bandStartX},${y + BAND_HEIGHT / 2} L${bandStartX},${y + 26} L${targetX},${bracketBottom} L${bandEndX},${y + 26} L${bandEndX},${y + BAND_HEIGHT / 2}`}
                fill="none"
                aria-hidden="true"
              />
            </g>
          );
        })}

        {MODELS.map((model) => {
          const stepWidth = TRACK_WIDTH / (model.levels.length - 1);
          const targetX = MARGIN.left + model.targetIndex * stepWidth;
          return (
            <line
              key={model.name}
              className={styles.mergeLine}
              x1={targetX}
              x2={zeroX}
              y1={bracketBottom}
              y2={bracketBottom + 64}
              aria-hidden="true"
            />
          );
        })}

        <g transform={`translate(0, ${bracketBottom + 24})`}>
          <line
            className={styles.track}
            x1={MARGIN.left}
            x2={MARGIN.left + TRACK_WIDTH}
            y1={40}
            y2={40}
            aria-hidden="true"
          />
          {[-15, -10, -5, 0, 5, 10, 14].map((index) => {
            const x = MARGIN.left + ((index + 15) / 29) * TRACK_WIDTH;
            return (
              <g key={index}>
                <circle
                  className={index === 0 ? styles.tickTarget : styles.tick}
                  cx={x}
                  cy={40}
                  r={index === 0 ? 5 : 3}
                  aria-hidden="true"
                />
                <text
                  className={styles.yearLabel}
                  x={x}
                  y={62}
                  textAnchor="middle"
                  aria-hidden="true"
                >
                  {index > 0 ? `+${index}` : index}
                </text>
              </g>
            );
          })}
          <text className={styles.rowLabel} x={0} y={45} aria-hidden="true">
            Synthetic
            <tspan x={0} dy="1.1em">
              time index
            </tspan>
          </text>
        </g>
      </svg>
    </figure>
  );
}
