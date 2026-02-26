/*
 * DESIGN PHILOSOPHY: Dark Academic / Manuscript Illumination
 * Interactive layer decomposition section - shows Minard's map broken into
 * its three constituent chart layers (army size, route, temperature) then combined.
 * Uses Recharts with the dark academic palette.
 */

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, Legend,
} from "recharts";

// ── DATA ──────────────────────────────────────────────────────────────────────

const armyData = [
  { place: "Niemen", troops: 422000, phase: "advance" },
  { place: "Vilna",  troops: 400000, phase: "advance" },
  { place: "Vitebsk",troops: 175000, phase: "advance" },
  { place: "Smolensk",troops:145000, phase: "advance" },
  { place: "Moscow", troops: 100000, phase: "advance" },
  { place: "Smolensk↩", troops: 55000,  phase: "retreat" },
  { place: "Minsk↩",    troops: 37000,  phase: "retreat" },
  { place: "Vilna↩",    troops: 12000,  phase: "retreat" },
  { place: "Niemen↩",   troops: 10000,  phase: "retreat" },
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
  { date: "Oct 18", celsius: 0,    reaum: 0 },
  { date: "Oct 24", celsius: -11.3, reaum: -9 },
  { date: "Nov 9",  celsius: -26.3, reaum: -21 },
  { date: "Nov 14", celsius: -13.8, reaum: -11 },
  { date: "Nov 28", celsius: -25.0, reaum: -20 },
  { date: "Dec 1",  celsius: -30.0, reaum: -24 },
  { date: "Dec 6",  celsius: -37.5, reaum: -30 },
  { date: "Dec 7",  celsius: -32.5, reaum: -26 },
];

// ── COLOURS ───────────────────────────────────────────────────────────────────
const GOLD    = "#c9a84c";
const GOLD_DIM= "#8a6e30";
const TAN     = "#d4af6a";
const DARK_BAND = "#5a3a1a";
const BLUE    = "#5882c8";
const GRID_C  = "rgba(255,255,255,0.06)";
const TICK_C  = "#a89878";
const BG_CARD = "#251e14";
const BG_DEEP = "#161009";

// ── SHARED CHART STYLES ───────────────────────────────────────────────────────
const axisStyle = { fill: TICK_C, fontSize: 11, fontFamily: "'Fira Mono', monospace" };
const tooltipStyle = {
  contentStyle: { background: BG_CARD, border: `1px solid ${GOLD_DIM}`, borderRadius: 2, fontFamily: "'Lora', serif", fontSize: 13 },
  labelStyle:   { color: GOLD, fontFamily: "'Fira Mono', monospace", fontSize: 11 },
  itemStyle:    { color: "#ede8dc" },
};

// ── LAYER TABS ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "flow",        label: "01 - Army Size" },
  { id: "route",       label: "02 - Route" },
  { id: "temperature", label: "03 - Temperature" },
  { id: "combined",    label: "04 - Combined" },
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
    title: "Layer 1 - Army Size (Band Width)",
    body: "In isolation this is a straightforward bar chart of troop numbers at successive waypoints. The tan bars represent the advance; the dark bars the retreat. The dramatic collapse from 422,000 to ~10,000 is immediately legible. Bertin classifies size as the most effective quantitative retinal variable - the eye reads magnitude directly from area.",
  },
  route: {
    title: "Layer 2 - Geographic Route (Position)",
    body: "Stripped of the flow band, the route becomes a simple scatter/line plot - longitude on the x-axis, latitude on the y-axis. On its own it tells us nothing about losses; it merely traces a path. Position is Bertin's most fundamental variable, providing the spatial anchor onto which all other variables are hung.",
  },
  temperature: {
    title: "Layer 3 - Temperature (Réaumur → °C)",
    body: "The temperature chart records readings taken during the retreat only, from October to December 1812. In isolation it is a time-series line chart. Its power emerges only when placed beneath the retreat band - the correlation between falling temperature and accelerating troop loss becomes visually undeniable. Note: Minard used the obsolete Réaumur scale; values here are converted to Celsius (°C = °Ré × 1.25).",
  },
  combined: {
    title: "Layer 4 - The Combined Argument",
    body: "When army size, geographic route, and temperature are fused - as Minard did - each layer alone becomes unremarkable. Together, they construct an argument: the army advanced in strength, reached Moscow, and was then destroyed by the Russian winter on the retreat. No prose is required. This is the power of multivariate integration.",
  },
};

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
        Minard's map is the product of several distinct data layers, each encoding a separate variable. Isolating these layers reveals how each contributes to the whole and how their combination produces an argument no single chart could make alone.
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
              border: `1px solid ${active === tab.id ? GOLD : "rgba(58,48,32,0.8)"}`,
              background: active === tab.id ? "rgba(201,168,76,0.1)" : "transparent",
              color: active === tab.id ? GOLD : TICK_C,
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
          padding: "1.25rem 1rem 0.75rem",
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
              <Bar
                dataKey="troops"
                radius={[1, 1, 0, 0]}
                fill={TAN}
                // colour retreat bars darker
                label={false}
              >
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
              <XAxis dataKey="lon" type="number" name="Longitude" domain={[22, 40]} tick={axisStyle} label={{ value: "Longitude (°E)", position: "insideBottom", offset: -4, fill: TICK_C, fontSize: 11, fontFamily: "'Fira Mono', monospace" }} />
              <YAxis dataKey="lat" type="number" name="Latitude" domain={[52, 57]} tick={axisStyle} label={{ value: "Latitude (°N)", angle: -90, position: "insideLeft", fill: TICK_C, fontSize: 11, fontFamily: "'Fira Mono', monospace" }} />
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
              <Line
                type="monotone"
                dataKey="celsius"
                stroke={BLUE}
                strokeWidth={2}
                dot={{ fill: BLUE, r: 4 }}
                activeDot={{ r: 6 }}
                name="Temperature (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* ── PANEL 4: COMBINED ── */}
        {active === "combined" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              {/* Mini army */}
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
              {/* Mini route */}
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
            {/* Arrow */}
            <p style={{ textAlign: "center", color: GOLD_DIM, fontSize: "1.2rem", margin: "0.25rem 0" }}>↓ combined with ↓</p>
            {/* Mini temperature */}
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
      </div>

      {/* Description */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.85rem 1.1rem",
          borderLeft: `2px solid rgba(201,168,76,0.3)`,
          background: "rgba(201,168,76,0.03)",
          fontSize: "0.9rem",
          lineHeight: 1.7,
          color: TICK_C,
          fontFamily: "'Lora', serif",
        }}
      >
        <strong style={{ color: TAN }}>{desc.title}.</strong>{" "}
        {desc.body}
      </div>
    </div>
  );
}
