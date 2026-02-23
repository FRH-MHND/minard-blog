/*
 * DESIGN PHILOSOPHY: Dark Academic / Manuscript Illumination
 * Deep dark canvas (oklch 0.14) + antique gold (oklch 0.75 0.12 75) + warm cream text
 * Typography: Cormorant Garamond headings, Lora body, Fira Mono data labels
 * Layout: centred reading column (max-w-[720px]) with gold ornamental dividers
 * Signature elements: drop-cap, pull-quotes, compass-rose ornaments, variable badges
 */

import { useEffect, useRef, useState } from "react";
import LayerDecomposition from "@/components/LayerDecomposition";

const HERO_URL =
  "https://private-us-east-1.manuscdn.com/sessionFile/LFOR5ktuK8fd7hlaiJO9Mh/sandbox/ptDhhstl7fw5tcWt6mgAFo-img-1_1771835048000_na1fn_bWluYXJkLWhlcm8.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvTEZPUjVrdHVLOGZkN2hsYWlKTzlNaC9zYW5kYm94L3B0RGhoc3RsN2Z3NXRjV3Q2bWdBRm8taW1nLTFfMTc3MTgzNTA0ODAwMF9uYTFmbl9iV2x1WVhKa0xXaGxjbTguanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=lfDgIRWNkb5a-yeL~JlrmZhoBPaPhPL3qGQZ-Ic7Dj2HKUyVAmX-8skOAZOlqeIPmLY2NCMjoUfmfKgd7qCgms8mC32A~Bg7qi2CM6sWcAk95GmWGjpBRNb6gvUDtEXB8Zhu-SNq9eWTrqn09PHltLyeewcFjK864YO5Tgy5XxTpRZc7uU7jpFVXaooPFtomraPYpSQ4Z7RZ82reAk0GGaq~IkMEw4OLhmwTh1c5xYcbz-jiqX26pyfHYMfipcm5O4faKuTRGkOD9OpfsJhL~oX6VUze-XkZgogcikO0rPhpDcevS0OU2YYz7gl-15l77rCBwBwsUBy60LgN0IGifg__";

const MAP_URL =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663055267602/RNqlIlPppodzsUtn.jpg";

// Six variables data
const SIX_VARIABLES = [
  { label: "Army Size", encoding: "Band width", bertin: "Size", color: "oklch(0.75 0.12 75)" },
  { label: "Longitude", encoding: "x-position", bertin: "Position (x)", color: "oklch(0.65 0.08 75)" },
  { label: "Latitude", encoding: "y-position", bertin: "Position (y)", color: "oklch(0.65 0.08 75)" },
  { label: "Direction", encoding: "Band colour", bertin: "Colour hue", color: "oklch(0.55 0.12 35)" },
  { label: "Temperature", encoding: "Line graph (lower)", bertin: "Position (y)", color: "oklch(0.50 0.10 240)" },
  { label: "Date / Time", encoding: "Temperature labels", bertin: "Text annotation", color: "oklch(0.60 0.06 75)" },
];

// Compass rose SVG ornament
function CompassOrnament({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Eight-pointed star */}
      <polygon
        points="50,5 53,45 95,50 53,55 50,95 47,55 5,50 47,45"
        fill="oklch(0.75 0.12 75 / 0.85)"
      />
      <polygon
        points="50,18 52,46 82,50 52,54 50,82 48,54 18,50 48,46"
        fill="oklch(0.14 0.02 55)"
      />
      <circle cx="50" cy="50" r="6" fill="oklch(0.75 0.12 75)" />
      <circle cx="50" cy="50" r="3" fill="oklch(0.14 0.02 55)" />
    </svg>
  );
}

// Section divider with ornament
function SectionDivider() {
  return (
    <div className="flex items-center gap-4 my-12">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[oklch(0.75_0.12_75/0.4)]" />
      <CompassOrnament size={28} />
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[oklch(0.75_0.12_75/0.4)]" />
    </div>
  );
}

