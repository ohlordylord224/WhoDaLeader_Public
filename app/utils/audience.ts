import type { Row, WidgetAudience } from '~~/types/widgets'

// Filter a sorted Row[] to the audience subset BEFORE ranking and limit.
// Returns the input unchanged when audience is unset (all-tracked behaviour).
export function filterByAudience(
  rows: Row[],
  audience: WidgetAudience | undefined,
  ownerTeamIds: Map<string, string[]>,
): Row[] {
  if (!audience) return rows
  if (audience.mode === 'owners') {
    const set = new Set(audience.ownerIds)
    return rows.filter(r => set.has(r.key))
  }
  // mode === 'team'
  const allowed = new Set(audience.teamIds)
  return rows.filter(r => (ownerTeamIds.get(r.key) ?? []).some(t => allowed.has(t)))
}
