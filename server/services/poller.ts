import type { Credentials } from '../utils/credentials'
import { searchAll, searchFirst, getOwners, getDealStages, type DealStage, type OwnerData } from '../utils/hubspot'
import type { Screen, Snapshot, Aggregates, PeriodSlice, Row, Metric } from '~~/types/widgets'

// ── Context (A3: buildSnapshot reads NO globals, NO env vars) ───────────────

export interface PollerConfig {
  period: string          // global default — used for compat + new-dashboard fallback
  timezone: string
  primaryBoard: string
  activityObjects: string[]
  callDispositions: {
    connectDispositions: string[]
    labels: Record<string, string>
  }
  closedWonStage: string
  teamFilter: {
    mode: 'allowlist' | 'blocklist' | 'off'
    teamIds: string[]
    includeTeamless: boolean
  }
  excludeOwnerIds: string[]
}

export interface PollerContext {
  config:       PollerConfig
  screen:       Screen          // union demand across all dashboards
  periods:      ReadonlySet<string>  // distinct periods in use — drives fetch loop
  credentials:  Credentials
  periodBounds: (period: string, tz: string) => { gte: number; lte: number }
}

// ── Per-ctx cache ────────────────────────────────────────────────────────────

interface CtxCache {
  owners:          { data: OwnerData; ts: number } | null
  stages:          { data: DealStage[]; ts: number } | null
  invocationCount: number
  // Per-period prev aggregates — keyed by period string.
  // Refreshed on invocations 1, 6, 11, … (every 5th) for all active periods.
  prevByPeriod:    Map<string, Aggregates>
}

const ctxCaches = new WeakMap<object, CtxCache>()

function getCache(ctx: PollerContext): CtxCache {
  let c = ctxCaches.get(ctx)
  if (!c) {
    c = { owners: null, stages: null, invocationCount: 0, prevByPeriod: new Map() }
    ctxCaches.set(ctx, c)
  }
  return c
}

// ── Reference data (1-hour cache, ctx-keyed) ─────────────────────────────────

const CACHE_TTL_MS = 60 * 60_000

async function cachedOwners(ctx: PollerContext): Promise<OwnerData> {
  const c = getCache(ctx)
  if (!c.owners || Date.now() - c.owners.ts > CACHE_TTL_MS) {
    c.owners = { data: await getOwners(ctx.credentials), ts: Date.now() }
  }
  return c.owners.data
}

// ── Team filter ───────────────────────────────────────────────────────────────

export function applyTeamFilter(
  { names, teamIds }: OwnerData,
  config: PollerConfig,
): Map<string, string> {
  const { mode, teamIds: allowed, includeTeamless } = config.teamFilter
  const allowedSet = new Set(allowed)
  const out = new Map<string, string>()

  for (const [oid, name] of names) {
    if (config.excludeOwnerIds.includes(oid)) continue

    if (mode === 'off') { out.set(oid, name); continue }

    const ownerTeams = teamIds.get(oid) ?? []
    if (ownerTeams.length === 0) {
      if (includeTeamless) out.set(oid, name)
      continue
    }

    const inAllowed = ownerTeams.some(tid => allowedSet.has(tid))
    if (mode === 'allowlist' && inAllowed)  out.set(oid, name)
    if (mode === 'blocklist' && !inAllowed) out.set(oid, name)
  }

  return out
}

async function cachedStages(ctx: PollerContext): Promise<DealStage[]> {
  const c = getCache(ctx)
  if (!c.stages || Date.now() - c.stages.ts > CACHE_TTL_MS) {
    c.stages = { data: await getDealStages(ctx.credentials), ts: Date.now() }
  }
  return c.stages.data
}

// ── Needs flags (demand-driven: derive from union screen) ─────────────────────

interface NeedsFlags {
  revenue:    boolean
  pipeline:   boolean
  deals:      boolean
  activities: boolean
  calls:      boolean
  linkedin:   boolean
  ticker:     boolean
  ownerDim:   boolean
  stageDim:   boolean
}

