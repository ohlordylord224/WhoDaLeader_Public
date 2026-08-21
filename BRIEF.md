# BRIEF v2 — Whodaleader: Modular HubSpot Sales Dashboard (Raspberry Pi 5, kiosk)

**This document replaces BRIEF v1 in full.** Format: Opus-authored brief → implement with Claude Code, one task per commit, commit + push per task. Standalone project — never reference, import from, or reuse anything from nautiq or scubaid.

**Status:** Tasks 1–2 are DONE (Nuxt 4 scaffold, `config/leaderboard.ts`, `server/utils/period.ts`). Work resumes at Task 3.

**Goal:** A full-screen, browser-based sales dashboard on a Raspberry Pi 5 in kiosk mode. The screen is a configurable grid of widgets (leaderboards, spotlights, targets, ticker, trends) fed by HubSpot data. Widgets that track a leader celebrate overtakes with a green takeover animation. Look and layout are customisable from a live settings panel — no redeploy to retheme or rearrange.

---

## 1. Architecture (unchanged from v1 — the load-bearing decision)

```
HubSpot API ──poll every 60s (throttled)──► Nitro poller ──► SQLite (snapshots + settings)
                                                 │
                                            EventEmitter bus
                                                 │
                                          SSE /api/stream ──► Browser dashboard (kiosk)
```

- The browser NEVER calls HubSpot. Token lives server-side only.
- The binding API constraint is the CRM **Search API at ~4 req/sec** (separate from the daily quota). All HubSpot calls go through one throttled client at ≤3 req/sec.
- **Demand-driven polling:** the poller reads the active screen config (settings) and fetches only the dimension × metric × window combinations that configured widgets actually need. Adding widgets adds calls; removing them removes calls. Worst case (all five widget types active, 10 owners): ~55 calls/poll ≈ 80k/day — well inside even the Free-tier 250k daily quota.

---

## 2. Layout model — the 2×2 grid

The screen is a 2×2 grid of cells. A widget occupies:
- `quarter` = 1 cell
- `half` = 1 full column (2 cells, vertical split → left/right halves)
- `full` = all 4 cells

A screen config is an ordered array of widgets; cells fill column-by-column, left to right. **Validation: sizes must sum to exactly 4 cells.** Valid tilings: full · half+half · half+quarter+quarter · quarter×4.

```ts
type Size = 'full' | 'half' | 'quarter'

type Widget = {
  id: string
  size: Size
  type: 'leaderboard' | 'spotlight' | 'target' | 'ticker' | 'trend'
  dimension?: 'owner' | 'dealstage' | 'none'
  metric?: 'revenue' | 'pipeline' | 'deals' | 'activities'
  celebrate?: boolean      // overtake animation (leaderboard/spotlight only)
  title?: string           // optional custom header
}

type Screen = { widgets: Widget[] }
```

Widgets adapt to their slot: a leaderboard shows ~3 rows in a quarter, 5–6 in a half, 10 in a full; type scale and density derive from slot size via CSS container queries (or a size class on the slot).

---

## 3. The five widget types

| Type | What it shows | Config | Notes |
|---|---|---|---|
| **leaderboard** | Top-N ranked list | dimension (owner/dealstage) × metric, N from slot size | "Top owners by pipeline" and "Pipeline by deal stage" are this one widget with different settings |
| **spotlight** | One big name + number ("Top by activities — Tom, 142") | dimension + metric; `dimension: 'none'` = team total ("£412k closed") | The natural home of the overtake celebration |
| **target** | Progress bar/gauge vs a goal, % + days remaining | metric + scope (team or owner) | Targets come from local config/settings (`targets: { revenue: 500000 }`), NOT HubSpot's goals API (tier-dependent, unreliable) |
| **ticker** | Live feed of recent events ("Sarah closed Acme Ltd — £14,300 · 12 min ago") | max items | Makes the board feel alive between ranking changes; data is a byproduct of polling |
| **trend** | This period-to-date vs the SAME ELAPSED POINT of the previous period, per owner or team (paired bars / delta arrows) | dimension + metric | Compare like-for-like elapsed time, not full prior period — otherwise every Monday looks like a collapse |

**Trend mechanics:** requires a second time window per poll (previous period, same elapsed duration). Trend windows refresh every 5th poll (5 min), not every poll — trend data doesn't need 60s freshness and this halves its API cost.

---

## 4. Data layer

### 4a. Snapshot shape — a general cube, not fixed boards

```ts
type Row = { key: string; label: string; value: number }   // key = ownerId or stageId

type Snapshot = {
  generatedAt: number
  period: string
  aggregates: {
    // populated on demand per active widgets:
    // aggregates[dimension][metric] = Row[] (sorted desc)
    owner?:     Partial<Record<Metric, Row[]>>
    dealstage?: Partial<Record<Metric, Row[]>>
    team?:      Partial<Record<Metric, number>>
  }
  trend?: { /* same shape, previous-period window */ }
  events: Array<{ ts: number; kind: 'deal' | 'activity'; text: string }>
  stale?: boolean
}
```

