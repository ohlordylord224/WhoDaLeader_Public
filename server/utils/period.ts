// Returns { gte, lte } as epoch-ms for 'today' | 'week' | 'month' | 'quarter' in the given IANA tz.
// Week starts Monday. lte = Date.now().
export function periodBounds(period: string, tz: string): { gte: number; lte: number } {
  const now = new Date()
  const lte = now.getTime()

  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false,
  })

  const parts = Object.fromEntries(fmt.formatToParts(now).map(p => [p.type, p.value]))
  const year  = Number(parts.year)
  const month = Number(parts.month) // 1-based
  const day   = Number(parts.day)

  if (period === 'today') {
    // Local-day midnight → now in the account timezone.
    return { gte: getUTCForTZMidnight(year, month, day, tz), lte }
  }

  if (period === 'week') {
    const todayMidnightMs = getUTCForTZMidnight(year, month, day, tz)
    const dowFmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' })
    const dowStr = dowFmt.format(new Date(todayMidnightMs))
    const dowMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    const dow = dowMap[dowStr] ?? 0
    const daysSinceMon = (dow + 6) % 7 // ISO: Mon=day 0, Sun=day 6
    return { gte: todayMidnightMs - daysSinceMon * 86_400_000, lte }
  }

  if (period === 'month') {
    return { gte: getUTCForTZMidnight(year, month, 1, tz), lte }
  }

  if (period === 'quarter') {
    const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1 // 1, 4, 7, or 10
    return { gte: getUTCForTZMidnight(year, quarterStartMonth, 1, tz), lte }
  }

  // Fallback: current month
  return { gte: getUTCForTZMidnight(year, month, 1, tz), lte }
}

// Returns the UTC epoch-ms that corresponds to 00:00:00 on year/month/day in tz.
function getUTCForTZMidnight(year: number, month: number, day: number, tz: string): number {
  // Use noon UTC to safely measure the tz offset (avoids DST edge at midnight).
  const noonUTC = Date.UTC(year, month - 1, day, 12, 0, 0)
  const offsetMs = getTZOffsetMs(noonUTC, tz)
  return Date.UTC(year, month - 1, day, 0, 0, 0) - offsetMs
}

// Returns (tz local time - UTC) in ms for the given UTC timestamp.
// E.g. UTC+1 → +3_600_000.
function getTZOffsetMs(utcMs: number, tz: string): number {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
  const p = Object.fromEntries(fmt.formatToParts(new Date(utcMs)).map(p => [p.type, p.value]))
  const localMs = Date.UTC(
    Number(p.year), Number(p.month) - 1, Number(p.day),
    Number(p.hour), Number(p.minute), Number(p.second),
  )
  return localMs - utcMs
}
