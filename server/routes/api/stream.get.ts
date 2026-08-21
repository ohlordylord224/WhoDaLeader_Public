// SSE endpoint — streams snapshots and settings changes to browser clients.
//
// Two event types over the same connection:
//   (unnamed)        data: <Snapshot JSON>         — every poll or on-connect boot
//   event: settings  data: { screen: Screen }      — after a validated PUT /api/settings
//
// The unnamed type fires es.onmessage in the client; the named type requires
// es.addEventListener('settings', ...) — added in the edit-layer Part 2.
// Both share one connection; no second SSE stream is needed.
//
// On connect: immediately push the stored snapshot so the board paints without
// waiting for the next poll. Then relay every bus 'snapshot' and 'settings' event.
// On close: remove both listeners to prevent leaks (bus is capped at 200).
//
// Uses raw Node.js res.write() rather than h3's createEventStream because
// sendStream() short-circuits when event.node.res.socket is null in Nitro's
// Vite dev layer. The raw approach works identically in dev and production.
//
// A1: storage access via interface only. A5: path is relative (/api/stream).

import { storage }                                             from '../../utils/storage'
import { bus, onSnapshot, offSnapshot, onSettings, offSettings, type SettingsPayload } from '../../utils/bus'
import type { Snapshot }                                       from '~~/types/widgets'

export default defineEventHandler(async (event) => {
  const res = event.node.res

  // SSE headers — must be sent before any body bytes.
  res.setHeader('Content-Type',      'text/event-stream')
  res.setHeader('Cache-Control',     'no-cache')
  res.setHeader('Connection',        'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')   // disable nginx/proxy buffering
  res.flushHeaders()

  // Immediately push the stored snapshot so the board paints on connect.
  const latest = await storage.latestSnapshot()
  if (latest) {
    res.write(`data: ${JSON.stringify(latest)}\n\n`)
  }

  // ── Snapshot writer (unnamed SSE event → es.onmessage) ───────────────────
  const writeSnap = (snap: Snapshot): void => {
    try {
      res.write(`data: ${JSON.stringify(snap)}\n\n`)
    } catch { /* client gone — cleaned up on close */ }
  }

  // ── Settings writer (named SSE event → es.addEventListener('settings', …)) ─
  // Format: "event: settings\ndata: {...}\n\n"
  // Named events do NOT fire es.onmessage, so existing snapshot handling is
  // completely unaffected. The edit-layer Part 2 adds the client-side listener.
  const writeSettings = (payload: SettingsPayload): void => {
    try {
      res.write(`event: settings\ndata: ${JSON.stringify(payload)}\n\n`)
    } catch { /* client gone */ }
  }

  const before = bus.listenerCount('snapshot')
  onSnapshot(writeSnap)
  onSettings(writeSettings)
  console.log(`[stream] client connected    listeners ${before} → ${bus.listenerCount('snapshot')}`)

  // 30-second heartbeat comment keeps the connection alive through proxies.
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n') } catch { /* ignore */ }
  }, 30_000)

  // Single cleanup — guard against double-fire (close fires after finish).
  let cleaned = false
  const cleanup = (): void => {
    if (cleaned) return
    cleaned = true
    clearInterval(heartbeat)
    offSnapshot(writeSnap)
    offSettings(writeSettings)
    console.log(`[stream] client disconnected listeners ${bus.listenerCount('snapshot') + 1} → ${bus.listenerCount('snapshot')}`)
  }

  res.on('close',  cleanup)
  res.on('finish', cleanup)

  // Tell h3 we handled the response ourselves; don't let it write a body.
  event._handled = true
})