const ACTIVITY_METRICS = new Set<Metric>(['activities', 'emails', 'meetings', 'tasks', 'notes'])
const CALL_METRICS     = new Set<Metric>(['calls', 'dials', 'connects', 'connectRate', 'callsByResult'])

function deriveNeeds(screen: Screen): NeedsFlags {
  const all = [...screen.widgets, ...screen.bench]
  const m = (metric: Metric) => all.some(w => w.metric === metric)
  const activities = all.some(w => w.metric && ACTIVITY_METRICS.has(w.metric as Metric))
  const calls      = all.some(w => w.metric && CALL_METRICS.has(w.metric as Metric))
  return {
    revenue:    m('revenue'),
    pipeline:   m('pipeline'),
    deals:      m('deals'),
    activities,
    calls,
    linkedin:   m('linkedin') || activities,
    ticker:     all.some(w => w.type === 'ticker'),
    ownerDim:   all.some(w => w.dimension === 'owner'),
    stageDim:   all.some(w => w.dimension === 'dealstage'),
  }
}

// ── Row builders ─────────────────────────────────────────────────────────────

function toOwnerRows(valueMap: Map<string, number>, owners: Map<string, string>): Row[] {
  const rows: Row[] = []
  for (const [key, value] of valueMap) {
    const label = owners.get(key)
    if (!label) continue
    rows.push({ key, label, value })
  }
  return rows.sort((a, b) => b.value - a.value)
}

function toStageRows(valueMap: Map<string, number>, stages: DealStage[]): Row[] {
  const labelMap = new Map(stages.map(s => [s.stageId, s.stageLabel]))
  const rows: Row[] = []
  for (const [key, value] of valueMap) {
    rows.push({ key, label: labelMap.get(key) ?? key, value })
  }
  return rows.sort((a, b) => b.value - a.value)
}

// ── Aggregate computation for a given time window ────────────────────────────

type ActivityKey = 'calls' | 'emails' | 'meetings' | 'tasks' | 'notes'
const ACTIVITY_OBJECTS: ActivityKey[] = ['calls', 'emails', 'meetings', 'tasks', 'notes']

type OwnerDispositions = Map<string, number>

