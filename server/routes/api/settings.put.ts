// PUT /api/settings — validates and persists the full multi-dashboard Settings,
// then broadcasts the change to all connected SSE clients.
//
// Request body:  { settings: Settings }
// Response 200:  Settings                     — accepted and stored
// Response 400:  { errors: string[] }         — validation failure, nothing persisted
//
// Seam checks:
//   A1: storage access via interface only
//   validateSettings: pure, no I/O — enforced server-side after client pre-check

import { storage }            from '../../utils/storage'
import { emitSettings }       from '../../utils/bus'
import { validateSettings }   from '#shared/utils/validateScreen'
import type { Settings }      from '~~/types/widgets'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ settings?: unknown }>(event)

  const result = validateSettings(body?.settings)
  if (!result.ok) {
    setResponseStatus(event, 400)
    return { errors: result.errors }
  }

  const settings = body!.settings as Settings

  // Persist: all three keys in one transaction via the storage seam.
  await storage.putSettings({
    dashboards:        settings.dashboards,
    rotation:          settings.rotation,
    activeDashboardId: settings.activeDashboardId,
  })

  // Broadcast full Settings to every SSE client — each client updates its
  // in-memory settings and re-derives the active screen locally.
  emitSettings(settings)

  console.log(
    `[settings] PUT accepted — ${settings.dashboards.length} dashboard(s), ` +
    `rotation=${settings.rotation.mode}/${settings.rotation.seconds}s, persisted + broadcast`,
  )

  return settings
})
