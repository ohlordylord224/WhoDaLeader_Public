import type { Credentials } from './credentials'

const BASE = 'https://api.hubapi.com'
const MIN_SPACING_MS = 350 // ~3 req/s, headroom under the 4/s search cap

let lastCall = 0
let _callCount = 0

export function resetCallCount(): void { _callCount = 0 }
export function getCallCount(): number  { return _callCount }

async function spaced(): Promise<void> {
  const wait = Math.max(0, lastCall + MIN_SPACING_MS - Date.now())
  if (wait) await new Promise(r => setTimeout(r, wait))
  lastCall = Date.now()
}

async function hsFetch(path: string, creds: Credentials, init: RequestInit = {}, attempt = 0): Promise<any> {
  await spaced()
  _callCount++
  const token = await creds.getHubspotToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 5) throw new Error(`HubSpot ${res.status} after ${attempt} retries`)
    const retryAfter = Number(res.headers.get('Retry-After'))
    const backoff = retryAfter ? retryAfter * 1000 : Math.min(2 ** attempt * 500, 8_000)
    await new Promise(r => setTimeout(r, backoff))
    return hsFetch(path, creds, init, attempt + 1)
  }

  if (!res.ok) throw new Error(`HubSpot ${res.status}: ${await res.text()}`)
  return res.json()
}

// Paginated search — collects all pages. Records must be needed; for counts use searchCount.
export async function searchAll(object: string, body: Record<string, any>, creds: Credentials): Promise<any[]> {
  const out: any[] = []
  let after: string | undefined
  do {
    const page = await hsFetch(`/crm/v3/objects/${object}/search`, creds, {
      method: 'POST',
      body: JSON.stringify({ ...body, limit: 100, after }),
    })
    out.push(...(page.results ?? []))
    after = page.paging?.next?.after
  } while (after)
  return out
}

// Returns the server-side total without fetching records — safe against the 10k cap.
export async function searchCount(object: string, body: Record<string, any>, creds: Credentials): Promise<number> {
  const page = await hsFetch(`/crm/v3/objects/${object}/search`, creds, {
    method: 'POST',
    body: JSON.stringify({ ...body, limit: 1 }),
  })
  return page.total ?? 0
}

// Single-page fetch with sort support — used for ticker (top-N sorted).
export async function searchFirst(
  object: string,
  body: Record<string, any>,
  creds: Credentials,
  limit = 10,
): Promise<any[]> {
  const page = await hsFetch(`/crm/v3/objects/${object}/search`, creds, {
    method: 'POST',
    body: JSON.stringify({ ...body, limit }),
  })
  return page.results ?? []
}

export type OwnerData = {
  names:     Map<string, string>       // ownerId → full name
  teamIds:   Map<string, string[]>     // ownerId → [teamId, ...]
  teamNames: Map<string, string>       // teamId  → team name
}

// Returns name map, team-membership map, and team-name map for all active owners.
export async function getOwners(creds: Credentials): Promise<OwnerData> {
  const names     = new Map<string, string>()
  const teamIds   = new Map<string, string[]>()
  const teamNames = new Map<string, string>()
  let after: string | undefined
  do {
    const qs = after ? `?after=${after}&limit=100` : '?limit=100'
    const page = await hsFetch(`/crm/v3/owners${qs}`, creds)
    for (const o of page.results ?? []) {
      if (o.archived) continue
      const oid = String(o.id)
      names.set(oid, [o.firstName, o.lastName].filter(Boolean).join(' ') || o.email)
      const ownerTeams = (o.teams ?? []) as Array<{ id: string | number; name?: string }>
      teamIds.set(oid, ownerTeams.map(t => String(t.id)))
      for (const t of ownerTeams) teamNames.set(String(t.id), t.name ?? String(t.id))
    }
    after = page.paging?.next?.after
  } while (after)
  return { names, teamIds, teamNames }
}

export type DealStage = { pipelineId: string; pipelineLabel: string; stageId: string; stageLabel: string }

// Returns every stage across all deal pipelines.
export async function getDealStages(creds: Credentials): Promise<DealStage[]> {
  const res = await hsFetch('/crm/v3/pipelines/deals', creds)
  const stages: DealStage[] = []
  for (const pipeline of res.results ?? []) {
    for (const stage of pipeline.stages ?? []) {
      stages.push({
        pipelineId:    pipeline.id,
        pipelineLabel: pipeline.label,
        stageId:       stage.id,
        stageLabel:    stage.label,
      })
    }
  }
  return stages
}
