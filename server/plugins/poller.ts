// Nitro startup plugin: migrates settings, boots from SQLite, then polls
// HubSpot on a fixed interval.
// A3: no globals or env vars read here — everything arrives via ctx or env.ts.
// A1: touches storage only through the Storage interface.

import { buildSnapshot }            from '../services/poller'
import { storage }                  from '../utils/storage'
import { bus, onSettings }          from '../utils/bus'
import { credentials }              from '../utils/credentials'
import { periodBounds }             from '../utils/period'
import { env }                      from '../utils/env'
import { leaderboardConfig }        from '~~/config/leaderboard'
import { migrateSettingsIfNeeded }  from '../utils/migrateSettings'
import type { Snapshot, Widget, Settings, DashboardPeriod } from '~~/types/widgets'

// Build a single merged Screen that unions the widgets+bench from ALL dashboards.
// deriveNeeds() sees the full demand set → one poll covers all rotation states.
function unionScreen(settings: Settings) {
  const widgets: Widget[] = settings.dashboards.flatMap(d => d.screen.widgets)
  const bench:   Widget[] = settings.dashboards.flatMap(d => d.screen.bench)
  return { widgets, bench }
}

// Collect the distinct periods across all dashboards.
// Falls back to the global config period for dashboards without an explicit period.
function extractPeriods(settings: Settings): Set<string> {
  const defaultPeriod = leaderboardConfig.period ?? 'month'
  const periods = new Set<string>()
  for (const d of settings.dashboards) {
    periods.add(d.period ?? defaultPeriod)
  }
  return periods
}

export default async function () {
  // ── Startup migration ──────────────────────────────────────────────────────
  const initialSettings = await migrateSettingsIfNeeded()

  const ctx = {
    config:       leaderboardConfig,
    screen:       unionScreen(initialSettings),
    periods:      extractPeriods(initialSettings),
    credentials,
    periodBounds,
  }

  console.log(
    `[poller] demand union: ${ctx.screen.widgets.length} widget(s) across ` +
    `${initialSettings.dashboards.length} dashboard(s), ` +
    `periods=[${[...ctx.periods].join(', ')}]`,
  )

  // ── Live demand update — fires whenever a PUT /api/settings is saved ───────
  onSettings((newSettings) => {
    ctx.screen  = unionScreen(newSettings)
    ctx.periods = extractPeriods(newSettings)
    console.log(
      `[poller] demand updated: ${ctx.screen.widgets.length} widget(s) across ` +
      `${newSettings.dashboards.length} dashboard(s), ` +
      `periods=[${[...ctx.periods].join(', ')}]`,
    )
  })

  // ── Boot: emit last-known snapshot immediately so the board is never blank ──
  let lastSnap: Snapshot | null = await storage.latestSnapshot()
  if (lastSnap) {
    bus.emit('snapshot', lastSnap)
    console.log(`[poller] booted from stored snapshot (generatedAt=${new Date(lastSnap.generatedAt).toISOString()})`)
  } else {
    console.log('[poller] no stored snapshot — first poll will populate the board')
  }

  // ── Poll tick ──────────────────────────────────────────────────────────────
  async function tick() {
    try {
      const snap = await buildSnapshot(ctx)
      lastSnap   = snap
      const day  = todayInTz(leaderboardConfig.timezone)
      await storage.saveSnapshot(snap, day)
      bus.emit('snapshot', snap)
      const pList = Object.keys(snap.byPeriod ?? {}).join(', ')
      console.log(
        `[poller] snapshot saved  day=${day}  periods=[${pList}]  ` +
        `generatedAt=${new Date(snap.generatedAt).toISOString()}`,
      )
    } catch (err) {
      console.error('[poller] poll failed:', err)
      if (lastSnap) {
        bus.emit('snapshot', { ...lastSnap, stale: true })
        console.log('[poller] emitting stale snapshot to connected clients')
      }
    }
  }

  tick()
  setInterval(tick, env.pollIntervalMs)
}

function todayInTz(tz: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: tz }).format(new Date())
}
