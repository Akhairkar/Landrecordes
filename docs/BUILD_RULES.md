# LandRecord Build Rules (addendum to RULEBOOK.md)

Status: MANDATORY for the rebuild · Version 1.0 · 2026-10-09 · Approved by owner request ("rules pehle bana lo").
Authority: `RULEBOOK.md` > this file > `docs/architecture/MASTER_PLAN.md`. Nothing here weakens the Rulebook; conflicts are resolved in the Rulebook's favour.

## A. Quality gates (automated in CI; a failing gate blocks merge)

A1. **Source gate** — every factual claim rendered from data (portal URL, unit factor, fee, form, deadline) must come from `data/*.json` with `source_url`, `source_org`, `jurisdiction`, `reviewed_on`. Missing field ⇒ build error.
A2. **Link gate** — no broken internal links; official external links checked weekly; failing 14 days ⇒ page shows "link under review".
A3. **SEO gate** — unique `<title>` (≤ 60 chars) and meta description (120–160 chars), one `<h1>`, absolute canonical, `lang`, valid JSON-LD that matches visible content.
A4. **Thin/duplicate gate** — among pages of the same template: word-trigram Jaccard similarity < 0.35 and ≥ 400 words of *unique* visible text or a working tool. Evidence for the threshold: the old district pages measured 0.89. Pages failing the gate are `status: draft` and excluded from the sitemap.
A5. **Sitemap gate** — `sitemap.xml` generated only from `status: published` pages; never hand-edited.
A6. **Performance gate** — Lighthouse CI on mobile: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95; budgets in MASTER_PLAN §6.
A7. **Accessibility gate** — axe has no serious/critical issues; keyboard test per component.
A8. **Secret gate** — secret scanning on every push (Rulebook §24).

## B. Data & tool correctness

B1. Unit factors are data, never hard-coded in scripts. Each factor has a source; where a unit varies by district/community, store a range and require the user to confirm a local value.
B2. Every tool ships with unit tests using known vectors (e.g. 1 acre = 43,560 sq ft; 1 hectare = 2.4711 acres; 1 gaj = 9 sq ft) and edge cases (zero, negative, huge, locale decimal comma).
B3. Every tool shows its formula, assumptions, and "approximate — verify with revenue records; not for registry or legal use."
B4. Tools run entirely client-side, collect no personal data, send nothing to third parties, and keep state only in the URL fragment/query for sharing.
B5. No fees, stamp duties, circle rates, legal shares or deadlines are shown unless verified and sourced; otherwise link to the official calculator.
B6. Map tool results are labelled approximate and never styled as cadastral (Rulebook §7).

## C. Content

C1. Hindi-first plain language; English technical terms in brackets; no machine-translated filler (Rulebook §6).
C2. AI-assisted drafts are permitted only if a human checks each claim against the cited source and signs the page with reviewer + date. Unreviewed AI text may not be `published`.
C3. Each page records its purpose: user intent, unique value, primary source, parent hub, 2+ sibling links, 1+ tool link (`docs/content/page-register.md` row or front-matter).
C4. No copy from competitors or government sites beyond short attributed quotes; no government logos, seals or lookalike styling.
C5. No fake reviews, counters, testimonials, "X users served", or invented statistics.
C6. Legal topics: state named, source named, reviewed date visible, "educational information, not legal advice".

## D. Architecture & code

D1. Static output (HTML/CSS/JS). Generator may be used, but output must work without JS for reading content; tools may need JS.
D2. One shared shell, one design system, tokens only (Rulebook §31). No page-specific headers/footers/colour systems.
D3. No runtime dependency without written justification; pin exact versions; load only from our own origin or pinned, integrity-checked URLs; lazy-load heavy libraries (maps) only on the page that needs them.
D4. Images: AVIF/WebP with explicit dimensions; SVG for icons/diagrams; no layout shift.
D5. Cookies/analytics: none until the owner approves a privacy-friendly option; privacy page must match reality.
D6. Ads (later): never above the fold on tool pages, never between inputs and results, slots reserved to avoid CLS, only after policy pages are live.

## E. URLs, indexing and migration

E1. URLs lowercase, stable, human-readable; one canonical per intent; no language duplicates (Rulebook §6, README URL rules).
E2. Until launch approval: every page `noindex,nofollow` and absent from sitemap/robots allow-list (Rulebook §26).
E3. No old BhumiRecord URL with impressions is abandoned: each gets a mapped target in `data/redirects.json` before launch.
E4. Never bulk-generate geographic pages. A district/tehsil page needs ≥ 3 verified local facts that differ from its parent and sibling pages (offices, local portal differences, local unit practice, circle-rate source, helpline) and passes A4.
E5. Page-budget guard: CI prints published-page count by type; adding >30 pages of one type in a single PR requires owner approval.

## F. Process

F1. Read README, RULEBOOK, this file and the relevant docs before any change (Rulebook §0).
F2. One concern per commit; Rulebook/BUILD_RULES changes in their own commits.
F3. Each milestone ends with a short report in `docs/milestones/<id>.md`: scope, gates run, screenshots (mobile + desktop, light + dark, hi + en), known gaps.
F4. Monthly SEO review (from GSC): list pages with >100 impressions and CTR <1% → rewrite title/snippet one variable at a time; list pages with impressions but position >20 → improve content/links; record results in `docs/seo/reviews/YYYY-MM.md`.
F5. Never remove working functionality without owner approval; deprecate with redirect.
F6. Secrets never in Git; any server-side credential lives in the host's secret store.

## G. Definition of done for a page

Intent defined · unique value documented · sources + reviewed date · Hindi+English · tools/related links · map/jurisdiction context · schema matches visible content · gates A1–A8 green · mobile and desktop checked · owner-visible diff reviewed.
