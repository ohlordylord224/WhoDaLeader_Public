// Singleton roster composable — fetches /api/roster once per browser tab and
// shares the result across all components that call useRoster().
// Roster reference data (tracked owners + their teams) changes hourly at most.

export interface RosterTeam  { id: string; name: string }
export interface RosterOwner { id: string; name: string; teamIds: string[] }

const _teams   = shallowRef<RosterTeam[]>([])
const _owners  = shallowRef<RosterOwner[]>([])
let   _fetched = false

export function useRoster() {
  if (import.meta.client && !_fetched) {
    _fetched = true
    $fetch<{ teams: RosterTeam[]; owners: RosterOwner[] }>('/api/roster')
      .then(r => { _teams.value = r.teams; _owners.value = r.owners })
      .catch(e => console.warn('[useRoster] fetch failed', e))
  }

  // Map from ownerId → teamIds — rebuilt reactively when owners arrive.
  const ownerTeamIds = computed<Map<string, string[]>>(() => {
    const m = new Map<string, string[]>()
    for (const o of _owners.value) m.set(o.id, o.teamIds)
    return m
  })

  return {
    rosterTeams:  _teams  as Readonly<typeof _teams>,
    rosterOwners: _owners as Readonly<typeof _owners>,
    ownerTeamIds,
  }
}
