# DESIGN.md — Whosdaleader Design System Integration

**Status: AUTHORITATIVE for all visual decisions. This file supersedes BRIEF.md §6 wherever they disagree.** The design system lives in `design/system/` in this repo (tokens, component specs, reference screens, readme). Claude Code must read `design/system/readme.md` before any frontend task.

**Brand note:** the product/brand name is **Whosdaleader** (wordmark "Whos**da**leader", the "da" may take `--brand-bright`). The repo slug stays `whodaleader`.

---

## 1. What we consume directly vs what we re-implement

**Consume as-is (CSS):**
- `design/system/styles.css` and everything it imports (`tokens/*.css`) — linked/imported globally in the Nuxt app. THIS top-level copy is canonical. (The product screens under `ui_kits/DashboardDesigns/` carry their own nested duplicate of the tokens so they render standalone — that copy is reference-only and must never be imported by the app.)
- All app CSS must use the semantic custom properties (`--surface-card`, `--text-strong`, `--up`, `--down`, `--rank-1`, `--space-*`, `--radius-*`, `--shadow-card`, `--glow-gold`, `--glow-up`, `--dur-*`, `--ease-*`). Raw ramp values (`--slate-850`, `--mint-500`) must not appear in app code — semantic tokens only. The two sanctioned gradient tints from the reference screens (leader gold tint, celebrate mint tint) should be defined once as app-level semantic tokens (e.g. `--tint-lead`, `--tint-celebrate`) wrapping the reference's color-mix recipes.
- `design/system/assets/emblem.svg` — the logo.

