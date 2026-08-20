"use client";

import styles from "./TurbinePowerCurve.module.scss";

// Standard cubic ramp-up between cut-in and rated wind speed, flat at rated
// power until cut-out, then zero — the shape NREL's ReV turbine power curves
// follow (see the Wind installation design parameters in the guidance text).
const CUT_IN = 3;
const RATED_SPEED = 11;
const CUT_OUT = 25;
const MAX_SPEED = 40;
const MAX_POWER = 8;

const WIDTH = 640;
const HEIGHT = 360;
const MARGIN = { top: 16, right: 16, bottom: 44, left: 56 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

function powerAt(speed: number, ratedPower: number): number {
  if (speed < CUT_IN || speed > CUT_OUT) return 0;
  if (speed <= RATED_SPEED) {
    const t = (speed ** 3 - CUT_IN ** 3) / (RATED_SPEED ** 3 - CUT_IN ** 3);
    return ratedPower * t;
  }
  return ratedPower;
}

function buildPath(ratedPower: number): string {
  const points: [number, number][] = [];
  for (let speed = 0; speed <= MAX_SPEED; speed += 0.25) {
    points.push([speed, powerAt(speed, ratedPower)]);
  }

  return points
    .map(([speed, power], i) => {
      const x = (speed / MAX_SPEED) * PLOT_WIDTH;
      const y = PLOT_HEIGHT - (power / MAX_POWER) * PLOT_HEIGHT;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

const X_TICKS = [0, 10, 20, 30, 40];
const Y_TICKS = [0, 2, 4, 6, 8];

/** Onshore (3 MW) vs offshore (8 MW) turbine power output by wind speed. */
export default function TurbinePowerCurve() {
  const onshorePath = buildPath(3);
  const offshorePath = buildPath(8);

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Turbine power curve: power output in megawatts by wind speed in meters per second, for onshore (3 megawatt) and offshore (8 megawatt) turbines. Power ramps up between 3 and 11 meters per second, holds steady until 25 meters per second, then cuts out to zero."
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {Y_TICKS.map((tick) => {
            const y = PLOT_HEIGHT - (tick / MAX_POWER) * PLOT_HEIGHT;
            return (
              <g key={tick}>
                <line
                  className={styles.grid}
                  x1={0}
                  x2={PLOT_WIDTH}
                  y1={y}
                  y2={y}
                  aria-hidden="true"
                />
                <text
                  className={styles.tickLabel}
                  x={-10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  aria-hidden="true"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {X_TICKS.map((tick) => {
            const x = (tick / MAX_SPEED) * PLOT_WIDTH;
            return (
              <text
                key={tick}
                className={styles.tickLabel}
                x={x}
                y={PLOT_HEIGHT + 22}
                textAnchor="middle"
                aria-hidden="true"
              >
                {tick}
              </text>
            );
          })}

          <line
            className={styles.axisLine}
            x1={0}
            x2={0}
            y1={0}
            y2={PLOT_HEIGHT}
            aria-hidden="true"
          />
          <line
            className={styles.axisLine}
            x1={0}
            x2={PLOT_WIDTH}
            y1={PLOT_HEIGHT}
            y2={PLOT_HEIGHT}
            aria-hidden="true"
          />

          <path className={styles.onshoreLine} d={onshorePath} aria-hidden="true" />
          <path className={styles.offshoreLine} d={offshorePath} aria-hidden="true" />

          <text
            className={styles.axisTitle}
            x={PLOT_WIDTH / 2}
            y={PLOT_HEIGHT + 40}
            textAnchor="middle"
            aria-hidden="true"
          >
            Wind speed (m/s)
          </text>
          <text
            className={styles.axisTitle}
            x={-PLOT_HEIGHT / 2}
            y={-40}
            textAnchor="middle"
            transform="rotate(-90)"
            aria-hidden="true"
          >
            Power (MW)
          </text>
        </g>
      </svg>

      <figcaption className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.onshoreSwatch} aria-hidden="true" />
          Onshore (3 MW)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.offshoreSwatch} aria-hidden="true" />
          Offshore (8 MW)
        </span>
      </figcaption>
    </figure>
  );
}
