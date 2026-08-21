// Pure, side-effect-free layout + settings validator.
// Imported by the PUT route (server enforcement) and by the edit-layer UI
// (client pre-check) — single source of truth, no drift between layers.
//
// Import path from server: '#shared/utils/validateScreen'
// Import path from app:    '#shared/utils/validateScreen'

import type { Screen, Widget, Size, Metric, Settings } from '~~/types/widgets'

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] }

const VALID_TYPES   = new Set(['leaderboard', 'spotlight', 'target', 'ticker', 'trend'])
const VALID_SIZES   = new Set<Size>(['full', 'half', 'quarter'])
const VALID_DIMS    = new Set(['owner', 'dealstage', 'none'])
const VALID_METRICS = new Set<Metric>([
  'revenue', 'pipeline', 'deals', 'activities',
  'calls', 'dials', 'connects', 'connectRate', 'callsByResult',
  'emails', 'meetings', 'tasks', 'notes', 'linkedin',
])

const CELL_SIZE: Record<Size, number> = { full: 4, half: 2, quarter: 1 }

// Types where celebrate:true is a meaningful option.
const CELEBRATE_TYPES = new Set(['leaderboard', 'spotlight'])

// Title hard-cap from DESIGN.md §8b: controls must stay readable at 10 ft.
const TITLE_MAX_CHARS = 24

function validateWidget(w: Widget, label: string, errors: string[]): void {
  if (!w.id || typeof w.id !== 'string' || !w.id.trim()) {
    errors.push(`${label}: id must be a non-empty string`)
  }
  if (!VALID_TYPES.has(w.type)) {
    errors.push(`${label}: unknown type '${w.type}' (must be leaderboard | spotlight | target | ticker | trend)`)
  }
  if (!VALID_SIZES.has(w.size)) {
    errors.push(`${label}: unknown size '${w.size}' (must be full | half | quarter)`)
  }
  if (w.celebrate === true && !CELEBRATE_TYPES.has(w.type)) {
    errors.push(`${label}: celebrate:true is only valid on leaderboard or spotlight, not '${w.type}'`)
  }
  if (w.title != null && w.title.length > TITLE_MAX_CHARS) {
    errors.push(`${label}: title '${w.title}' is ${w.title.length} chars — max is ${TITLE_MAX_CHARS} (DESIGN §8b)`)
  }
  if (w.limit !== undefined) {
    if (!Number.isInteger(w.limit) || w.limit < 1 || w.limit > 10) {
      errors.push(`${label}: limit must be an integer between 1 and 10 (got ${w.limit})`)
    }
  }

  if (w.audience !== undefined) {
    const a = w.audience as Record<string, unknown>
    if (a.mode === 'team') {
      const ids = a.teamIds
      if (!Array.isArray(ids) || ids.length === 0 || !ids.every(t => typeof t === 'string' && t)) {
        errors.push(`${label}: audience.teamIds must be a non-empty array of strings`)
      }
    } else if (a.mode === 'owners') {
      const ids = a.ownerIds
      if (!Array.isArray(ids) || ids.length === 0 || !ids.every(t => typeof t === 'string' && t)) {
        errors.push(`${label}: audience.ownerIds must be a non-empty array of strings`)
      }
    } else {
      errors.push(`${label}: audience.mode must be 'team' or 'owners'`)
    }
  }

  // Type-specific required fields.
  if (w.type === 'leaderboard' || w.type === 'spotlight') {
    if (!w.dimension || !VALID_DIMS.has(w.dimension)) {
      errors.push(`${label}: ${w.type} requires dimension (owner | dealstage | none)`)
    }
    if (!w.metric || !VALID_METRICS.has(w.metric)) {
      errors.push(`${label}: ${w.type} requires a valid metric`)
    }
  }
  if (w.type === 'trend') {
    if (!w.metric || !VALID_METRICS.has(w.metric)) {
      errors.push(`${label}: trend requires a valid metric`)
    }
  }
}

export function validateScreen(screen: unknown): ValidationResult {
  const errors: string[] = []

  if (!screen || typeof screen !== 'object') {
    return { ok: false, errors: ['screen must be an object'] }
  }
  const s = screen as Record<string, unknown>

  if (!Array.isArray(s.widgets)) errors.push('screen.widgets must be an array')
  if (!Array.isArray(s.bench))   errors.push('screen.bench must be an array')

  // Bail early if top-level shape is wrong — the per-widget checks below would throw.
  if (errors.length) return { ok: false, errors }

  const widgets = s.widgets as Widget[]
  const bench   = s.bench   as Widget[]

  // Cell count: displayed widgets must sum to exactly 4.
  let cells = 0
  for (const w of widgets) {
    const sz = CELL_SIZE[w.size as Size]
    cells += sz ?? 0
  }
  if (cells !== 4) {
    errors.push(
      `screen.widgets sizes sum to ${cells} cells — must equal exactly 4 ` +
      `(full=4, half=2, quarter=1). Got: [${widgets.map(w => `${w.size}(${CELL_SIZE[w.size as Size] ?? '?'})`).join(', ')}]`,
    )
  }

  // Unique IDs across widgets + bench.
  const seen = new Map<string, string>()
  for (const w of [...widgets, ...bench]) {
    const id = String(w.id ?? '')
    if (!id) continue  // blank id reported by validateWidget
    const prev = seen.get(id)
    if (prev) {
      errors.push(`duplicate widget id '${id}' — ids must be unique across widgets and bench`)
    } else {
      seen.set(id, id)
    }
  }

  // Per-widget validation.
  for (let i = 0; i < widgets.length; i++) {
    validateWidget(widgets[i]!, `widgets[${i}] (id='${widgets[i]?.id ?? ''}')`, errors)
  }
  for (let i = 0; i < bench.length; i++) {
    validateWidget(bench[i]!, `bench[${i}] (id='${bench[i]?.id ?? ''}')`, errors)
  }

  return errors.length ? { ok: false, errors } : { ok: true }
}

