// GET /api/settings — returns the full multi-dashboard Settings object.
// A5: screen identity resolved here; clients never hardcode which screen to render.
// Resolution order: stored v2 settings → v1 migration → defaultSettings.

import { loadSettings } from '../../utils/migrateSettings'

export default defineEventHandler(async () => {
  return await loadSettings()
})
