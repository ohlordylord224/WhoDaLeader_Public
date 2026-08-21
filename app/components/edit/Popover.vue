<script setup lang="ts">
import { validateScreen } from '#shared/utils/validateScreen'
import type { Widget, Screen, Metric, WidgetAudience } from '~~/types/widgets'

const props = defineProps<{
  widget: Widget
  screen: Screen          // full draft, needed for validateScreen
  anchorRect: DOMRect | null
}>()

const emit = defineEmits<{
  update: [patch: Partial<Widget>]
  bench: []
  close: []
}>()

// ── Validation ────────────────────────────────────────────────────────────────
// Run continuously as any field changes. Errors shown inline; external consumers
// can read `valid` to decide whether to enable Save.
const validationErrors = computed<string[]>(() => {
  const result = validateScreen(props.screen)
  return result.ok ? [] : result.errors
})

// ── Size segmented control ────────────────────────────────────────────────────
const SIZES = [
  { value: 'quarter' as const, label: 'Quarter', icon: '▪' },
  { value: 'half'    as const, label: 'Half',    icon: '▬' },
  { value: 'full'    as const, label: 'Full',    icon: '█' },
]

// ── Widget type grid ──────────────────────────────────────────────────────────
const TYPES: Array<{ value: Widget['type']; label: string }> = [
  { value: 'leaderboard', label: 'Lead' },
  { value: 'spotlight',   label: 'Spot' },
  { value: 'target',      label: 'Target' },
  { value: 'ticker',      label: 'Ticker' },
  { value: 'trend',       label: 'Trend' },
]

// ── Data dimension + metric ───────────────────────────────────────────────────
const DIMENSIONS: Array<{ value: 'owner' | 'dealstage' | 'none'; label: string }> = [
  { value: 'owner',     label: 'By person' },
  { value: 'dealstage', label: 'By stage' },
  { value: 'none',      label: 'Overall' },
]

// Full real metric union from types/widgets.ts §8a — NOT a stale short list.
const METRICS: Array<{ value: Metric; label: string }> = [
  { value: 'revenue',     label: 'Revenue' },
  { value: 'pipeline',    label: 'Pipeline' },
  { value: 'deals',       label: 'Deals' },
  { value: 'activities',  label: 'Activities' },
  { value: 'calls',       label: 'Calls' },
  { value: 'dials',       label: 'Dials' },
  { value: 'connects',    label: 'Connects' },
  { value: 'connectRate', label: 'Connect%' },
  { value: 'emails',      label: 'Emails' },
  { value: 'meetings',    label: 'Meetings' },
  { value: 'tasks',       label: 'Tasks' },
  { value: 'notes',       label: 'Notes' },
  { value: 'linkedin',    label: 'LinkedIn' },
]

// Which types show the data section (dimension + metric).
const HAS_DATA  = new Set(['leaderboard', 'spotlight', 'target', 'trend'])
// Which types show the celebrate toggle.
const HAS_CELE  = new Set(['leaderboard', 'spotlight'])
// Ticker has no metric selector.
const HAS_METRIC = new Set(['leaderboard', 'spotlight', 'target', 'trend'])

// ── Row limit (leaderboard only) ──────────────────────────────────────────────
const ROW_DEFAULTS: Record<Widget['size'], number> = { quarter: 3, half: 6, full: 10 }
const maxRows  = computed(() => ROW_DEFAULTS[props.widget.size])
const rowCount = computed(() => props.widget.limit ?? ROW_DEFAULTS[props.widget.size])

function setRows(n: number) {
  emit('update', { limit: Math.max(1, Math.min(n, maxRows.value)) })
}
function clearRows() { emit('update', { limit: undefined }) }

const showData    = computed(() => HAS_DATA.has(props.widget.type))
const showCele    = computed(() => HAS_CELE.has(props.widget.type))
const showMetric  = computed(() => HAS_METRIC.has(props.widget.type))

// ── Audience ──────────────────────────────────────────────────────────────────
// Shown for owner-dimensioned leaderboard/spotlight/trend. Ticker and target
// have no owner breakdown; dealstage-dimensioned widgets use stage keys not
// owner keys, so audience would silently yield 0 rows.
const { rosterTeams, rosterOwners } = useRoster()

const showAudience = computed(() =>
  ['leaderboard', 'spotlight', 'trend'].includes(props.widget.type) &&
  props.widget.dimension !== 'dealstage',
)

