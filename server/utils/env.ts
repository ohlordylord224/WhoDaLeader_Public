// A4: sole reader of operational env vars that are neither credentials nor
// leaderboard config. Keep this minimal — add only vars that can't live in
// config/leaderboard.ts (machine-level) or credentials.ts (secrets).
export const env = {
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 60_000),

  // Persistent database path. MUST survive reboots on the Pi — use an absolute
  // path under /home/pi or another persistent location, NOT /tmp or .data (which
  // lives under the app directory and may be wiped on redeploy).
  // Default '.data/whodaleader.db' is fine for dev; production overrides via DB_PATH.
  dbPath: process.env.DB_PATH ?? '.data/whodaleader.db',

  // Network bind address. Default 0.0.0.0 makes the board reachable from any
  // device on the LAN — convenient for the settings panel or a second screen.
  // Set to 127.0.0.1 if the board should only be accessible from the Pi itself
  // (pure kiosk mode, figures not visible on the office network).
  // Passed to Nitro as NITRO_HOST at startup (see deploy/whodaleader.service).
  bindHost: process.env.BIND_HOST ?? '0.0.0.0',
}
