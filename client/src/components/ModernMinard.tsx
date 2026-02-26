/**
 * Modern Interactive Minard Chart
 * Dark Academic theme
 *
 * Layout (top to bottom):
 *   [ADVANCE BAND]  — tan, widest left (Niemen 422k), narrowing to Moscow (100k)
 *   [gap]
 *   [RETREAT BAND]  — dark brown, widest left (Moscow 100k), narrowing right (Niemen 10k)
 *   [TEMPERATURE]   — blue line beneath retreat
 */

import { useState } from "react";

const ADVANCE = [
  { city: "Kaunas (Niemen)", troops: 422000, date: "Jun 1812" },
  { city: "Vilnius", troops: 400000, date: "Jun 1812" },
  { city: "Vitebsk", troops: 175000, date: "Jul 1812" },
  { city: "Smolensk", troops: 145000, date: "Aug 1812" },
  { city: "Moscow", troops: 100000, date: "Sep 1812" },
];

const RETREAT = [
  { city: "Moscow", troops: 100000, date: "Oct 1812", tempR: 0 },
  { city: "Smolensk", troops: 55000, date: "Nov 1812", tempR: -9 },
  { city: "Berezina", troops: 37000, date: "Nov 1812", tempR: -21 },
  { city: "Vilnius", troops: 24000, date: "Dec 1812", tempR: -26 },
  { city: "Kaunas (Niemen)", troops: 10000, date: "Dec 1812", tempR: -30 },
];

const SVG_W = 760;
const MAX_BAND_H = 80;
const MAX_TROOPS = 422000;
const GAP = 20;
const ADV_TOP = 48;
const PAD_X = 20;
const INNER_W = SVG_W - PAD_X * 2;
const TEMP_AREA_H = 68;

function bandH(troops: number) {
  return (troops / MAX_TROOPS) * MAX_BAND_H;
}
function xPos(i: number, total: number) {
  return PAD_X + (i / (total - 1)) * INNER_W;
}

// Advance: bottom edge is flat baseline, top edge rises with troop count
const ADV_BASE = ADV_TOP + MAX_BAND_H;
function advTopY(troops: number) { return ADV_BASE - bandH(troops); }

// Retreat: top edge is flat, bottom edge drops with troop count
const RET_TOP = ADV_BASE + GAP;
function retBotY(troops: number) { return RET_TOP + bandH(troops); }

const TEMP_TOP = RET_TOP + MAX_BAND_H + 18;
const SVG_H = TEMP_TOP + TEMP_AREA_H + 20;

function tempY(tempR: number) {
  const ratio = (tempR - 2) / (-32 - 2);
  return TEMP_TOP + ratio * (TEMP_AREA_H - 8);
}
function rToC(r: number) { return Math.round(r * 1.25); }

function advancePoints() {
  const n = ADVANCE.length;
  const top = ADVANCE.map((d, i) => `${xPos(i, n)},${advTopY(d.troops)}`);
  const bot = ADVANCE.map((_, i) => `${xPos(i, n)},${ADV_BASE}`).reverse();
  return [...top, ...bot].join(" ");
}

function retreatPoints() {
  const n = RETREAT.length;
  const top = RETREAT.map((_, i) => `${xPos(i, n)},${RET_TOP}`);
  const bot = RETREAT.map((d, i) => `${xPos(i, n)},${retBotY(d.troops)}`).reverse();
  return [...top, ...bot].join(" ");
}

type TooltipData = {
  x: number; y: number; city: string; troops: number; date: string; tempR?: number;
} | null;