type AudMode = 'all' | 'team' | 'owners'
const audMode = computed<AudMode>(() => {
  const a = props.widget.audience
  if (!a) return 'all'
  return a.mode === 'team' ? 'team' : 'owners'
})

function setAudMode(mode: AudMode) {
  if (mode === 'all')    { emit('update', { audience: undefined }); return }
  if (mode === 'team')   { emit('update', { audience: { mode: 'team',   teamIds:  [] } }); return }
  if (mode === 'owners') { emit('update', { audience: { mode: 'owners', ownerIds: [] } }); return }
}

function toggleTeam(teamId: string) {
  const cur  = props.widget.audience?.mode === 'team' ? props.widget.audience.teamIds : []
  const next = cur.includes(teamId) ? cur.filter(t => t !== teamId) : [...cur, teamId]
  emit('update', { audience: { mode: 'team', teamIds: next } as WidgetAudience })
}

function toggleOwner(ownerId: string) {
  const cur  = props.widget.audience?.mode === 'owners' ? props.widget.audience.ownerIds : []
  const next = cur.includes(ownerId) ? cur.filter(t => t !== ownerId) : [...cur, ownerId]
  emit('update', { audience: { mode: 'owners', ownerIds: next } as WidgetAudience })
}

// Auto-clear audience when switching to dealstage dimension (audience keys
// are owner IDs; they don't match stage IDs and would silently zero the widget).
watch(() => props.widget.dimension, (dim) => {
  if (dim === 'dealstage' && props.widget.audience) emit('update', { audience: undefined })
})

// ── Title with 24-char hard cap ───────────────────────────────────────────────
const TITLE_MAX = 24
const titleValue = ref(props.widget.title ?? '')
const titleOver  = computed(() => titleValue.value.length > TITLE_MAX)

// Guard: suppress outbound emit when titleValue is updated by a prop change
// (different gear opened, or undo restoring a prior title).
let syncingFromProp = false

watch(titleValue, (v) => {
  if (syncingFromProp) return
  if (v.length > TITLE_MAX) {
    titleValue.value = v.slice(0, TITLE_MAX)
    return
  }
  // Empty string → undefined so Cell.vue falls back to the widget's auto-title.
  emit('update', { title: v || undefined })
})

// Sync when either the selected widget or its title changes externally.
// Covers: a different gear opens (id change), undo restoring a prior title (title change).
watch([() => props.widget.id, () => props.widget.title], () => {
  syncingFromProp = true
  titleValue.value = props.widget.title ?? ''
  nextTick(() => { syncingFromProp = false })
})

// ── Popover positioning — viewport-aware, flips upward when below gear overflows ─
const POP_W           = 344
const BENCH_CLEAR     = 80   // keep clear of the bench shelf at the bottom
const CHIP_H          = 40   // gear chip height in screen px (native-res, not scaled)
const POP_GAP         = 8    // gap between chip edge and popover edge, screen px
const POP_MARGIN      = 12   // minimum space from any viewport edge
const POP_MIN_USEFUL  = 220  // below this height, flip direction is preferred
// Design insets (canvas units) — multiplied by scale, same as Chrome.vue.
const INSET_TOP_CANVAS = 10

function canvasScale(): number {
  const el = document.getElementById('canvas')
  if (!el) return 1
  const w = el.getBoundingClientRect().width
  return w > 0 ? w / 1920 : 1
}

const popStyle = computed<Record<string, string>>(() => {
  const ar = props.anchorRect
  if (!ar) return { display: 'none' } as Record<string, string>

  const s  = canvasScale()
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Horizontal: right-aligned to the cell's right edge, clamped within viewport.
  let left = Math.round(ar.right - 10 - POP_W)
  left = Math.max(POP_MARGIN, Math.min(left, vw - POP_W - POP_MARGIN))

  // Gear chip bounds in screen pixels.
  const gearTop    = Math.round(ar.top + INSET_TOP_CANVAS * s)
  const gearBottom = gearTop + CHIP_H

  // Available vertical space below and above the gear chip.
  const spaceBelow = vh - (gearBottom + POP_GAP) - BENCH_CLEAR - POP_MARGIN
  const spaceAbove = gearTop - POP_GAP - POP_MARGIN

  let top: number
  let maxHeight: number

  if (spaceBelow >= POP_MIN_USEFUL || spaceBelow >= spaceAbove) {
    // Downward: top of popover just below the gear chip.
    top = Math.max(POP_MARGIN, gearBottom + POP_GAP)
    maxHeight = vh - top - BENCH_CLEAR - POP_MARGIN
  } else {
    // Flip upward: bottom of popover just above the gear chip.
    // top is clamped to POP_MARGIN; maxHeight fills the available space above.
    top = Math.max(POP_MARGIN, gearTop - POP_GAP - Math.max(POP_MIN_USEFUL, spaceAbove))
    maxHeight = gearTop - POP_GAP - top
  }

  return {
    left:      `${left}px`,
    top:       `${top}px`,
    maxHeight: `${Math.max(100, maxHeight)}px`,
  }
})