// Animated section that fades in on scroll
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Reading progress bar
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="reading-progress"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-lantern">
      <ReadingProgress />

      {/* ── HERO ── */}
      <header className="relative w-full overflow-hidden" style={{ minHeight: "60vh" }}>
        <img
          src={HERO_URL}
          alt="Dramatic composite of Minard's Napoleon campaign map over a Russian winter landscape"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.55) saturate(0.9)" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.14 0.02 55 / 0.2) 0%, oklch(0.14 0.02 55 / 0.7) 60%, oklch(0.14 0.02 55) 100%)",
          }}
        />
        {/* Hero text */}
        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16 px-6 text-center" style={{ minHeight: "60vh" }}>
          <p
            className="text-sm tracking-[0.3em] uppercase mb-4"
            style={{ color: "oklch(0.75 0.12 75)", fontFamily: "'Fira Mono', monospace" }}
          >
            martins-cool-datavis-website &nbsp;·&nbsp; Data Visualisation Analysis
          </p>
          <h1
            className="font-bold leading-tight mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 5vw, 3.75rem)",
              color: "oklch(0.92 0.02 85)",
              textShadow: "0 2px 20px oklch(0 0 0 / 0.6)",
              maxWidth: "800px",
            }}
          >
            The Best Statistical Graphic Ever Drawn
          </h1>
          <p
            className="text-lg italic mb-8"
            style={{ color: "oklch(0.75 0.06 75)", maxWidth: "560px", lineHeight: 1.7 }}
          >
            A critical analysis of Charles Joseph Minard's 1869 flowchart of Napoleon's Russian campaign
          </p>
          <div className="flex items-center gap-3 text-sm" style={{ color: "oklch(0.60 0.04 75)" }}>
            <span style={{ fontFamily: "'Fira Mono', monospace" }}>~1,100 words</span>
            <span>·</span>
            <span>CMT218 — Data Visualisation</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="reading-column py-16">

        {/* ── INTRODUCTION ── */}
        <AnimatedSection>
          <p
            className="drop-cap text-lg leading-relaxed mb-6"
            style={{ lineHeight: 1.9, color: "oklch(0.88 0.02 80)" }}
          >
            Charles Joseph Minard's 1869 <em>Carte figurative des pertes successives en hommes de l'Armée Française dans la campagne de Russie 1812–1813</em> is widely regarded as one of the most significant works in the history of data visualisation. Celebrated by Edward Tufte as "the best statistical graphic ever drawn" <span className="ref-num">[1]</span>, Minard's work is a powerful testament to the capacity of visual communication to render a complex and tragic story with clarity and emotional force. This post examines the graphic's considerable strengths through the lens of established design principles, before turning a critical eye to its limitations and considering how it might be reimagined with contemporary tools.
          </p>
        </AnimatedSection>

        {/* ── MAP IMAGE ── */}
        <AnimatedSection>
          <figure className="my-10">
            <div className="map-frame">
              <img
                src={MAP_URL}
                alt="Minard's 1869 figurative map of Napoleon's Russian campaign showing troop movements and losses"
                className="w-full block"
                style={{ borderRadius: "1px" }}
              />
            </div>
            <figcaption
              className="mt-3 text-center text-sm italic"
              style={{ color: "oklch(0.60 0.05 75)", fontFamily: "'Fira Mono', monospace" }}
            >
              Fig. 1 — Minard, C.J. (1869). <em>Carte figurative des pertes successives en hommes de l'Armée Française dans la campagne de Russie 1812–1813.</em> Paris. [Translated version shown.]
            </figcaption>
          </figure>
        </AnimatedSection>

        <SectionDivider />

        {/* ── SECTION 1: MULTIVARIATE NARRATIVE ── */}
        <AnimatedSection>
          <h2
            className="text-3xl font-semibold mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.75 0.12 75)" }}
          >
            I. The Power of a Multivariate Narrative
          </h2>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            Minard's genius lies in his ability to weave a multivariate narrative, encoding six distinct variables into a single cohesive graphic. As Friendly (2002) <span className="ref-num">[2]</span> observes, Minard was a true pioneer in thematic cartography whose consistent goal was to let data "speak to the eyes." The six variables encoded in the map are:
          </p>

          {/* Six variables table */}
          <div className="my-8 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.75 0.12 75 / 0.3)" }}>
                  <th className="text-left py-3 pr-4 font-semibold" style={{ color: "oklch(0.75 0.12 75)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem" }}>Variable</th>
                  <th className="text-left py-3 pr-4 font-semibold" style={{ color: "oklch(0.75 0.12 75)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem" }}>Visual Encoding</th>
                  <th className="text-left py-3 font-semibold" style={{ color: "oklch(0.75 0.12 75)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem" }}>Bertin's Variable</th>
                </tr>
              </thead>
              <tbody>
                {SIX_VARIABLES.map((v, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid oklch(0.30 0.04 65 / 0.5)" }}
                  >
                    <td className="py-3 pr-4" style={{ color: "oklch(0.88 0.02 80)" }}>
                      <span className="variable-badge">{v.label}</span>
                    </td>
                    <td className="py-3 pr-4" style={{ color: "oklch(0.75 0.06 75)" }}>{v.encoding}</td>
                    <td className="py-3" style={{ color: "oklch(0.65 0.04 75)", fontFamily: "'Fira Mono', monospace", fontSize: "0.8rem" }}>{v.bertin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs" style={{ color: "oklch(0.55 0.04 75)", fontFamily: "'Fira Mono', monospace" }}>
              Table 1 — Minard's six variables mapped against Bertin's (1983) <span className="ref-num">[3]</span> visual variable taxonomy.
            </p>
          </div>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            Jacques Bertin's foundational theory of visual variables <span className="ref-num">[3]</span> provides a precise vocabulary for understanding why the map works so well. The most powerful encoding is <span className="term-highlight">size</span>: the width of the flow band directly and proportionally represents the number of surviving soldiers. This exploits what Bertin identified as the most perceptually accurate quantitative variable, allowing the viewer to grasp the scale of attrition at a glance. The army departs from the Niemen River at 422,000 men; the band that returns is barely a sliver — approximately 10,000. No caption is needed to convey the horror.
          </p>
        </AnimatedSection>

        <SectionDivider />

        {/* ── SECTION 2: TUFTE'S PRINCIPLES ── */}
        <AnimatedSection>
          <h2
            className="text-3xl font-semibold mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.75 0.12 75)" }}
          >
            II. Tufte's Principles of Analytical Design
          </h2>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            The enduring power of Minard's map can be understood through Tufte's six principles of analytical design, articulated in <em>Beautiful Evidence</em> (2006) <span className="ref-num">[1]</span>. The graphic exemplifies each principle with remarkable fidelity.
          </p>

          <div className="pull-quote">
            "Graphical excellence is that which gives to the viewer the greatest number of ideas in the shortest time with the least ink in the smallest space."
            <footer className="mt-2 text-sm not-italic" style={{ color: "oklch(0.60 0.05 75)" }}>— Edward Tufte, <em>The Visual Display of Quantitative Information</em> (2001)</footer>
          </div>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            The map <strong style={{ color: "oklch(0.85 0.06 75)" }}>forces visual comparisons</strong> through the contrasting tan and black bands: the broad, warm advance against the narrow, dark retreat. It <strong style={{ color: "oklch(0.85 0.06 75)" }}>shows causality</strong> through the temperature chart subscripted below the retreat path — a stroke of genius that links the plummeting thermometer readings directly to the army's accelerating collapse. As Cairo (2012) <span className="ref-num">[4]</span> argues, the best visualisations do not merely display data but construct an argument; Minard's map argues, compellingly and silently, against the folly of the campaign.
          </p>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            The map also achieves what Tufte calls <strong style={{ color: "oklch(0.85 0.06 75)" }}>integration of evidence</strong> — the seamless fusion of map, flow diagram, temperature chart, and text annotations into a single, self-contained artefact. This was a pioneering achievement in 1869, anticipating what we now call the infographic by over a century. Friendly (2002) <span className="ref-num">[2]</span> notes that Minard's broader body of work consistently pursued this integration, but the Napoleon map represents its apotheosis. The <strong style={{ color: "oklch(0.85 0.06 75)" }}>data-ink ratio</strong> is exceptionally high: virtually every mark on the page encodes meaningful information, with no decorative embellishment or chartjunk to distract the eye.
          </p>
        </AnimatedSection>

        <SectionDivider />

        {/* ── SECTION 3: LAYER DECOMPOSITION ── */}
        <AnimatedSection>
          <LayerDecomposition />
        </AnimatedSection>

        <SectionDivider />

        {/* ── SECTION 4: WEAKNESSES ── */}
        <AnimatedSection>
          <h2
            className="text-3xl font-semibold mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.75 0.12 75)" }}
          >
            IV. A Critical Eye: Weaknesses and Limitations
          </h2>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            Despite its brilliance, Minard's map is not without significant flaws, particularly when viewed through the lens of modern visualisation scholarship. Several limitations merit careful consideration.
          </p>

          <h3
            className="text-xl font-semibold mb-3 mt-8"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.80 0.08 75)" }}
          >
            The Subordination of Chronology to Geography
          </h3>
          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            The map's most significant weakness is its treatment of time. Minard anchors the x-axis to geographical longitude rather than to a temporal scale, which produces two related distortions. First, the army's month-long occupation of Moscow is entirely invisible: the flow band simply reverses direction, giving the misleading impression of an immediate retreat. As Boykin (n.d.) <span className="ref-num">[5]</span> observes, this omission distorts the viewer's perception of the campaign's pace and the strategic decision-making that preceded the retreat. Second, the absence of dates along the advance route means the viewer cannot correlate the army's position with the calendar, obscuring the relationship between the summer advance and the autumn retreat.
          </p>

          <h3
            className="text-xl font-semibold mb-3 mt-8"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.80 0.08 75)" }}
          >
            The Sawtooth Attrition Effect
          </h3>
          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            A subtler but important design flaw concerns how the band narrows to represent troop losses. Because the band tapers symmetrically from both its upper and lower edges, each loss event is visually halved in impact. If 30,000 men were lost at a given point, the band jags by 15,000 along its top edge and 15,000 along its bottom — producing half the visual drama that a single-edge taper would achieve. The exception is the catastrophic crossing of the Berezina River, where the band narrows dramatically; but this is more a consequence of the scale of the loss than a deliberate design choice.
          </p>

          <h3
            className="text-xl font-semibold mb-3 mt-8"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.80 0.08 75)" }}
          >
            The Awkward Temperature Integration
          </h3>
          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            While the temperature chart is conceptually brilliant, its execution is technically problematic. The chart uses the Réaumur scale, now obsolete, requiring modern readers to perform a mental conversion. More critically, Minard connects his sporadic temperature readings with straight lines, implying a smooth and continuous decline in temperature that the underlying data does not support. This violates Cairo's (2012) <span className="ref-num">[4]</span> principle of truthfulness — the visual form should not imply greater precision or continuity than the data warrants. Furthermore, the visual similarity between the rising and falling contour of the temperature line and the geographical undulations of the retreat path creates a spurious visual correlation between the two, which can mislead the viewer.
          </p>
        </AnimatedSection>

        <SectionDivider />

        {/* ── SECTION 4: IMPROVEMENTS ── */}
        <AnimatedSection>
          <h2
            className="text-3xl font-semibold mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.75 0.12 75)" }}
          >
            V. Reimagining Minard: Potential Improvements
          </h2>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            The most impactful improvement would be to introduce a <strong style={{ color: "oklch(0.85 0.06 75)" }}>temporal x-axis</strong> for the retreat segment, replacing or supplementing the geographical longitude with a calendar-based scale. This would make the relationship between temperature and troop loss far more legible, and would correctly represent the army's static month in Moscow. Several modern redesigns, including those catalogued by Friendly (2002) <span className="ref-num">[2]</span>, have explored this approach with considerable success.
          </p>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            A second improvement would be to <strong style={{ color: "oklch(0.85 0.06 75)" }}>encode temperature directly into the colour of the flow band</strong> during the retreat, using a sequential colour scale from amber (mild) to deep blue (lethal cold). This would eliminate the need for the separate temperature chart entirely, integrating the causal relationship directly into the primary visual encoding and substantially reducing the cognitive load on the viewer. This approach, suggested by several designers in Boykin's (n.d.) <span className="ref-num">[5]</span> survey of redesigns, would also address the misleading contour similarity noted above.
          </p>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            Finally, an <strong style={{ color: "oklch(0.85 0.06 75)" }}>interactive digital version</strong> could address many of the map's remaining limitations simultaneously. Tooltips could surface precise troop counts and dates at any point along the route; an animated timeline could correctly represent the Moscow pause; and the temperature scale could be converted to Celsius on demand. These affordances would preserve the graphic's powerful narrative structure while correcting its factual and perceptual distortions.
          </p>
        </AnimatedSection>

        <SectionDivider />

        {/* ── CONCLUSION ── */}
        <AnimatedSection>
          <h2
            className="text-3xl font-semibold mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.75 0.12 75)" }}
          >
            Conclusion
          </h2>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            Charles Joseph Minard's map of Napoleon's Russian campaign remains a towering achievement in the history of data visualisation. Its ability to encode six variables into a single, self-contained narrative — one that communicates the scale of a military catastrophe with immediate emotional force — is a standard that few visualisations, before or since, have matched. Tufte's admiration is well-founded: the map exemplifies nearly every principle of analytical design, from multivariate complexity to the integration of evidence.
          </p>

          <p className="mb-5 leading-relaxed" style={{ lineHeight: 1.9 }}>
            Yet the map is also a product of its time and its limitations are instructive. The subordination of chronology to geography, the symmetric sawtooth attrition effect, and the technically imprecise temperature chart are not merely historical curiosities — they are reminders that even masterpieces involve design trade-offs. By studying where Minard succeeded and where he fell short, we sharpen our own understanding of what effective data visualisation demands: not merely the display of data, but the construction of a truthful, legible, and emotionally resonant argument.
          </p>
        </AnimatedSection>

        <SectionDivider />

        {/* ── REFERENCES ── */}
        <AnimatedSection>
          <h2
            className="text-2xl font-semibold mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: "oklch(0.75 0.12 75)" }}
          >
            References
          </h2>

          <ol
            className="space-y-4 text-sm"
            style={{ color: "oklch(0.65 0.04 75)", lineHeight: 1.8, fontFamily: "'Lora', serif" }}
          >
            {[
              {
                num: 1,
                text: "Tufte, E.R. (2006). Beautiful Evidence. Cheshire, CT: Graphics Press.",
              },
              {
                num: 2,
                text: "Friendly, M. (2002). 'Visions and Re-Visions of Charles Joseph Minard', Journal of Educational and Behavioral Statistics, 27(1), pp. 31–51.",
              },
              {
                num: 3,
                text: "Bertin, J. (1983). Semiology of Graphics: Diagrams, Networks, Maps. Madison, WI: University of Wisconsin Press.",
              },
              {
                num: 4,
                text: "Cairo, A. (2012). The Functional Art: An Introduction to Information Graphics and Visualization. Berkeley, CA: New Riders.",
              },
              {
                num: 5,
                text: "Boykin, J. (n.d.). Redesigning Minard's Napoleon Graphic. [online] Available at: http://wayfind.com/redesigning-minards-napoleon-graphic/ [Accessed 23 Feb. 2026].",
              },
              {
                num: 6,
                text: "Tufte, E.R. (2001). The Visual Display of Quantitative Information. 2nd edn. Cheshire, CT: Graphics Press.",
              },
            ].map((ref) => (
              <li key={ref.num} className="flex gap-3">
                <span
                  className="shrink-0 font-semibold"
                  style={{ color: "oklch(0.75 0.12 75)", fontFamily: "'Fira Mono', monospace", minWidth: "1.5rem" }}
                >
                  [{ref.num}]
                </span>
                <span>{ref.text}</span>
              </li>
            ))}
          </ol>
        </AnimatedSection>

      </main>

      {/* ── FOOTER ── */}
      <footer
        className="py-12 text-center border-t"
        style={{ borderColor: "oklch(0.30 0.04 65)", color: "oklch(0.50 0.04 65)" }}
      >
        <CompassOrnament size={24} />
        <p className="mt-4 text-sm" style={{ fontFamily: "'Fira Mono', monospace" }}>
          CMT218 — Data Visualisation &nbsp;·&nbsp; Cardiff University
        </p>
        <p className="mt-1 text-xs" style={{ color: "oklch(0.40 0.03 65)" }}>
          Analysis of Minard's 1869 <em>Carte figurative</em> &nbsp;·&nbsp; 2025–26
        </p>
      </footer>
    </div>
  );
}
