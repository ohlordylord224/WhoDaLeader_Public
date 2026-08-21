<script setup lang="ts">
import type { Screen, Widget, Size, Settings, DashboardPeriod } from '~~/types/widgets'

const props = defineProps<{
  screen:        Screen          // the editing dashboard's current draft screen
  draftSettings: Settings        // full settings draft (for DashboardManager)
  editDashIdx:   number
  openWidgetId:  string | null
  draftValid:    boolean
  draftValidError?: string | null
  undoDepth:     number
  isSaving?:     boolean
  saveError?:    string | null
}>()

const emit = defineEmits<{
  gearToggle:     [widgetId: string]
  update:         [widgetId: string, patch: Partial<Widget>]
  bench:          [widgetId: string]
  returnFromBench:[widgetId: string]
  undo:           []
  save:           []
  cancel:         []
  // dashboard management
  switchDash:     [idx: number]
  addDash:        []
  deleteDash:     [idx: number]
  renameDash:     [idx: number, name: string]
  setRotation:    [mode: 'auto' | 'manual', seconds: number]
  setPeriod:      [period: DashboardPeriod]
}>()

// ── Cell rect map (id-keyed, not index-based) ─────────────────────────────────
const rectMap = ref(new Map<string, DOMRect>())

function measureCells() {
  const next = new Map<string, DOMRect>()
  document.querySelectorAll<HTMLElement>('.wall__grid .cell[data-widget-id]').forEach(el => {
    const id = el.dataset.widgetId
    if (id) next.set(id, el.getBoundingClientRect())
  })
  rectMap.value = next
}

onMounted(() => {
  measureCells()
  setTimeout(measureCells, 350)
  window.addEventListener('resize', measureCells)
})
onUnmounted(() => window.removeEventListener('resize', measureCells))

watch(() => props.screen.widgets.map(w => w.id).join(','), () => nextTick(measureCells))

// ── Canvas scale ─────────────────────────────────────────────────────────────
function canvasScale(): number {
  const el = document.getElementById('canvas')
  if (!el) return 1
  const w = el.getBoundingClientRect().width
  return w > 0 ? w / 1920 : 1
}

// ── Gear chip positioning ─────────────────────────────────────────────────────
const INSET_RIGHT_CANVAS = 10
const INSET_TOP_CANVAS   = 10
const CHIP_W_SCREEN      = 40

function gearStyle(widgetId: string): Record<string, string> {
  const r = rectMap.value.get(widgetId)
  if (!r) return { display: 'none' }
  const s = canvasScale()
  return {
    left: `${Math.round(r.right - CHIP_W_SCREEN - INSET_RIGHT_CANVAS * s)}px`,
    top:  `${Math.round(r.top   + INSET_TOP_CANVAS * s)}px`,
  }
}

// ── Popover anchor ────────────────────────────────────────────────────────────
const openGearRect = computed<DOMRect | null>(() =>
  props.openWidgetId ? (rectMap.value.get(props.openWidgetId) ?? null) : null,
)

const openWidget = computed<Widget | null>(() =>
  props.openWidgetId
    ? (props.screen.widgets.find(w => w.id === props.openWidgetId) ?? null)
    : null,
)

// ── Bench chip helpers ────────────────────────────────────────────────────────
const CELL_SIZES: Record<Size, number> = { full: 4, half: 2, quarter: 1 }

function canReturn(widgetId: string): boolean {
  const w = props.screen.bench.find(b => b.id === widgetId)
  if (!w) return false
  const used = props.screen.widgets.reduce((s, w) => s + (CELL_SIZES[w.size] ?? 0), 0)
  return used + CELL_SIZES[w.size] <= 4
}

function benchLabel(w: Widget): string {
  const name   = w.title ?? (w.type.charAt(0).toUpperCase() + w.type.slice(1))
  const metric = w.metric ?? null
  return metric ? `${name} — ${metric} · ${w.size}` : `${name} · ${w.size}`
}
</script>

<template>
  <div id="chrome">
    <!-- Dashboard manager — top-left tab strip + rotation settings -->
    <EditDashboardManager
      :dashboards="draftSettings.dashboards"
      :edit-dash-idx="editDashIdx"
      :rotation="draftSettings.rotation"
      @switch-dash="(idx) => emit('switchDash', idx)"
      @add-dash="emit('addDash')"
      @delete-dash="(idx) => emit('deleteDash', idx)"
      @rename-dash="(idx, name) => emit('renameDash', idx, name)"
      @set-rotation="(mode, secs) => emit('setRotation', mode, secs)"
      @set-period="(period) => emit('setPeriod', period)"
    />

    <!-- "Editing" indicator — centred in header zone -->
    <div
      class="inkchip editing"
      style="top: 20px; left: 50%; transform: translateX(-50%);"
    >
      <span class="editing__dot" />
      Editing
    </div>

    <!-- Save / Cancel / Undo — top-right -->
    <div class="inkchip edit-actions">
      <Transition name="undo-fade">
        <button
          v-if="undoDepth > 0"
          class="btn-action btn-action--undo"
          @click="emit('undo')"
        >↩ Undo</button>
      </Transition>
      <button class="btn-action btn-action--cancel" @click="emit('cancel')">Cancel</button>
      <button
        class="btn-action btn-action--save"
        :disabled="!draftValid || isSaving"
        :title="draftValid ? undefined : (draftValidError ?? 'Fix layout before saving')"
        @click="emit('save')"
      >
        {{ isSaving ? 'Saving…' : 'Save' }}
      </button>
    </div>

    <!-- Save error -->
    <Transition name="undo-fade">
      <div v-if="saveError" class="inkchip save-error" role="alert">
        {{ saveError }}
      </div>
    </Transition>

    <!-- Gear chips — one per displayed widget -->
    <button
      v-for="w in screen.widgets"
      :key="w.id"
      class="inkchip gearchip"
      :class="{ 'gearchip--active': openWidgetId === w.id }"
      :style="gearStyle(w.id)"
      :aria-label="`Edit ${w.title ?? w.type}`"
      @click="emit('gearToggle', w.id)"
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>

    <!-- Gear popover -->
    <EditPopover
      v-if="openWidget && openGearRect"
      :widget="openWidget"
      :screen="screen"
      :anchor-rect="openGearRect"
      @update="(patch) => emit('update', openWidget!.id, patch)"
      @bench="emit('bench', openWidget!.id)"
      @close="emit('gearToggle', openWidget!.id)"
    />

    <!-- Bench shelf -->
    <Transition name="bench-shelf">
      <div
        v-if="screen.bench.length > 0"
        class="inkchip bench"
      >
        <span class="bench__lbl">Bench</span>
        <span class="bench__div" aria-hidden="true" />
        <TransitionGroup name="bench-chip" tag="div" class="bench__chips">
          <button
            v-for="w in screen.bench"
            :key="w.id"
            class="bench__chip"
            :disabled="!canReturn(w.id)"
            :title="canReturn(w.id) ? `Return ${w.title ?? w.type} to board` : `No room for ${w.size}`"
            @click="canReturn(w.id) && emit('returnFromBench', w.id)"
          >
            {{ benchLabel(w) }}
          </button>
        </TransitionGroup>
      </div>
    </Transition>
  </div>
</template>
