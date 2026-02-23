/*
 * ModernMinard.tsx
 * DESIGN PHILOSOPHY: Dark Academic / Manuscript Illumination
 *
 * A faithful interactive SVG interpretation of Minard's 1869 Napoleon map.
 * Layout:
 *   - Top section: ADVANCE band (tan), flows left→right, narrows as troops lost
 *   - Bottom section: RETREAT band (dark brown), flows right→left, narrows further
 *   - Both bands share the same horizontal x-axis (geography, west→east)
 *   - Below: temperature line chart (retreat phase only)
 *   - Hover tooltips on each waypoint dot
 */

import { useState } from "react";

// ── COLOURS ───────────────────────────────────────────────────────────────────
const GOLD      = "#c9a84c";
const GOLD_DIM  = "#8a6e30";
const TAN       = "#d4af6a";
const TAN_DARK  = "#b8922a";
const RETREAT   = "#6b3a1f";
const RETREAT_L = "#8a5030";
const BLUE      = "#6a9fd8";
const TICK_C    = "#a89878";
const BG_CARD   = "#251e14";
const BG_DEEP   = "#161009";

// ── WAYPOINTS ─────────────────────────────────────────────────────────────────
// x: 0–1 normalised west→east position
// Each city appears once; advance troops at that city, retreat troops at that city
const CITIES = [
  { name: "Niemen",   x: 0.00 },
  { name: "Vilna",    x: 0.12 },
  { name: "Vitebsk",  x: 0.32 },
  { name: "Smolensk", x: 0.50 },
  { name: "Moscow",   x: 0.78 },
];

// Advance: troops at each city going east
const ADVANCE = [422000, 400000, 175000, 145000, 100000];
// Retreat: troops at each city going west (Moscow first, Niemen last)
// Index matches CITIES order (west→east), so Niemen=10k, Vilna=12k, etc.
const RETREAT_TROOPS = [10000, 12000, 37000, 55000, 100000]; // west→east order

const DATES_ADV = ["Jun 1812", "Jul 1812", "Jul 1812", "Aug 1812", "Sep 1812"];
const DATES_RET = ["Dec 1812", "Dec 1812", "Nov 1812", "Nov 1812", "Oct 1812"]; // west→east

const TEMPS = [null, null, null, null, 0, -13.8, -25.0, -32.5, -37.5]; // not used directly

// Temperature readings during retreat (west→east: Niemen→Moscow)
const TEMP_BY_CITY = [-37.5, -32.5, -25.0, -13.8, 0];

// ── SVG DIMENSIONS ────────────────────────────────────────────────────────────
const W       = 760;
const PAD_L   = 52;
const PAD_R   = 24;
const CHART_W = W - PAD_L - PAD_R;

const ADV_TOP    = 16;   // top of advance band area
const ADV_BOTTOM = 140;  // bottom of advance band area (centre line)
const RET_TOP    = 148;  // top of retreat band area (centre line)
const RET_BOTTOM = 260;  // bottom of retreat band area
const TEMP_TOP   = 278;  // top of temperature chart
const TEMP_BOT   = 360;  // bottom of temperature chart
const H_TOTAL    = 390;

const MAX_TROOPS = 422000;
const ADV_MAX_H  = ADV_BOTTOM - ADV_TOP - 8;   // max band height (advance)
const RET_MAX_H  = RET_BOTTOM - RET_TOP - 8;   // max band height (retreat)

function scaleAdv(t: number) { return (t / MAX_TROOPS) * ADV_MAX_H; }
function scaleRet(t: number) { return (t / MAX_TROOPS) * RET_MAX_H; }

function cx(xNorm: number) { return PAD_L + xNorm * CHART_W; }

// Temperature scale: 0°C → TEMP_TOP, -40°C → TEMP_BOT
function tempY(t: number) {
  return TEMP_TOP + ((0 - t) / 40) * (TEMP_BOT - TEMP_TOP);
}

