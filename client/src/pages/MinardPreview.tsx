/**
 * STANDALONE PREVIEW — Modern Interactive Minard Chart
 * Dark Academic theme: deep charcoal bg, antique gold accents, Lora/Cormorant typography
 *
 * Design approach:
 * - Two horizontal flow bands drawn as SVG polygons sharing a centre axis
 *   • Advance (tan/wheat): top half, widest at left (Niemen), narrowing to Moscow
 *   • Retreat (dark brown): bottom half, widest at Moscow, narrowing back to Niemen
 * - Band height at each waypoint = proportional to troop count (max = full half-height)
 * - Temperature line chart beneath both bands (retreat phase only)
 * - Hover tooltips on each waypoint dot
 * - City labels above advance band
 */

import { useState } from "react";

// ── DATA ─────────────────────────────────────────────────────────────────────

const ADVANCE = [
  { city: "Kaunas\n(Niemen)", troops: 422000, date: "Jun 1812" },
  { city: "Vilnius", troops: 400000, date: "Jun 1812" },
  { city: "Vitebsk", troops: 175000, date: "Jul 1812" },
  { city: "Smolensk", troops: 145000, date: "Aug 1812" },
  { city: "Moscow", troops: 100000, date: "Sep 1812" },
];

const RETREAT = [
  { city: "Moscow", troops: 100000, date: "Oct 1812", temp: 0 },
  { city: "Smolensk", troops: 55000, date: "Nov 1812", temp: -9 },
  { city: "Studianka\n(Berezina)", troops: 37000, date: "Nov 1812", temp: -21 },
  { city: "Vilnius", troops: 24000, date: "Dec 1812", temp: -26 },
  { city: "Kaunas\n(Niemen)", troops: 10000, date: "Dec 1812", temp: -30 },
];

// ── LAYOUT CONSTANTS ─────────────────────────────────────────────────────────

const W = 800;
const BAND_H = 160;       // total height for both bands combined
const HALF = BAND_H / 2;  // centre axis y
const MAX_TROOPS = 422000;
const TEMP_H = 80;        // height of temperature chart area
const PADDING_X = 60;
const PADDING_TOP = 60;
const TOTAL_H = PADDING_TOP + BAND_H + TEMP_H + 60;

function xPos(i: number, total: number) {
  return PADDING_X + (i / (total - 1)) * (W - PADDING_X * 2);
}

function bandHalf(troops: number) {
  return (troops / MAX_TROOPS) * HALF * 0.92;
}

function tempY(temp: number) {
  // Map 0°C → top of temp area, -30°C → bottom
  const minT = -32, maxT = 2;
  const ratio = (temp - maxT) / (minT - maxT);
  return PADDING_TOP + BAND_H + 10 + ratio * (TEMP_H - 20);
}

// Build SVG polygon points for advance band (top half of centre axis)
function advancePolygon() {
  const n = ADVANCE.length;
  // top edge: centre - halfHeight
  const top = ADVANCE.map((d, i) => `${xPos(i, n)},${PADDING_TOP + HALF - bandHalf(d.troops)}`);
  // bottom edge: centre (shared axis)
  const bot = ADVANCE.map((d, i) => `${xPos(i, n)},${PADDING_TOP + HALF}`).reverse();
  return [...top, ...bot].join(" ");
}

