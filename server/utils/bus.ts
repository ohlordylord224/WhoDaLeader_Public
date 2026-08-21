import { EventEmitter } from 'node:events'
import type { Snapshot, Settings } from '~~/types/widgets'

// Singleton event bus — snapshot fan-out + settings change broadcast.
// Snapshot emitter:  server/plugins/poller.ts
// Settings emitter:  server/routes/api/settings.put.ts
// Listeners:         server/routes/api/stream.get.ts
class Bus extends EventEmitter {}
export const bus = new Bus()
bus.setMaxListeners(200)  // one per connected SSE client

// ── Snapshot events ──────────────────────────────────────────────────────────

export function emitSnapshot(snap: Snapshot): void {
  bus.emit('snapshot', snap)
}

export function onSnapshot(listener: (snap: Snapshot) => void): void {
  bus.on('snapshot', listener)
}

export function offSnapshot(listener: (snap: Snapshot) => void): void {
  bus.off('snapshot', listener)
}

// ── Settings events ───────────────────────────────────────────────────────────
// Emitted after a validated PUT /api/settings so every connected SSE client can
// update its full settings (dashboards + rotation) without a page refresh.

export type SettingsPayload = Settings  // full settings object, not just a screen

export function emitSettings(payload: SettingsPayload): void {
  bus.emit('settings', payload)
}

export function onSettings(listener: (payload: SettingsPayload) => void): void {
  bus.on('settings', listener)
}

export function offSettings(listener: (payload: SettingsPayload) => void): void {
  bus.off('settings', listener)
}
