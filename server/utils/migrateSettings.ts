// Settings migration — runs at Nitro startup, no-ops if already current.
// Safe to call every boot.
//
// v1: settings table has key='screen', value=JSON of Screen
// v2: key='dashboards' | 'rotation' | 'activeDashboardId'  (no period on dashboards)
// v3: dashboards[].period added (today | week | month | quarter)
//
// Old 'screen' row is left in the table harmlessly — v2+ consumers use 'dashboards'.

import type { Screen, Settings, DashboardPeriod } from '~~/types/widgets'
import { storage }                from './storage'
import { defaultSettings }        from '~~/config/screen.default'
import { leaderboardConfig }      from '~~/config/leaderboard'

export async function migrateSettingsIfNeeded(): Promise<Settings> {
  const raw = await storage.getSettings()

  // ── v1 → v2+v3: no 'dashboards' key at all ───────────────────────────────
  if (!Array.isArray(raw.dashboards)) {
    const existingScreen =
      (raw.screen as Screen | undefined) ?? defaultSettings.dashboards[0]!.screen

    const defaultPeriod = (leaderboardConfig.period ?? 'month') as DashboardPeriod
    const migrated: Settings = {
      dashboards:        [{ id: 'd1', name: 'Main', period: defaultPeriod, screen: existingScreen }],
      rotation:          { mode: 'auto', seconds: 30 },
      activeDashboardId: 'd1',
    }

    await storage.putSettings({
      dashboards:        migrated.dashboards,
      rotation:          migrated.rotation,
      activeDashboardId: migrated.activeDashboardId,
    })

    console.log('[settings] v1→v3 migration complete — existing layout preserved as "Main" dashboard')
    return migrated
  }

  // ── v2 → v3: 'dashboards' present but dashboards lack period ─────────────
  const dashboards = raw.dashboards as Array<Record<string, unknown>>
  if (dashboards.some(d => d.period === undefined)) {
    const defaultPeriod = (leaderboardConfig.period ?? 'month') as DashboardPeriod
    const patched = dashboards.map(d =>
      d.period === undefined ? { ...d, period: defaultPeriod } : d,
    )
    await storage.putSettings({ dashboards: patched })
    console.log(
      `[settings] v2→v3 migration: added period='${defaultPeriod}' to ` +
      `${dashboards.filter(d => d.period === undefined).length} dashboard(s)`,
    )
    return { ...raw, dashboards: patched } as unknown as Settings
  }

  // Already v3 — no-op.
  return raw as unknown as Settings
}

// Re-hydrate Settings from storage. Returns defaultSettings if storage is empty.
export async function loadSettings(): Promise<Settings> {
  const raw = await storage.getSettings()
  if (Array.isArray(raw.dashboards)) return raw as unknown as Settings
  return await migrateSettingsIfNeeded()
}
