---
name: whosdaleader-design
description: Use this skill to generate well-branded interfaces and assets for Whosdaleader, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation
- **What it is:** Whosdaleader — live sales leaderboards/contests on Linux & Raspberry Pi wall displays. Competitive, gamified, candy-bright, **dark-first**, big bold numbers.
- **Global CSS:** link `styles.css` (it `@import`s all tokens + fonts). Author against semantic tokens (`--surface-card`, `--up`, `--down`, `--rank-1`, `--text-strong`).
- **Components:** load `_ds_bundle.js`, read from `window.WhosdaleaderDesignSystem_012310` (`Button`, `IconButton`, `Badge`, `Avatar`, `Card`, `Switch`, `RankBadge`, `StatDelta`, `ProgressBar`, `MetricTile`, `LeaderRow`).
- **The one rule you can't break:** up = mint-green + ▲, down = coral-red + ▼, flat = muted + —. Podium = gold/silver/bronze. Don't repurpose these colors decoratively.
- **Type:** Bricolage Grotesque (display 800), Hanken Grotesk (body), Space Grotesk (tabular numbers).
- **Fonts** load via Google Fonts CDN (see `tokens/fonts.css`).
- **Icons:** Lucide (CDN), passed as nodes into components. Direction uses ▲▼— glyphs, not icons. No emoji.

## Files
- `readme.md` — full brand guide (content + visual foundations, iconography, manifest).
- `tokens/` — colors, typography, spacing, effects, fonts.
- `components/` — core + leaderboard React primitives (each with `.d.ts` + `.prompt.md`).
- `ui_kits/leaderboard/` — the Live Wall Display product (flagship recreation).
- `guidelines/` — foundation specimen cards.
- `assets/emblem.svg` — logo mark.
