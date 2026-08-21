// Verify the SQLite DB state after the server has run.
// Uses the storage interface (not better-sqlite3 directly) to respect the A1 seam.
// Run AFTER starting (and stopping) the dev server at least once:
//   npx tsx --tsconfig .nuxt/tsconfig.server.json scripts/verify-storage.ts
import { env }     from '../server/utils/env'
import { storage } from '../server/utils/storage'
import { resolve } from 'node:path'

console.log(`\nDB path: ${resolve(env.dbPath)}\n`)

// ── snapshots_latest ──────────────────────────────────────────────────────────
const latest = await storage.latestSnapshot()
console.log('── snapshots_latest ─────────────────────────────────────────────────────')
if (!latest) {
  console.log('  (empty — server has not polled yet)')
} else {
  console.log(`  generatedAt: ${new Date(latest.generatedAt).toISOString()}`)
  console.log(`  period:      ${latest.period}`)
  console.log(`  stale:       ${latest.stale ?? false}`)
  console.log(`  owners (revenue cube): ${latest.aggregates?.owner?.revenue?.length ?? 0}`)
  console.log(`  ticker events:         ${latest.events?.length ?? 0}`)
  console.log(`  trend present:         ${!!latest.trend}`)
}

// ── snapshots_daily ───────────────────────────────────────────────────────────
const dailies = await storage.dailySnapshots(35)
console.log('\n── snapshots_daily ──────────────────────────────────────────────────────')
console.log(`  total rows (last 35 days): ${dailies.length}`)
for (const snap of [...dailies].reverse().slice(0, 5)) {
  console.log(`  generatedAt: ${new Date(snap.generatedAt).toISOString()}  period=${snap.period}`)
}

// ── settings ──────────────────────────────────────────────────────────────────
const settings = await storage.getSettings()
const settingKeys = Object.keys(settings)
console.log('\n── settings ─────────────────────────────────────────────────────────────')
console.log(settingKeys.length === 0
  ? '  (empty — no settings saved yet)'
  : settingKeys.map(k => `  ${k}: ${JSON.stringify(settings[k])}`).join('\n'))

// ── daily-row behaviour ───────────────────────────────────────────────────────
console.log('\n── daily-row behaviour ──────────────────────────────────────────────────')
console.log('  ONE row per calendar day (YYYY-MM-DD key, upserted each poll).')
console.log('  Each poll overwrites the current day\'s row; past days\' rows are final.')
console.log(`  Retention: ~35 days (${dailies.length} day(s) stored now).`)