async function fetchAggregates(
  bounds: { gte: number; lte: number },
  needs: NeedsFlags,
  owners: Map<string, string>,
  stages: DealStage[],
  config: PollerConfig,
  creds: Credentials,
): Promise<Aggregates> {
  const ownerRevenue      = new Map<string, number>()
  const ownerDeals        = new Map<string, number>()
  const stageRevenue      = new Map<string, number>()
  const stageDeals        = new Map<string, number>()
  const ownerPipeline     = new Map<string, number>()
  const stagePipeline     = new Map<string, number>()
  const ownerCounts       = new Map<string, Record<ActivityKey, number>>()
  const ownerDispositions = new Map<string, OwnerDispositions>()
  let   callsByResultRows: Array<{ key: string; label: string; count: number }> = []
  const dialsMap    = new Map<string, number>()
  const connectsMap = new Map<string, number>()
  const rateMap     = new Map<string, number>()
  const linkedinMap = new Map<string, number>()
  const whatsappMap = new Map<string, number>()
  const smsMap      = new Map<string, number>()
  const actMap      = new Map<string, number>()

  // ── Closed-won deals ───────────────────────────────────────────────────────
  if (needs.revenue || needs.deals) {
    const deals = await searchAll('deals', {
      filterGroups: [{ filters: [
        { propertyName: 'dealstage', operator: 'EQ',  value: config.closedWonStage },
        { propertyName: 'closedate', operator: 'GTE', value: bounds.gte },
        { propertyName: 'closedate', operator: 'LTE', value: bounds.lte },
      ]}],
      properties: ['amount', 'hs_amount_in_home_currency', 'hubspot_owner_id', 'closedate', 'dealstage', 'dealname'],
    }, creds)

    if (deals.length > 9_500)
      console.warn(`[poller] ⚠️  WARN: closed-won search returned ${deals.length} deals (>9500). Results may be capped.`)

    for (const d of deals) {
      const oid = String(d.properties.hubspot_owner_id ?? '')
      if (!oid || config.excludeOwnerIds.includes(oid)) continue
      const sid    = String(d.properties.dealstage ?? '')
      const amount = Number(d.properties.hs_amount_in_home_currency ?? d.properties.amount ?? 0)
      if (needs.revenue) {
        ownerRevenue.set(oid, (ownerRevenue.get(oid) ?? 0) + amount)
        stageRevenue.set(sid, (stageRevenue.get(sid) ?? 0) + amount)
      }
      if (needs.deals) {
        ownerDeals.set(oid, (ownerDeals.get(oid) ?? 0) + 1)
        stageDeals.set(sid, (stageDeals.get(sid) ?? 0) + 1)
      }
    }
  }

  // ── Open pipeline ──────────────────────────────────────────────────────────
  if (needs.pipeline) {
    const pDeals = await searchAll('deals', {
      filterGroups: [{ filters: [
        { propertyName: 'hs_is_closed', operator: 'EQ', value: 'false' },
      ]}],
      properties: ['amount', 'hs_amount_in_home_currency', 'hubspot_owner_id', 'dealstage'],
    }, creds)

    for (const d of pDeals) {
      const oid = String(d.properties.hubspot_owner_id ?? '')
      if (!oid || config.excludeOwnerIds.includes(oid)) continue
      const sid    = String(d.properties.dealstage ?? '')
      const amount = Number(d.properties.hs_amount_in_home_currency ?? d.properties.amount ?? 0)
      ownerPipeline.set(oid, (ownerPipeline.get(oid) ?? 0) + amount)
      stagePipeline.set(sid, (stagePipeline.get(sid) ?? 0) + amount)
    }
  }

  // ── Non-call activity counts ───────────────────────────────────────────────
  // Discovery (2026-06): emails filter to outbound only (hs_email_direction='EMAIL').
  if (needs.activities) {
    const activeObjects = ACTIVITY_OBJECTS.filter(obj => obj !== 'calls' && config.activityObjects.includes(obj))
    for (const obj of activeObjects) {
      const dirFilter = obj === 'emails'
        ? [{ propertyName: 'hs_email_direction', operator: 'EQ', value: 'EMAIL' }]
        : []
      const records = await searchAll(obj, {
        filterGroups: [{ filters: [
          { propertyName: 'hs_timestamp', operator: 'GTE', value: bounds.gte },
          { propertyName: 'hs_timestamp', operator: 'LTE', value: bounds.lte },
          ...dirFilter,
        ]}],
        properties: ['hubspot_owner_id', 'hs_timestamp'],
      }, creds)

      if (records.length >= 9_500)
        console.warn(`[poller] ⚠️  ${obj}: ${records.length} records in window — volume approaching 10k cap.`)

      for (const r of records) {
        const oid = String(r.properties.hubspot_owner_id ?? '')
        if (!oid || config.excludeOwnerIds.includes(oid)) continue
        if (!ownerCounts.has(oid)) {
          ownerCounts.set(oid, { calls: 0, emails: 0, meetings: 0, tasks: 0, notes: 0 })
        }
        ownerCounts.get(oid)![obj]++
      }
    }
  }

  // ── Calls (disposition-based — status=COMPLETED overcounts 7x) ─────────────
  if (needs.calls) {
    if (config.activityObjects.includes('calls')) {
      const records = await searchAll('calls', {
        filterGroups: [{ filters: [
          { propertyName: 'hs_timestamp', operator: 'GTE', value: bounds.gte },
          { propertyName: 'hs_timestamp', operator: 'LTE', value: bounds.lte },
        ]}],
        properties: ['hubspot_owner_id', 'hs_timestamp', 'hs_call_disposition'],
      }, creds)

      if (records.length >= 9_500)
        console.warn(`[poller] ⚠️  calls: ${records.length} records in window — approaching 10k cap.`)

      for (const r of records) {
        const oid = String(r.properties.hubspot_owner_id ?? '')
        if (!oid || config.excludeOwnerIds.includes(oid)) continue
        if (!ownerCounts.has(oid)) {
          ownerCounts.set(oid, { calls: 0, emails: 0, meetings: 0, tasks: 0, notes: 0 })
        }
        ownerCounts.get(oid)!.calls++

        const disp = String(r.properties.hs_call_disposition ?? '').trim()
        if (!ownerDispositions.has(oid)) ownerDispositions.set(oid, new Map())
        if (disp) {
          const dm = ownerDispositions.get(oid)!
          dm.set(disp, (dm.get(disp) ?? 0) + 1)
        }
      }

      const connectSet = new Set(config.callDispositions.connectDispositions)
      for (const [oid] of ownerCounts) {
        const dials = ownerCounts.get(oid)?.calls ?? 0
        if (!dials) continue
        const dm = ownerDispositions.get(oid) ?? new Map<string, number>()
        let connects = 0
        for (const guid of connectSet) connects += dm.get(guid) ?? 0
        const rate = dials > 0 ? Math.round((connects / dials) * 1000) / 10 : 0
        dialsMap.set(oid, dials)
        connectsMap.set(oid, connects)
        rateMap.set(oid, rate)
      }

      const teamDispositions = new Map<string, number>()
      for (const [oid, dm] of ownerDispositions) {
        if (!owners.has(oid)) continue
        for (const [guid, count] of dm) {
          teamDispositions.set(guid, (teamDispositions.get(guid) ?? 0) + count)
        }
      }
      callsByResultRows = [...teamDispositions.entries()]
        .map(([key, count]) => ({
          key,
          label: config.callDispositions.labels[key] ?? key,
          count,
        }))
        .sort((a, b) => b.count - a.count)
    }
  }

  // ── Communications (LinkedIn / WhatsApp / SMS) ─────────────────────────────
  if (needs.linkedin) {
    const comms = await searchAll('communications', {
      filterGroups: [{ filters: [
        { propertyName: 'hs_timestamp', operator: 'GTE', value: bounds.gte },
        { propertyName: 'hs_timestamp', operator: 'LTE', value: bounds.lte },
      ]}],
      properties: ['hubspot_owner_id', 'hs_timestamp', 'hs_communication_channel_type'],
    }, creds)

    if (comms.length >= 9_500)
      console.warn(`[poller] ⚠️  communications: ${comms.length} records — approaching 10k cap.`)

    for (const r of comms) {
      const oid = String(r.properties.hubspot_owner_id ?? '')
      if (!oid || config.excludeOwnerIds.includes(oid)) continue
      const channel = String(r.properties.hs_communication_channel_type ?? '').toUpperCase()
      if (channel === 'LINKEDIN_MESSAGE') {
        linkedinMap.set(oid, (linkedinMap.get(oid) ?? 0) + 1)
      } else if (channel === 'WHATS_APP') {
        whatsappMap.set(oid, (whatsappMap.get(oid) ?? 0) + 1)
      } else if (channel === 'SMS') {
        smsMap.set(oid, (smsMap.get(oid) ?? 0) + 1)
      }
    }

    console.log('[poller] linkedin per owner:')
    for (const [oid, li] of linkedinMap) {
      const name = owners.get(oid) ?? oid
      console.log(`  ${name}: linkedin=${li}, whatsapp=${whatsappMap.get(oid) ?? 0}, sms=${smsMap.get(oid) ?? 0}`)
    }
  }

  // ── Assemble aggregates cube ───────────────────────────────────────────────
  const agg: Aggregates = {}

  if (needs.ownerDim) {
    agg.owner = {}
    if (needs.revenue)  agg.owner.revenue  = toOwnerRows(ownerRevenue, owners)
    if (needs.deals)    agg.owner.deals    = toOwnerRows(ownerDeals, owners)
    if (needs.pipeline) agg.owner.pipeline = toOwnerRows(ownerPipeline, owners)

    if (needs.activities) {
      for (const obj of ACTIVITY_OBJECTS) {
        if (obj === 'calls') continue
        if (!config.activityObjects.includes(obj)) continue
        const m = new Map<string, number>()
        for (const [oid, c] of ownerCounts) m.set(oid, c[obj])
        agg.owner[obj as Metric] = toOwnerRows(m, owners)
      }

      // activities = emails + meetings + linkedin (all weight 1)
      for (const oid of owners.keys()) {
        const c        = ownerCounts.get(oid)
        const emails   = c?.emails   ?? 0
        const meetings = c?.meetings ?? 0
        const linkedin = linkedinMap.get(oid) ?? 0
        const total    = emails + meetings + linkedin
        if (total > 0) actMap.set(oid, total)
      }
      agg.owner.activities = toOwnerRows(actMap, owners)
    }

    if (needs.calls) {
      if (config.activityObjects.includes('calls')) {
        const m = new Map<string, number>()
        for (const [oid, c] of ownerCounts) m.set(oid, c.calls)
        agg.owner.calls = toOwnerRows(m, owners)
      }
      if (dialsMap.size > 0) {
        agg.owner.dials       = toOwnerRows(dialsMap, owners)
        agg.owner.connects    = toOwnerRows(connectsMap, owners)
        agg.owner.connectRate = toOwnerRows(rateMap, owners)
      }
    }

    if (needs.linkedin) {
      agg.owner.linkedin = toOwnerRows(linkedinMap, owners)
    }
  }

  if (needs.stageDim) {
    agg.dealstage = {}
    if (needs.revenue)  agg.dealstage.revenue  = toStageRows(stageRevenue, stages)
    if (needs.deals)    agg.dealstage.deals    = toStageRows(stageDeals, stages)
    if (needs.pipeline) agg.dealstage.pipeline = toStageRows(stagePipeline, stages)
  }

  agg.team = {}
  if (needs.revenue)    agg.team.revenue    = [...ownerRevenue.values()].reduce((s, v) => s + v, 0)
  if (needs.deals)      agg.team.deals      = [...ownerDeals.values()].reduce((s, v) => s + v, 0)
  if (needs.pipeline)   agg.team.pipeline   = [...ownerPipeline.values()].reduce((s, v) => s + v, 0)
  if (needs.linkedin)   agg.team.linkedin   = [...linkedinMap.values()].reduce((s, v) => s + v, 0)
  if (needs.activities) {
    agg.team.activities = [...actMap.values()].reduce((s, v) => s + v, 0)
  }
  if (needs.calls && dialsMap.size > 0) {
    const teamDials    = [...dialsMap.values()].reduce((s, v) => s + v, 0)
    const teamConnects = [...connectsMap.values()].reduce((s, v) => s + v, 0)
    agg.team.dials       = teamDials
    agg.team.connects    = teamConnects
    agg.team.connectRate = teamDials > 0 ? Math.round((teamConnects / teamDials) * 1000) / 10 : 0
  }
  if (needs.calls && callsByResultRows.length > 0) {
    agg.callsByResult = callsByResultRows
  }

  return agg
}

