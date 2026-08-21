// EXAMPLE CONFIG — copy to config/leaderboard.ts and fill in YOUR portal's values.
// The IDs below (team IDs, owner IDs, disposition GUIDs) are HubSpot
// PORTAL-SPECIFIC. The placeholders here will NOT work against your portal.

export const leaderboardConfig = {
  period: process.env.LEADERBOARD_PERIOD ?? 'month',
  timezone: process.env.ACCOUNT_TIMEZONE ?? 'Europe/London',
  primaryBoard: process.env.PRIMARY_BOARD ?? 'revenue',

  activityObjects: ['calls', 'emails', 'meetings', 'tasks', 'notes'] as string[],

  // Call metrics use hs_call_disposition (not status, which overcounts connects).
  // HOW TO FIND: GET /crm/v3/properties/calls/hs_call_disposition returns your
  // portal's disposition GUIDs + labels. The "Connected" GUID goes in connectDispositions.
  callDispositions: {
    connectDispositions: ['00000000-0000-0000-0000-000000000000'] as string[], // REPLACE
    labels: {
      '00000000-0000-0000-0000-000000000000': 'Connected', // REPLACE
    } as Record<string, string>,
  },

  closedWonStage: process.env.CLOSED_WON_STAGE ?? 'closedwon',

  // Team filter. mode: 'allowlist' | 'blocklist' | 'off'.
  // HOW TO FIND team IDs: GET /settings/v3/users/teams. Start with 'off' to see everyone.
  teamFilter: {
    mode: 'off' as 'allowlist' | 'blocklist' | 'off',
    teamIds: [] as string[], // e.g. ['YOUR_SALES_TEAM_ID']
    includeTeamless: false,
  },

  // System/bot accounts to hide (NOT real people — humans are governed by teamFilter).
  // HOW TO FIND: GET /crm/v3/owners lists every owner id + name + email.
  excludeOwnerIds: [] as string[],
}
