import type { Screen, Settings } from '~~/types/widgets'

export const defaultScreen: Screen = {
  widgets: [
    { id: 'w1', size: 'half',    type: 'leaderboard', dimension: 'owner', metric: 'revenue',    celebrate: true },
    { id: 'w2', size: 'quarter', type: 'spotlight',   dimension: 'owner', metric: 'activities' },
    { id: 'w3', size: 'quarter', type: 'ticker' },
  ],
  bench: [],
}

// Default multi-dashboard settings used on first boot and as migration target.
// The single "Main" dashboard wraps the original default screen so the board
// keeps displaying correctly after the storage migration.
export const defaultSettings: Settings = {
  dashboards: [{ id: 'd1', name: 'Main', period: 'month', screen: defaultScreen }],
  rotation:   { mode: 'auto', seconds: 30 },
  activeDashboardId: 'd1',
}
