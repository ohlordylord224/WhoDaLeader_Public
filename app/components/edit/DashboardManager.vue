<script setup lang="ts">
import type { Dashboard, DashboardPeriod } from '~~/types/widgets'

const props = defineProps<{
  dashboards: Dashboard[]
  editDashIdx: number
  rotation: { mode: 'auto' | 'manual'; seconds: number }
}>()

const emit = defineEmits<{
  switchDash:  [idx: number]
  addDash:     []
  deleteDash:  [idx: number]
  renameDash:  [idx: number, name: string]
  setRotation: [mode: 'auto' | 'manual', seconds: number]
  setPeriod:   [period: DashboardPeriod]
}>()

const PERIODS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'today',   label: 'Today' },
  { value: 'week',    label: 'Week' },
  { value: 'month',   label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
]

const currentPeriod = computed<DashboardPeriod>(() =>
  props.dashboards[props.editDashIdx]?.period ?? 'month',
)

// ── Rename ────────────────────────────────────────────────────────────────────
const renameIdx   = ref<number | null>(null)
const renameValue = ref('')
const renameError = ref('')
const renameInput = ref<HTMLInputElement | null>(null)

function startRename(idx: number) {
  if (renameIdx.value === idx) return
  renameIdx.value   = idx
  renameValue.value = props.dashboards[idx]?.name ?? ''
  renameError.value = ''
  nextTick(() => { renameInput.value?.select() })
}

function cancelRename() {
  renameIdx.value   = null
  renameError.value = ''
}

function commitRename() {
  const idx = renameIdx.value
  if (idx === null) return
  const trimmed = renameValue.value.trim()
  if (!trimmed)             { renameError.value = 'Name required'; return }
  if (trimmed.length > 32)  { renameError.value = 'Max 32 chars'; return }
  const taken = props.dashboards.some((d, i) =>
    i !== idx && d.name.toLowerCase() === trimmed.toLowerCase(),
  )
  if (taken) { renameError.value = 'Name already used'; return }
  emit('renameDash', idx, trimmed)
  renameIdx.value   = null
  renameError.value = ''
}

// Close rename when tab is switched externally.
watch(() => props.editDashIdx, () => cancelRename())

// ── Delete confirm ────────────────────────────────────────────────────────────
const deleteConfirmIdx = ref<number | null>(null)

function askDelete(idx: number, e: MouseEvent) {
  e.stopPropagation()
  deleteConfirmIdx.value = idx
}
function cancelDelete()  { deleteConfirmIdx.value = null }
function confirmDelete() {
  if (deleteConfirmIdx.value !== null) emit('deleteDash', deleteConfirmIdx.value)
  deleteConfirmIdx.value = null
}

// ── Rotation ──────────────────────────────────────────────────────────────────
const rotSecs = ref(props.rotation.seconds)
watch(() => props.rotation.seconds, s => { rotSecs.value = s })

function setMode(mode: 'auto' | 'manual') {
  emit('setRotation', mode, rotSecs.value)
}

function handleSecsChange(e: Event) {
  const v = parseInt((e.target as HTMLInputElement).value, 10)
  if (!isNaN(v) && v >= 5 && v <= 3600) {
    rotSecs.value = v
    emit('setRotation', props.rotation.mode, v)
  }
}
</script>

<template>
  <div class="dash-mgr inkchip">
    <!-- Tab strip -->
    <div class="dash-mgr__tabs">
      <div
        v-for="(dash, idx) in dashboards"
        :key="dash.id"
        class="dash-tab"
        :class="{ 'dash-tab--active': idx === editDashIdx }"
        @click="idx === editDashIdx ? startRename(idx) : emit('switchDash', idx)"
      >
        <!-- Rename mode -->
        <template v-if="renameIdx === idx">
          <input
            ref="renameInput"
            v-model="renameValue"
            class="dash-tab__rename"
            :class="{ 'dash-tab__rename--error': renameError }"
            maxlength="36"
            @keydown.enter.prevent="commitRename"
            @keydown.escape.prevent="cancelRename"
            @blur="commitRename"
            @click.stop
          />
          <span v-if="renameError" class="dash-tab__rename-err">{{ renameError }}</span>
        </template>

        <!-- Normal mode -->
        <template v-else>
          <span class="dash-tab__name">{{ dash.name }}</span>
          <button
            v-if="dashboards.length > 1"
            class="dash-tab__del"
            :aria-label="`Delete ${dash.name}`"
            @click.stop="askDelete(idx, $event)"
          >×</button>
        </template>
      </div>

      <!-- Add button (hidden at max) -->
      <button
        v-if="dashboards.length < 5"
        class="dash-add"
        aria-label="Add dashboard"
        title="Add dashboard"
        @click="emit('addDash')"
      >+</button>
    </div>

    <!-- Period selector — per-dashboard data window -->
    <div class="dash-period">
      <span class="dash-period__lbl">Period</span>
      <div class="dash-period__seg">
        <button
          v-for="opt in PERIODS"
          :key="opt.value"
          class="dash-period__opt"
          :class="{ 'dash-period__opt--on': currentPeriod === opt.value }"
          @click="emit('setPeriod', opt.value)"
        >{{ opt.label }}</button>
      </div>
    </div>

    <!-- Divider -->
    <div class="dash-mgr__div" aria-hidden="true" />

    <!-- Rotation settings -->
    <div class="rot-settings">
      <div class="rot-seg">
        <button
          class="rot-seg__opt"
          :class="{ 'rot-seg__opt--on': rotation.mode === 'manual' }"
          @click="setMode('manual')"
        >Manual</button>
        <button
          class="rot-seg__opt"
          :class="{ 'rot-seg__opt--on': rotation.mode === 'auto' }"
          @click="setMode('auto')"
        >Auto</button>
      </div>
      <Transition name="rot-secs">
        <div v-if="rotation.mode === 'auto'" class="rot-seconds">
          <input
            class="rot-seconds__input"
            type="number"
            :value="rotSecs"
            min="5"
            max="3600"
            step="5"
            @change="handleSecsChange"
          />
          <span class="rot-seconds__unit">s</span>
        </div>
      </Transition>
    </div>
  </div>

  <!-- Delete confirm dialog -->
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="deleteConfirmIdx !== null" class="dash-confirm">
        <div class="dash-confirm__backdrop" @click="cancelDelete" />
        <div class="dash-confirm__box" role="dialog" aria-modal="true">
          <p class="dash-confirm__msg">
            Delete
            <strong>{{ dashboards[deleteConfirmIdx!]?.name ?? 'this dashboard' }}</strong>?
            This cannot be undone.
          </p>
          <div class="dash-confirm__actions">
            <button class="btn-action btn-action--cancel" @click="cancelDelete">Cancel</button>
            <button class="btn-action btn-action--delete" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