// ── Previous-period bounds (like-for-like elapsed time, not full prior period) ──

function tzMidnightMs(year: number, month: number, day: number, tz: string): number {
  const noonUTC = Date.UTC(year, month - 1, day, 12, 0, 0)
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
  const p = Object.fromEntries(fmt.formatToParts(new Date(noonUTC)).map(x => [x.type, x.value]))
  const localMs = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    Number(p.hour), Number(p.minute), Number(p.second),
  )
  return Date.UTC(year, month - 1, day, 0, 0, 0) - (localMs - noonUTC)
}

function getPrevBounds(
  period: string,
  tz: string,
  current: { gte: number; lte: number },
): { gte: number; lte: number } {
  const elapsed = current.lte - current.gte

  if (period === 'today') {
    // Previous calendar day, same elapsed fraction from local midnight.
    // Using 86_400_000ms offset (same approach as 'week'); ±1h DST delta on
    // the 2 DST-switch days per year is acceptable for a "yesterday" comparison.
    return { gte: current.gte - 86_400_000, lte: current.lte - 86_400_000 }
  }

  if (period === 'week') {
    return { gte: current.gte - 7 * 86_400_000, lte: current.gte - 7 * 86_400_000 + elapsed }
  }

  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour12: false,
  })
  const parts = Object.fromEntries(fmt.formatToParts(new Date(current.gte)).map(p => [p.type, p.value]))
  const year = Number(parts.year), month = Number(parts.month)

  if (period === 'month') {
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear  = month === 1 ? year - 1 : year
    const prevGte   = tzMidnightMs(prevYear, prevMonth, 1, tz)
    return { gte: prevGte, lte: prevGte + elapsed }
  }

  if (period === 'quarter') {
    const qStart   = Math.floor((month - 1) / 3) * 3 + 1
    let prevQStart = qStart - 3
    const prevYear = prevQStart < 1 ? year - 1 : year
    if (prevQStart < 1) prevQStart += 12
    const prevGte  = tzMidnightMs(prevYear, prevQStart, 1, tz)
    return { gte: prevGte, lte: prevGte + elapsed }
  }

  // Fallback
  return { gte: current.gte - elapsed, lte: current.gte }
}

