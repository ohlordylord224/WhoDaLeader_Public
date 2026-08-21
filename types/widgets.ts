export type Size = 'full' | 'half' | 'quarter'

// Per-object activity types are first-class metrics (amendment: design review §9).
// 'activities' is the weighted aggregate; individual objects are raw counts.
// Call-specific derived metrics (amendment: discovery 2026-06):
//   'calls'        = alias for 'dials' (total call records, all statuses); kept for compat
//   'dials'        = same value as 'calls'; semantic name on widgets
//   'connects'     = calls whose hs_call_disposition ∈ config.callDispositions.connectDispositions
//                    (NOT status=COMPLETED — that overcounts 7x; voicemail/no-answer also mark COMPLETED)
//   'connectRate'  = connects / dials × 100, stored as 0–100 (e.g. 10.4 = 10.4%)
//   'callsByResult'= team-wide disposition breakdown; stored for future stacked widget
export type Metric =
  | 'revenue'
  | 'pipeline'
  | 'deals'
  | 'activities'
  | 'calls'
  | 'dials'
  | 'connects'
  | 'connectRate'
  | 'callsByResult'
  | 'emails'
  | 'meetings'
  | 'tasks'
  | 'notes'
  | 'linkedin'

// Audience narrows an owner-dimensioned widget to a subset of tracked owners.
// Unset = all globally-tracked owners (current behaviour, unchanged).
// Rows are filtered BEFORE ranking and limit so "Top 5 SDRs" means top 5
// within the SDR subset, not global top 5 with non-SDRs hidden.
export type WidgetAudience =
  | { mode: 'team';   teamIds: string[] }   // owners whose teamIds intersect
  | { mode: 'owners'; ownerIds: string[] }  // specific owner IDs

export type Widget = {
  id: string
  size: Size
  type: 'leaderboard' | 'spotlight' | 'target' | 'ticker' | 'trend'
  dimension?: 'owner' | 'dealstage' | 'none'
  metric?: Metric
  celebrate?: boolean
  title?: string
  // leaderboard: custom row count (1–10); unset = density default (quarter 3 / half 6 / full 10)
  limit?: number
  // owner-dimensioned widgets only; unset = inherit global teamFilter
  audience?: WidgetAudience
}

export type Screen = {
  widgets: Widget[]
  bench: Widget[]  // configured but not currently displayed; still fetched
}

// ── Multi-dashboard settings ──────────────────────────────────────────────────

// Time period for a dashboard's data window.
export type DashboardPeriod = 'today' | 'week' | 'month' | 'quarter'

export type Dashboard = {
  id: string
  name: string
  // Independent time period per dashboard. Optional for backward compat with
  // pre-v3 stored settings — migration fills it in on first boot.
  // Falls back to the global LEADERBOARD_PERIOD config when absent.
  period?: DashboardPeriod
  screen: Screen
  // Optional per-dashboard rotation dwell (seconds).
  // Falls back to Settings.rotation.seconds when absent.
  dwell?: number
}

export type Settings = {
  dashboards: Dashboard[]
  rotation: {
    mode: 'auto' | 'manual'
    seconds: number  // global rotation interval; per-dashboard dwell overrides
  }
  activeDashboardId: string  // which dashboard is currently shown / being edited
}

export type Row = { key: string; label: string; value: number }

// Team-wide disposition tally — one row per disposition GUID, sorted desc by count.
// Stored in Aggregates.callsByResult for the future stacked/segmented widget.
export type CallDispositionRow = { key: string; label: string; count: number }

// aggregates[dimension][metric] = Row[] sorted desc
export type Aggregates = {
  owner?:          Partial<Record<Metric, Row[]>>
  dealstage?:      Partial<Record<Metric, Row[]>>
  team?:           Partial<Record<Metric, number>>
  callsByResult?:  CallDispositionRow[]  // team-wide disposition breakdown
}

// One period's worth of data — current window + optional prev-window for deltas.
export type PeriodSlice = {
  aggregates: Aggregates
  trend?: Aggregates  // prev-period like-for-like window (refreshed every 5th poll)
}

export type Snapshot = {
  generatedAt: number
  // Top-level period + aggregates kept for backward compat.
  // Equals byPeriod[global-default-period] (or first available period).
  // Step B widgets will read byPeriod[dashboard.period] instead.
  period: string
  aggregates: Aggregates
  trend?: Aggregates
  // Cube keyed by period string — one slice per distinct period in use.
  // Optional so old stored snapshots (pre-v3 poll) parse without error.
  byPeriod?: Record<string, PeriodSlice>
  events: Array<{ ts: number; kind: 'deal' | 'activity'; text: string }>
  stale?: boolean
}