// Build SVG polygon points for retreat band (bottom half of centre axis)
function retreatPolygon() {
  const n = RETREAT.length;
  // top edge: centre (shared axis)
  const top = RETREAT.map((d, i) => `${xPos(i, n)},${PADDING_TOP + HALF}`);
  // bottom edge: centre + halfHeight
  const bot = RETREAT.map((d, i) => `${xPos(i, n)},${PADDING_TOP + HALF + bandHalf(d.troops)}`).reverse();
  return [...top, ...bot].join(" ");
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

type Tooltip = {
  x: number;
  y: number;
  city: string;
  troops: number;
  date: string;
  temp?: number;
} | null;

export default function MinardPreview() {
  const [tooltip, setTooltip] = useState<Tooltip>(null);

  const advN = ADVANCE.length;
  const retN = RETREAT.length;

  // Temperature line path
  const tempPoints = RETREAT.map((d, i) => `${xPos(i, retN)},${tempY(d.temp)}`).join(" ");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "oklch(0.13 0.015 60)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Lora', serif",
      }}
    >
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: "oklch(0.82 0.10 75)",
          fontSize: "1.8rem",
          fontWeight: 600,
          marginBottom: "0.25rem",
          letterSpacing: "0.02em",
        }}
      >
        Modern Interactive Minard
      </h1>
      <p style={{ color: "oklch(0.60 0.05 75)", fontSize: "0.85rem", marginBottom: "2rem" }}>
        Hover over the dots to explore troop counts, dates, and temperatures
      </p>

      <div style={{ position: "relative", width: "100%", maxWidth: W + 40 }}>
        <svg
          viewBox={`0 0 ${W} ${TOTAL_H}`}
          width="100%"
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="advGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.78 0.10 80)" stopOpacity="1" />
              <stop offset="100%" stopColor="oklch(0.65 0.08 75)" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="retGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.35 0.06 55)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="oklch(0.22 0.04 50)" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="tempGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.65 0.15 220)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="oklch(0.35 0.12 220)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* ── ADVANCE BAND ── */}
          <polygon
            points={advancePolygon()}
            fill="url(#advGrad)"
            stroke="oklch(0.70 0.09 78)"
            strokeWidth="1"
            opacity="0.92"
          />

          {/* ── RETREAT BAND ── */}
          <polygon
            points={retreatPolygon()}
            fill="url(#retGrad)"
            stroke="oklch(0.30 0.05 52)"
            strokeWidth="1"
            opacity="0.92"
          />

          {/* ── CENTRE AXIS ── */}
          <line
            x1={PADDING_X}
            y1={PADDING_TOP + HALF}
            x2={W - PADDING_X}
            y2={PADDING_TOP + HALF}
            stroke="oklch(0.55 0.06 75)"
            strokeWidth="0.5"
            strokeDasharray="4 3"
            opacity="0.4"
          />

          {/* ── TEMPERATURE AREA ── */}
          <text
            x={PADDING_X}
            y={PADDING_TOP + BAND_H + 8}
            fill="oklch(0.55 0.08 220)"
            fontSize="9"
            fontFamily="'Lora', serif"
          >
            TEMPERATURE (°R) — RETREAT PHASE
          </text>

          {/* Temp zero line */}
          <line
            x1={PADDING_X}
            y1={tempY(0)}
            x2={W - PADDING_X}
            y2={tempY(0)}
            stroke="oklch(0.55 0.06 75)"
            strokeWidth="0.5"
            strokeDasharray="3 3"
            opacity="0.3"
          />
          <text x={PADDING_X - 4} y={tempY(0) + 3} fill="oklch(0.50 0.04 75)" fontSize="8" textAnchor="end">0°</text>
          <text x={PADDING_X - 4} y={tempY(-30) + 3} fill="oklch(0.50 0.04 75)" fontSize="8" textAnchor="end">−30°</text>

          {/* Temp fill area */}
          <polygon
            points={`${RETREAT.map((d, i) => `${xPos(i, retN)},${tempY(d.temp)}`).join(" ")} ${xPos(retN - 1, retN)},${tempY(0)} ${xPos(0, retN)},${tempY(0)}`}
            fill="url(#tempGrad)"
          />

          {/* Temp line */}
          <polyline
            points={tempPoints}
            fill="none"
            stroke="oklch(0.65 0.15 220)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* ── CITY LABELS (advance) ── */}
          {ADVANCE.map((d, i) => {
            const cx = xPos(i, advN);
            const topY = PADDING_TOP + HALF - bandHalf(d.troops);
            return (
              <text
                key={`adv-label-${i}`}
                x={cx}
                y={topY - 8}
                textAnchor="middle"
                fill="oklch(0.75 0.08 75)"
                fontSize="9"
                fontFamily="'Lora', serif"
              >
                {d.city.split("\n")[0]}
              </text>
            );
          })}

          {/* ── ADVANCE DOTS ── */}
          {ADVANCE.map((d, i) => {
            const cx = xPos(i, advN);
            const cy = PADDING_TOP + HALF;
            return (
              <circle
                key={`adv-dot-${i}`}
                cx={cx}
                cy={cy}
                r={5}
                fill="oklch(0.82 0.10 78)"
                stroke="oklch(0.20 0.02 60)"
                strokeWidth="1.5"
                style={{ cursor: "pointer" }}
                onMouseEnter={() =>
                  setTooltip({ x: cx, y: cy - 20, city: d.city.replace("\n", " "), troops: d.troops, date: d.date })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

          {/* ── RETREAT DOTS ── */}
          {RETREAT.map((d, i) => {
            const cx = xPos(i, retN);
            const cy = PADDING_TOP + HALF;
            return (
              <circle
                key={`ret-dot-${i}`}
                cx={cx}
                cy={cy}
                r={5}
                fill="oklch(0.55 0.07 55)"
                stroke="oklch(0.20 0.02 60)"
                strokeWidth="1.5"
                style={{ cursor: "pointer" }}
                onMouseEnter={() =>
                  setTooltip({ x: cx, y: cy - 20, city: d.city.replace("\n", " "), troops: d.troops, date: d.date, temp: d.temp })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

          {/* ── TEMP DOTS ── */}
          {RETREAT.map((d, i) => {
            const cx = xPos(i, retN);
            const cy = tempY(d.temp);
            return (
              <circle
                key={`temp-dot-${i}`}
                cx={cx}
                cy={cy}
                r={3.5}
                fill="oklch(0.65 0.15 220)"
                stroke="oklch(0.20 0.02 60)"
                strokeWidth="1"
              />
            );
          })}

          {/* ── DIRECTION LABELS ── */}
          <text x={PADDING_X + 10} y={PADDING_TOP + HALF - 6} fill="oklch(0.72 0.08 78)" fontSize="8" fontFamily="'Lora', serif" opacity="0.7">
            ← ADVANCE
          </text>
          <text x={PADDING_X + 10} y={PADDING_TOP + HALF + 14} fill="oklch(0.50 0.06 55)" fontSize="8" fontFamily="'Lora', serif" opacity="0.7">
            RETREAT →
          </text>

          {/* ── TROOP COUNT LABELS ── */}
          {ADVANCE.map((d, i) => {
            const cx = xPos(i, advN);
            return (
              <text
                key={`adv-count-${i}`}
                x={cx}
                y={PADDING_TOP + HALF - bandHalf(d.troops) / 2}
                textAnchor="middle"
                fill="oklch(0.25 0.02 60)"
                fontSize="8"
                fontWeight="600"
                fontFamily="'Lora', serif"
              >
                {(d.troops / 1000).toFixed(0)}k
              </text>
            );
          })}
          {RETREAT.map((d, i) => {
            const cx = xPos(i, retN);
            return (
              <text
                key={`ret-count-${i}`}
                x={cx}
                y={PADDING_TOP + HALF + bandHalf(d.troops) / 2 + 4}
                textAnchor="middle"
                fill="oklch(0.80 0.04 60)"
                fontSize="8"
                fontWeight="600"
                fontFamily="'Lora', serif"
              >
                {(d.troops / 1000).toFixed(0)}k
              </text>
            );
          })}
        </svg>

        {/* ── TOOLTIP ── */}
        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: `${(tooltip.x / W) * 100}%`,
              top: `${(tooltip.y / TOTAL_H) * 100}%`,
              transform: "translate(-50%, -100%)",
              background: "oklch(0.18 0.02 60)",
              border: "1px solid oklch(0.45 0.08 75)",
              borderRadius: "6px",
              padding: "8px 12px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            <div style={{ color: "oklch(0.82 0.10 75)", fontWeight: 600, fontSize: "0.8rem", fontFamily: "'Cormorant Garamond', serif" }}>
              {tooltip.city}
            </div>
            <div style={{ color: "oklch(0.70 0.05 75)", fontSize: "0.72rem" }}>{tooltip.date}</div>
            <div style={{ color: "oklch(0.85 0.04 75)", fontSize: "0.75rem", marginTop: "2px" }}>
              {tooltip.troops.toLocaleString()} troops
            </div>
            {tooltip.temp !== undefined && (
              <div style={{ color: "oklch(0.65 0.15 220)", fontSize: "0.72rem" }}>
                {tooltip.temp}°R ({Math.round(tooltip.temp * 1.25)}°C)
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── LEGEND ── */}
      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.5rem", fontSize: "0.78rem", color: "oklch(0.60 0.05 75)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: 20, height: 10, background: "oklch(0.78 0.10 80)", display: "inline-block", borderRadius: 2 }} />
          Advance
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: 20, height: 10, background: "oklch(0.35 0.06 55)", display: "inline-block", borderRadius: 2 }} />
          Retreat
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: 20, height: 3, background: "oklch(0.65 0.15 220)", display: "inline-block" }} />
          Temperature
        </span>
        <span style={{ color: "oklch(0.50 0.04 75)" }}>● Hover for data</span>
      </div>
    </div>
  );
}
