<script setup lang="ts">
import { useBoard }    from '~/composables/useBoard'
import { useEditMode } from '~/composables/useEditMode'
import type { Widget, Settings, Snapshot } from '~~/types/widgets'

const {
  settings, screen, snap, prevSnap,
  activeIdx, paused,
  togglePause, next: rotNext, prev: rotPrev, goTo: rotGoTo,
  enterEdit, exitEdit,
} = useBoard()

const em = useEditMode()
const {
  isChrome, draft, draftSettings, editDashIdx,
  openWidgetId, draftValid, draftValidError, undoStack,
  onPointer, openGear, cancel,
  updateWidget, benchWidget, returnFromBench, addNewWidget, undo,
  switchEditDash, addDashboard, deleteDashboard, renameDashboard, setRotation, setPeriod,
} = em

// Single gated source for the currently-displayed dashboard.
// Display mode: settings.dashboards[activeIdx] — rotates with the timer.
// Edit mode:    draftSettings.dashboards[editDashIdx] — follows the editor.
// All derived values (screen, period, id) read from this one computed so they
// cannot desync: adding a new derived property inherits the gate automatically.
const activeDashboard = computed(() =>
  isChrome.value && draftSettings.value
    ? draftSettings.value.dashboards[editDashIdx.value]
    : settings.value?.dashboards[activeIdx.value],
)

// screen.value from useBoard (settings[activeIdx].screen) is the fallback —
// it stays correct on first render before settings arrives and during SSR.
const activeScreen = computed(() => activeDashboard.value?.screen ?? screen.value)
const activePeriod = computed<string>(() => activeDashboard.value?.period ?? 'month')
const activeDashId = computed<string>(() => activeDashboard.value?.id ?? '')

// Override snap's aggregates/trend/period with the active dashboard's period slice.
// Widgets continue reading snap.aggregates — no changes to widget components.
// When byPeriod[period] is absent (new period just added, not yet polled), aggregates
// defaults to {} which causes widget empty-states rather than a crash.
const displaySnap = computed<Snapshot | null>(() => {
  const s = snap.value
  if (!s) return null
  const period = activePeriod.value
  const slice  = s.byPeriod?.[period]
  return { ...s, period, aggregates: slice?.aggregates ?? {}, trend: slice?.trend }
})

// Same slicing for prevSnap so rank-move and delta comparisons use the right period.
// Falls back to the compat top-level aggregates if byPeriod is absent (old snapshot format).
const displayPrevSnap = computed<Snapshot | null>(() => {
  const s = prevSnap.value
  if (!s) return null
  const period = activePeriod.value
  const slice  = s.byPeriod?.[period]
  return {
    ...s,
    period,
    aggregates: slice?.aggregates ?? s.aggregates,
    trend:      slice?.trend ?? s.trend,
  }
})

// Pause rotation when edit chrome opens; resume when it closes.
watch(isChrome, (editing) => {
  if (editing) enterEdit()
  else         exitEdit()
})

// Keyboard shortcuts for rotation (only when not in edit mode).
function onKeyDown(e: KeyboardEvent) {
  if (isChrome.value) return
  const tag = (e.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return
  if (e.key === 'ArrowRight') { e.preventDefault(); rotNext() }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); rotPrev() }
  if (e.key === ' ')          { e.preventDefault(); togglePause() }
}

// Canvas-scale strategy: fixed 1920×1080 design canvas, letterboxed on black.
const canvasStyle = ref('')
function fitCanvas() {
  const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
  canvasStyle.value = `transform: scale(${s})`
}
onMounted(() => {
  fitCanvas()
  window.addEventListener('resize', fitCanvas)
  window.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  window.removeEventListener('resize', fitCanvas)
  window.removeEventListener('keydown', onKeyDown)
})

// First pointer: clone live settings into draft, set editDashIdx to whichever
// dashboard was visible on screen at that moment.
function handlePointer() { onPointer(settings.value, activeIdx.value) }

function handleUpdate(widgetId: string, patch: Partial<Widget>) {
  updateWidget(widgetId, patch)
  saveError.value = null
}

// ── Save / Cancel ─────────────────────────────────────────────────────────────
const isSaving  = ref(false)
const saveError = ref<string | null>(null)

async function handleSave() {
  if (!draftSettings.value) return

  isSaving.value  = true
  saveError.value = null

  // Snapshot before await to prevent races (though draftSettings is a ref, not
  // reassigned during save — this is a belt-and-suspenders copy).
  const payload: Settings = JSON.parse(JSON.stringify(draftSettings.value))

  try {
    const saved = await $fetch<Settings>('/api/settings', {
      method: 'PUT',
      body:   { settings: payload },
    })

    // Optimistic update before clearAfterSave() so activeScreen doesn't flash
    // back to the stale layout while the SSE echo is in flight.
    settings.value = saved
    em.clearAfterSave()

  } catch (err: unknown) {
    // Draft intentionally NOT cleared — user's work must survive a failed save.
    let msg = 'Save failed — please try again'
    if (err && typeof err === 'object') {
      const fe = err as { data?: { errors?: string[] } }
      if (fe.data?.errors?.length) msg = fe.data.errors.join(' · ')
    }
    saveError.value = msg
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div
    id="stage"
    @mousemove="handlePointer"
    @touchstart.passive="handlePointer"
  >
    <div id="canvas" :style="canvasStyle">
      <WallShell
        v-if="screen && displaySnap"
        :screen="activeScreen ?? screen"
        :snap="displaySnap"
        :prev-snap="displayPrevSnap"
        :edit-mode="isChrome"
        :active-dash-id="activeDashId"
        :dash-count="settings?.dashboards.length ?? 0"
        :active-idx="activeIdx"
        :rot-paused="paused"
        @add-slot="addNewWidget"
        @rot-prev="rotPrev"
        @rot-next="rotNext"
        @rot-go-to="rotGoTo"
        @rot-toggle="togglePause"
      />
    </div>
  </div>

  <!-- Edit chrome: native viewport resolution, over the scaled canvas -->
  <Teleport to="body">
    <EditChrome
      v-if="isChrome && activeScreen && draftSettings"
      :screen="activeScreen"
      :draft-settings="draftSettings"
      :edit-dash-idx="editDashIdx"
      :open-widget-id="openWidgetId"
      :draft-valid="draftValid"
      :draft-valid-error="draftValidError"
      :undo-depth="undoStack.length"
      :is-saving="isSaving"
      :save-error="saveError"
      @gear-toggle="openGear"
      @update="handleUpdate"
      @bench="benchWidget"
      @return-from-bench="returnFromBench"
      @undo="undo"
      @save="handleSave"
      @cancel="cancel"
      @switch-dash="switchEditDash"
      @add-dash="addDashboard"
      @delete-dash="deleteDashboard"
      @rename-dash="renameDashboard"
      @set-rotation="setRotation"
      @set-period="setPeriod"
    />
  </Teleport>
</template>
