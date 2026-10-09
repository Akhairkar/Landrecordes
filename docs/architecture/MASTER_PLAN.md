# LandRecord — Master Plan v1 (rebuild from zero)

Status: **proposal for owner approval** · Date: 2026-10-09
Inputs: `docs/seo/RESEARCH_2026-10.md`, `README.md`, `RULEBOOK.md`, `docs/BUILD_RULES.md`.
Authority order: RULEBOOK > BUILD_RULES > this plan. Where this plan sequences work differently from the README roadmap (§3), the owner's approval of this plan is the intentional documentation update the Rulebook §37 requires.

## 1. Strategy in one paragraph

LandRecord = **tools first, guidance second, records as a navigator**. The old site's only proven demand is the Hindi/Hinglish land-measurement calculator (53% of impressions, page-1 positions, CTR <1%). We rebuild around a suite of correct, fast, mobile-first tools; wrap them with a state-aware record navigator (Rule Engine) and a small number of deeply useful state/record/problem pages; and refuse to scale URL count until each page type passes automated uniqueness gates. No API in phase 1 (owner decision); structure data so APIs plug in later.

## 2. Target and honest math

Goal: 1,000,000 visits/month. Not guaranteed; these are planning hypotheses to be corrected by real GSC data each month.

| Stage | Horizon | Monthly organic visits (hypothesis) | What must be true |
|---|---|---|---|
| S0 | now | ~2k (current ≈ 60–70 clicks/mo at 1.2% CTR) | — |
| S1 Launch slice | month 1–2 | 10k | Tool suite live, calculator CTR 0.8% → 4%+, old URLs preserved |
| S2 | month 3–6 | 50k | 10 priority states deep, 25 record pages, 30 problem guides, Hindi long-tail ranking |
| S3 | month 7–12 | 250k | All 36 state hubs verified, 15+ tools, Bhu-Aadhaar/DILRMP topical authority, brand + return users (PWA) |
| S4 | month 13–24 | 1M | Top ~150 districts with real local value, strong links/mentions, tools shared on WhatsApp/Telegram |

Lever arithmetic: 1M visits at a blended 4% CTR needs ~25M impressions/month. Today ≈ 5.6k/month-equivalent at 5,988/36 days → ~4,000× growth, which only comes from many distinct, useful pages ranking, not from a single page. That is why the plan has many *tools and problem guides*, not many *templated geography pages*.

Quick win available immediately: calculator at position ~7 with 3,167 impressions. Moving CTR from 0.79% to 4% ≈ +100 clicks per 36 days from that one URL.

## 3. Milestones (re-sequenced; README M1–M10 names kept)

| # | Milestone | Output | Done when |
|---|---|---|---|
| M1 ✅ | Design system | tokens | exists |
| M2 ✅ | Global shell | header/nav/theme/lang | exists — extend with bottom nav + search launcher |
| **M3a** | **Build system + data layer + quality gates** | static generator, `data/*.json` schemas, CI checks (BUILD_RULES §A) | CI fails on missing source/duplicate/thin/broken link |
| **M3b** | **Tool engine + Tool #1–#4** | unit converter, plot-area, partition, record-finder wizard | unit tests pass; mobile Lighthouse ≥ 95; tool pages shippable |
| M3c | Homepage v1 | README §Homepage sequence, tool-led | replaces card wall |
| M4 | Record & terminology pages (≈25 canonical) | one page per concept; state-term mapping tables | passes page-quality gate |
| M5 | Rule Engine v1 | deterministic JSON rules → record-finder, problem solver | every output traceable to a rule id + source |
| M6 | State hubs: 10 priority → 36 | verified portal, terms, units, offices | each hub has ≥3 verified facts that differ from siblings |
| M7 | Tools wave 2 + map tool | tools #5–#12, map-draw area tool | see §5 |
| M8 | Problem/solution guides (≈40) | mutation, correction, encroachment, boundary, Bhu-Aadhaar | each cites sources |
| **M-Mig** | **Migration** (runs before public launch) | URL map old→new, canonicals/redirects | §7 |
| M9 | District depth (≈top 100–150 only, evidence-gated) | pages with real local data | gate §A4 passes; never bulk |
| M10 | Admin, link-health, launch audit | GSC launch | Rulebook §34 checklist |

Each milestone: define scope → build → run gates → mobile+desktop screenshots → separate commit → owner review.