// ── Ticker events ─────────────────────────────────────────────────────────────

function fmtGBP(n: number): string {
  return '£' + Math.round(n).toLocaleString('en-GB')
}

async function fetchTickerEvents(
  owners: Map<string, string>,
  config: PollerConfig,
  creds: Credentials,
): Promise<Snapshot['events']> {
  const deals = await searchFirst('deals', {
    filterGroups: [{ filters: [
      { propertyName: 'dealstage', operator: 'EQ', value: config.closedWonStage },
    ]}],
    sorts: [{ propertyName: 'closedate', direction: 'DESCENDING' }],
    properties: ['amount', 'hs_amount_in_home_currency', 'hubspot_owner_id', 'closedate', 'dealname'],
  }, creds, 20)

  return deals
    .filter(d => owners.has(String(d.properties.hubspot_owner_id ?? '')))
    .slice(0, 10)
    .map(d => {
      const oid    = String(d.properties.hubspot_owner_id ?? '')
      const name   = owners.get(oid) ?? 'Unknown'
      const deal   = String(d.properties.dealname ?? 'a deal')
      const amount = Number(d.properties.hs_amount_in_home_currency ?? d.properties.amount ?? 0)
      const ts     = new Date(d.properties.closedate ?? 0).getTime()
      return { ts, kind: 'deal' as const, text: `${name} closed ${deal} — ${fmtGBP(amount)}` }
    })
}

