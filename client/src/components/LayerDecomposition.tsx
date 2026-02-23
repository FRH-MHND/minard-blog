/*
 * DESIGN PHILOSOPHY: Dark Academic / Manuscript Illumination
 * Interactive layer decomposition section — shows Minard's map broken into
 * its three constituent chart layers (army size, route, temperature) then combined,
 * plus Tab 05: a modern interactive SVG interpretation of Minard's original.
 */

import { useState, useRef, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, Legend,
} from "recharts";

// ── DATA ──────────────────────────────────────────────────────────────────────

const armyData = [
  { place: "Niemen",     troops: 422000, phase: "advance" },
  { place: "Vilna",      troops: 400000, phase: "advance" },
  { place: "Vitebsk",    troops: 175000, phase: "advance" },
  { place: "Smolensk",   troops: 145000, phase: "advance" },
  { place: "Moscow",     troops: 100000, phase: "advance" },
  { place: "Smolensk↩",  troops: 55000,  phase: "retreat" },
  { place: "Minsk↩",     troops: 37000,  phase: "retreat" },
  { place: "Vilna↩",     troops: 12000,  phase: "retreat" },
  { place: "Niemen↩",    troops: 10000,  phase: "retreat" },
];

const advanceRoute = [
  { lon: 23.9, lat: 54.7, name: "Niemen" },
  { lon: 25.3, lat: 54.7, name: "Vilna" },
  { lon: 28.2, lat: 55.2, name: "Vitebsk" },
  { lon: 32.0, lat: 54.8, name: "Smolensk" },
  { lon: 37.6, lat: 55.8, name: "Moscow" },
];
const retreatRoute = [
  { lon: 37.6, lat: 55.8, name: "Moscow" },
  { lon: 32.0, lat: 54.5, name: "Smolensk↩" },
  { lon: 27.6, lat: 53.9, name: "Minsk↩" },
  { lon: 25.3, lat: 54.4, name: "Vilna↩" },
  { lon: 23.9, lat: 54.6, name: "Niemen↩" },
];

const temperatureData = [
  { date: "Oct 18", celsius: 0,     reaum: 0 },
  { date: "Oct 24", celsius: -11.3, reaum: -9 },
  { date: "Nov 9",  celsius: -26.3, reaum: -21 },
  { date: "Nov 14", celsius: -13.8, reaum: -11 },
  { date: "Nov 28", celsius: -25.0, reaum: -20 },
  { date: "Dec 1",  celsius: -30.0, reaum: -24 },
  { date: "Dec 6",  celsius: -37.5, reaum: -30 },
  { date: "Dec 7",  celsius: -32.5, reaum: -26 },
];

// ── MODERN MINARD DATA ────────────────────────────────────────────────────────
// Each waypoint: x position (0–1), troop count, label, phase, date, temp (retreat only)
const MINARD_NODES = [
  // Advance (left → right)
  { id: 0,  x: 0.00, troops: 422000, label: "Niemen",    phase: "advance", date: "Jun 1812",  temp: null },
  { id: 1,  x: 0.10, troops: 400000, label: "Vilna",     phase: "advance", date: "Jul 1812",  temp: null },
  { id: 2,  x: 0.28, troops: 175000, label: "Vitebsk",   phase: "advance", date: "Jul 1812",  temp: null },
  { id: 3,  x: 0.44, troops: 145000, label: "Smolensk",  phase: "advance", date: "Aug 1812",  temp: null },
  { id: 4,  x: 0.70, troops: 100000, label: "Moscow",    phase: "advance", date: "Sep 1812",  temp: 0 },
  // Retreat (right → left)
  { id: 5,  x: 0.44, troops: 55000,  label: "Smolensk",  phase: "retreat", date: "Nov 1812",  temp: -13.8 },
  { id: 6,  x: 0.28, troops: 37000,  label: "Minsk",     phase: "retreat", date: "Nov 1812",  temp: -25.0 },
  { id: 7,  x: 0.10, troops: 12000,  label: "Vilna",     phase: "retreat", date: "Dec 1812",  temp: -32.5 },
  { id: 8,  x: 0.00, troops: 10000,  label: "Niemen",    phase: "retreat", date: "Dec 1812",  temp: -37.5 },
];

