# Minard Blog — Design Brainstorm

## Context
A blog post analysing Charles Joseph Minard's 1869 Napoleon campaign map for a data visualisation module (CMT218). The audience is knowledgeable about data visualisation. The tone is scholarly yet engaging. The visual identity should feel like a premium academic/editorial publication.

---

<response>
<probability>0.07</probability>
<idea>

**Design Movement:** 19th-Century Cartographic Antiquarian meets Modern Editorial

**Core Principles:**
1. Aged parchment warmth contrasted with sharp typographic precision
2. The map itself as the hero — every design decision defers to it
3. Restrained ornamentation: ink-like borders, subtle sepia gradients, no digital gloss
4. Information hierarchy borrowed from broadsheet newspapers

**Color Philosophy:**
- Background: warm off-white/parchment (`oklch(0.97 0.02 85)`)
- Text: deep charcoal ink (`oklch(0.18 0.01 60)`)
- Accent: Minard's own tan/gold (`oklch(0.72 0.09 75)`) and dark umber (`oklch(0.25 0.04 55)`)
- Reasoning: evokes the physical artefact, creates emotional resonance with the 1869 original

**Layout Paradigm:**
- Asymmetric two-column layout: a wide reading column (65%) with a narrow annotation sidebar (35%)
- The map image bleeds edge-to-edge at the top, then the text wraps beneath it
- Section dividers use thin horizontal rules styled as cartographic scale bars

**Signature Elements:**
1. Drop-cap initials styled in a serif display font at each section opening
2. Pull-quotes rendered in a sepia box with a left border, mimicking marginalia
3. Footnote-style reference annotations in the sidebar column

**Interaction Philosophy:**
- Hovering over key terms reveals a tooltip with a brief definition
- Smooth scroll with a reading progress indicator styled as a compass needle

**Animation:**
- Page entrance: content fades in from below like a document being unrolled
- Map image: subtle sepia vignette pulses once on load to draw the eye
- Section transitions: 300ms ease-in-out opacity fade

**Typography System:**
- Display/Headings: `Playfair Display` (serif, high contrast, editorial gravitas)
- Body: `Source Serif 4` (readable, warm, academic)
- Captions/Labels: `DM Mono` (monospace, analytical, contrasts with serif body)
- Hierarchy: H1 at 3.5rem bold, H2 at 1.75rem, body at 1.125rem/1.85 line-height

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

**Design Movement:** Swiss International Typographic Style (Brutalist Academic)

**Core Principles:**
1. Grid is law — every element snaps to a strict 8-column baseline grid
2. Typography does all the work; imagery is functional, never decorative
3. High contrast black-and-white with a single accent colour
4. Density and precision over whitespace and comfort

**Color Philosophy:**
- Background: pure white (`oklch(1 0 0)`)
- Text: pure black (`oklch(0 0 0)`)
- Accent: a single bold red (`oklch(0.55 0.22 27)`) used only for critical callouts
- Reasoning: forces the reader to engage with the argument, not the aesthetics

**Layout Paradigm:**
- Strict three-column grid; text occupies columns 1–2, annotations in column 3
- Large block-level section numbers (01, 02, 03…) printed in oversized grey type behind headings
- No rounded corners anywhere; all borders are 1px solid black

**Signature Elements:**
1. Section numbers as enormous background watermarks
2. Data table comparing Minard's six variables against Bertin's visual variable taxonomy
3. Horizontal rules that span the full viewport width

**Interaction Philosophy:**
- No hover effects; the interface is static and authoritative
- A sticky top bar shows the current section title and word count remaining

**Animation:**
- None on load; sections slide in from the left on scroll (200ms linear)

**Typography System:**
- Headings: `Bebas Neue` (condensed, authoritative)
- Body: `IBM Plex Serif` (technical, legible, institutional)
- Labels: `IBM Plex Mono`
- Hierarchy: H1 at 4rem, H2 at 1.5rem uppercase tracked, body at 1rem/1.7

</idea>
</response>

<response>
<probability>0.08</probability>
<idea>

**Design Movement:** Dark Academic / Manuscript Illumination

**Core Principles:**
1. Deep, rich darkness as the canvas — like reading by candlelight in a library
2. Gold and amber accents that echo the tan of Minard's advancing army band
3. Generous whitespace within a constrained reading column for focus and gravitas
4. Every decorative element must serve the content's scholarly tone

**Color Philosophy:**
- Background: very dark warm brown (`oklch(0.14 0.02 55)`)
- Text: warm cream (`oklch(0.92 0.02 85)`)
- Primary accent: antique gold (`oklch(0.75 0.12 75)`)
- Secondary accent: muted rust (`oklch(0.55 0.12 35)`)
- Reasoning: the darkness creates intimacy and focus; gold ties visually to the map itself

**Layout Paradigm:**
- Single wide column (max 720px) centred on the page, with generous side margins
- A fixed left-side vertical timeline/progress bar in gold
- The map image is presented in a "lightbox" style frame with a gold border

**Signature Elements:**
1. Chapter ornaments — small SVG flourishes between sections inspired by cartographic compass roses
2. Highlighted key terms in amber with a subtle glow effect
3. A sticky "map legend" sidebar that explains the six variables as the user scrolls

**Interaction Philosophy:**
- Clicking on highlighted terms scrolls to the relevant analysis section
- The map image can be zoomed/panned inline

**Animation:**
- Page load: a slow fade from black, like a lantern being lit
- Scroll-triggered: sections rise from below with a 400ms ease-out
- Hover on key terms: warm amber glow pulses

**Typography System:**
- Headings: `Cormorant Garamond` (elegant, historical, high contrast)
- Body: `Lora` (warm, readable, scholarly)
- Code/Data: `Fira Mono`
- Hierarchy: H1 at 3rem italic, H2 at 1.6rem small-caps, body at 1.1rem/1.9

</idea>
</response>

---

## Selected Design: Dark Academic / Manuscript Illumination (Option 3)

This approach best serves the content. The dark background with gold accents directly mirrors the visual language of Minard's own map (tan advance band, dark retreat band). The scholarly, candlelit atmosphere is appropriate for an academic blog post about a 19th-century artefact. The Cormorant Garamond + Lora pairing provides historical gravitas without feeling archaic.
