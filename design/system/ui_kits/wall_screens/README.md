# Wall screens — product screens for the 10-foot display

Five standalone 1920×1080 screens composing the Whosdaleader wall product from
the design system. Same structure as `ui_kits/leaderboard/` — link
`../../styles.css`, compose from `../../_ds_bundle.js`, fake data in `data.js`.

## Files

| File | Screen |
|---|---|
| `01-flagship.html` | Half revenue leaderboard + activities spotlight + live ticker |
| `02-flagship-overtake.html` | Same screen mid-overtake — the celebration state |
| `03-four-quarters.html` | Leaderboard / spotlight / target / ticker (empty state) + stale chip |
| `04-top-ten.html` | Full-screen top-10 leaderboard |
| `05-board-trend.html` | Leaderboard + trend halves |
| `widgets.jsx` | The five widget types + `WallShell` chrome (exported to `window`) |
| `wall.css` | TV-scale layer — all styling against semantic tokens |
| `data.js` | `window.WDLW` sample dataset |

## New patterns introduced (everything else is per the system)

- **2×2 wall grid.** `WallShell` renders the minimal header (wordmark, period
  chip, clock, LIVE — per `WallChrome`) over a 2×2 grid. `Cell` takes
  `size="quarter" | "half" | "full"` (1 cell / full column / all four).
- **TV type scale.** Nothing essential under 24px on the canvas: row names
  28–34px, row values 38–48px, hero numbers `--text-6xl`–`--text-8xl` in
  `--font-numeric` tabular. The only sub-24px text is timestamps
  (`.tick__time`) and the stale chip, as allowed.
- **`TvDelta`.** `StatDelta` semantics (▲ ▼ — holding, direction colors) at
  10-foot sizes (24/32px). Use it on wall screens; `StatDelta` stays for
  desktop surfaces.
- **Crown amendment.** A single crown — the emblem's crown path as an inline
  SVG glyph (`Crown`) — marks the current #1 on leaderboards and spotlights,
  nothing else. Ranks 2–3 stay metal color + number. No other emoji anywhere.
- **Celebration (overtake) state.** `OvertakeBanner` + `celebrate` on
  `Leaderboard`: the new #1 row swaps its gold tint for mint (`--up`) with
  `--glow-up` and a `--ease-spring` pop; banner springs in. Animations are
  gated on `prefers-reduced-motion: no-preference` and settle to the visible
  end state. One glow per screen — celebration replaces the gold glow.
- **Stale chip.** `StaleChip` — quiet pill, bottom-right corner,
  `--warning` dot, "Reconnecting · 14:31".
- **Empty state.** `Ticker empty` renders the system voice line:
  *"No deals yet today — first one sets the pace."*

## Config layer — how the board is edited (screens 06–10)

The configuration screens add an **edit layer** over the same wall. The TV
itself never shows any of it.

| File | Screen |
|---|---|
| `06-edit-mode.html` | Edit mode revealed — gears on every module, "Editing" indicator, bench |
| `07-gear-popover.html` | The gear popover open on the leaderboard, all controls visible |
| `08-mid-reflow.html` | Spotlight growing to half, ticker sliding to the bench (frozen mid-transition) |
| `09-new-widget.html` | An empty "+ Add widget" slot with the popover in new-widget form |
| `10-display-mode.html` | The same board the TV shows — zero edit chrome survives |
| `editchrome.jsx` | The native-res edit chrome: `EditChrome`, `AddSlot` (exported to `window`) |
| `edit.css` | Config-layer styling — native-res chrome + canvas-scale slot/reflow |

### Mode model

- **Display mode** (`10`) is the wall exactly as the TV renders it — header
  only, nothing interactive. It loads `edit.css` and keeps an empty `#chrome`
  node, and still renders zero edit affordances: proof the chrome is purely
  additive.
- **Edit mode** (`06`–`09`) reveals chrome on pointer activity (the screens are
  the revealed state). Each module gains a quiet gear on a translucent ink chip,
  the header shows an "Editing" dot, and the bench appears along the bottom.

### Native-res chrome over the scaled canvas

Per the system's floating-dock pattern, all edit chrome (gears, "Editing" chip,
bench, popover) renders into a `#chrome` layer that sits **outside** the scaled
`#canvas`, so it stays crisp and tappable at any canvas scale. `EditChrome`
measures the live post-transform rects of `.wall__grid .cell` (and re-measures
after webfonts settle / on resize) and anchors each gear and the popover to them
in viewport coordinates. Surfaces use `backdrop-filter: blur(14px)` over a
translucent `--surface-overlay` / `--surface-card` — the documented dock recipe.

### The gear popover

Anchored to its gear, compact, system tokens throughout. Sections in order:
**Size** (quarter / half / full segmented control with footprint pictograms —
sizing *is* placement), **Type** (leaderboard / spotlight / target / ticker /
trend, Lucide icons + labels), **Data** (dimension + metric selects, hidden for
ticker), **Celebrate overtakes** toggle (leaderboard + spotlight only, the DS
`Switch`), **Title** override (placeholder shows the auto title), and **Set
aside** in the footer (sends the module to the bench, not deletion). The
new-widget form (`09`) is the same popover with a primary **Add to board**
footer.

### Reflow + bench

The grid always sums to 4 cells (quarter = 1, half = 2, full = 4). Growing a
module displaces others to **the bench** — a slim shelf of named chips
("Ticker — wins"); a chip shows a disabled "No room" state when it won't fit.
Shrinking leaves empty cells, rendered as quiet dashed **"+ Add widget"** slots
(edit mode only) that open the popover in new-widget form. `08` freezes the
moment of reflow: a half growing to full while a quarter slides toward the bench,
animated with `--dur-base` / `--ease-out` and paused mid-flight (negative
animation-delay), with the arriving bench chip materialising in the same frame.

## New tokens / patterns needed

**No new tokens.** The entire config layer is built from existing semantic
tokens — `--surface-overlay`/`--surface-card`/`--surface-inset`,
`--brand`/`--brand-soft`/`--brand-bright`, the `--border-*`, `--radius-*`,
`--shadow-*` (incl. `--shadow-overlay` for the popover), `--text-*`,
`--weight-*`, `--tracking-*`, `--ring`, and the motion tokens
`--dur-fast`/`--dur-base`/`--ease-out`/`--ease-in-out`. The blur value (14px) is
the dock figure named in the guide, not a token. New *patterns* introduced
(all token-built): the native-res `#chrome` portal layer, the `.gearchip` /
`.editing` / `.bench` / `.pop` chrome surfaces, the size/type pictogram controls,
the dashed `.slot` add-widget cell, and the frozen `.reflow-col` transition.

## Open questions

- Auto-rotation between these screens (the leaderboard kit's 8s rhythm) is out
  of scope here — screens are static compositions for review.
- The 30s idle timeout that fades edit chrome back to display mode is described
  in the mode model but, like auto-rotation, is left to the runtime — these
  screens are the discrete revealed/idle states, not the live timer.
