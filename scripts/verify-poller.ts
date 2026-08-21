// Verify poller: build a snapshot for the default screen and print results.
// Run with: npx tsx --tsconfig .nuxt/tsconfig.server.json scripts/verify-poller.ts
import 'dotenv/config'
import { credentials } from '../server/utils/credentials'
import { periodBounds } from '../server/utils/period'
import { leaderboardConfig } from '../config/leaderboard'
import { defaultScreen } from '../config/screen.default'
import { buildSnapshot, type PollerContext } from '../server/services/poller'
import { resetCallCount, getCallCount } from '../server/utils/hubspot'

const ctx: PollerContext = {
  config: leaderboardConfig,
  screen: defaultScreen,
  credentials,
  periodBounds,
}

console.log('[verify-poller] Building snapshot for default screen…')
console.log(`  period=${leaderboardConfig.period}  tz=${leaderboardConfig.timezone}`)
console.log(`  excludeOwnerIds: ${leaderboardConfig.excludeOwnerIds.join(', ')}`)
resetCallCount()
const t0 = Date.now()

const snap = await buildSnapshot(ctx)

const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
const calls   = getCallCount()

// ── Revenue leaderboard ───────────────────────────────────────────────────────
console.log('\n── Revenue (owner, this period) ────────────────────────────────────────')
const revRows = snap.aggregates.owner?.revenue ?? []
for (const r of revRows) {
  const bar = '█'.repeat(Math.round((r.value / (revRows[0]?.value || 1)) * 20))
  console.log(`  ${r.label.padEnd(24)} £${Math.round(r.value).toLocaleString('en-GB').padStart(12)}  ${bar}`)
}

// ── Activities: aggregate + per-object breakdown for top owner ────────────────
const actRows = snap.aggregates.owner?.activities ?? []
if (actRows.length > 0) {
  const top = actRows[0]
  console.log('\n── Activities — top owner aggregate + per-object breakdown ──────────────')
  console.log(`  #1: ${top.label} — aggregate total: ${top.value}`)
  for (const obj of ['calls', 'emails', 'meetings', 'tasks', 'notes'] as const) {
    const rows = snap.aggregates.owner?.[obj] ?? []
    const row = rows.find(r => r.key === top.key)
    console.log(`    ${obj.padEnd(10)} ${row?.value ?? 0}`)
  }
  console.log('\n── Activities — top 10 by aggregate ─────────────────────────────────────')
  for (const r of actRows.slice(0, 10)) {
    console.log(`  ${r.label.padEnd(24)} ${String(r.value).padStart(6)}`)
  }
}

// ── Prev-window revenue (top 5) ───────────────────────────────────────────────
const prevRevRows = snap.trend?.owner?.revenue ?? []
console.log('\n── Prev-period revenue (top 5) ─────────────────────────────────────────')
if (prevRevRows.length === 0) {
  console.log('  (none)')
} else {
  for (const r of prevRevRows.slice(0, 5)) {
    console.log(`  ${r.label.padEnd(24)} £${Math.round(r.value).toLocaleString('en-GB').padStart(12)}`)
  }
}

// ── Excluded owner IDs — must produce no rows ─────────────────────────────────
const EXCLUDED_IDS = leaderboardConfig.excludeOwnerIds
const allOwnerRows = [
  ...(snap.aggregates.owner?.revenue ?? []),
  ...(snap.aggregates.owner?.activities ?? []),
  ...(snap.aggregates.owner?.calls ?? []),
  ...(snap.trend?.owner?.revenue ?? []),
  ...(snap.trend?.owner?.activities ?? []),
]
const leaked = allOwnerRows.filter(r => EXCLUDED_IDS.includes(r.key))
console.log('\n── Excluded owner leak check ────────────────────────────────────────────')
console.log(leaked.length === 0
  ? '  ✓ No excluded owner IDs appear in any cube row'
  : `  ✗ LEAK: ${leaked.map(r => `${r.label} (${r.key})`).join(', ')}`)

// ── Aisha Khanom call metric verification ────────────────────────────────────
const aishaDialsRow    = (snap.aggregates.owner?.dials       ?? []).find(r => r.label === 'Aisha Khanom')
const aishaConnRow     = (snap.aggregates.owner?.connects    ?? []).find(r => r.label === 'Aisha Khanom')
const aishaRateRow     = (snap.aggregates.owner?.connectRate ?? []).find(r => r.label === 'Aisha Khanom')
const aishaCallsRow    = (snap.aggregates.owner?.calls       ?? []).find(r => r.label === 'Aisha Khanom')
console.log('\n── Aisha Khanom call metrics (reconciliation check) ─────────────────────')
if (!aishaDialsRow) {
  console.log('  (Aisha Khanom not found in calls cube — check config.excludeOwnerIds)')
} else {
  console.log(`  calls (alias=dials):  ${aishaCallsRow?.value ?? 0}   (expect 395)`)
  console.log(`  dials:                ${aishaDialsRow.value}   (expect 395)`)
  console.log(`  connects:             ${aishaConnRow?.value ?? 0}  (expect 318)`)
  console.log(`  connectRate:          ${aishaRateRow?.value ?? 0}%  (expect ~81%)`)
  console.log(`\n  team dials:       ${snap.aggregates.team?.dials ?? 0}`)
  console.log(`  team connects:    ${snap.aggregates.team?.connects ?? 0}`)
  console.log(`  team connectRate: ${snap.aggregates.team?.connectRate ?? 0}%`)
}

// ── Ticker events ─────────────────────────────────────────────────────────────
console.log('\n── Ticker events ────────────────────────────────────────────────────────')
for (const e of snap.events) {
  const ago = Math.round((Date.now() - e.ts) / 60_000)
  console.log(`  ${e.text}  (${ago} min ago)`)
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n── Summary ──────────────────────────────────────────────────────────────')
console.log(`  generatedAt:     ${new Date(snap.generatedAt).toISOString()}`)
console.log(`  period:          ${snap.period}`)
console.log(`  team.revenue:    £${Math.round(snap.aggregates.team?.revenue ?? 0).toLocaleString('en-GB')}`)
console.log(`  team.activities: ${snap.aggregates.team?.activities ?? 0}`)
console.log(`  owners in cube (revenue): ${revRows.length}`)
console.log(`  owners in cube (activities): ${actRows.length}`)
console.log(`  ticker events:   ${snap.events.length}`)
console.log(`  trend present:   ${snap.trend !== undefined}`)
console.log(`\n  ⏱  ${elapsed}s elapsed — ${calls} HubSpot API calls total`)
