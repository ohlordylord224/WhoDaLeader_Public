# Whosdaleader Design System

**Whosdaleader** is a dashboard application for Linux and Raspberry Pi that turns a
sales team's day into a live, big-screen competition. Teams mount a Pi to a wall
display and Whosdaleader renders **leaderboards, contests and team standings** that
update in real time — who's up, who's down, who just took the crown.

This design system is the brand's single source of truth: color, type, spacing,
effects, reusable React components, and a high-fidelity recreation of the flagship
**Live Wall Display** product.

> **Personality:** competitive & gamified — arcade scoreboard energy, but friendly
> and candy-bright, not aggressive. Dark-first (built for wall-mounted screens),
> with editorial-contrast typography and **big, bold, readable-across-the-room** numbers.

---

## Sources

This system was authored **from a written brief**, not an existing codebase or Figma
file. There is no upstream repo or design file to reference. If/when a product
codebase or Figma exists, link it here so future contributors can reconcile:

- Product codebase: _none provided_
- Figma: _none provided_
- Brand brief: "colourful with a clear colour palette to denote up/down, leaders &
  draggers; big bold text." Direction confirmed with the user: dark-first, candy/
  friendly color feel, editorial-contrast type, one product surface (the live
  leaderboard / TV dashboard).

---

## How to consume

Link the one global entry point — it `@import`s every token + font file:

```html
<link rel="stylesheet" href="styles.css">
```

Then author against the **semantic** custom properties (`--surface-card`, `--up`,
`--rank-1`, `--text-strong`…), not the raw ramps. React components are published on
the compiled bundle:

```html
<script src="_ds_bundle.js"></script>
<script>
  const { Button, LeaderRow, MetricTile } = window.WhosdaleaderDesignSystem_012310;
</script>
```

Dark is the default (`:root`). A light theme is available via `data-theme="light"`
on a wrapper for office-desktop contexts.

---

## CONTENT FUNDAMENTALS

How Whosdaleader writes.

- **Voice:** energetic, plain-spoken, a little cheeky — like a friendly hype-MC, not
  a corporate dashboard. It celebrates wins and softens losses ("needs a nudge", not
  "failing").