// ── validateSettings — full multi-dashboard settings ─────────────────────────
// Validates the entire Settings object: dashboard count/names/uniqueness,
// each dashboard's screen (delegating to validateScreen), rotation config.
// Called by PUT /api/settings server-side and optionally client-side on save.

const MAX_DASHBOARDS    = 5
const DASHBOARD_NAME_MAX = 32
const MIN_ROTATION_S    = 5
const MAX_ROTATION_S    = 3_600
const VALID_PERIODS     = new Set(['today', 'week', 'month', 'quarter'])

export function validateSettings(raw: unknown): ValidationResult {
  const errors: string[] = []

  if (!raw || typeof raw !== 'object') {
    return { ok: false, errors: ['settings must be an object'] }
  }

  const s = raw as Record<string, unknown>

  if (!Array.isArray(s.dashboards)) {
    return { ok: false, errors: ['settings.dashboards must be an array'] }
  }

  const dashboards = s.dashboards as unknown[]

  if (dashboards.length === 0) errors.push('settings.dashboards must contain at least one dashboard')
  if (dashboards.length > MAX_DASHBOARDS) {
    errors.push(`settings.dashboards has ${dashboards.length} — max is ${MAX_DASHBOARDS}`)
  }

  const seenIds   = new Set<string>()
  const seenNames = new Set<string>()

  for (let i = 0; i < dashboards.length; i++) {
    const d = dashboards[i] as Record<string, unknown>
    const lbl = `dashboards[${i}]`

    // id
    if (!d.id || typeof d.id !== 'string' || !d.id.trim()) {
      errors.push(`${lbl}: id must be a non-empty string`)
    } else {
      if (seenIds.has(d.id as string)) errors.push(`${lbl}: duplicate id '${d.id}'`)
      seenIds.add(d.id as string)
    }

    // name
    if (!d.name || typeof d.name !== 'string' || !(d.name as string).trim()) {
      errors.push(`${lbl}: name must be a non-empty string`)
    } else {
      const name = d.name as string
      if (name.length > DASHBOARD_NAME_MAX) {
        errors.push(`${lbl}: name is ${name.length} chars — max is ${DASHBOARD_NAME_MAX}`)
      }
      const key = name.toLowerCase().trim()
      if (seenNames.has(key)) errors.push(`${lbl}: duplicate name '${name}'`)
      seenNames.add(key)
    }

    // screen
    const screenResult = validateScreen(d.screen)
    if (!screenResult.ok) {
      for (const e of screenResult.errors) errors.push(`${lbl}.screen — ${e}`)
    }

    // optional period — validated when present, silently accepted when absent
    // (absent = legacy row; migration fills it in on first boot)
    if (d.period !== undefined && !VALID_PERIODS.has(d.period as string)) {
      errors.push(`${lbl}: period must be 'today' | 'week' | 'month' | 'quarter' (got '${d.period}')`)
    }

    // optional dwell
    if (d.dwell !== undefined) {
      if (typeof d.dwell !== 'number' || d.dwell < MIN_ROTATION_S || d.dwell > MAX_ROTATION_S) {
        errors.push(`${lbl}: dwell must be a number between ${MIN_ROTATION_S} and ${MAX_ROTATION_S}`)
      }
    }
  }

  // activeDashboardId
  if (!s.activeDashboardId || typeof s.activeDashboardId !== 'string') {
    errors.push('settings.activeDashboardId must be a non-empty string')
  } else if (seenIds.size > 0 && !seenIds.has(s.activeDashboardId as string)) {
    errors.push(`settings.activeDashboardId '${s.activeDashboardId}' not found in dashboards`)
  }

  // rotation
  if (!s.rotation || typeof s.rotation !== 'object') {
    errors.push('settings.rotation must be an object')
  } else {
    const r = s.rotation as Record<string, unknown>
    if (r.mode !== 'auto' && r.mode !== 'manual') {
      errors.push("settings.rotation.mode must be 'auto' or 'manual'")
    }
    if (typeof r.seconds !== 'number' || r.seconds < MIN_ROTATION_S || r.seconds > MAX_ROTATION_S) {
      errors.push(`settings.rotation.seconds must be a number between ${MIN_ROTATION_S} and ${MAX_ROTATION_S}`)
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true }
}