Widgets are pure readers of this cube. Reconfiguring the screen never touches poller code.

### 4b. Metric definitions

- **revenue** — sum of closed-won deal amounts, close date in period. Use `hs_amount_in_home_currency` when present, falling back to `amount` (multi-currency correctness).
- **pipeline** — sum of OPEN deal amounts (`hs_is_closed = false`), any create date. New fetch vs v1.
- **deals** — count of closed-won deals in period.
- **activities** — count of activity objects (`calls`, `emails`, `meetings`, `tasks`, `notes`) with `hs_timestamp` in period. **Default weights are ALL 1 (raw counts).** If any weight ≠ 1 is configured, the widget MUST label the column "Points", not "Activities" — a weighted score displayed as a count will be disputed on the sales floor. Calls contribute their **dial count** (all statuses) to the activities aggregate.
- **calls / emails / meetings / tasks / notes** — per-object raw counts are **first-class metrics** stored in the cube alongside `activities` (the weighted aggregate). No extra API calls: the calls sweep also fetches `hs_call_status`, enabling three derived call metrics at zero extra cost:
  - **dials** — total call records (all statuses); `calls` is a backward-compat alias for `dials` and carries identical values.
  - **connects** — calls where the line was reached (statuses in `config.callStatuses.connectStatuses`; default: `COMPLETED + NO_ANSWER`). A "connect" = the phone rang; the contact may or may not have answered.
  - **connectRate** — `connects / dials × 100`, stored as a 0–100 number (e.g. 81.0 = 81%). Guard: 0 when dials = 0.
- Metric type: `'revenue' | 'pipeline' | 'deals' | 'activities' | 'calls' | 'dials' | 'connects' | 'connectRate' | 'emails' | 'meetings' | 'tasks' | 'notes'`.
- **Previous-period window** — fetched on every 5th poll invocation regardless of which widgets are configured (not gated on a trend widget being active). Every leaderboard and spotlight row needs period-over-period delta data. The cube carries a `trend` field with the same `aggregates` shape for the prior period, computed over the identical elapsed duration (like-for-like, not the full prior period).

### 4c. Counting without the 10k trap

HubSpot Search pagination caps at 10,000 results — silently undercounting beyond it. Activities (especially emails) can approach this in a busy month.

**Activity counting strategy (Option A — fetch and tally):** for each activity object type, issue **one paginated `searchAll`** over the period with a single `hs_timestamp` range filter (no owner filter). Tally counts per owner in code. This gives O(object_types × pages) calls rather than O(owners × object_types) — for typical team sizes the total activity volume is far lower than owner-count × objects, so the page count stays small (~5 pages/object ≈ 25 calls for activities in a typical month). Guard: if any object returns ≥ 9,500 records in a window, log a loud warning.

Drop `excludeOwnerIds` during the tally loop (not after), so excluded owners accumulate nothing and produce no cube rows. Apply the same exclusion in the deal loops and the ticker filter.

Deals are low-volume: paginate normally (records are needed for amounts), but if any deal search reports `total > 9500`, log a loud warning.

### 4d. Reference data caches

- **Owners** (`GET /crm/v3/owners`): cache 1 hour. Skip archived. Drop rows whose owner is unknown (deactivated ghosts / unassigned).
- **Deal stages** (`GET /crm/v3/pipelines/deals`): cache 1 hour; provides stage *labels* for the dealstage dimension and identifies the closed-won stage id. `CLOSED_WON_STAGE` env stays as override; verify against this endpoint in Task 3.

### 4e. Ticker events

Per poll (only if a ticker widget is active): closed-won deals sorted by `closedate` desc, limit 10 → "X closed {dealname} — £N"; plus the latest few activities per type if desired. Keep the last ~20 events in the snapshot.

---

## 5. Settings: env defaults → SQLite overrides → live panel

Three layers, strict precedence:

1. **`.env`** — secrets + machine config: `HUBSPOT_TOKEN`, `ACCOUNT_TIMEZONE`, `POLL_INTERVAL_MS`, `CLOSED_WON_STAGE`, `BIND_HOST`.
2. **`config/leaderboard.ts` + `config/screen.default.ts`** — the default screen layout, default theme, activity weights, targets. Version-controlled.
3. **SQLite `settings` table** (key-value JSON) — anything changed in the live panel. Overrides config defaults. Survives reboots. Broadcast over SSE on change so the board updates instantly.

**Settings panel scope (v1):** theme preset, brand accent colour, company name, layout editor (pick a tiling, assign type/dimension/metric/celebrate per slot), celebration toggles (sound, confetti), targets. API: `GET/PUT /api/settings` (local network only).

---

## 6. Visual design