// ── COLOURS ───────────────────────────────────────────────────────────────────
const GOLD     = "#c9a84c";
const GOLD_DIM = "#8a6e30";
const TAN      = "#d4af6a";
const DARK_BAND= "#5a3a1a";
const BLUE     = "#5882c8";
const GRID_C   = "rgba(255,255,255,0.06)";
const TICK_C   = "#a89878";
const BG_CARD  = "#251e14";
const BG_DEEP  = "#161009";

// ── SHARED CHART STYLES ───────────────────────────────────────────────────────
const axisStyle = { fill: TICK_C, fontSize: 11, fontFamily: "'Fira Mono', monospace" };
const tooltipStyle = {
  contentStyle: { background: BG_CARD, border: `1px solid ${GOLD_DIM}`, borderRadius: 2, fontFamily: "'Lora', serif", fontSize: 13 },
  labelStyle:   { color: GOLD, fontFamily: "'Fira Mono', monospace", fontSize: 11 },
  itemStyle:    { color: "#ede8dc" },
};

// ── LAYER TABS ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "flow",        label: "01 — Army Size" },
  { id: "route",       label: "02 — Route" },
  { id: "temperature", label: "03 — Temperature" },
  { id: "combined",    label: "04 — Combined" },
  { id: "modern",      label: "05 — Modern Minard" },
];

// ── CUSTOM TOOLTIP FORMATTERS ─────────────────────────────────────────────────
function ArmyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...tooltipStyle.contentStyle, padding: "0.6rem 0.9rem" }}>
      <p style={{ ...tooltipStyle.labelStyle, marginBottom: 4 }}>{label}</p>
      <p style={tooltipStyle.itemStyle}>{payload[0].value.toLocaleString()} troops</p>
    </div>
  );
}
function RouteTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ ...tooltipStyle.contentStyle, padding: "0.6rem 0.9rem" }}>
      <p style={{ ...tooltipStyle.labelStyle, marginBottom: 4 }}>{d?.name}</p>
      <p style={tooltipStyle.itemStyle}>{d?.lon}°E, {d?.lat}°N</p>
    </div>
  );
}
function TempTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...tooltipStyle.contentStyle, padding: "0.6rem 0.9rem" }}>
      <p style={{ ...tooltipStyle.labelStyle, marginBottom: 4 }}>{label}</p>
      <p style={tooltipStyle.itemStyle}>{payload[0].value}°C</p>
      <p style={{ color: TICK_C, fontSize: 11 }}>≈ {payload[0].payload.reaum}°Ré (Réaumur)</p>
    </div>
  );
}

// ── CHART DESCRIPTIONS ────────────────────────────────────────────────────────
const DESCRIPTIONS: Record<string, { title: string; body: string }> = {
  flow: {
    title: "Layer 1 — Army Size (Band Width)",
    body: "In isolation this is a straightforward bar chart of troop numbers at successive waypoints. The tan bars represent the advance; the dark bars the retreat. The dramatic collapse from 422,000 to ~10,000 is immediately legible. Bertin classifies size as the most effective quantitative retinal variable — the eye reads magnitude directly from area.",
  },
  route: {
    title: "Layer 2 — Geographic Route (Position)",
    body: "Stripped of the flow band, the route becomes a simple scatter/line plot — longitude on the x-axis, latitude on the y-axis. On its own it tells us nothing about losses; it merely traces a path. Position is Bertin's most fundamental variable, providing the spatial anchor onto which all other variables are hung.",
  },
  temperature: {
    title: "Layer 3 — Temperature (Réaumur → °C)",
    body: "The temperature chart records readings taken during the retreat only, from October to December 1812. In isolation it is a time-series line chart. Its power emerges only when placed beneath the retreat band — the correlation between falling temperature and accelerating troop loss becomes visually undeniable. Note: Minard used the obsolete Réaumur scale; values here are converted to Celsius (°C = °Ré × 1.25).",
  },
  combined: {
    title: "Layer 4 — The Combined Argument",
    body: "When army size, geographic route, and temperature are fused — as Minard did — each layer alone becomes unremarkable. Together, they construct an argument: the army advanced in strength, reached Moscow, and was then destroyed by the Russian winter on the retreat. No prose is required. This is the power of multivariate integration.",
  },
  modern: {
    title: "Layer 5 — A Modern Interactive Interpretation",
    body: "This panel reimagines Minard's map with contemporary tools: a proportional flow band encoding army size, colour distinguishing advance (tan) from retreat (dark), and a live temperature gradient beneath the retreat path. Hover over any waypoint to reveal exact troop counts, dates, and temperatures. This addresses two of Minard's key weaknesses — the absence of tooltips for precise data and the inaccessibility of the Réaumur temperature scale — while preserving the original's narrative power.",
  },
};