// ── Per-field validation error helpers ───────────────────────────────────────
function fieldError(keyword: string): string | null {
  const e = validationErrors.value.find(err => err.toLowerCase().includes(keyword))
  return e ?? null
}
</script>

<template>
  <div class="pop" :style="popStyle" role="dialog" aria-label="Widget settings">
    <!-- Header -->
    <div class="pop__head">
      <h2 class="pop__title">{{ widget.title || widget.type }}</h2>
      <button class="pop__x" aria-label="Close" @click="emit('close')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M1 1l12 12M13 1L1 13" />
        </svg>
      </button>
    </div>

    <!-- ── Size ── -->
    <div class="pop__sec">
      <span class="pop__lbl">Size</span>
      <div class="seg">
        <button
          v-for="s in SIZES"
          :key="s.value"
          class="seg__opt"
          :class="{ 'seg__opt--on': widget.size === s.value }"
          @click="emit('update', { size: s.value })"
        >
          {{ s.icon }}&nbsp;{{ s.label }}
        </button>
      </div>
    </div>

    <!-- ── Type ── -->
    <div class="pop__sec">
      <span class="pop__lbl">Type</span>
      <div class="typegrid">
        <button
          v-for="t in TYPES"
          :key="t.value"
          class="typegrid__opt"
          :class="{ 'typegrid__opt--on': widget.type === t.value }"
          @click="emit('update', { type: t.value })"
        >
          <!-- type icon via inline SVG pictograms -->
          <svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor" aria-hidden="true">
            <!-- leaderboard: stacked bars -->
            <template v-if="t.value === 'leaderboard'">
              <rect x="0" y="10" width="20" height="3" rx="1" />
              <rect x="0" y="6"  width="14" height="3" rx="1" />
              <rect x="0" y="2"  width="9"  height="3" rx="1" />
            </template>
            <!-- spotlight: single big bar -->
            <template v-else-if="t.value === 'spotlight'">
              <rect x="0" y="4" width="20" height="8" rx="2" />
            </template>
            <!-- target: circle with dot -->
            <template v-else-if="t.value === 'target'">
              <circle cx="10" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="2" />
              <circle cx="10" cy="8" r="3" />
            </template>
            <!-- ticker: two text lines -->
            <template v-else-if="t.value === 'ticker'">
              <rect x="0" y="4"  width="20" height="2.5" rx="1" />
              <rect x="0" y="9"  width="16" height="2.5" rx="1" />
            </template>
            <!-- trend: polyline -->
            <template v-else-if="t.value === 'trend'">
              <polyline points="0,14 6,8 11,11 20,2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </template>
          </svg>
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- ── Data (dimension + metric) — hidden for ticker ── -->
    <div v-if="showData" class="pop__sec">
      <span class="pop__lbl">Data</span>
      <div class="pop__row2">
        <!-- Dimension -->
        <div class="pop__selwrap">
          <select
            class="pop__select"
            :value="widget.dimension ?? 'owner'"
            @change="emit('update', { dimension: ($event.target as HTMLSelectElement).value as 'owner' | 'dealstage' | 'none' })"
          >
            <option v-for="d in DIMENSIONS" :key="d.value" :value="d.value">{{ d.label }}</option>
          </select>
          <span class="pop__chev" aria-hidden="true">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 1l4 4 4-4" /></svg>
          </span>
        </div>
        <!-- Metric — full real union -->
        <div v-if="showMetric" class="pop__selwrap">
          <select
            class="pop__select"
            :value="widget.metric ?? 'revenue'"
            @change="emit('update', { metric: ($event.target as HTMLSelectElement).value as Metric })"
          >
            <option v-for="m in METRICS" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
          <span class="pop__chev" aria-hidden="true">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 1l4 4 4-4" /></svg>
          </span>
        </div>
      </div>
      <p v-if="fieldError('metric') || fieldError('dimension')" class="pop__err">
        {{ fieldError('metric') ?? fieldError('dimension') }}
      </p>
    </div>

    <!-- ── Rows — leaderboard only ── -->
    <div v-if="widget.type === 'leaderboard'" class="pop__sec">
      <span class="pop__lbl">Rows</span>
      <div class="pop__rows">
        <button
          class="pop__rows-auto"
          :class="{ 'pop__rows-auto--on': widget.limit == null }"
          :title="widget.limit == null ? 'Auto (size default)' : 'Reset to auto'"
          @click="clearRows"
        >Auto</button>
        <div class="pop__rows-step" :class="{ 'pop__rows-step--active': widget.limit != null }">
          <button
            class="pop__rows-btn"
            aria-label="Fewer rows"
            :disabled="rowCount <= 1"
            @click="setRows(rowCount - 1)"
          >−</button>
          <span class="pop__rows-val">{{ rowCount }}</span>
          <button
            class="pop__rows-btn"
            aria-label="More rows"
            :disabled="rowCount >= maxRows"
            @click="setRows(rowCount + 1)"
          >+</button>
        </div>
      </div>
    </div>

    <!-- ── Audience — leaderboard, spotlight, trend (not ticker / target / dealstage) ── -->
    <div v-if="showAudience" class="pop__sec">
      <span class="pop__lbl">Audience</span>
      <div class="aud-mode">
        <button class="aud-mode__opt" :class="{ 'aud-mode__opt--on': audMode === 'all' }"    @click="setAudMode('all')">All</button>
        <button class="aud-mode__opt" :class="{ 'aud-mode__opt--on': audMode === 'team' }"   @click="setAudMode('team')">Team</button>
        <button class="aud-mode__opt" :class="{ 'aud-mode__opt--on': audMode === 'owners' }" @click="setAudMode('owners')">People</button>
      </div>

      <!-- Team list -->
      <div v-if="audMode === 'team'" class="aud-list">
        <span v-if="!rosterTeams.length" class="aud-list__empty">Loading teams…</span>
        <label v-for="t in rosterTeams" :key="t.id" class="aud-list__item">
          <input
            type="checkbox"
            :checked="widget.audience?.mode === 'team' && (widget.audience as { mode:'team'; teamIds:string[] }).teamIds.includes(t.id)"
            @change="toggleTeam(t.id)"
          />
          {{ t.name }}
        </label>
      </div>

      <!-- People list -->
      <div v-if="audMode === 'owners'" class="aud-list">
        <span v-if="!rosterOwners.length" class="aud-list__empty">Loading people…</span>
        <label v-for="o in rosterOwners" :key="o.id" class="aud-list__item">
          <input
            type="checkbox"
            :checked="widget.audience?.mode === 'owners' && (widget.audience as { mode:'owners'; ownerIds:string[] }).ownerIds.includes(o.id)"
            @change="toggleOwner(o.id)"
          />
          {{ o.name }}
        </label>
      </div>

      <p v-if="fieldError('audience')" class="pop__err">{{ fieldError('audience') }}</p>
    </div>

    <!-- ── Celebrate toggle — leaderboard + spotlight only ── -->
    <div v-if="showCele" class="pop__sec">
      <div class="pop__toggle">
        <span class="pop__toggletxt">Celebrate overtakes</span>
        <input
          type="checkbox"
          :checked="widget.celebrate ?? false"
          @change="emit('update', { celebrate: ($event.target as HTMLInputElement).checked })"
        />
      </div>
    </div>

    <!-- ── Title (≤24 chars) ── -->
    <div class="pop__sec">
      <span class="pop__lbl">Title <span style="font-weight: var(--weight-medium); text-transform: none; letter-spacing: 0;">{{ titleValue.length }}/{{ TITLE_MAX }}</span></span>
      <input
        v-model="titleValue"
        class="pop__input"
        :class="{ 'pop__input--error': titleOver }"
        type="text"
        :maxlength="TITLE_MAX"
        placeholder="Use widget default"
      />
      <p v-if="titleOver" class="pop__err">Title must be {{ TITLE_MAX }} chars or fewer</p>
    </div>

    <!-- ── Footer: Set aside ── -->
    <div class="pop__foot">
      <button
        class="btn-action btn-action--cancel"
        style="width: 100%; border-radius: var(--radius-sm);"
        @click="emit('bench')"
      >
        Set aside
      </button>
    </div>

    <!-- Inline validation summary (only if not covered by per-field messages) -->
    <template v-if="validationErrors.length">
      <p
        v-for="(err, i) in validationErrors"
        :key="i"
        class="pop__err"
        style="margin-top: 8px;"
      >{{ err }}</p>
    </template>
  </div>
</template>