The reference is `design/mockup.html` in this repo (commit it from the approved mockup) — broadcast-scoreboard direction: dark default theme, design tokens as CSS custom properties, tabular numerals everywhere, four theme presets (Midnight / Arctic / Ember / Daylight), semantic colours that NEVER retheme (gold = current leader, green = overtake, red = live).

- **The takeover** is the signature: when a `celebrate: true` widget's #1 changes, that widget runs the green sweep + name slam, a centered banner announces the new leader, optional sound (C5–E5–G5 triad) and confetti fire per settings. Client-side detection: remember previous leader key per widget, diff on each SSE push.
- **Count-up animation** on every number change (`requestAnimationFrame`, ease-out) — this is what makes a 60s poll feel live.
- **Stale state:** on poll failure the server re-emits the last snapshot with `stale: true`; the board shows a discreet "reconnecting" pill. NEVER blank or zero — nobody loses the lead to a dropped request.
- **Fonts are self-hosted** in the repo (Archivo, OFL licence — include the licence file). The kiosk must not depend on Google Fonts at boot.
- Use the **frontend-design skill** for the polish pass in Task 8. Respect `prefers-reduced-motion`.

---

## 7. Build order (resume at Task 3; one task per commit)

1. ✅ DONE — Nuxt 4 scaffold, deps, `.env`, structure.
2. ✅ DONE — `config/leaderboard.ts`, `server/utils/period.ts` (pure Intl, Monday weeks).
3. **HubSpot client** — `server/utils/hubspot.ts`: throttled `hsFetch` (350ms spacing), backoff honouring `Retry-After` on 429 + retrying 5xx (max 5), `searchAll`, `searchCount` (limit:1 → total), `getOwners`, `getDealStages`. Verify with a one-off script: print the owner map AND the deal pipeline stages (settles `CLOSED_WON_STAGE`). *(Kickoff prompt already written.)*
4. **Poller v2** — `server/services/poller.ts`: build the demand-driven cube per §4 (closed-won, open pipeline, activity counts via `searchCount`, ticker events, hourly owner/stage caches, trend window every 5th poll). Log the snapshot; verify against the HubSpot UI.
5. **Persistence + bus** — `server/utils/db.ts` (better-sqlite3: `snapshots` + `settings` tables), `bus.ts`, `server/plugins/poller.ts` (boot from last snapshot, interval tick, stale re-emit on failure).
6. **API routes** — `routes/api/stream.get.ts` (SSE: push latest on connect, push on snapshot AND settings change), `snapshot.get.ts`, `settings.get.ts` + `settings.put.ts`.
7. **Layout engine + widgets** — `app/pages/index.vue` renders the 2×2 grid from the active Screen config; the five widget components; overtake detection per celebrate-widget; count-up; stale pill; `<TransitionGroup>` row reordering.
8. **Settings panel + polish** — the drawer (theme, accent, brand, layout editor, toggles, targets) persisting via the settings API; self-hosted fonts; full frontend-design polish pass against `design/mockup.html`.
9. **Pi deployment** — systemd unit for the Node server (`EnvironmentFile=.env`, `Restart=always`); Chromium kiosk autostart (Wayland/labwc on Bookworm: `~/.config/labwc/autostart`); disable screen blanking; **nightly cron restart of the kiosk browser** (Chromium leaks over weeks); deployment docs.

---

## 8. Security & network

- `BIND_HOST` env: default `0.0.0.0` (board reachable on the LAN — convenient for the settings panel from a laptop); set `127.0.0.1` for kiosk-only if sales figures shouldn't be browsable by anyone on the office network. Document the trade-off; this is a deliberate choice, not an accident.
- Token: read-only scopes only, `.env` only, never in client code or commits.

---

## 9. Acceptance criteria

- [ ] Widget numbers match the HubSpot UI for the same period/metric/dimension.
- [ ] Activity counts are immune to the 10k pagination cap (counted via `total`, verified by code inspection).
- [ ] No 429s in normal operation; a forced 429 backs off and recovers.
- [ ] Layout validation rejects configs that don't sum to 4 cells.
- [ ] Changing layout/theme in the settings panel updates the board live, persists across reboot.
- [ ] An engineered overtake on a `celebrate` widget fires sweep + banner within one poll cycle; non-celebrate widgets don't.
- [ ] Weighted activities (any weight ≠ 1) display as "Points".
- [ ] Network kill → "reconnecting" pill with last-known values → auto-recovery. Pi reboot → board repaints from SQLite immediately.
- [ ] Board renders correctly with fonts while fully offline from Google.

## 10. Guardrails

- Browser never holds the HubSpot token or calls HubSpot.
- Every HubSpot call goes through the throttled client. Counts use `searchCount`, never pagination.
- Widgets read the snapshot cube only; new widget types must not require poller rewrites beyond adding a fetch.
- Settings precedence: env → config defaults → SQLite. Never write secrets to SQLite.
- Additive changes only to the Snapshot shape once Task 7 lands.
- Commit + push per task.