- **Person:** speaks to the team as **"you"** and names people directly ("Priya just
  took #1"). Uses first names on the board. Avoids jargon.
- **Casing:** Sentence case for almost everything — headings, buttons, labels.
  ALL-CAPS is reserved for tiny **eyebrows / overlines** and the **LIVE** badge
  (letter-spaced). Never shout in body copy.
- **Numbers are the message.** Lead with the figure, keep the label short. Currency
  abbreviates on the board (`£128.4k`), expands in detail views (`£128,400`).
  Always tabular so digits don't jitter as they tick.
- **Deltas read as direction, not math:** `▲ 12.4%`, `▼ 6.1%`, `— holding`. Up is a
  win, down is a slip, flat is "holding".
- **Tone examples:**
  - Title: *"This week's movers"* · *"Sprint to the finish"* · *"Team standings"*
  - Eyebrow: *"LIVE"* · *"WEEK 6"* · *"NORTH REGION"*
  - Win ticker: *"Mia Chen closed Northwind Robotics — £24.0k"*,
    *"Priya overtook Marcus for #1"*
  - Empty/soft: *"No deals yet today — first one sets the pace."*
- **Emoji:** avoid. The arcade energy comes from **color, scale and motion**, not
  emoji. Direction is shown with the triangle glyphs ▲ ▼ — and podium metals, never 🏆/🔥.

---

## VISUAL FOUNDATIONS

The look, answered concretely.

**Color & vibe.** Dark-first. Surfaces are a **neutral cool-grey "Slate" ramp**
(`#101317` app → `#1a1f26` cards), never pure black — calm grey that lets the
accents pop. The brand is an electric **Azure** blue (`#2f8bff`). Semantic accents:
**Mint** (up `#19d894`), **Coral** (down `#f5365c`), **Gold/Silver/Bronze** podium
metals, plus Sky / Teal / Tango for charts and tags. No purple anywhere.
Imagery, when present, should be cool and high-energy; the system itself ships no
photography — it's typographic and data-driven.

**The direction system is sacred.** Up is always mint-green + ▲, down is always
coral-red + ▼, flat is muted + —. These three colors carry meaning across the entire
product — don't repurpose them for decoration. The brand blue is for primary actions
and focus, never for up/down signals.

**Type.** Editorial contrast. **Bricolage Grotesque (800)** for display/headlines —
characterful, bold, a touch quirky. **Hanken Grotesk** for body & UI — clean, tall
x-height, reads from across a room. **Space Grotesk** (tabular) for every number,
score and delta. Display tracking is tight (`-0.015em`); numbers are tabular lining
figures. Scale runs large — hero digits up to 140px; nothing on a TV view under ~15px.

**Spacing & layout.** 4px base grid, but rhythm runs **roomy** — TV dashboards are
read at distance, so padding is generous (`24–44px` gutters). Wall views are a fixed
**1920×1080** canvas, scaled to fit and letterboxed on black; controls live *outside*
the scaled canvas. Fixed header bar, grid body (board + right "pulse" rail).

**Corners & cards.** Friendly = rounded. Radii are large (cards `26px`, tiles `26px`,
pills everywhere for buttons/badges). Cards are a raised Ink surface with a 1px
low-contrast border and a **soft dark drop shadow** (`--shadow-card`). No hard
1px-grey boxes.

**Glows, not just shadows.** Emphasis is shown with **colored glows** —
`--glow-gold` haloes the current leader, `--glow-up`/`--glow-down` flag big movers,
`--glow-brand` for primary focus. Use sparingly, for the thing that matters most on
screen (usually #1).

**Borders & lines.** Hairline dividers use `--border-subtle` (≈9% paper) / 
`--border-default` (≈16%). Never heavy. Section splits inside cards use a single
subtle top border, not boxes.

**Backgrounds.** Flat Ink surfaces. The only gradients allowed are (1) progress/race
**fills** (candy left-to-right), and (2) a faint leader-card tint
(`gold 12% → surface`). No purple-blue hero gradients, no noise/grain by default
(a `--grain-opacity` token exists if you want a whisper of texture on a hero).

**Motion.** Fast and springy, never sluggish. `--dur-fast 120ms` for hover/press,
`--dur-base 220ms` for state, `--dur-slow 420ms` for bars filling. Easing:
`--ease-out` for most, `--ease-spring` (candy bounce) for toggles and celebratory
pops. Auto-rotate between board views every ~8s. Respect `prefers-reduced-motion`.

**Hover / press.** Hover = lift (`translateY(-3px)`) + deeper shadow on cards;
brightened/`-hover` color on buttons; a colored glow appears on primary/semantic
buttons. Press = subtle shrink (`scale(.985–.93)`) + 1px down. Focus = a soft blue
ring (`--ring`), never a hard outline.

**Transparency & blur.** Reserved for floating chrome over the scaled canvas — the
control dock uses `backdrop-filter: blur(14px)` over a translucent Ink. Content
surfaces are opaque for legibility on a TV.

---

## ICONOGRAPHY

- **Icon set:** [Lucide](https://lucide.dev) — friendly, rounded, consistent 2px
  stroke that matches the candy/approachable tone. Loaded from CDN in the component
  cards (`lucide@0.456.0`). When building production UIs, install `lucide-react` and
  pass icons as nodes into `Button`, `IconButton`, and `MetricTile` (they accept icon
  `ReactNode` props — the system never hard-codes an icon).
  > ⚠️ **Substitution flag:** Lucide is a stand-in chosen to fit the brand; there is no
  > bespoke Whosdaleader icon set yet. If you have/commission one, drop the SVGs in
  > `assets/icons/` and update this section.
- **Direction glyphs:** the up/down/flat indicators use the unicode triangles
  **▲ ▼ —** (in the `StatDelta` component), not icons — they're crisp at any size and
  inherit the direction color.
- **Podium:** rank 1·2·3 are communicated by **metal color + number**, not medal
  emoji. The logo emblem is the only illustrative mark (podium bars + crown).
- **Emoji:** not used in product UI.
- **Logo:** `assets/emblem.svg` — a rounded blue badge with gold/silver/bronze
  podium bars and a crown. The wordmark is set in Bricolage Grotesque 800
  ("Whos**da**leader", the middle "da" can take `--brand-bright`). See
  `guidelines/brand-logo.html`.

---

## Index / manifest

**Root**
- `styles.css` — global entry point (`@import` list only). Consumers link this.
- `readme.md` — this file.
- `SKILL.md` — Agent-Skill manifest for use in Claude Code.

**`tokens/`** — design tokens (each `@import`ed by `styles.css`)
- `fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `effects.css`

**`assets/`**
- `emblem.svg` — logo mark.

**`guidelines/`** — foundation specimen cards (Design System tab)
- Type: `type-display` · `type-body` · `type-numeric` · `type-scale`
- Colors: `colors-direction` · `colors-podium` · `colors-brand` · `colors-accents` · `colors-surfaces` · `colors-text`
- Spacing: `spacing-scale` · `radius` · `shadows`
- Brand: `brand-logo`

**`components/`** — reusable React primitives (`window.WhosdaleaderDesignSystem_012310`)
- `core/` — `Button` · `IconButton` · `Badge` · `Avatar` · `Card` · `Switch`
- `leaderboard/` — `RankBadge` · `StatDelta` · `ProgressBar` · `MetricTile` · `LeaderRow`

**`ui_kits/leaderboard/`** — the Live Wall Display product
- `index.html` — interactive shell (switch view/metric, auto-rotate), 1920×1080 scaled
- `WallLeaderboard.jsx` — podium + ranked rows + team-pulse rail (flagship)
- `ContestRace.jsx` — head-to-head race to a target
- `TeamStandings.jsx` — region-vs-region grid
- `WallChrome.jsx` — shared header + wins ticker
- `data.js` — sample dataset

---

## Notes & open questions

- **Fonts load from Google Fonts CDN** (Bricolage Grotesque, Hanken Grotesk, Space
  Grotesk) rather than self-hosted binaries — the build environment can't fetch font
  files. To self-host, drop `.woff2`s in `assets/fonts/` and swap the `@import` in
  `tokens/fonts.css` for `@font-face` rules.
- Lucide is a documented **substitute** icon set (see Iconography).
