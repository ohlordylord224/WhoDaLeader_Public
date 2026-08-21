// Diagnostic: reconcile Aisha Khanom's activity counts vs HubSpot UI report.
// No side-effects, no poller changes. Run with:
//   npx tsx --tsconfig .nuxt/tsconfig.server.json scripts/diag-aisha.ts
import 'dotenv/config'
import { credentials } from '../server/utils/credentials'
import { periodBounds } from '../server/utils/period'
import { getOwners } from '../server/utils/hubspot'

const TZ     = 'Europe/London'
const PERIOD = 'month'

// ── Re-implement a raw hsFetch so we can see the 'total' field directly ──────

const BASE          = 'https://api.hubapi.com'
const MIN_SPACING   = 350
let lastCall        = 0

async function spaced() {
  const wait = Math.max(0, lastCall + MIN_SPACING - Date.now())
  if (wait) await new Promise(r => setTimeout(r, wait))
  lastCall = Date.now()
}

async function rawFetch(path: string, body?: object): Promise<any> {
  await spaced()
  const token = await credentials.getHubspotToken()
  const res = await fetch(`${BASE}${path}`, {
    method:  body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`)
  return res.json()
}

async function searchPage(object: string, body: object): Promise<any> {
  return rawFetch(`/crm/v3/objects/${object}/search`, body)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isoInLondon(ms: number | null | undefined): string {
  if (!ms || isNaN(ms)) return '(no timestamp)'
  try {
    return new Intl.DateTimeFormat('sv-SE', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(new Date(ms)).replace(' ', 'T') + ' London'
  } catch { return `(invalid: ${ms})` }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const bounds = periodBounds(PERIOD, TZ)
console.log('\n── Period bounds ────────────────────────────────────────────────────────')
console.log(`  gte: ${bounds.gte}  →  ${isoInLondon(bounds.gte)}`)
console.log(`  lte: ${bounds.lte}  →  ${isoInLondon(bounds.lte)}`)

// Resolve Aisha's owner ID
const owners = await getOwners(credentials)
const [aishaId] = [...owners.entries()].find(([, name]) => name === 'Aisha Khanom') ?? []
if (!aishaId) { console.error('Owner "Aisha Khanom" not found'); process.exit(1) }
console.log(`\n  Aisha Khanom owner ID: ${aishaId}`)

const ownerFilter = { propertyName: 'hubspot_owner_id', operator: 'EQ', value: aishaId }
const gteFilter   = { propertyName: 'hs_timestamp', operator: 'GTE', value: bounds.gte }
const lteFilter   = { propertyName: 'hs_timestamp', operator: 'LTE', value: bounds.lte }
const filters     = [ownerFilter, gteFilter, lteFilter]

// ── Per-object counts ─────────────────────────────────────────────────────────
console.log('\n── Per-object counts (total from API, then actual paginated records) ────')

const OBJECTS = ['calls', 'emails', 'meetings', 'tasks', 'notes'] as const

for (const obj of OBJECTS) {
  // First: get the API-reported total (limit 1)
  const p1 = await searchPage(obj, {
    filterGroups: [{ filters }],
    properties: ['hubspot_owner_id', 'hs_timestamp'],
    limit: 1,
  })
  const apiTotal = p1.total ?? '?'

  // Second: paginate fully and count actual records
  let actualCount = 0
  let after: string | undefined = undefined
  let pages = 0
  do {
    const page = await searchPage(obj, {
      filterGroups: [{ filters }],
      properties: ['hubspot_owner_id', 'hs_timestamp'],
      limit: 100,
      after,
    })
    actualCount += (page.results ?? []).length
    after = page.paging?.next?.after
    pages++
  } while (after)

  const dedup = apiTotal !== actualCount ? ` ⚠️  mismatch (total=${apiTotal})` : ''
  console.log(`  ${obj.padEnd(10)}  api.total=${String(apiTotal).padStart(4)}  paginated=${String(actualCount).padStart(4)}  pages=${pages}${dedup}`)
}

// ── Calls: first 20 records — inspect channel/type fields ─────────────────────
console.log('\n── Calls — first 20 records (looking for non-call channels) ─────────────')

const callProps = [
  'hs_timestamp',
  'hs_activity_type',
  'hs_call_title',
  'hs_call_direction',
  'hs_call_status',
  'hs_call_source',
  'hs_call_duration',
  'hs_communication_channel_type',   // present on comms objects
  'hs_engagement_source',
  'hs_call_body',
]

const callPage = await searchPage('calls', {
  filterGroups: [{ filters }],
  properties: callProps,
  sorts: [{ propertyName: 'hs_timestamp', direction: 'DESCENDING' }],
  limit: 20,
})

const callRecords = callPage.results ?? []
console.log(`  (showing ${callRecords.length} of ${callPage.total} calls)\n`)

for (const [i, r] of callRecords.entries()) {
  const p = r.properties
  const ts = isoInLondon(p.hs_timestamp ? Number(p.hs_timestamp) : null)
  console.log(`  [${String(i + 1).padStart(2)}] ${ts}`)
  console.log(`       activity_type:  ${p.hs_activity_type ?? '(none)'}`)
  console.log(`       title:          ${p.hs_call_title ?? '(none)'}`)
  console.log(`       direction:      ${p.hs_call_direction ?? '(none)'}`)
  console.log(`       status:         ${p.hs_call_status ?? '(none)'}`)
  console.log(`       source:         ${p.hs_call_source ?? '(none)'}`)
  console.log(`       duration(ms):   ${p.hs_call_duration ?? '(none)'}`)
  console.log(`       channel_type:   ${p.hs_communication_channel_type ?? '(none)'}`)
  console.log(`       engagement_src: ${p.hs_engagement_source ?? '(none)'}`)
  if (p.hs_call_body) console.log(`       body snippet:   ${String(p.hs_call_body).slice(0, 80)}`)
  console.log()
}

// ── Notes: all 10 — check for anything unexpected ─────────────────────────────
console.log('── Notes — all records ──────────────────────────────────────────────────')
const notesPage = await searchPage('notes', {
  filterGroups: [{ filters }],
  properties: ['hs_timestamp', 'hs_note_body', 'hs_activity_type', 'hs_engagement_source'],
  sorts: [{ propertyName: 'hs_timestamp', direction: 'DESCENDING' }],
  limit: 20,
})
console.log(`  api.total=${notesPage.total}`)
for (const r of notesPage.results ?? []) {
  const p = r.properties
  const ts = isoInLondon(p.hs_timestamp ? Number(p.hs_timestamp) : null)
  console.log(`  ${ts}  type=${p.hs_activity_type ?? '(none)'}  src=${p.hs_engagement_source ?? '(none)'}`)
  if (p.hs_note_body) console.log(`    body: ${String(p.hs_note_body).slice(0, 100)}`)
}
