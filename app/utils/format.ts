import type { Metric } from '~~/types/widgets'

export type DeltaResult = { pct: number; capped: boolean }

const REVENUE_FLOOR = 5_000
const COUNT_FLOOR   = 5

function isCountMetric(m: Metric): boolean {
  return m !== 'revenue' && m !== 'pipeline' && m !== 'connectRate'
}

/**
 * Compute a displayable delta between current and prior values for a given metric.
 * Returns null when the delta should be hidden:
 *   - prior is zero (no meaningful base)
 *   - revenue/pipeline prior < £5k (noise from tiny base deals)
 *   - count metrics prior < 5 (noise from very low prior-period counts)
 * Caps at ±999 % and sets capped=true to show ">999%" rather than overflowing the cell.
 */
export function deltaDisplay(current: number, prior: number, metric: Metric): DeltaResult | null {
  if (!prior) return null
  if ((metric === 'revenue' || metric === 'pipeline') && prior < REVENUE_FLOOR) return null
  if (isCountMetric(metric) && prior < COUNT_FLOOR) return null

  const raw = ((current - prior) / prior) * 100
  if (Math.abs(raw) > 999) return { pct: Math.sign(raw) * 999, capped: true }
  return { pct: raw, capped: false }
}

export function fmtMetric(value: number, metric: Metric): string {
  if (metric === 'revenue' || metric === 'pipeline') {
    if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}m`
    if (value >= 1_000)     return `£${(value / 1_000).toFixed(1)}k`
    return `£${Math.round(value)}`
  }
  if (metric === 'connectRate') return `${value.toFixed(1)}%`
  return String(Math.round(value))
}

export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length > 1) return `${parts[0]} ${parts[1]?.[0] ?? ''}.`
  return name
}

export function metricLabel(metric: Metric): string {
  const labels: Partial<Record<Metric, string>> = {
    revenue:     'Revenue',
    pipeline:    'Pipeline',
    deals:       'Deals',
    activities:  'Activities',
    calls:         'Calls',
    dials:         'Dials',
    connects:      'Connects',
    connectRate:   'Connect rate',
    callsByResult: 'Calls by result',
    emails:        'Emails',
    meetings:    'Meetings',
    tasks:       'Tasks',
    notes:       'Notes',
    linkedin:    'LinkedIn',
  }
  return labels[metric] ?? metric
}

export function periodLabel(period: string): string {
  if (period === 'week')    return 'This week'
  if (period === 'month')   return 'This month'
  if (period === 'quarter') return 'This quarter'
  return period
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', timeZone: 'Europe/London',
  })
}