## 4. Information architecture (matches Rulebook structure)

```
/                       homepage (tool-led, smart search)
/tools/                 hub  → /tools/<tool>/
/records/               hub  → /records/<concept>/   (khasra, khatauni, jamabandi, 7-12, 8a, ror, patta-chitta, adangal, khata, khewat, fard, property-card, bhu-aadhaar …)
/states/                hub  → /states/<state>/ → /states/<state>/<record-or-service>/ (only where it differs)
/guides/                problem-first guides
/maps/                  official-map discovery + map-draw tool
/forms/                 templates (application/complaint) — client-side generators
/districts/<s>/<d>/     deferred (M9, gated)
/about /sources /disclaimer /privacy /contact
```

Page budget for launch (S1): ≈ 1 home + 5 hubs + 6 tools + 10 priority state hubs + 12 records + 10 guides + legal ≈ **50 strong pages**, growing to ≈ 250–400 by S3. Not 1,000+.

Priority states (from GSC impressions + population): Delhi, Uttarakhand, Rajasthan, Uttar Pradesh, Punjab, J&K, Maharashtra, Haryana, Madhya Pradesh, Bihar; then Gujarat, Karnataka, Telangana, AP, Himachal, Ladakh.

## 5. Tool suite (client-side only, no API, works offline later via PWA)

| # | Tool | Why it wins | Notes / guard-rails |
|---|---|---|---|
| T1 | **Land unit converter, state-wise** (bigha, biswa, kachha/pakka, kanal, marla, gaj/sq yd, sq ft, guntha, cent/decimal, katha, dhur, ropani, acre, hectare) | competitors disagree; we show the *factor table per state with source*, plus range warning where the unit varies by district | factors live in `data/units.json` with source + reviewed date; unknown ⇒ ask user for local value |
| T2 | **Plot area from measurements** (rectangle, triangle, quadrilateral, irregular via diagonals/coordinates, kadi-jarib chain method) with diagrams | answers "jamin napne ka formula" fully | show formula steps; output in chosen local unit |
| T3 | **Partition (batwara) calculator** — proportional split by shares | existing demand | arithmetic only; **no inheritance/legal outcome claims** |
| T4 | **Record finder wizard** (Rule Engine front-end) | "what do I have → which portal/option" | no scraping/API; links to official portals |
| T5 | Terminology translator (khatauni↔jamabandi↔RoR↔7/12↔pahani↔adangal) | also seeds record pages | searchable table |
| T6 | Document checklist builder + print/PDF (mutation, registry prep, loan, conversion) | high-intent | jurisdiction-labelled; verified lists only |
| T7 | Application/complaint template generator (illegal possession, mutation, name correction) | matches GSC query cluster | "template, not legal advice"; sections cited only if verified |
| T8 | Price per unit / total cost calculator | simple, shareable | user-entered numbers only |
| T9 | **Map-draw area tool** (draw polygon → area in local units) | strong differentiator | clearly "approximate, not cadastral"; map lib lazy-loaded; **tile provider with permitted production use** (OSM public tiles restrict heavy use — decide provider) |
| T10 | Official portal directory with last-checked date + weekly link check | freshness/trust | GitHub Action |
| T11 | Bhu-Aadhaar (ULPIN) explainer + "where to find it" | timely topic | verify vs dolr.gov.in before publish; no validator unless format is documented |
| T12 | Dispute pathway navigator (decision tree) | problem-intent | educational; state-labelled |

Every tool: shareable URL state (WhatsApp/Telegram friendly), Hindi default input labels, copy/print, accessible, unit-tested with known vectors, shows formula + assumptions, and carries a "not for registry / legal use; verify with revenue records" notice.

## 6. Design & UX direction (benchmark-derived, within the existing design system)

- Mobile-first (92% of impressions). Sticky bottom bar: Tools · Records · States · Search · हिं/EN. Header keeps theme/lang.
- Search = command palette: matches terms, states, tools, natural language ("khasra kaise nikale up"); Hinglish + Devanagari aliases.
- Tool pages: tool above the fold, short answer under it, then explanation, FAQ, related tools. No ad-style clutter.
- Typography: system stack with Devanagari fallback; 16 px+ body; 44 px targets (already in tokens).
- Budgets: LCP < 2.0 s on mid Android/4G; CLS < 0.05; INP < 200 ms; HTML ≤ 40 KB gz for content pages; JS ≤ 30 KB gz content / ≤ 90 KB gz tool pages; map lib only on map tool.
- Titles/snippets written for **CTR**: answer + differentiator, e.g. "जमीन नापने का कैलकुलेटर — बीघा, बिस्वा, एकड़ (राज्य अनुसार सही माप)". A/B by sequential iteration using GSC, one change at a time.