// ── Main export ───────────────────────────────────────────────────────────────
// Fetches data for every distinct period in ctx.periods — one fetchAggregates
// call per period (deduped: three 'month' dashboards → one fetch).
//
// API call count per tick for N distinct periods and M metric groups:
//   current:  N × M  (e.g. today + month = 2 × M)
//   prev:     N × M  (every 5th invocation only)
//   total:    up to 2N × M  — with dedup, same as a single period if all periods match.

export async function buildSnapshot(ctx: PollerContext): Promise<Snapshot> {
  const { config, screen, periods, credentials: creds, periodBounds: pbFn } = ctx
  const cache = getCache(ctx)
  cache.invocationCount++

  const [ownerData, stages] = await Promise.all([cachedOwners(ctx), cachedStages(ctx)])
  const owners = applyTeamFilter(ownerData, config)
  const needs  = deriveNeeds(screen)

  // First-invocation roster log
  if (cache.invocationCount === 1) {
    console.log(`[poller] team filter mode=${config.teamFilter.mode} teamIds=[${config.teamFilter.teamIds.join(',')}]`)
    console.log(`[poller] included owners (${owners.size}):`)
    for (const [oid, name] of owners) {
      const teams = (ownerData.teamIds.get(oid) ?? []).join(',') || 'none'
      console.log(`  ${name.padEnd(30)} oid=${oid}  teams=[${teams}]`)
    }
    console.log(`[poller] distinct periods in use: [${[...periods].join(', ')}]`)
  }

  // ── Fetch once per distinct period (dedup) ────────────────────────────────
  const shouldFetchPrev = cache.invocationCount % 5 === 1
  const byPeriod: Record<string, PeriodSlice> = {}

  for (const period of periods) {
    const bounds = pbFn(period, config.timezone)
    const agg    = await fetchAggregates(bounds, needs, owners, stages, config, creds)

    let trend: Aggregates | undefined
    if (shouldFetchPrev) {
      const prevBounds = getPrevBounds(period, config.timezone, bounds)
      trend = await fetchAggregates(prevBounds, needs, owners, stages, config, creds)
      cache.prevByPeriod.set(period, trend)
      console.log(`[poller] prev-period [${period}] refreshed (invocation ${cache.invocationCount})`)
    } else {
      trend = cache.prevByPeriod.get(period)
    }

    byPeriod[period] = { aggregates: agg, trend }
  }

  // Verify call metrics on first invocation (primary period only)
  if (cache.invocationCount === 1 && needs.calls) {
    const primaryPeriod = config.period
    const primaryAgg = (byPeriod[primaryPeriod] ?? Object.values(byPeriod)[0])?.aggregates ?? {}
    const td = primaryAgg.team?.dials    ?? 0
    const tc = primaryAgg.team?.connects ?? 0
    const tr = primaryAgg.team?.connectRate ?? 0
    console.log(`[poller] ── call metrics [${primaryPeriod}] (disposition-based) ──`)
    console.log(`[poller] team: dials=${td}  connects=${tc}  connectRate=${tr}%`)
    const top3 = [...(primaryAgg.owner?.connects ?? [])].sort((a, b) => b.value - a.value).slice(0, 3)
    if (top3.length) {
      console.log('[poller] top-3 by connects:')
      for (const r of top3) {
        const dials = primaryAgg.owner?.dials?.find(d => d.key === r.key)?.value ?? 0
        const rate  = primaryAgg.owner?.connectRate?.find(d => d.key === r.key)?.value ?? 0
        console.log(`  ${r.label.padEnd(30)} dials=${dials}  connects=${r.value}  rate=${rate}%`)
      }
    }
    if (primaryAgg.callsByResult?.length) {
      console.log('[poller] callsByResult:')
      for (const d of primaryAgg.callsByResult) console.log(`  ${d.label.padEnd(24)} ${d.count}`)
    }
  }

  // Ticker events (period-independent — recent wins, not time-windowed)
  const events = needs.ticker
    ? await fetchTickerEvents(owners, config, creds)
    : []

  // ── Top-level compat fields — populated from the global config period ──────
  // Widgets built before Step B read snap.aggregates/snap.trend/snap.period.
  // After Step B they read snap.byPeriod[dashboard.period] directly.
  // Use the global default period if it's in byPeriod; otherwise fall back to
  // the first fetched period so the compat fields are never empty.
  const compatPeriod  = periods.has(config.period) ? config.period : [...periods][0] ?? config.period
  const compatSlice   = byPeriod[compatPeriod] ?? { aggregates: {} }

  return {
    generatedAt: Date.now(),
    period:      compatPeriod,
    aggregates:  compatSlice.aggregates,
    trend:       compatSlice.trend,
    byPeriod,
    events,
  }
}
