// GET /api/roster — returns the globally-tracked owners (post teamFilter) and
// the HubSpot teams they belong to. Used by the widget audience popover.
// In-process 1h cache; roster reference data changes at most hourly.

import { getOwners }                        from '../../utils/hubspot'
import { applyTeamFilter }                  from '../../services/poller'
import { credentials }                      from '../../utils/credentials'
import { leaderboardConfig }                from '~~/config/leaderboard'

export interface RosterTeam  { id: string; name: string }
export interface RosterOwner { id: string; name: string; teamIds: string[] }
export interface RosterResponse { teams: RosterTeam[]; owners: RosterOwner[] }

const TTL_MS = 60 * 60_000  // 1 hour

let _cache: { data: RosterResponse; ts: number } | null = null

export default defineEventHandler(async (): Promise<RosterResponse> => {
  if (_cache && Date.now() - _cache.ts < TTL_MS) return _cache.data

  const ownerData = await getOwners(credentials)
  const tracked   = applyTeamFilter(ownerData, leaderboardConfig)

  const seenTeams = new Set<string>()
  const owners: RosterOwner[] = []

  for (const [id, name] of tracked) {
    const tids = ownerData.teamIds.get(id) ?? []
    owners.push({ id, name, teamIds: tids })
    for (const tid of tids) seenTeams.add(tid)
  }

  owners.sort((a, b) => a.name.localeCompare(b.name))

  const teams: RosterTeam[] = [...seenTeams]
    .map(id => ({ id, name: ownerData.teamNames.get(id) ?? id }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const data: RosterResponse = { teams, owners }
  _cache = { data, ts: Date.now() }
  return data
})
