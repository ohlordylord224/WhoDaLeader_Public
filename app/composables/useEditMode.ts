// Edit-mode state machine.
// Step A–C: draft spans the FULL Settings (all dashboards + rotation), not just
// one screen. `draft` is a computed view of the currently-editing dashboard's
// screen — backward-compatible with all existing gear/reflow/bench operations
// which mutate screen arrays in-place (not by reassigning `draft.value` itself).

import { validateSettings } from '#shared/utils/validateScreen'
import type { Screen, Widget, Size, Settings, Dashboard, DashboardPeriod } from '~~/types/widgets'

export const CELL_SIZES: Record<Size, number> = { full: 4, half: 2, quarter: 1 }

function cellSum(widgets: Widget[]): number {
  return widgets.reduce((s, w) => s + (CELL_SIZES[w.size] ?? 0), 0)
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}

// ── Unique id generators ──────────────────────────────────────────────────────
let _seq = 0
function newWidgetId(existing: Widget[]): string {
  const taken = new Set(existing.map(w => w.id))
  let id: string
  do { id = `w${Date.now()}-${++_seq}` } while (taken.has(id))
  return id
}

function newDashId(): string { return `d${Date.now()}-${++_seq}` }

function nextDashName(dashboards: Dashboard[]): string {
  const taken = new Set(dashboards.map(d => d.name.toLowerCase()))
  let n = 2
  while (taken.has(`dashboard ${n}`)) n++
  return `Dashboard ${n}`
}

function makeNewDashboardScreen(): Screen {
  // One full-size widget = 4 cells → passes validateScreen immediately.
  return {
    widgets: [{ id: `w${Date.now()}-${++_seq}`, size: 'full', type: 'leaderboard', dimension: 'owner', metric: 'revenue' }],
    bench: [],
  }
}

// ── Write the active screen back into draftSettings ───────────────────────────
// Used wherever the old code did `draft.value = newScreen` (undo, safety revert).
// Mutating the screen object in draftSettings is sufficient — Vue tracks it.
function setActiveScreen(
  draftSettings: Ref<Settings | null>,
  editDashIdx: Ref<number>,
  screen: Screen,
) {
  if (!draftSettings.value) return
  const d = draftSettings.value.dashboards[editDashIdx.value]
  if (d) d.screen = screen
}

export type EditModeState = ReturnType<typeof useEditMode>

