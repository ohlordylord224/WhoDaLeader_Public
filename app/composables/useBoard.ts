import type { Screen, Snapshot, Settings } from '~~/types/widgets'
import { defaultSettings } from '~~/config/screen.default'

export function useBoard() {
  const settings  = ref<Settings | null>(null)
  const snap      = ref<Snapshot | null>(null)
  const prevSnap  = ref<Snapshot | null>(null)

  // ── Rotation state ──────────────────────────────────────────────────────────
  // INDEPENDENCE INVARIANT: rotTimer and the SSE EventSource are two completely
  // separate clocks. A snapshot tick updates snap.value only — it never reads or
  // writes rotTimer. A timer tick advances activeIdx.value only — it never
  // touches the EventSource. Rotating dashboards does NOT reconnect the stream.
  const activeIdx  = ref(0)
  const userPaused = ref(false)   // user toggled via pause button / Space key
  const editPaused = ref(false)   // system pause while edit chrome is open

  // What the rotation dot UI shows as "paused".
  const paused = computed(() => userPaused.value || editPaused.value)

  let rotTimer: ReturnType<typeof setInterval> | null = null

  function dashCount() { return settings.value?.dashboards.length ?? 0 }

  function stopTimer() {
    if (rotTimer) { clearInterval(rotTimer); rotTimer = null }
  }

  function startTimer() {
    stopTimer()
    if (userPaused.value || editPaused.value) return
    if (dashCount() <= 1) return   // single-dashboard: no rotation needed
    const cfg = settings.value?.rotation
    if (!cfg || cfg.mode !== 'auto') return
    const ms = Math.max(5, cfg.seconds) * 1000
    rotTimer = setInterval(() => {
      activeIdx.value = (activeIdx.value + 1) % dashCount()
    }, ms)
  }

  // User-facing pause toggle (button or Space key).
  function togglePause() {
    userPaused.value = !userPaused.value
    userPaused.value ? stopTimer() : startTimer()
  }

  // Manual advance — resets dwell so the full interval begins from now.
  function next() {
    activeIdx.value = (activeIdx.value + 1) % Math.max(1, dashCount())
    startTimer()
  }

  function prev() {
    const count = Math.max(1, dashCount())
    activeIdx.value = (activeIdx.value - 1 + count) % count
    startTimer()
  }

  function goTo(idx: number) {
    activeIdx.value = Math.max(0, Math.min(idx, Math.max(0, dashCount() - 1)))
    startTimer()
  }

  // Called by index.vue when entering edit mode. Separate from userPaused so
  // exiting edit mode cannot override a deliberate user pause.
  function enterEdit() {
    editPaused.value = true
    stopTimer()
  }

  function exitEdit() {
    editPaused.value = false
    if (!userPaused.value) startTimer()
  }

  // The screen shown on the board — driven by activeIdx (the display cursor),
  // not by settings.activeDashboardId (which is the editor's target).
  const screen = computed<Screen | null>(() => {
    if (!settings.value) return null
    return settings.value.dashboards[activeIdx.value]?.screen ?? null
  })

  // ── Fetch settings on mount ─────────────────────────────────────────────────
  onMounted(async () => {
    try {
      const s = await $fetch<Settings>('/api/settings')
      settings.value = s
      // Seed rotation position to activeDashboardId so the first displayed
      // dashboard matches what the user last saved.
      const startIdx = s.dashboards.findIndex(d => d.id === s.activeDashboardId)
      activeIdx.value = Math.max(0, startIdx)
      startTimer()
    } catch (e) {
      console.error('[useBoard] settings fetch failed', e)
      settings.value = defaultSettings
      startTimer()
    }
  })

  // ── SSE stream ──────────────────────────────────────────────────────────────
  onMounted(() => {
    const es = new EventSource('/api/stream')

    // Unnamed events: snapshot data. NEVER touches rotTimer.
    es.onmessage = (e: MessageEvent) => {
      try {
        const incoming = JSON.parse(e.data as string) as Snapshot
        prevSnap.value = snap.value
        snap.value = incoming
      } catch {
        console.warn('[useBoard] bad SSE frame', e.data)
      }
    }

    es.onerror = () => {
      console.warn('[useBoard] SSE error — browser will reconnect automatically')
    }

    // Named 'settings' events: layout + rotation config. Clamps activeIdx if
    // dashboards were removed; restarts timer if rotation config changed.
    // Does NOT reset activeIdx to the stored activeDashboardId — that would
    // interrupt mid-rotation on every save from another tab.
    es.addEventListener('settings', (e: MessageEvent) => {
      try {
        const incoming = JSON.parse(e.data as string) as Settings
        settings.value = incoming
        // Only clamp — never jump forward on a settings echo.
        const count = incoming.dashboards.length
        if (activeIdx.value >= count) activeIdx.value = Math.max(0, count - 1)
        // Restart timer in case rotation.seconds or mode changed.
        if (!paused.value) startTimer()
      } catch {
        console.warn('[useBoard] bad settings SSE frame', e.data)
      }
    })

    onUnmounted(() => {
      es.close()
      stopTimer()
    })
  })

  // ── DEV-ONLY: ?demo=overtake ────────────────────────────────────────────────
  if (import.meta.dev) {
    onMounted(() => {
      if (new URLSearchParams(window.location.search).get('demo') !== 'overtake') return

      const stop = watch(snap, (s) => {
        if (!s) return
        stop()

        const fake = JSON.parse(JSON.stringify(s)) as Snapshot
        if (fake.aggregates.owner) {
          for (const key of Object.keys(fake.aggregates.owner)) {
            const rows = fake.aggregates.owner[key as keyof typeof fake.aggregates.owner]
            if (Array.isArray(rows) && rows.length >= 2) {
              const tmp = rows[0]!; rows[0] = rows[1]!; rows[1] = tmp
            }
          }
        }
        prevSnap.value = fake
        console.info('[demo] overtake injected — prevSnap rows[0]↔[1] swapped')
      })
    })
  }

  return {
    settings,
    screen,
    snap,
    prevSnap,
    activeIdx: readonly(activeIdx) as Readonly<Ref<number>>,
    paused,
    togglePause,
    next,
    prev,
    goTo,
    enterEdit,
    exitEdit,
  }
}
