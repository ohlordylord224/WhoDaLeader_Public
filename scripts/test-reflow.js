#!/usr/bin/env node
// Throwaway unit verifier for the reflow logic in useEditMode.ts.
// Reimplements the pure transforms (no Vue, no imports) so they can be
// exercised in plain Node before committing.

const CELL = { full: 4, half: 2, quarter: 1 }
function cellSum(ws) { return ws.reduce((s, w) => s + (CELL[w.size] ?? 0), 0) }
function clone(x)    { return JSON.parse(JSON.stringify(x)) }

// ── resizeWidget — pure board order, NO target exemption ──────────────────────
// Bench from tail (highest array index) until sum ≤ 4.
// If the target happens to be the tail widget, IT gets benched with the new size.
function resizeWidget(draft, widgetId, newSize) {
  const d = clone(draft)
  const targetIdx = d.widgets.findIndex(w => w.id === widgetId)
  if (targetIdx === -1) return { draft: d, ok: false, reason: 'widget not found' }

  const target = d.widgets[targetIdx]
  if (target.size === newSize) return { draft: d, ok: true, reason: 'no-op' }

  target.size = newSize

  let sum = cellSum(d.widgets)
  while (sum > 4) {
    const last = d.widgets.pop()
    if (!last) break
    d.bench.push(last)
    sum -= CELL[last.size] ?? 0
  }

  if (sum > 4) return { draft: d, ok: false, reason: `overflow after bench: ${sum}` }
  return { draft: d, ok: true, sum }
}

// ── returnFromBench ───────────────────────────────────────────────────────────
function returnFromBench(draft, widgetId) {
  const d = clone(draft)
  const w = d.bench.find(b => b.id === widgetId)
  if (!w) return { draft: d, ok: false, reason: 'not in bench' }
  const used = cellSum(d.widgets)
  if (used + CELL[w.size] > 4) return { draft: d, ok: false, reason: 'no room' }
  d.bench = d.bench.filter(b => b.id !== widgetId)
  d.widgets.push(w)
  return { draft: d, ok: true }
}

// ── validateScreen mirror ─────────────────────────────────────────────────────
function validate(draft) {
  const n = cellSum(draft.widgets)
  if (n !== 4) return { ok: false, errors: [`sum = ${n}, need 4`] }
  return { ok: true }
}

// ── Runner ────────────────────────────────────────────────────────────────────
let pass = 0, fail = 0
function assert(cond, msg) {
  if (cond) { console.log('  ✓', msg); pass++ }
  else       { console.error('  ✗', msg); fail++ }
}
function describe(label, fn) { console.log(`\n${label}`); fn() }

// ── Test 1: half→full benches trailing quarters (target at front) ─────────────
describe('Test 1 — half→full: target at front, trailing quarters benched', () => {
  const before = {
    widgets: [
      { id: 'lb', size: 'half',    type: 'leaderboard' },
      { id: 'sp', size: 'quarter', type: 'spotlight' },
      { id: 'tk', size: 'quarter', type: 'ticker' },
    ],
    bench: [],
  }
  const { draft: after, ok } = resizeWidget(before, 'lb', 'full')

  assert(ok, 'transform succeeds')
  assert(cellSum(after.widgets) === 4, `sum = ${cellSum(after.widgets)} (want 4)`)
  assert(after.widgets.length === 1, `1 widget remains (got ${after.widgets.length})`)
  assert(after.widgets[0].id === 'lb', 'remaining widget is lb')
  assert(after.widgets[0].size === 'full', 'lb is now full')
  assert(after.bench.length === 2, `2 benched (got ${after.bench.length})`)
  // Tail order: tk (idx 2) benched first, then sp (idx 1)
  assert(after.bench[0].id === 'tk', `bench[0] = tk (tail) got ${after.bench[0].id}`)
  assert(after.bench[1].id === 'sp', `bench[1] = sp got ${after.bench[1].id}`)
  assert(validate(after).ok, 'validateScreen passes')
})

// ── Test 2: shrink full→half opens empty cells (sum < 4) ─────────────────────
describe('Test 2 — full→half: shrink produces 2 empty slots', () => {
  const before = { widgets: [{ id: 'lb', size: 'full', type: 'leaderboard' }], bench: [] }
  const { draft: after, ok } = resizeWidget(before, 'lb', 'half')

  assert(ok, 'transform succeeds')
  assert(cellSum(after.widgets) === 2, `sum = ${cellSum(after.widgets)} (want 2)`)
  assert(after.bench.length === 0, 'nothing auto-benched on shrink')
  assert(!validate(after).ok, 'validateScreen fails — Save disabled until slot filled')
})

// ── Test 3: undo restores prior draft ────────────────────────────────────────
describe('Test 3 — undo restores', () => {
  const original = {
    widgets: [
      { id: 'lb', size: 'half',    type: 'leaderboard' },
      { id: 'sp', size: 'quarter', type: 'spotlight' },
      { id: 'tk', size: 'quarter', type: 'ticker' },
    ],
    bench: [],
  }
  resizeWidget(original, 'lb', 'full')   // mutate to show change
  const restored = clone(original)       // simulates undoStack.pop()

  assert(cellSum(restored.widgets) === 4, 'restored sum = 4')
  assert(restored.widgets.length === 3,   'restored has 3 widgets')
  assert(restored.bench.length === 0,     'restored bench empty')
  assert(validate(restored).ok,           'validateScreen passes on restored draft')
  const ids = original.widgets.map(w => w.id).join(',')
  assert(ids === restored.widgets.map(w => w.id).join(','), 'widget order preserved')
})