export function useEditMode() {
  // isChrome: gear chips + editing indicator visible.
  // Hides after 30 s of no pointer; draftSettings survives the hide.
  const isChrome = ref(false)

  // Source of truth for the edit session: a deep clone of the live Settings.
  // null = no session in progress.
  const draftSettings = ref<Settings | null>(null)

  // Which dashboard (by index into draftSettings.dashboards) is being edited.
  const editDashIdx = ref(0)

  // Read-only view of the currently-editing screen.
  // Existing methods mutate `draft.value.widgets` etc. in-place — those go
  // directly into draftSettings since draft.value IS the same object reference.
  // The only place where we must NOT write `draft.value = x` is undo/revert:
  // use setActiveScreen() there instead.
  const draft = computed<Screen | null>(() =>
    draftSettings.value?.dashboards[editDashIdx.value]?.screen ?? null,
  )

  // Which widget's gear popover is currently open.
  const openWidgetId = ref<string | null>(null)

  // Undo stack — each structural change on the active screen pushes a full
  // prior screen clone. Cleared when switching dashboards.
  const undoStack = ref<Screen[]>([])

  // ── Idle timer ──────────────────────────────────────────────────────────────
  let idleTimer: ReturnType<typeof setTimeout> | null = null
  function resetIdle() {
    if (idleTimer) clearTimeout(idleTimer)
    idleTimer = setTimeout(() => {
      isChrome.value = false
      openWidgetId.value = null
    }, 30_000)
  }

  // ── Internal helpers ────────────────────────────────────────────────────────
  function pushUndo() {
    if (draft.value) undoStack.value.push(deepClone(draft.value))
  }

  function assertNoOverflow(label: string): boolean {
    if (!draft.value) return true
    const n = cellSum(draft.value.widgets)
    if (n > 4) {
      console.error(`[useEditMode] ${label}: invariant violated — ${n} cells > 4; reverting`)
      return false
    }
    return true
  }

  function findWidget(id: string): Widget | undefined {
    if (!draft.value) return undefined
    return (
      draft.value.widgets.find(w => w.id === id) ??
      draft.value.bench.find(w => w.id === id)
    )
  }

  // ── Pointer — first pointer clones the live settings into draftSettings ──────
  // activeDisplayIdx: the rotation index that was showing when the user entered
  // edit mode — becomes the initial editDashIdx so the user edits what they saw.
  function onPointer(liveSettings: Settings | null, activeDisplayIdx: number) {
    if (!liveSettings) return
    if (!draftSettings.value) {
      const cloned = deepClone(liveSettings)
      const idx = Math.min(activeDisplayIdx, cloned.dashboards.length - 1)
      editDashIdx.value = Math.max(0, idx)
      // Sync activeDashboardId to the display dashboard at the moment of entry.
      const currentDash = cloned.dashboards[editDashIdx.value]
      if (currentDash) cloned.activeDashboardId = currentDash.id
      draftSettings.value = cloned
    }
    isChrome.value = true
    resetIdle()
  }

  // ── Gear popover toggle ─────────────────────────────────────────────────────
  function openGear(widgetId: string) {
    openWidgetId.value = openWidgetId.value === widgetId ? null : widgetId
    resetIdle()
  }
  function closeGear() { openWidgetId.value = null }

  // ── updateWidget — non-structural field edits ────────────────────────────────
  function updateWidget(widgetId: string, patch: Partial<Widget>) {
    if (!draft.value) return

    if ('size' in patch && patch.size !== undefined) {
      const current = draft.value.widgets.find(w => w.id === widgetId)
      if (current && current.size !== patch.size) {
        resizeWidget(widgetId, patch.size)
      }
      const { size: _dropped, ...rest } = patch
      if (Object.keys(rest).length > 0) {
        const w = findWidget(widgetId)
        if (w) Object.assign(w, rest)
      }
      resetIdle()
      return
    }

    const w = findWidget(widgetId)
    if (w) Object.assign(w, patch)
    resetIdle()
  }

  // ── resizeWidget — core reflow transform ────────────────────────────────────
  function resizeWidget(widgetId: string, newSize: Size) {
    if (!draft.value) return

    const targetIdx = draft.value.widgets.findIndex(w => w.id === widgetId)
    if (targetIdx === -1) return

    const target = draft.value.widgets[targetIdx]!
    if (target.size === newSize) return

    pushUndo()
    target.size = newSize

    let sum = cellSum(draft.value.widgets)
    while (sum > 4) {
      const last = draft.value.widgets.pop()
      if (!last) break
      draft.value.bench.push(last)
      sum -= CELL_SIZES[last.size] ?? 0
    }

    if (openWidgetId.value && draft.value.bench.some(w => w.id === openWidgetId.value)) {
      openWidgetId.value = null
    }

    if (!assertNoOverflow(`resizeWidget(${widgetId}, ${newSize})`)) {
      const prior = undoStack.value.pop()
      if (prior) setActiveScreen(draftSettings, editDashIdx, prior)
    }

    resetIdle()
  }

  // ── undo ────────────────────────────────────────────────────────────────────
  function undo() {
    const prior = undoStack.value.pop()
    if (prior) {
      setActiveScreen(draftSettings, editDashIdx, prior)
      openWidgetId.value = null
    }
    resetIdle()
  }

  // ── benchWidget ─────────────────────────────────────────────────────────────
  function benchWidget(widgetId: string) {
    if (!draft.value) return
    const idx = draft.value.widgets.findIndex(w => w.id === widgetId)
    if (idx === -1) return
    pushUndo()
    const [w] = draft.value.widgets.splice(idx, 1)
    draft.value.bench.push(w!)
    openWidgetId.value = null
    resetIdle()
  }

  // ── returnFromBench ──────────────────────────────────────────────────────────
  function returnFromBench(widgetId: string) {
    if (!draft.value) return
    const benchW = draft.value.bench.find(w => w.id === widgetId)
    if (!benchW) return
    const used = cellSum(draft.value.widgets)
    if (used + CELL_SIZES[benchW.size] > 4) return
    pushUndo()
    draft.value.bench = draft.value.bench.filter(w => w.id !== widgetId)
    draft.value.widgets.push(benchW)
    resetIdle()
  }

  // ── addNewWidget ─────────────────────────────────────────────────────────────
  function addNewWidget() {
    if (!draft.value) return
    const all = [...draft.value.widgets, ...draft.value.bench]
    const id  = newWidgetId(all)
    const slot: Widget = { id, size: 'quarter', type: 'leaderboard', dimension: 'owner', metric: 'revenue' }
    const used = cellSum(draft.value.widgets)
    if (used + 1 > 4) return
    pushUndo()
    draft.value.widgets.push(slot)
    openWidgetId.value = id
    resetIdle()
  }

  // ── Dashboard management ──────────────────────────────────────────────────────

  function switchEditDash(idx: number) {
    if (!draftSettings.value) return
    const count = draftSettings.value.dashboards.length
    if (idx < 0 || idx >= count) return
    editDashIdx.value = idx
    draftSettings.value.activeDashboardId = draftSettings.value.dashboards[idx]!.id
    // Clear per-dashboard context so old undo/popover don't bleed through.
    undoStack.value    = []
    openWidgetId.value = null
    resetIdle()
  }

  function addDashboard() {
    if (!draftSettings.value) return
    if (draftSettings.value.dashboards.length >= 5) return
    const id   = newDashId()
    const name = nextDashName(draftSettings.value.dashboards)
    const newDash: Dashboard = { id, name, period: 'month', screen: makeNewDashboardScreen() }
    draftSettings.value.dashboards.push(newDash)
    switchEditDash(draftSettings.value.dashboards.length - 1)
  }

  function deleteDashboard(idx: number) {
    if (!draftSettings.value) return
    if (draftSettings.value.dashboards.length <= 1) return
    draftSettings.value.dashboards.splice(idx, 1)
    const newIdx = Math.min(editDashIdx.value, draftSettings.value.dashboards.length - 1)
    editDashIdx.value  = newIdx
    draftSettings.value.activeDashboardId = draftSettings.value.dashboards[newIdx]!.id
    undoStack.value    = []
    openWidgetId.value = null
    resetIdle()
  }

  function renameDashboard(idx: number, name: string) {
    if (!draftSettings.value) return
    const d = draftSettings.value.dashboards[idx]
    if (d) d.name = name.trim()
    resetIdle()
  }

  function setRotation(mode: 'auto' | 'manual', seconds: number) {
    if (!draftSettings.value) return
    draftSettings.value.rotation = { mode, seconds }
    resetIdle()
  }

  function setPeriod(period: DashboardPeriod) {
    if (!draftSettings.value) return
    const d = draftSettings.value.dashboards[editDashIdx.value]
    if (d) d.period = period
    resetIdle()
  }

  // ── cancel / save cleanup ───────────────────────────────────────────────────
  function cancel() {
    isChrome.value     = false
    draftSettings.value = null
    openWidgetId.value  = null
    undoStack.value     = []
    if (idleTimer) clearTimeout(idleTimer)
  }
  function clearAfterSave() { cancel() }

  // ── Computed helpers ────────────────────────────────────────────────────────

  const draftCells = computed(() =>
    draft.value ? cellSum(draft.value.widgets) : 0,
  )

  const freeCells = computed(() => Math.max(0, 4 - draftCells.value))

  function canReturnFromBench(widgetId: string): boolean {
    if (!draft.value) return false
    const w = draft.value.bench.find(b => b.id === widgetId)
    if (!w) return false
    return draftCells.value + CELL_SIZES[w.size] <= 4
  }

  // validateSettings checks ALL dashboard screens + rotation.
  // The save button is disabled until every dashboard is valid.
  const settingsValidResult = computed(() =>
    draftSettings.value
      ? validateSettings(draftSettings.value)
      : ({ ok: false, errors: ['No draft'] } as const),
  )

  const draftValid = computed(() => settingsValidResult.value.ok)

  const draftValidError = computed<string | null>(() =>
    settingsValidResult.value.ok
      ? null
      : (settingsValidResult.value.errors[0] ?? 'Invalid'),
  )

  onUnmounted(() => { if (idleTimer) clearTimeout(idleTimer) })

  return {
    // state
    isChrome:      readonly(isChrome),
    draft,              // computed Screen | null — for wall rendering + existing ops
    draftSettings,      // Ref<Settings | null> — for save handler + manager
    editDashIdx:   readonly(editDashIdx),
    openWidgetId:  readonly(openWidgetId),
    undoStack:     readonly(undoStack),
    // computed
    draftCells,
    freeCells,
    draftValid,
    draftValidError,
    // layout ops (unchanged API)
    onPointer,
    openGear,
    closeGear,
    updateWidget,
    resizeWidget,
    undo,
    benchWidget,
    returnFromBench,
    addNewWidget,
    canReturnFromBench,
    cancel,
    clearAfterSave,
    // dashboard management (new)
    switchEditDash,
    addDashboard,
    deleteDashboard,
    renameDashboard,
    setRotation,
    setPeriod,
  }
}
