import { fileURLToPath } from 'node:url'

// Absolute path to the design system entry point so Vite resolves it correctly.
// styles.css is a pure @import manifest; it chains to tokens/*.css with relative
// paths — those relative imports follow the file on disk (no alias needed).
const designSystemCss = fileURLToPath(new URL('design/system/styles.css', import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Design system tokens + TV-scale wall stylesheet, applied globally.
  css: [
    designSystemCss,               // design/system/styles.css (absolute, Vite-safe)
    '~/assets/css/wall.css',       // TV-scale layer, authors against semantic tokens
    '~/assets/css/edit.css',       // edit-mode chrome (native-res overlay + canvas-scale pieces)
    '~/assets/css/rotation.css',   // rotation dots + controls (canvas-scale)
  ],

  nitro: {
    // better-sqlite3 is a native Node addon (.node file); it must not be
    // bundled by Rollup — keep it as a runtime require() in both dev and prod.
    externals: {
      external: ['better-sqlite3'],
    },
  },
})