// ── MODERN MINARD SVG COMPONENT ───────────────────────────────────────────────
function ModernMinardChart() {
  const [tooltip, setTooltip] = useState<{
    node: typeof MINARD_NODES[0];
    x: number;
    y: number;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 700;
  const H_FLOW = 200;   // height of flow band area
  const H_TEMP = 100;   // height of temperature area
  const H_TOTAL = H_FLOW + H_TEMP + 40; // +40 for labels
  const PAD_L = 40;
  const PAD_R = 20;
  const BAND_W = W - PAD_L - PAD_R;
  const MAX_TROOPS = 422000;
  const MAX_BAND_H = 120; // max band half-height in px

  // Scale troops → band half-height
  const scale = (t: number) => (t / MAX_TROOPS) * MAX_BAND_H;

  // x position for a node
  const nx = (node: typeof MINARD_NODES[0]) => PAD_L + node.x * BAND_W;

  // Advance nodes (ids 0–4), retreat nodes (ids 4–8, reversed for path)
  const advNodes = MINARD_NODES.filter(n => n.phase === "advance");
  const retNodes = MINARD_NODES.filter(n => n.phase === "retreat");

  // Centre line y for the flow band
  const CY = H_FLOW / 2 + 10;

  // Build advance polygon: top edge left→right, bottom edge right→left
  const advTop = advNodes.map(n => `${nx(n)},${CY - scale(n.troops)}`).join(" ");
  const advBot = [...advNodes].reverse().map(n => `${nx(n)},${CY + scale(n.troops)}`).join(" ");
  const advPoly = `${advTop} ${advBot}`;

  // Build retreat polygon (Moscow → Niemen)
  const retTop = retNodes.map(n => `${nx(n)},${CY - scale(n.troops)}`).join(" ");
  const retBot = [...retNodes].reverse().map(n => `${nx(n)},${CY + scale(n.troops)}`).join(" ");
  const retPoly = `${retTop} ${retBot}`;

  // Temperature line (retreat nodes that have temp, mapped to temp chart area)
  const tempNodes = retNodes.filter(n => n.temp !== null);
  const TEMP_Y_TOP = H_FLOW + 30;
  const TEMP_MIN = -40;
  const TEMP_MAX = 5;
  const tempY = (t: number) =>
    TEMP_Y_TOP + ((TEMP_MAX - t) / (TEMP_MAX - TEMP_MIN)) * H_TEMP;
  const tempPath = tempNodes
    .map((n, i) => `${i === 0 ? "M" : "L"}${nx(n)},${tempY(n.temp!)}`)
    .join(" ");

  const handleMouseEnter = useCallback((node: typeof MINARD_NODES[0], e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ node, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  // Unique city labels (advance pass only for top, retreat for bottom)
  const advLabels = advNodes;
  const retLabels = retNodes.filter(n => n.id !== 4); // skip Moscow duplicate

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H_TOTAL}`}
        style={{ width: "100%", minWidth: 480, display: "block" }}
        onMouseLeave={handleMouseLeave}
      >
        {/* ── Background ── */}
        <rect x={0} y={0} width={W} height={H_TOTAL} fill={BG_DEEP} />

        {/* ── Horizontal centre line ── */}
        <line x1={PAD_L} y1={CY} x2={W - PAD_R} y2={CY}
          stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

        {/* ── Advance band ── */}
        <polygon points={advPoly} fill={TAN} fillOpacity={0.85} />

        {/* ── Retreat band ── */}
        <polygon points={retPoly} fill={DARK_BAND} fillOpacity={0.9} />

        {/* ── Advance node dots + hover targets ── */}
        {advNodes.map(n => (
          <circle
            key={`adv-${n.id}`}
            cx={nx(n)} cy={CY} r={6}
            fill={GOLD} stroke={BG_DEEP} strokeWidth={1.5}
            style={{ cursor: "pointer" }}
            onMouseEnter={e => handleMouseEnter(n, e)}
          />
        ))}

        {/* ── Retreat node dots + hover targets ── */}
        {retNodes.map(n => (
          <circle
            key={`ret-${n.id}`}
            cx={nx(n)} cy={CY} r={6}
            fill={GOLD_DIM} stroke={BG_DEEP} strokeWidth={1.5}
            style={{ cursor: "pointer" }}
            onMouseEnter={e => handleMouseEnter(n, e)}
          />
        ))}

        {/* ── Advance city labels (above) ── */}
        {advLabels.map(n => (
          <text key={`albl-${n.id}`}
            x={nx(n)} y={CY - scale(n.troops) - 8}
            textAnchor="middle" fill={TICK_C}
            fontSize={9} fontFamily="'Fira Mono', monospace"
          >
            {n.label}
          </text>
        ))}

        {/* ── Retreat city labels (below band) ── */}
        {retLabels.map(n => (
          <text key={`rlbl-${n.id}`}
            x={nx(n)} y={CY + scale(n.troops) + 14}
            textAnchor="middle" fill={TICK_C}
            fontSize={9} fontFamily="'Fira Mono', monospace"
          >
            {n.label}
          </text>
        ))}

        {/* ── "ADVANCE" / "RETREAT" labels ── */}
        <text x={PAD_L + BAND_W * 0.22} y={CY - MAX_BAND_H - 16}
          textAnchor="middle" fill={TAN} fontSize={9}
          fontFamily="'Fira Mono', monospace" letterSpacing={2}>
          ADVANCE →
        </text>
        <text x={PAD_L + BAND_W * 0.22} y={CY + MAX_BAND_H + 28}
          textAnchor="middle" fill={DARK_BAND} fontSize={9}
          fontFamily="'Fira Mono', monospace" letterSpacing={2}
          style={{ fill: "#8a6040" }}>
          ← RETREAT
        </text>

        {/* ── Temperature section divider ── */}
        <line x1={PAD_L} y1={H_FLOW + 22} x2={W - PAD_R} y2={H_FLOW + 22}
          stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="4 4" />
        <text x={PAD_L} y={H_FLOW + 18}
          fill={BLUE} fontSize={8} fontFamily="'Fira Mono', monospace" opacity={0.7}>
          TEMPERATURE (°C) — RETREAT PHASE
        </text>

        {/* ── Temperature zero line ── */}
        <line x1={PAD_L} y1={tempY(0)} x2={W - PAD_R} y2={tempY(0)}
          stroke="rgba(88,130,200,0.15)" strokeWidth={1} />
        <text x={PAD_L - 4} y={tempY(0) + 3}
          textAnchor="end" fill={BLUE} fontSize={8} fontFamily="'Fira Mono', monospace" opacity={0.6}>
          0°
        </text>
        <text x={PAD_L - 4} y={tempY(-40) + 3}
          textAnchor="end" fill={BLUE} fontSize={8} fontFamily="'Fira Mono', monospace" opacity={0.6}>
          -40°
        </text>

        {/* ── Temperature path ── */}
        <path d={tempPath} fill="none" stroke={BLUE} strokeWidth={2} strokeLinejoin="round" />

        {/* ── Temperature dots ── */}
        {tempNodes.map(n => (
          <circle key={`tmp-${n.id}`}
            cx={nx(n)} cy={tempY(n.temp!)} r={3.5}
            fill={BLUE} stroke={BG_DEEP} strokeWidth={1}
            style={{ cursor: "pointer" }}
            onMouseEnter={e => handleMouseEnter(n, e)}
          />
        ))}

        {/* ── Temperature shading ── */}
        <defs>
          <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity={0.15} />
            <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {tempNodes.length > 1 && (
          <path
            d={`${tempPath} L${nx(tempNodes[tempNodes.length - 1])},${H_FLOW + 30 + H_TEMP} L${nx(tempNodes[0])},${H_FLOW + 30 + H_TEMP} Z`}
            fill="url(#tempGrad)"
          />
        )}

        {/* ── Troop count annotations at key points ── */}
        {[MINARD_NODES[0], MINARD_NODES[4], MINARD_NODES[8]].map(n => (
          <text key={`ann-${n.id}`}
            x={nx(n)} y={CY + 4}
            textAnchor="middle" fill="rgba(255,255,255,0.55)"
            fontSize={8} fontFamily="'Fira Mono', monospace"
          >
            {(n.troops / 1000).toFixed(0)}k
          </text>
        ))}
      </svg>

      {/* ── Tooltip ── */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            background: BG_CARD,
            border: `1px solid ${GOLD_DIM}`,
            borderRadius: 2,
            padding: "0.5rem 0.75rem",
            fontFamily: "'Lora', serif",
            fontSize: 12,
            color: "#ede8dc",
            pointerEvents: "none",
            zIndex: 10,
            minWidth: 140,
            boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
          }}
        >
          <p style={{ color: GOLD, fontFamily: "'Fira Mono', monospace", fontSize: 10, marginBottom: 4 }}>
            {tooltip.node.label} — {tooltip.node.phase === "advance" ? "Advance" : "Retreat"}
          </p>
          <p><span style={{ color: TICK_C }}>Troops:</span> {tooltip.node.troops.toLocaleString()}</p>
          <p><span style={{ color: TICK_C }}>Date:</span> {tooltip.node.date}</p>
          {tooltip.node.temp !== null && (
            <p><span style={{ color: BLUE }}>Temp:</span> {tooltip.node.temp}°C</p>
          )}
        </div>
      )}

      {/* ── Legend ── */}
      <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem", paddingLeft: PAD_L }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: 24, height: 10, background: TAN, borderRadius: 1 }} />
          <span style={{ fontFamily: "'Fira Mono', monospace", fontSize: 10, color: TICK_C }}>Advance</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: 24, height: 10, background: DARK_BAND, borderRadius: 1 }} />
          <span style={{ fontFamily: "'Fira Mono', monospace", fontSize: 10, color: TICK_C }}>Retreat</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: 24, height: 2, background: BLUE, borderRadius: 1 }} />
          <span style={{ fontFamily: "'Fira Mono', monospace", fontSize: 10, color: TICK_C }}>Temperature</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ width: 8, height: 8, background: GOLD, borderRadius: "50%" }} />
          <span style={{ fontFamily: "'Fira Mono', monospace", fontSize: 10, color: TICK_C }}>Hover for data</span>
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LayerDecomposition() {
  const [active, setActive] = useState<string>("flow");
  const desc = DESCRIPTIONS[active];

  return (
    <div
      style={{
        background: BG_CARD,
        border: `1px solid rgba(58,48,32,0.8)`,
        borderRadius: 3,
        padding: "2rem 1.75rem",
        marginTop: "0.5rem",
      }}
    >
      {/* Heading */}
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2rem",
          fontWeight: 600,
          color: GOLD,
          marginBottom: "0.5rem",
        }}
      >
        III. Deconstructing the Layers
      </h2>
      <p
        style={{
          color: TICK_C,
          fontSize: "0.95rem",
          lineHeight: 1.75,
          marginBottom: "1.75rem",
          fontFamily: "'Lora', serif",
        }}
      >
        Minard's map is the product of several distinct data layers, each encoding a separate variable. Isolating these layers reveals how each contributes to the whole — and how their combination produces an argument no single chart could make alone. Tab 05 presents a modern interactive interpretation.
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              fontFamily: "'Fira Mono', monospace",
              fontSize: "0.76rem",
              letterSpacing: "0.04em",
              padding: "0.4rem 1rem",
              border: `1px solid ${active === tab.id ? (tab.id === "modern" ? "#5882c8" : GOLD) : "rgba(58,48,32,0.8)"}`,
              background: active === tab.id
                ? tab.id === "modern"
                  ? "rgba(88,130,200,0.12)"
                  : "rgba(201,168,76,0.1)"
                : "transparent",
              color: active === tab.id
                ? tab.id === "modern" ? "#5882c8" : GOLD
                : TICK_C,
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div
        style={{
          background: BG_DEEP,
          border: `1px solid rgba(58,48,32,0.6)`,
          borderRadius: 2,
          padding: active === "modern" ? "1.25rem 1rem 1rem" : "1.25rem 1rem 0.75rem",
        }}
      >
        {/* ── PANEL 1: ARMY SIZE ── */}
        {active === "flow" && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={armyData} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_C} />
              <XAxis dataKey="place" tick={axisStyle} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={axisStyle} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
              <Tooltip content={<ArmyTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="troops" radius={[1, 1, 0, 0]}>
                {armyData.map((entry, i) => (
                  <rect key={i} fill={entry.phase === "retreat" ? DARK_BAND : TAN} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* ── PANEL 2: ROUTE ── */}
        {active === "route" && (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_C} />
              <XAxis dataKey="lon" type="number" name="Longitude" domain={[22, 40]} tick={axisStyle}
                label={{ value: "Longitude (°E)", position: "insideBottom", offset: -4, fill: TICK_C, fontSize: 11, fontFamily: "'Fira Mono', monospace" }} />
              <YAxis dataKey="lat" type="number" name="Latitude" domain={[52, 57]} tick={axisStyle}
                label={{ value: "Latitude (°N)", angle: -90, position: "insideLeft", fill: TICK_C, fontSize: 11, fontFamily: "'Fira Mono', monospace" }} />
              <Tooltip content={<RouteTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              <Legend wrapperStyle={{ fontFamily: "'Fira Mono', monospace", fontSize: 11, color: TICK_C }} />
              <Scatter name="Advance" data={advanceRoute} line={{ stroke: TAN, strokeWidth: 2 }} fill={TAN} />
              <Scatter name="Retreat" data={retreatRoute} line={{ stroke: DARK_BAND, strokeWidth: 2 }} fill={DARK_BAND} />
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {/* ── PANEL 3: TEMPERATURE ── */}
        {active === "temperature" && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_C} />
              <XAxis dataKey="date" tick={axisStyle} />
              <YAxis tick={axisStyle} tickFormatter={(v) => `${v}°C`} />
              <Tooltip content={<TempTooltip />} />
              <Line type="monotone" dataKey="celsius" stroke={BLUE} strokeWidth={2}
                dot={{ fill: BLUE, r: 4 }} activeDot={{ r: 6 }} name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* ── PANEL 4: COMBINED ── */}
        {active === "combined" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <p style={{ fontFamily: "'Fira Mono', monospace", fontSize: "0.68rem", color: GOLD_DIM, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Army Size</p>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={armyData} margin={{ top: 4, right: 8, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_C} />
                    <XAxis dataKey="place" tick={{ ...axisStyle, fontSize: 8 }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ ...axisStyle, fontSize: 8 }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                    <Bar dataKey="troops" fill={TAN} radius={[1,1,0,0]}>
                      {armyData.map((entry, i) => (
                        <rect key={i} fill={entry.phase === "retreat" ? DARK_BAND : TAN} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p style={{ fontFamily: "'Fira Mono', monospace", fontSize: "0.68rem", color: GOLD_DIM, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Geographic Route</p>
                <ResponsiveContainer width="100%" height={150}>
                  <ScatterChart margin={{ top: 4, right: 8, left: -20, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_C} />
                    <XAxis dataKey="lon" type="number" domain={[22,40]} tick={{ ...axisStyle, fontSize: 8 }} />
                    <YAxis dataKey="lat" type="number" domain={[52,57]} tick={{ ...axisStyle, fontSize: 8 }} />
                    <Scatter data={advanceRoute} line={{ stroke: TAN, strokeWidth: 1.5 }} fill={TAN} />
                    <Scatter data={retreatRoute} line={{ stroke: DARK_BAND, strokeWidth: 1.5 }} fill={DARK_BAND} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p style={{ textAlign: "center", color: GOLD_DIM, fontSize: "1.2rem", margin: "0.25rem 0" }}>↓ combined with ↓</p>
            <div>
              <p style={{ fontFamily: "'Fira Mono', monospace", fontSize: "0.68rem", color: GOLD_DIM, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Temperature (retreat phase)</p>
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={temperatureData} margin={{ top: 4, right: 8, left: -20, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_C} />
                  <XAxis dataKey="date" tick={{ ...axisStyle, fontSize: 8 }} />
                  <YAxis tick={{ ...axisStyle, fontSize: 8 }} tickFormatter={(v) => `${v}°C`} />
                  <Line type="monotone" dataKey="celsius" stroke={BLUE} strokeWidth={1.5} dot={{ fill: BLUE, r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── PANEL 5: MODERN MINARD ── */}
        {active === "modern" && <ModernMinardChart />}
      </div>

      {/* Description */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.85rem 1.1rem",
          borderLeft: `2px solid ${active === "modern" ? "rgba(88,130,200,0.4)" : "rgba(201,168,76,0.3)"}`,
          background: active === "modern" ? "rgba(88,130,200,0.04)" : "rgba(201,168,76,0.03)",
          fontSize: "0.9rem",
          lineHeight: 1.7,
          color: TICK_C,
          fontFamily: "'Lora', serif",
        }}
      >
        <strong style={{ color: active === "modern" ? "#7aa0d8" : TAN }}>{desc.title}.</strong>{" "}
        {desc.body}
      </div>
    </div>
  );
}
