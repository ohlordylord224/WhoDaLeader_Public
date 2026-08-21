# EDITIONS.md — Whodaleader Device & Cloud

Two editions, one codebase. This document has two parts with very different status:

- **Part A — Edition seams.** IN EFFECT NOW. Claude Code must follow this from Task 4 onwards. It changes *how* the device edition is built (interfaces at five seams), not *what* it does. BRIEF.md remains the device edition's spec.
- **Part B — Cloud edition brief.** GATED. Do not implement anything from Part B until the gate in B0 is passed. It exists so device-edition decisions never accidentally close the cloud door.

**The product rule that governs both:** identical features in both editions. Device (self-hosted, Pi) is free. Cloud charges for convenience — hosting, zero setup, automatic updates — never for capabilities. No feature may ever be cloud-only or device-only unless it is *inherent* to the edition (e.g. kiosk autostart is inherently device; share-links are inherently cloud).

---

## Part A — Edition seams (in effect now)

The editions differ in exactly five places. Each gets an interface; the device edition ships the simple implementation. Core code (poller, HubSpot client, widgets, layout engine) must depend only on the interfaces.

### A1. Storage seam

```ts
// server/utils/storage.ts — the ONLY module that touches a database
export interface Storage {
  saveSnapshot(s: Snapshot): void | Promise<void>
  latestSnapshot(): Snapshot | null | Promise<Snapshot | null>
  getSettings(): Record<string, unknown> | Promise<Record<string, unknown>>
  putSettings(patch: Record<string, unknown>): void | Promise<void>
}
export const storage: Storage = createSqliteStorage()   // device edition
```

All callers `import { storage }` and await results (works for both sync SQLite and async Postgres later). No `better-sqlite3` import may appear outside the SQLite implementation file. Cloud later swaps in `createSupabaseStorage(tenantId)` without touching callers.

### A2. Credentials seam

```ts
// server/utils/credentials.ts — the ONLY module that knows where tokens live
export interface Credentials { getHubspotToken(): string | Promise<string> }
export const credentials: Credentials = { getHubspotToken: () => process.env.HUBSPOT_TOKEN! }
```

`hubspot.ts` calls `credentials.getHubspotToken()` per request — never `process.env` directly. (Cloud later: per-tenant lookup + OAuth refresh behind the same call.)

### A3. Poller purity

`buildSnapshot(ctx)` takes a context object `{ config, credentials, periodBounds }` as input and returns a Snapshot. It reads NO globals, NO env vars, holds NO module-level state except caches keyed by context. Reason: cloud runs this same function once per tenant in a loop. The device edition calls it with its single context.

### A4. Config centralisation

Exactly one module (`config/leaderboard.ts` + a small `server/utils/env.ts`) reads `process.env`. Everything else imports typed config. Scattered env reads are the #1 thing that makes multi-tenant retrofits painful.

### A5. Display addressing

The dashboard page must not assume it is the only screen or that it lives at `/`. Concretely: the SSE client connects to a relative API path, and screen identity (which Screen config to render) comes from one resolvable input with a default — device: the default screen; cloud later: a share-token route `/tv/:token`. Cheap now, structural later.

**Acceptance addition for Tasks 4–6:** code review confirms no `better-sqlite3`, `process.env`, or token access outside the designated modules. Add to the per-task kickoffs.

---

## Part B — Cloud edition brief (GATED — do not build yet)

### B0. The gate

Cloud work starts only when ALL of:
1. Device edition has run on the wall in production for ≥2 weeks with real HubSpot data.
2. Public/open-source release shipped (docs task complete) — the free edition IS the marketing.
3. Evidence of demand: meaningful installs/stars/inbound asking "can you host this for me?" — that question, asked unprompted, is the green light.

Until then, Part B's only job is to keep Part A honest.

### B1. Stack (deliberately the ScubaID stack — zero new tools)

- **App:** the same Nuxt 4 codebase, cloud entry. Deployed to a long-running Node host (Railway / Fly / Render — NOT Vercel: persistent poller + SSE).
- **DB + auth:** Supabase (Postgres, RLS, Supabase Auth for workspace users). New dedicated Supabase project — never shared with ScubaID/Nautiq.
- **Billing:** Stripe subscriptions (flat per-workspace price — pricing TBD, deliberately deferred).
- **Email:** Brevo (transactional: magic links, alerts).

### B2. Tenancy model

```
workspaces            (id, name, created_at, plan, stripe_customer_id)
workspace_members     (workspace_id, user_id, role)
hubspot_connections   (workspace_id, token_encrypted, token_type 'private_app'|'oauth',
                       refresh_token_encrypted?, portal_id, scopes, status)
screens               (id, workspace_id, name, config jsonb, share_token unique)
settings              (workspace_id, key, value jsonb)
snapshots             (workspace_id, generated_at, data jsonb)  -- latest + small history
```

Tokens encrypted at rest (libsodium sealed box or pgsodium); decryption key only in app env. RLS on every table by workspace membership. `share_token` rows are readable via a dedicated public endpoint only — never via general RLS.

### B3. Onboarding ladder (cuts the hardest work from v1)

- **Phase C1 — paste-a-token.** Workspace signup → paste a HubSpot Private App token (same scopes doc as device edition) → pick a screen → done. No OAuth at all. This is a legitimate early-stage onboarding and reuses the device docs verbatim.
- **Phase C2 — OAuth.** HubSpot public app: consent flow, access+refresh tokens, refresh handling, token health monitoring (`status` column → dashboard banner on auth failure). Marketplace listing optional, later.
- **Phase C3 — billing.** Stripe checkout + customer portal, trial, dunning. Free until this phase ships.

### B4. Scheduler

One worker loop: every minute, iterate active workspaces, call the shared `buildSnapshot(ctx)` with that tenant's context, persist, publish. Per-tenant rate limiting is automatic — each tenant's token carries its own HubSpot quota, so tenants never contend. Stagger tenant starts across the minute to smooth load. SSE fan-out per workspace channel (or Supabase Realtime on the snapshots table if SSE-at-scale gets annoying).

### B5. Display

- App users: authed dashboard at `/w/:workspace/screen/:id`.
- TVs: unauthenticated read-only `/tv/:share_token` — the cloud equivalent of the kiosk. Regenerable token revokes old links. This is the ScubaID public-profile-via-token pattern.

### B6. What cloud must NOT do

- No feature gating vs device edition (see product rule).
- No scraping/storing CRM records beyond the aggregate snapshot + ticker events — the privacy posture "we hold aggregates, not your CRM" is a selling point worth protecting.
- No per-seat pricing mechanics anywhere in the schema (no per-rep entitlements) — flat per-workspace is the positioning.

### B7. Build phases (when gated open)

C0 repo split-prep: extract shared core to `/core` (or workspace package) — mechanical thanks to Part A.
C1 tenancy + paste-a-token + TV links (the real MVP).
C2 OAuth.
C3 Stripe.
C4 polish: token health alerts, workspace member management, snapshot history/trends.

---

*Maintenance note: if a device-edition decision would violate a seam in Part A, stop and update this document first. The seams are the contract between the editions.*