## 7. Migration & GSC protection (critical)

Facts: GSC property is `akhairkar.github.io/BhumiRecord/`; new repo is at `/Landrecordes/`. GitHub Pages cannot issue 301s; GSC *Change of Address* is unavailable for URL-prefix `github.io` properties.

Plan:
1. **Do not touch or de-index BhumiRecord until the new site is launch-ready.** Keep Landrecordes `noindex` (Rulebook §26).
2. **Decision needed from owner — own domain** (recommended, ~₹800–1,000/yr for a `.in`): required for long-term brand, AdSense eligibility, redirects and Search Console domain property. Host on Cloudflare Pages (free; `_redirects`, headers, CDN) or keep GitHub Pages + custom domain.
3. URL map `data/redirects.json`: every BhumiRecord URL with impressions (≈ top 20) → closest new URL (calculator → `/tools/land-unit-converter/`, state pages → `/states/<state>/`, forms → `/forms/`, …). Keep ranking pages' intent intact.
4. At launch: on BhumiRecord add `rel=canonical` + instant `meta refresh` to the new URL for mapped pages (Google treats instant meta refresh as a redirect); if the new site is on a new domain, add the new Search Console domain property, submit the new sitemap, and keep the old property to watch the transition.
5. The 794 templated district pages: **do not carry over.** After launch, set them to `noindex` (or canonical to their state hub) rather than leaving them; keep nothing that cannot pass the §A4 gate. Ones with impressions (e.g. Mumbai City) are rebuilt properly only if the evidence-gated district process approves.
6. Monitor weekly: indexed pages, impressions of mapped URLs, CTR of calculator.

## 8. Content & data governance

- All facts come from `data/*.json` with `source_url`, `source_org`, `jurisdiction`, `reviewed_on`, `next_review`. Build fails if a rendered fact has no source.
- Writing: Hindi-first plain language with English technical term in brackets; human-reviewed; AI-assisted drafting allowed only with the BUILD_RULES §C checklist; named reviewer + date shown.
- Never present state rules as national; never invent fees, areas or forms.
- Content refresh cadence: portal links weekly (automated), state hubs quarterly, news-sensitive topics (DILRMP 3.0/Bhu-Aadhaar) monthly.

## 9. Monetisation & growth (later, not in S1)

- S1–S2: zero ads, build trust and traffic. S3+: AdSense (own domain, policy pages live), no ad above tool result, reserved slots to protect CLS. Paid assisted services stay deferred per README.
- Distribution: share buttons on tool results (WhatsApp/Telegram), a Telegram channel for portal-change alerts, PWA install prompt after repeated tool use, short YouTube/Shorts demos of tools (owner decision).
- Links: tools are linkable assets — outreach to CSC/Lokvani operators, agri blogs, Hindi news explainers.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Unit factors wrong/contested | per-state sourced table, ranges flagged, tests, "verify locally" notice |
| Thin/duplicate flagging | automated similarity + unique-content gates, tiny page budget |
| Losing current rankings | URL map + canonical/meta-refresh, no early noindex of old site |
| Legal-advice exposure | templates + disclaimers, no outcome claims, cite sources |
| Government-portal changes | weekly link check, reviewed-dates, banner on failure |
| Scope creep | one milestone at a time, owner sign-off per milestone |

## 11. Owner decisions needed (blocking where marked)

1. **Domain** (blocking for S1 launch, not for build): buy a `.in`/`.com`? Suggested brand names to check: LandRecord, BhumiGuide, ZameenSetu — availability not yet checked.
2. Approve re-sequencing in §3 (tools before records/states).
3. Hosting: GitHub Pages (as today) vs Cloudflare Pages (recommended).
4. Map tile provider for T9 (free-tier OSM-based vs MapTiler/others).
5. Analytics: GSC only vs add privacy-friendly analytics (Cloudflare Web Analytics recommended).
6. Fate of old `schemes/` content (KCC, Kisan Kalyan…): off-core; propose archive, not migrate.