// ── Test 4: grow from underful state (no bench needed) ───────────────────────
describe('Test 4 — grow from underful state', () => {
  const before = { widgets: [{ id: 'lb', size: 'quarter', type: 'leaderboard' }], bench: [] }
  const { draft: after } = resizeWidget(before, 'lb', 'half')
  assert(cellSum(after.widgets) === 2, `sum = ${cellSum(after.widgets)} (want 2)`)
  assert(after.bench.length === 0, 'no bench needed')
})

// ── Test 5: returnFromBench room check ───────────────────────────────────────
describe('Test 5 — returnFromBench room check', () => {
  const d1 = {
    widgets: [{ id: 'lb', size: 'half', type: 'leaderboard' }],
    bench: [
      { id: 'sp', size: 'quarter', type: 'spotlight' },
      { id: 'tr', size: 'full',    type: 'trend' },
    ],
  }
  const r1 = returnFromBench(d1, 'sp')
  assert(r1.ok, 'quarter fits (2 + 1 = 3 ≤ 4)')
  assert(r1.draft.widgets.length === 2, 'sp added to widgets')
  assert(r1.draft.bench.length === 1,   'sp removed from bench')

  const r2 = returnFromBench(d1, 'tr')
  assert(!r2.ok, 'full does not fit (2 + 4 = 6 > 4)')
})

// ── Test 6a: target at front — tail widget benched ───────────────────────────
describe('Test 6a — pure board order: target at front, tail gets benched', () => {
  // [lb:half(0), sp:half(1)] — lb is target (front); sp is tail
  const before = {
    widgets: [
      { id: 'lb', size: 'half', type: 'leaderboard' },
      { id: 'sp', size: 'half', type: 'spotlight' },
    ],
    bench: [],
  }
  const { draft: after, ok } = resizeWidget(before, 'lb', 'full')
  assert(ok, 'transform succeeds')
  assert(after.widgets.length === 1,     '1 widget displayed')
  assert(after.widgets[0].id === 'lb',   'lb (target, front) remains displayed')
  assert(after.bench.length === 1,       '1 benched')
  assert(after.bench[0].id === 'sp',     'sp (tail) benched')
  assert(cellSum(after.widgets) === 4,   'sum = 4')
})

// ── Test 6b: target at tail — TARGET itself benched (pure board order) ────────
describe('Test 6b — pure board order: target at tail, target gets benched', () => {
  // [sp:half(0), lb:half(1)] — lb is target AND is at the tail
  const before = {
    widgets: [
      { id: 'sp', size: 'half', type: 'spotlight' },
      { id: 'lb', size: 'half', type: 'leaderboard' },
    ],
    bench: [],
  }
  const { draft: after, ok } = resizeWidget(before, 'lb', 'full')
  // Pure board order: pop() hits lb (tail) first → lb benched with new size
  assert(ok, 'transform succeeds')
  assert(after.widgets.length === 1,          '1 widget displayed')
  assert(after.widgets[0].id === 'sp',        'sp (non-target, front) remains displayed')
  assert(after.bench.length === 1,            '1 benched')
  assert(after.bench[0].id === 'lb',          'lb (target, tail) benched')
  assert(after.bench[0].size === 'full',      'lb benched with its NEW size (full)')
  assert(cellSum(after.widgets) === 2,        'sum = 2 (sp:half, 2 slots open)')
  assert(!validate(after).ok,                 'validateScreen fails — board underful')
  // User can now tap lb chip to return it (displacing sp):
  const r = returnFromBench(after, 'lb')
  assert(!r.ok, 'lb:full does not fit (2 + 4 = 6 > 4)')
  // If user shrinks lb to half in bench first (hypothetically), return would fit.
})

// ── Test 7: three widgets, middle target grows to full ───────────────────────
describe('Test 7 — middle target grows: trailing widget benched first', () => {
  // [sp:quarter(0), lb:quarter(1), tk:quarter(2)] resize lb (middle) to full
  // Pure order: pop tk → pop lb → sum = 1 ≤ 4
  // lb is benched WITH its new size (full), sp remains
  const before = {
    widgets: [
      { id: 'sp', size: 'quarter', type: 'spotlight' },
      { id: 'lb', size: 'quarter', type: 'leaderboard' },
      { id: 'tk', size: 'quarter', type: 'ticker' },
    ],
    bench: [],
  }
  const { draft: after, ok } = resizeWidget(before, 'lb', 'full')
  assert(ok, 'transform succeeds')
  // sum after setting lb to full: 1+4+1=6 → pop tk (sum=5) → pop lb (sum=1) ✓
  assert(after.widgets.length === 1,        '1 widget displayed')
  assert(after.widgets[0].id === 'sp',      'sp (front) remains')
  assert(after.bench.some(w => w.id === 'tk'), 'tk benched')
  assert(after.bench.some(w => w.id === 'lb'), 'lb (target, middle→now popped as second-to-last) benched')
  assert(cellSum(after.widgets) === 1,      'sum = 1')
})

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`)
console.log(`${pass + fail} assertions — ${pass} passed, ${fail} failed`)
if (fail > 0) process.exit(1)