**Re-implement as Vue (the system's components are React and CANNOT be imported):**
Each `.jsx` in `design/system/components/` is a SPEC, paired with a `.prompt.md` describing intent. Build Vue 3 equivalents in `app/components/ds/` with matching names, props, and pixel-faithful rendering:
- Core: `Button`, `IconButton`, `Badge`, `Avatar`, `Card`, `Switch`
- Leaderboard: `RankBadge`, `StatDelta`, `ProgressBar`, `MetricTile`, `LeaderRow`
Re-implement only what a widget actually needs, in dependency order.

**THE PRODUCT REFERENCE — the wall screens (canonical for task 7):**
`design/system/ui_kits/DashboardDesigns/ui_kits/wall_screens/` contains five standalone 1920×1080 screens plus the TV-scale layer:
- `01-flagship.html` — half revenue leaderboard + activities spotlight + ticker (the default screen)
- `02-flagship-overtake.html` — the celebration state (the product's signature moment)
- `03-four-quarters.html` — leaderboard / spotlight / target / ticker, incl. empty state + stale chip
- `04-top-ten.html` — full-screen top-10 leaderboard (two-column grid flow)
- `05-board-trend.html` — leaderboard + trend halves
- `widgets.jsx` — the five widgets + `WallShell`/`Cell` chrome (React reference; port to Vue)
- `wall.css` — the TV-scale stylesheet; port its classes/scales into the app's widget components
- `wall_screens/README.md` — the patterns it introduces (TvDelta, Crown, density `BOARD_COUNT { quarter:3, half:6, full:10 }`, celebration, stale chip, empty state)

Widget → reference mapping: leaderboard → `Leaderboard`/`.brd`; spotlight → `Spotlight`/`.spot`; target → `Target`; ticker → `Ticker`/`.tick`; trend → `Trend`. The earlier `ui_kits/leaderboard` exploration kit is superseded by these screens.

## 2. The canvas-scale display strategy (adopted)

The dashboard renders on a **fixed 1920×1080 design canvas** that scales uniformly to the viewport (`transform: scale(min(vw/1920, vh/1080))`, centered, letterboxed on odd ratios), exactly as the wall screens do. All widget layout maths assumes 1920×1080; the Pi can drive any TV without responsive edge cases. The settings drawer floats OVER the scaled canvas at native resolution (translucent ink + `backdrop-filter: blur(14px)` per the system's chrome rules) so controls stay crisp and tappable.

## 3. Color semantics (replaces BRIEF §6 semantics)

- Ranks are podium metals: `--rank-1` gold, `--rank-2` silver, `--rank-3` bronze (+ their `-soft` tints). #1 may carry `--glow-gold` — the only standing glow on screen.
- Direction: `--up` (mint) / `--down` (coral) / `--flat`. The OVERTAKE celebration uses the `--up` family: the new #1 row swaps gold tint for mint with `--glow-up` (celebration replaces the gold glow — still one glow per screen), per `02-flagship-overtake.html`.
- Brand/accent: azure family; `--focus-ring` for focus, never hard outlines.
- LIVE indicator: per system chrome (`Badge live`), letter-spaced ALL-CAPS.
- Stale chip: quiet pill, bottom-right, warning-toned dot + "Reconnecting · HH:MM". If the tokens lack a `--warning`, use the tango family — verify against `tokens/colors.css` before inventing anything.
- Themes: **dark is default; one light theme** via `data-theme="light"`. The four named presets from BRIEF v2 are RETIRED; the settings theme control is a dark/light switch. Brand-accent picker retired in favour of system azure.

## 4. Typography

- `--font-display` (Bricolage Grotesque) for headings/wordmark; `--font-body` (Hanken Grotesk) for everything else; `--font-numeric` (Space Grotesk) for ALL numbers, always tabular so digits don't jitter during count-up.
- TV scale per `wall.css`: nothing essential under 24px on the canvas (only timestamps and the stale chip may go smaller); row names 28–34px, row values 38–48px, hero numbers `--text-6xl`–`--text-8xl`. Long names truncate via the `shortName` pattern ("Priya A.") in tight slots.
- **Fonts must be self-hosted**: download the woff2s for the three families (all OFL — include licence files in `design/system/assets/fonts/`), replace the Google Fonts `@import` in `tokens/fonts.css` with `@font-face` rules. The kiosk must render correctly fully offline. Deliverable in the polish task.

## 5. Voice & copy (binding for all UI strings)

- Sentence case everywhere; ALL-CAPS only for tiny eyebrows and the LIVE badge.
- **No emoji anywhere in product UI** with ONE scoped exception: the Crown — the emblem's crown path as an inline SVG glyph — marks the current #1 on leaderboards and spotlights. Nothing else, ever. (👑 only as an absolute fallback.)
- Numbers lead, labels stay short. Currency abbreviates on the board (`£128.4k`), expands in detail (`£128,400`).
- Deltas read as direction via TvDelta: `▲ 12.4%` / `▼ 6.1%` / `— holding`.
- Celebrates wins, softens losses ("needs a nudge", never "failing").
- Overtake banner copy: *"{First name} just took #1"*. Ticker copy: *"Mia Chen closed Northwind Robotics — £24.0k"*.
- Empty states are warm: *"No deals yet today — first one sets the pace."*

## 6. Motion

- Tokens only: `--dur-fast` 120ms (hover/press), `--dur-base` 220ms (state), `--dur-slow` 420ms (bars filling, celebration); `--ease-out` default, `--ease-spring` for celebratory pops and toggles.
- The overtake celebration per `02-flagship-overtake.html`: banner springs in (`wall-banner-in`), new #1 row pops (`wall-pop`, 120ms delay), mint treatment per §3; animations gated on `prefers-reduced-motion: no-preference` and settle to the visible end state. Sound/confetti remain settings-gated behaviours (confetti colours from the token palette).
- Count-up on number change stays, rendered in `--font-numeric`.
- Auto-rotate between screens: OUT OF SCOPE for v1; logged as a v1.1 candidate.

## 7. Iconography

Lucide (the system's documented stand-in), 2px stroke, via `lucide-vue-next`. Direction glyphs are the unicode triangles, not icons. Podium is metal colour + number; the Crown per §5 is the only pictorial mark.

## 8. Configuration layer (edit mode) — interaction model

Designed screens REVIEWED and APPROVED — `ui_kits/wall_screens/` screens 06–10, plus `editchrome.jsx` + `edit.css`. These are the canonical reference for the edit layer (its own task, AFTER the display board in task 7; it depends on the settings-WRITE API, deferred per Option-1 sequencing). Three rulings from the review are binding when that task is built:

- **(8a) Metric/dimension lists in the gear popover are STALE in the reference.** `editchrome.jsx` hardcodes `['Revenue','Pipeline','Deals','Activities']` and `['Owners','Deal stages']`. The Vue build MUST enumerate the real metric union the cube serves — per-object (calls/emails/meetings/tasks/notes) and the derived call metrics (dials, connects, connectRate) per §9. Do not reproduce the short list.
- **(8b) Title override must NOT be free-text on the wall.** Hard-cap to ≤24 chars OR make it a toggle between auto-title and a short custom title. A 10-foot board can't show long titles. The reference's open text field specifies the control's position, not its validation.
- **(8c) The edit layer requires the settings-WRITE API** (PUT settings persisting the full Screen incl. bench, with sum-to-4-cells validation). Built WITH the edit layer, not task 6.

The binding interaction rules, confirmed against the approved screens:

- **Display mode** (default; what the TV shows): zero edit chrome. No gears, nothing interactive beyond the board itself.
- **Edit mode:** revealed by pointer activity (mouse move / tap from a laptop or phone on the LAN); each module gains a gear icon top-right on a translucent ink chip; an "Editing" indicator appears in the header; chrome fades back to display mode after ~30s without pointer activity. Edit chrome renders at native resolution OVER the scaled canvas. Kiosks have no pointer, so the TV never enters edit mode.
- **Gear popover (per module):** size (quarter/half/full — segmented control with grid pictograms; resizing IS placement), type (5 widgets), data (dimension + metric selects; hidden for ticker), celebrate toggle (leaderboard + spotlight only), title override, "Set aside" (→ bench).
- **Reflow + bench model:** the grid must always sum to 4 cells. Growing a module displaces others to THE BENCH — a slim shelf along the bottom edge, edit mode only, showing set-aside modules as named chips; tapping a chip returns it to the board if room exists (disabled when it doesn't). Shrinking leaves empty cells rendered as quiet "+ Add widget" placeholders (edit mode only) opening the popover in new-widget form. Transitions: `--dur-base` / `--ease-out`.
- **Data model impact:** `Screen` includes `bench: Widget[]` (persisted in settings).
- Global settings (dark/light, sound, confetti, targets, period) remain in the global drawer; per-module gears configure only their module.

## 9. Data-contract notes from the wall-screen review (binding on tasks 4–7)

- **Per-row deltas appear on every leaderboard** → the previous-period window is ALWAYS fetched (every 5th poll), not only when a trend widget is active.
- **Per-object activity metrics** (`calls`, `meetings`, `emails`, `tasks`, `notes`) are first-class selectable metrics alongside the aggregate `activities` — the cube keeps per-object counts rather than collapsing them.
- **Three derived call metrics** (no extra API calls — `hs_call_status` is fetched alongside `hubspot_owner_id` in the same calls sweep): `dials` (total call records, all statuses; alias of `calls`), `connects` (statuses listed in `config.callStatuses.connectStatuses`; default COMPLETED + NO_ANSWER = phone rang), `connectRate` (connects / dials × 100, stored 0–100; guard 0 on no dials). Widgets can surface "Dials", "Connects", or "Connect rate %" as standalone metrics. The underlying per-status breakdown (completed/noAnswer/failed/canceled/ringing/other) lives in the poller's in-memory map; `connects` + `dials` in the cube are sufficient for a 2-bucket stacked bar with no extra fetches.
- **Per-widget time windows** (e.g. "Calls today") are v1.1 — v1 has one global period; spotlight labels read "{Metric} this {period}".
- **Trend daily bars** derive from stored snapshot history (one retained snapshot per day, ~30 days), NOT from extra API calls; the trend widget shows headline + summary rows immediately and grows its daily bars as history accumulates.
- **Rank-movement arrows** are client-side: diff against the previous snapshot's ranks.

## 10. What stays from BRIEF v2 §6 (unchanged)

- Semantic behaviours: overtake detection per celebrate-widget, count-up, stale chip, never blank/zero on failure.
- Self-hosted fonts requirement (now with the system's three families).
- frontend-design skill used for the polish pass in service of this system. The design system ships its own `SKILL.md`; Claude Code should load it for frontend tasks.

## 11. Acceptance additions (frontend tasks)

- [ ] No raw ramp tokens or hard-coded colours/sizes in app code — semantic tokens only (wire `_adherence.oxlintrc.json` into linting if practical); the two tint gradients via app-level semantic tokens per §1.
- [ ] All numerals render in `--font-numeric` with tabular figures.
- [ ] Board renders correctly at 1920×1080, 3840×2160, and a 1366×768 laptop via canvas scaling.
- [ ] Zero emoji in UI strings beyond the §5 Crown exception. Copy matches §5 patterns.
- [ ] Dark and light themes both render every widget legibly.
- [ ] Fully offline kiosk renders with correct fonts.
- [ ] Display mode contains zero edit chrome; edit mode is unreachable without pointer activity.
