// A1: Storage seam — the ONLY module that imports better-sqlite3.
// All callers `import { storage }` and await results (async-shaped for cloud compat).
// Cloud edition swaps createSqliteStorage() for createSupabaseStorage(tenantId)
// without touching any caller.

import type { Snapshot } from '~~/types/widgets'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'
import { env } from './env'

export interface Storage {
  // Writes the snapshot as both the single "latest" row and the "today" daily row.
  // `day` is YYYY-MM-DD in the configured timezone — caller (poller plugin) computes it.
  saveSnapshot(s: Snapshot, day: string): void | Promise<void>

  // Returns the last saved snapshot for instant boot and SSE-on-connect.
  latestSnapshot(): Snapshot | null | Promise<Snapshot | null>

  // Returns daily snapshots for the last `sinceDays` days, oldest-first.
  // Each row is the final snapshot saved on that day (end-of-day state).
  dailySnapshots(sinceDays: number): Snapshot[] | Promise<Snapshot[]>

  getSettings(): Record<string, unknown> | Promise<Record<string, unknown>>
  putSettings(patch: Record<string, unknown>): void | Promise<void>
}

function createSqliteStorage(): Storage {
  const dbPath = resolve(env.dbPath)
  mkdirSync(dirname(dbPath), { recursive: true })

  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS snapshots_latest (
      id       INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
      data     TEXT    NOT NULL,
      saved_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS snapshots_daily (
      day      TEXT    PRIMARY KEY NOT NULL,  -- YYYY-MM-DD in config timezone
      data     TEXT    NOT NULL,
      saved_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL  -- JSON-encoded value
    );
  `)

  const upsertLatest = db.prepare<[string, number]>(
    `INSERT INTO snapshots_latest (id, data, saved_at) VALUES (1, ?, ?)
     ON CONFLICT (id) DO UPDATE SET data = excluded.data, saved_at = excluded.saved_at`,
  )
  const upsertDaily = db.prepare<[string, string, number]>(
    `INSERT INTO snapshots_daily (day, data, saved_at) VALUES (?, ?, ?)
     ON CONFLICT (day) DO UPDATE SET data = excluded.data, saved_at = excluded.saved_at`,
  )
  const pruneDaily = db.prepare<[string]>(
    `DELETE FROM snapshots_daily WHERE day < ?`,
  )
  const getLatest   = db.prepare(`SELECT data FROM snapshots_latest WHERE id = 1`)
  const getDaily    = db.prepare<[string]>(`SELECT data FROM snapshots_daily WHERE day >= ? ORDER BY day ASC`)
  const getSettings = db.prepare(`SELECT key, value FROM settings`)
  const upsertSetting = db.prepare<[string, string]>(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
  )

  // Wrap both upserts in a transaction so latest and daily are always in sync.
  const saveTx = db.transaction((json: string, day: string, now: number) => {
    upsertLatest.run(json, now)
    upsertDaily.run(day, json, now)
    // Prune rows older than 35 days to keep the daily table bounded.
    const cutoff = new Date(now - 35 * 24 * 60 * 60_000).toISOString().slice(0, 10)
    pruneDaily.run(cutoff)
  })

  return {
    saveSnapshot(s: Snapshot, day: string) {
      saveTx(JSON.stringify(s), day, Date.now())
    },

    latestSnapshot() {
      const row = getLatest.get() as { data: string } | undefined
      return row ? (JSON.parse(row.data) as Snapshot) : null
    },

    dailySnapshots(sinceDays: number) {
      const cutoff = new Date(Date.now() - sinceDays * 24 * 60 * 60_000)
        .toISOString()
        .slice(0, 10)
      const rows = getDaily.all(cutoff) as { data: string }[]
      return rows.map(r => JSON.parse(r.data) as Snapshot)
    },

    getSettings() {
      const rows = getSettings.all() as { key: string; value: string }[]
      const out: Record<string, unknown> = {}
      for (const r of rows) out[r.key] = JSON.parse(r.value)
      return out
    },

    putSettings(patch: Record<string, unknown>) {
      const tx = db.transaction(() => {
        for (const [k, v] of Object.entries(patch)) {
          upsertSetting.run(k, JSON.stringify(v))
        }
      })
      tx()
    },
  }
}

export const storage: Storage = createSqliteStorage()
