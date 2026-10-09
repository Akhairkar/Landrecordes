# Milestone report — Slice 1 (build system, tools #1–#3, homepage v1)

Date: 2026-10-09 · Status: **built, all pages `draft`** (owner review of Hindi copy pending; indexing off)

## Scope delivered
- M3a: static generator `scripts/build.mjs` with BUILD_RULES §A gates (source, SEO metadata, thin/duplicate trigram Jaccard, internal links, sitemap/robots control); CI workflow; deploy workflow builds `dist/`.
- M3b: tools — land unit converter, plot-area calculator (rectangle, triangle ×2, quadrilateral via diagonal, coordinate polygon with self-intersection check, custom length unit), partition (batwara) calculator (equal / user shares; shares must total 100%).
- M3c (v1): tool-led homepage replacing the hand-written noindex homepage; shell navigation now links only to existing pages (Tools, Sources, About); earth-tone palette; light is the default theme, dark via toggle.
- Support pages: tools hub, about, sources, disclaimer.

## Gates run
- `node --test tests/*.test.mjs` — 15 tests pass (unit factors, parsing, geometry, partition arithmetic).
- `node scripts/build.mjs` — 8 pages, all gates pass.
- Browser end-to-end (Chromium, 390 px and 1280 px): 15 checks pass — homepage/nav links resolve, rectangle/triangle/bow-tie/polygon/custom-unit results, URL state restore, share-sum validation, equal split, converter regression; no console errors; no sideways scroll.

## Known gaps / not done
- Record-finder wizard (T4), terminology translator, checklist and template tools — not built: official portal URLs could not be verified from this environment.
- No regional presets for bigha/biswa/katha/dhur by design (no verified source); user supplies the value.
- No site search page yet (removed from the shell until it exists).
- Hindi copy is AI-drafted and needs human review before `status: published` (BUILD_RULES §C2).
- Not yet done: Lighthouse/axe automated runs, hi/en toggle review of page body copy, redirect map for BhumiRecord URLs (needs domain decision).
- GitHub Pages cannot send 301s; see MASTER_PLAN §7.