export default function ModernMinardChart() {
  const [tooltip, setTooltip] = useState<TooltipData>(null);
  const advN = ADVANCE.length;
  const retN = RETREAT.length;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="mm-adv" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.80 0.11 80)" />
            <stop offset="100%" stopColor="oklch(0.68 0.09 76)" />
          </linearGradient>
          <linearGradient id="mm-ret" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.40 0.07 55)" />
            <stop offset="100%" stopColor="oklch(0.24 0.04 50)" />
          </linearGradient>
          <linearGradient id="mm-temp-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.60 0.14 220)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="oklch(0.35 0.10 220)" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* ── ADVANCE BAND ── */}
        <polygon points={advancePoints()} fill="url(#mm-adv)" stroke="oklch(0.72 0.09 78)" strokeWidth="0.8" opacity="0.93" />

        <text x={PAD_X + 4} y={ADV_TOP - 8} fill="oklch(0.72 0.08 78)" fontSize="9" fontFamily="'Lora', serif" opacity="0.85">
          ADVANCE →
        </text>

        {ADVANCE.map((d, i) => (
          <text key={`al-${i}`} x={xPos(i, advN)} y={advTopY(d.troops) - 5}
            textAnchor="middle" fill="oklch(0.75 0.08 75)" fontSize="8.5" fontFamily="'Lora', serif">
            {d.city.split(" (")[0]}
          </text>
        ))}

        {ADVANCE.map((d, i) => {
          const midY = (advTopY(d.troops) + ADV_BASE) / 2;
          return (
            <text key={`at-${i}`} x={xPos(i, advN)} y={midY + 3}
              textAnchor="middle" fill="oklch(0.22 0.02 60)" fontSize="8" fontWeight="700" fontFamily="'Lora', serif">
              {(d.troops / 1000).toFixed(0)}k
            </text>
          );
        })}

        {ADVANCE.map((d, i) => (
          <circle key={`ad-${i}`} cx={xPos(i, advN)} cy={ADV_BASE} r={5}
            fill="oklch(0.82 0.10 78)" stroke="oklch(0.18 0.02 60)" strokeWidth="1.5"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setTooltip({ x: xPos(i, advN), y: ADV_BASE - 12, city: d.city, troops: d.troops, date: d.date })}
            onMouseLeave={() => setTooltip(null)} />
        ))}

        {/* ── RETREAT BAND ── */}
        <polygon points={retreatPoints()} fill="url(#mm-ret)" stroke="oklch(0.30 0.05 52)" strokeWidth="0.8" opacity="0.93" />

        <text x={PAD_X + 4} y={RET_TOP - 5} fill="oklch(0.52 0.06 55)" fontSize="9" fontFamily="'Lora', serif" opacity="0.85">
          ← RETREAT
        </text>

        {RETREAT.map((d, i) => {
          const midY = RET_TOP + bandH(d.troops) / 2;
          return (
            <text key={`rt-${i}`} x={xPos(i, retN)} y={midY + 3}
              textAnchor="middle" fill="oklch(0.82 0.04 60)" fontSize="8" fontWeight="700" fontFamily="'Lora', serif">
              {(d.troops / 1000).toFixed(0)}k
            </text>
          );
        })}

        {RETREAT.map((d, i) => (
          <circle key={`rd-${i}`} cx={xPos(i, retN)} cy={RET_TOP} r={5}
            fill="oklch(0.55 0.07 55)" stroke="oklch(0.18 0.02 60)" strokeWidth="1.5"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setTooltip({ x: xPos(i, retN), y: RET_TOP - 12, city: d.city, troops: d.troops, date: d.date, tempR: d.tempR })}
            onMouseLeave={() => setTooltip(null)} />
        ))}

        {/* ── TEMPERATURE ── */}
        <text x={PAD_X} y={TEMP_TOP - 5} fill="oklch(0.52 0.10 220)" fontSize="8" fontFamily="'Lora', serif" opacity="0.8">
          TEMPERATURE — RETREAT PHASE
        </text>

        <line x1={PAD_X} y1={tempY(0)} x2={SVG_W - PAD_X} y2={tempY(0)}
          stroke="oklch(0.50 0.04 75)" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.35" />
        <text x={PAD_X - 3} y={tempY(0) + 3} fill="oklch(0.48 0.04 75)" fontSize="7.5" textAnchor="end">0°R</text>
        <text x={PAD_X - 3} y={tempY(-30) + 3} fill="oklch(0.48 0.04 75)" fontSize="7.5" textAnchor="end">−30°R</text>

        <polygon
          points={`${RETREAT.map((d, i) => `${xPos(i, retN)},${tempY(d.tempR)}`).join(" ")} ${xPos(retN - 1, retN)},${tempY(0)} ${xPos(0, retN)},${tempY(0)}`}
          fill="url(#mm-temp-fill)" />

        <polyline points={RETREAT.map((d, i) => `${xPos(i, retN)},${tempY(d.tempR)}`).join(" ")}
          fill="none" stroke="oklch(0.65 0.15 220)" strokeWidth="2" strokeLinejoin="round" />

        {RETREAT.map((d, i) => (
          <g key={`tg-${i}`}>
            <circle cx={xPos(i, retN)} cy={tempY(d.tempR)} r={3.5}
              fill="oklch(0.65 0.15 220)" stroke="oklch(0.18 0.02 60)" strokeWidth="1" />
            <text x={xPos(i, retN)} y={tempY(d.tempR) - 6}
              textAnchor="middle" fill="oklch(0.62 0.12 220)" fontSize="7.5" fontFamily="'Lora', serif">
              {d.tempR}°R
            </text>
          </g>
        ))}
      </svg>

      {/* ── TOOLTIP ── */}
      {tooltip && (
        <div style={{
          position: "absolute",
          left: `${(tooltip.x / SVG_W) * 100}%`,
          top: `${(tooltip.y / SVG_H) * 100}%`,
          transform: "translate(-50%, -100%)",
          background: "oklch(0.16 0.02 60)",
          border: "1px solid oklch(0.45 0.08 75)",
          borderRadius: "6px",
          padding: "8px 12px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 10,
          boxShadow: "0 4px 16px oklch(0 0 0 / 0.5)",
        }}>
          <div style={{ color: "oklch(0.82 0.10 75)", fontWeight: 600, fontSize: "0.82rem", fontFamily: "'Cormorant Garamond', serif" }}>
            {tooltip.city}
          </div>
          <div style={{ color: "oklch(0.65 0.05 75)", fontSize: "0.72rem" }}>{tooltip.date}</div>
          <div style={{ color: "oklch(0.88 0.04 75)", fontSize: "0.76rem", marginTop: "3px" }}>
            {tooltip.troops.toLocaleString()} troops
          </div>
          {tooltip.tempR !== undefined && (
            <div style={{ color: "oklch(0.65 0.15 220)", fontSize: "0.72rem", marginTop: "2px" }}>
              {tooltip.tempR}°R &nbsp;/&nbsp; {rToC(tooltip.tempR)}°C
            </div>
          )}
        </div>
      )}
    </div>
  );
}
