// Debug/fallback GET — returns the latest stored snapshot as JSON.
// Useful for clients that cannot maintain SSE, and for curl-based verification.
// A1: storage access via interface only.

import { storage } from '../../utils/storage'

export default defineEventHandler(async () => {
  const snap = await storage.latestSnapshot()
  if (!snap) {
    throw createError({ statusCode: 503, statusMessage: 'No snapshot available yet — server may still be polling' })
  }
  return snap
})