// ── TOOLTIP TYPE ──────────────────────────────────────────────────────────────
interface TooltipData {
  name: string;
  phase: "advance" | "retreat";
  troops: number;
  date: string;
  temp: number | null;
  px: number;
  py: number;
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function ModernMinardChart() {
  const [tip, setTip] = useState<TooltipData | null>(null);

  // Build advance polygon points
  // Top edge: left→right, each city's top = ADV_BOTTOM - bandH
  // Bottom edge: right→left, flat at ADV_BOTTOM
  const advTopPts = CITIES.map((c, i) => `${cx(c.x)},${ADV_BOTTOM - scaleAdv(ADVANCE[i])}`);
  const advBotPts = [...CITIES].reverse().map(c => `${cx(c.x)},${ADV_BOTTOM}`);
  const advPoly   = [...advTopPts, ...advBotPts].join(" ");

  // Build retreat polygon points
  // Retreat band: flat top at RET_TOP, bottom drops by troop count
  // Troops are given west→east but retreat travels east→west, so the band
  // is widest at Moscow (east) and narrowest at Niemen (west)
  const retTopPts = CITIES.map(c => `${cx(c.x)},${RET_TOP}`);
  const retBotPts = [...CITIES].reverse().map((c, ri) => {
    const i = CITIES.length - 1 - ri;
    return `${cx(c.x)},${RET_TOP + scaleRet(RETREAT_TROOPS[i])}`;
  });
  const retPoly = [...retTopPts, ...retBotPts].join(" ");

  // Temperature path (west→east: Niemen to Moscow)
  const tempPts = CITIES.map((c, i) =>
    TEMP_BY_CITY[i] !== null ? `${cx(c.x)},${tempY(TEMP_BY_CITY[i]!)}` : null
  ).filter(Boolean) as string[];
  const tempPath = tempPts.map((p, i) => `${i === 0 ? "M" : "L"}${p}`).join(" ");

  // Area fill under temperature line
  const tempArea = `${tempPath} L${cx(CITIES[CITIES.length-1].x)},${TEMP_BOT} L${cx(CITIES[0].x)},${TEMP_BOT} Z`;

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H_TOTAL}`}
        style={{ width: "100%", minWidth: 480, display: "block" }}
        onMouseLeave={() => setTip(null)}
      >
        {/* Background */}
        <rect x={0} y={0} width={W} height={H_TOTAL} fill={BG_DEEP} />

        {/* Section labels */}
        <text x={PAD_L - 4} y={ADV_TOP + 10} textAnchor="end"
          fill={TAN_DARK} fontSize={8} fontFamily="'Fira Mono', monospace" letterSpacing={1}>
          ADV
        </text>
        <text x={PAD_L - 4} y={RET_TOP + 10} textAnchor="end"
          fill={RETREAT_L} fontSize={8} fontFamily="'Fira Mono', monospace" letterSpacing={1}>
          RET
        </text>

        {/* Divider between advance and retreat */}
        <line x1={PAD_L} y1={ADV_BOTTOM + 4} x2={W - PAD_R} y2={ADV_BOTTOM + 4}
          stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

        {/* ── ADVANCE BAND ── */}
        <defs>
          <linearGradient id="advGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={TAN} stopOpacity={0.95} />
            <stop offset="100%" stopColor={TAN_DARK} stopOpacity={0.85} />
          </linearGradient>
          <linearGradient id="retGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={RETREAT} stopOpacity={0.7} />
            <stop offset="100%" stopColor={RETREAT_L} stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity={0.25} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <polygon points={advPoly} fill="url(#advGrad)" />

        {/* Advance band top edge line */}
        <polyline
          points={advTopPts.join(" ")}
          fill="none" stroke={GOLD_DIM} strokeWidth={1} strokeOpacity={0.5}
        />

        {/* ── RETREAT BAND ── */}
        <polygon points={retPoly} fill="url(#retGrad)" />

        {/* Retreat band bottom edge line */}
        <polyline
          points={[...CITIES].map((c, i) => `${cx(c.x)},${RET_TOP + scaleRet(RETREAT_TROOPS[i])}`).join(" ")}
          fill="none" stroke={GOLD_DIM} strokeWidth={1} strokeOpacity={0.3}
        />

        {/* ── CITY LABELS & VERTICAL CONNECTORS ── */}
        {CITIES.map((c, i) => (
          <g key={c.name}>
            {/* Vertical tick connecting advance top to retreat bottom */}
            <line
              x1={cx(c.x)} y1={ADV_BOTTOM - scaleAdv(ADVANCE[i])}
              x2={cx(c.x)} y2={RET_TOP + scaleRet(RETREAT_TROOPS[i])}
              stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="2 3"
            />
            {/* City name above advance band */}
            <text
              x={cx(c.x)} y={ADV_BOTTOM - scaleAdv(ADVANCE[i]) - 5}
              textAnchor="middle" fill={TICK_C}
              fontSize={9} fontFamily="'Fira Mono', monospace"
            >
              {c.name}
            </text>
          </g>
        ))}

        {/* ── ADVANCE DOTS ── */}
        {CITIES.map((c, i) => (
          <circle key={`adv-${i}`}
            cx={cx(c.x)} cy={ADV_BOTTOM - scaleAdv(ADVANCE[i]) / 2}
            r={5} fill={GOLD} stroke={BG_DEEP} strokeWidth={1.5}
            style={{ cursor: "pointer" }}
            onMouseEnter={e => {
              const rect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
              setTip({
                name: c.name, phase: "advance",
                troops: ADVANCE[i], date: DATES_ADV[i], temp: null,
                px: e.clientX - rect.left, py: e.clientY - rect.top,
              });
            }}
          />
        ))}

        {/* ── RETREAT DOTS ── */}
        {CITIES.map((c, i) => (
          <circle key={`ret-${i}`}
            cx={cx(c.x)} cy={RET_TOP + scaleRet(RETREAT_TROOPS[i]) / 2}
            r={5} fill={RETREAT_L} stroke={BG_DEEP} strokeWidth={1.5}
            style={{ cursor: "pointer" }}
            onMouseEnter={e => {
              const rect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
              setTip({
                name: c.name, phase: "retreat",
                troops: RETREAT_TROOPS[i], date: DATES_RET[i],
                temp: TEMP_BY_CITY[i],
                px: e.clientX - rect.left, py: e.clientY - rect.top,
              });
            }}
          />
        ))}

        {/* ── TROOP ANNOTATIONS ── */}
        {[0, 4].map(i => (
          <text key={`ann-${i}`}
            x={cx(CITIES[i].x) + (i === 0 ? 6 : -6)}
            y={ADV_BOTTOM - scaleAdv(ADVANCE[i]) / 2 + 4}
            textAnchor={i === 0 ? "start" : "end"}
            fill="rgba(255,255,255,0.45)" fontSize={8}
            fontFamily="'Fira Mono', monospace"
          >
            {(ADVANCE[i] / 1000).toFixed(0)}k
          </text>
        ))}

        {/* ── DIRECTION ARROWS ── */}
        <text x={PAD_L + CHART_W * 0.35} y={ADV_BOTTOM - scaleAdv(ADVANCE[2]) / 2 + 4}
          textAnchor="middle" fill={TAN_DARK} fontSize={8}
          fontFamily="'Fira Mono', monospace" letterSpacing={2} opacity={0.7}>
          ADVANCE →
        </text>
        <text x={PAD_L + CHART_W * 0.35} y={RET_TOP + scaleRet(RETREAT_TROOPS[2]) / 2 + 4}
          textAnchor="middle" fill={RETREAT_L} fontSize={8}
          fontFamily="'Fira Mono', monospace" letterSpacing={2} opacity={0.7}>
          ← RETREAT
        </text>

        {/* ── TEMPERATURE SECTION ── */}
        <line x1={PAD_L} y1={TEMP_TOP - 6} x2={W - PAD_R} y2={TEMP_TOP - 6}
          stroke="rgba(255,255,255,0.07)" strokeWidth={1} strokeDasharray="4 4" />
        <text x={PAD_L} y={TEMP_TOP - 10}
          fill={BLUE} fontSize={7.5} fontFamily="'Fira Mono', monospace" opacity={0.65}>
          TEMPERATURE (°C) — RETREAT PHASE
        </text>

        {/* 0°C reference line */}
        <line x1={PAD_L} y1={tempY(0)} x2={W - PAD_R} y2={tempY(0)}
          stroke="rgba(106,159,216,0.18)" strokeWidth={1} />
        <text x={PAD_L - 4} y={tempY(0) + 3} textAnchor="end"
          fill={BLUE} fontSize={8} fontFamily="'Fira Mono', monospace" opacity={0.55}>0°</text>
        <text x={PAD_L - 4} y={tempY(-40) + 3} textAnchor="end"
          fill={BLUE} fontSize={8} fontFamily="'Fira Mono', monospace" opacity={0.55}>-40°</text>
        <text x={PAD_L - 4} y={tempY(-20) + 3} textAnchor="end"
          fill={BLUE} fontSize={8} fontFamily="'Fira Mono', monospace" opacity={0.4}>-20°</text>

        {/* Temperature area fill */}
        <path d={tempArea} fill="url(#tempGrad)" />

        {/* Temperature line */}
        <path d={tempPath} fill="none" stroke={BLUE} strokeWidth={2} strokeLinejoin="round" />

        {/* Temperature dots */}
        {CITIES.map((c, i) => (
          <circle key={`tmp-${i}`}
            cx={cx(c.x)} cy={tempY(TEMP_BY_CITY[i])}
            r={3.5} fill={BLUE} stroke={BG_DEEP} strokeWidth={1}
            style={{ cursor: "pointer" }}
            onMouseEnter={e => {
              const rect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
              setTip({
                name: c.name, phase: "retreat",
                troops: RETREAT_TROOPS[i], date: DATES_RET[i],
                temp: TEMP_BY_CITY[i],
                px: e.clientX - rect.left, py: e.clientY - rect.top,
              });
            }}
          />
        ))}
      </svg>

      {/* ── TOOLTIP ── */}
      {tip && (
        <div style={{
          position: "absolute",
          left: tip.px + 14,
          top: tip.py - 14,
          background: BG_CARD,
          border: `1px solid ${GOLD_DIM}`,
          borderRadius: 2,
          padding: "0.5rem 0.8rem",
          fontFamily: "'Lora', serif",
          fontSize: 12,
          color: "#ede8dc",
          pointerEvents: "none",
          zIndex: 20,
          minWidth: 150,
          boxShadow: "0 4px 20px rgba(0,0,0,0.7)",
        }}>
          <p style={{ color: GOLD, fontFamily: "'Fira Mono', monospace", fontSize: 10, marginBottom: 5 }}>
            {tip.name} — {tip.phase === "advance" ? "Advance" : "Retreat"}
          </p>
          <p style={{ marginBottom: 2 }}>
            <span style={{ color: TICK_C }}>Troops: </span>
            {tip.troops.toLocaleString()}
          </p>
          <p style={{ marginBottom: 2 }}>
            <span style={{ color: TICK_C }}>Date: </span>
            {tip.date}
          </p>
          {tip.temp !== null && (
            <p>
              <span style={{ color: BLUE }}>Temp: </span>
              {tip.temp}°C
            </p>
          )}
        </div>
      )}

      {/* ── LEGEND ── */}
      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", marginTop: "0.75rem", paddingLeft: PAD_L }}>
        {[
          { color: TAN,       label: "Advance" },
          { color: RETREAT,   label: "Retreat" },
          { color: BLUE,      label: "Temperature", line: true },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            {item.line
              ? <div style={{ width: 22, height: 2, background: item.color, borderRadius: 1 }} />
              : <div style={{ width: 22, height: 10, background: item.color, borderRadius: 1 }} />
            }
            <span style={{ fontFamily: "'Fira Mono', monospace", fontSize: 10, color: TICK_C }}>
              {item.label}
            </span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: 8, height: 8, background: GOLD, borderRadius: "50%" }} />
          <span style={{ fontFamily: "'Fira Mono', monospace", fontSize: 10, color: TICK_C }}>
            Hover for data
          </span>
        </div>
      </div>
    </div>
  );
}
