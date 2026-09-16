"use client";

import styles from "./WindFarmLayout.module.scss";

// Turbine spacing: 8 × rotor diameter in x and y, every other row offset by
// half spacing (see the Wind installation design parameters in the guidance
// text). Positions here are generated from that rule, not copied from a
// specific run — they illustrate the pattern, not a literal deployed layout.
const DOMAIN = 3000;
const ONSHORE_ROTOR_DIAMETER = 127.5;
const OFFSHORE_ROTOR_DIAMETER = 180;
const SPACING_FACTOR = 8;

const WIDTH = 480;
const HEIGHT = 480;
const MARGIN = { top: 16, right: 16, bottom: 44, left: 56 };
const PLOT_SIZE = WIDTH - MARGIN.left - MARGIN.right;

function generateLayout(rotorDiameter: number): [number, number][] {
  const spacing = SPACING_FACTOR * rotorDiameter;
  const rowCount = Math.floor(DOMAIN / spacing) + 1;
  const extent = (rowCount - 1) * spacing;
  const margin = (DOMAIN - extent) / 2;
  const points: [number, number][] = [];

  for (let row = 0; row < rowCount; row++) {
    const y = margin + row * spacing;
    const rowOffset = row % 2 === 1 ? spacing / 2 : 0;
    for (let x = margin + rowOffset; x <= DOMAIN - margin + 1; x += spacing) {
      points.push([x, y]);
    }
  }

  return points;
}

const TICKS = [0, 500, 1000, 1500, 2000, 2500, 3000];

function toPlotCoords([x, y]: [number, number]): [number, number] {
  return [(x / DOMAIN) * PLOT_SIZE, PLOT_SIZE - (y / DOMAIN) * PLOT_SIZE];
}

/** Example onshore vs offshore turbine spacing across a 3 km domain. */
export default function WindFarmLayout() {
  const onshore = generateLayout(ONSHORE_ROTOR_DIAMETER);
  const offshore = generateLayout(OFFSHORE_ROTOR_DIAMETER);

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Example turbine positions across a 3 kilometer square domain, comparing onshore turbine spacing (1,020 meters, 8 times the 127.5 meter rotor diameter) with offshore turbine spacing (1,440 meters, 8 times the 180 meter rotor diameter), with every other row offset by half the spacing."
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {TICKS.map((tick) => {
            const [x] = toPlotCoords([tick, 0]);
            const [, y] = toPlotCoords([0, tick]);
            return (
              <g key={tick}>
                <line
                  className={styles.grid}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={PLOT_SIZE}
                  aria-hidden="true"
                />
                <line
                  className={styles.grid}
                  x1={0}
                  x2={PLOT_SIZE}
                  y1={y}
                  y2={y}
                  aria-hidden="true"
                />
                <text
                  className={styles.tickLabel}
                  x={x}
                  y={PLOT_SIZE + 20}
                  textAnchor="middle"
                  aria-hidden="true"
                >
                  {tick}
                </text>
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

          <line
            className={styles.axisLine}
            x1={0}
            x2={0}
            y1={0}
            y2={PLOT_SIZE}
            aria-hidden="true"
          />
          <line
            className={styles.axisLine}
            x1={0}
            x2={PLOT_SIZE}
            y1={PLOT_SIZE}
            y2={PLOT_SIZE}
            aria-hidden="true"
          />

          {onshore.map((point, i) => {
            const [x, y] = toPlotCoords(point);
            return (
              <circle
                key={`onshore-${i}`}
                className={styles.onshoreDot}
                cx={x}
                cy={y}
                r={7}
                aria-hidden="true"
              />
            );
          })}
          {offshore.map((point, i) => {
            const [x, y] = toPlotCoords(point);
            return (
              <circle
                key={`offshore-${i}`}
                className={styles.offshoreDot}
                cx={x}
                cy={y}
                r={7}
                aria-hidden="true"
              />
            );
          })}

          <text
            className={styles.axisTitle}
            x={PLOT_SIZE / 2}
            y={PLOT_SIZE + 38}
            textAnchor="middle"
            aria-hidden="true"
          >
            Turbine position (m)
          </text>
          <text
            className={styles.axisTitle}
            x={-PLOT_SIZE / 2}
            y={-40}
            textAnchor="middle"
            transform="rotate(-90)"
            aria-hidden="true"
          >
            Turbine position (m)
          </text>
        </g>
      </svg>

      <figcaption className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.onshoreSwatch} aria-hidden="true" />
          Onshore (1,020 m spacing)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.offshoreSwatch} aria-hidden="true" />
          Offshore (1,440 m spacing)
        </span>
      </figcaption>
    </figure>
  );
}
