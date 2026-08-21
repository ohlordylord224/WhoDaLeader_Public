# whodaleader

A live sales leaderboard for a wall-mounted TV, driven by HubSpot data. Runs
unattended on a Raspberry Pi (or any machine), polls HubSpot on a schedule, and
displays a self-scaling dashboard that updates in real time — with rotating
multi-dashboard support, per-dashboard time periods, and a touch/laptop edit
mode for rearranging the board without redeploying.

Built for a 4K TV kiosk, but it runs in any browser.

## What it does

- **Live board over SSE.** A server polls HubSpot every ~60s, caches to SQLite,
  and pushes snapshots to the browser. The browser never talks to HubSpot
  directly — one throttled server-side client respects HubSpot's rate limits.
- **Widgets.** Leaderboard, spotlight, target, ticker, and trend — each
  configurable by metric, dimension, audience, and row count.
- **Truthful metrics.** Revenue (closed-won), activities (emails + meetings +
  LinkedIn), and call metrics derived from `hs_call_disposition` (dials /
  connects / connect-rate) rather than the misleading call *status*.
- **Multi-dashboard rotation.** Up to five named dashboards, each with its own
  time period (today / week / month / quarter), auto-rotating on a timer with
  pause and manual controls.
- **Edit mode.** Pointer activity reveals per-widget gear controls; resize,
  reconfigure, set audience, and bench widgets, then save. Layout changes
  broadcast live to every connected screen.
- **Canvas-scale rendering.** A fixed 1920×1080 design canvas scales uniformly
  to any display, so the board looks right on a laptop or a 4K wall.
- **Self-hosted fonts.** Renders correctly fully offline.

## Stack

Nuxt 4 / Vue 3 / Nitro, better-sqlite3 for persistence, server-sent events for
live updates. No client-side HubSpot calls, no database in the browser.

## Quick start (development)

    npm install
    cp .env.example .env
    cp config/leaderboard.example.ts config/leaderboard.ts
    # fill in .env (HubSpot token, timezone) and config/leaderboard.ts (your IDs)
    npm run dev

Open the URL it prints. The board shows empty states until HubSpot data flows
in on the first poll.

### HubSpot setup

Create a **Private App** (HubSpot → Settings → Integrations → Private Apps) with
read scopes for contacts, deals, and owners. Activity reads (calls, emails,
meetings, tasks, notes) and communications (LinkedIn) ride on
`crm.objects.contacts.read`. Put the token in `.env` as `HUBSPOT_TOKEN`.

Portal-specific IDs (teams, system-account owners, call disposition GUIDs) go in
`config/leaderboard.ts` — see the "HOW TO FIND" notes in `leaderboard.example.ts`.

## Deployment (Raspberry Pi kiosk)

See [deploy/README.md](deploy/README.md) for the full walkthrough: systemd
service, Chromium kiosk autostart under Wayland/labwc, screen-blanking, and a
boot-safe launch. Key points: run the server via **systemd** (not bare `node`,
which won't load `.env`), and put `DB_PATH` **outside** the app directory so
redeploys don't wipe your dashboards.

## How the data layer works

The poller fetches the **union** of all dashboards' data needs each cycle, so
rotating never shows stale data. Metrics are counted in code (fetch records,
tally per owner) rather than one API call per owner, keeping well under
HubSpot's Search API rate limit. Daily snapshots are retained (~35 days) to feed
the trend widget — so trends build up over time.

## License

MIT — see [LICENSE](LICENSE).
