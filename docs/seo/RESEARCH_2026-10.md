# Research — GSC audit, current-site audit, competitor landscape

Date: 2026-10-09 · Status: input to `docs/architecture/MASTER_PLAN.md`
Scope note: this is a planning benchmark. No competitor traffic figures are claimed (no paid SEO tool was available). Search-volume numbers are deliberately not invented (Rulebook §9).

## 1. What Google Search Console shows (property: `akhairkar.github.io/BhumiRecord/`, 1 Sep – 6 Oct 2026)

| Metric | Value |
|---|---|
| Clicks / Impressions / CTR | 73 / 5,988 / 1.22% |
| Impressions, last 7 days | 2,130 (clicks 19) — impressions jumped from ~50–200/day to 590–623/day on 5–6 Oct |
| Country | India = 98% of impressions |
| Device | Mobile = 92% of impressions (desktop avg. position 17.6, mobile 7.2) |
| Avg. position | 7–10 for most days (page 1) — **ranking is not the problem, clicks are** |

Top pages (impressions → clicks):
- `land-calculator.html` 3,167 → 25 (pos 6.9, CTR 0.79%) — **53% of all impressions**
- `states/delhi` 536 → 12 · `states/uttarakhand` 449 → 12 · `states/rajasthan` 294 → 11 · `forms.html` 233 → 4
- `illegal-possession-remedies.html` 555 → 1 (CTR 0.18%) · `states/punjab` 189 · `states/jammu-and-kashmir` 168 · `districts/maharashtra/mumbai-city` 61 (pos 19)

Query intent (only ~348 of 5,988 impressions are attributed to named queries — Google hides the rest, so treat as directional):
- ~64% of named-query impressions are **portal-name / "state + bhulekh/khatauni/khasra" queries** (devbhoomi, dlrc delhi, bhulekh delhi, apan katha, himbhoomi). Here the official portal holds #1, we sit at pos 25–50 with ~0% CTR. Low-value to chase directly.
- ~12% are **calculator / unit queries** in Hindi and Hinglish ("जमीन नापने का फार्मूला", "jamin napne ka calculator", "रकबा से एकड़"). These already rank pos 1–11 for many variants. This is the proven wedge.
- A small cluster is **problem/legal intent** ("निजी जमीन पर अवैध कब्जा application", dharaa) — high intent, low CTR.

Conclusions:
1. The calculator/tool is the traffic engine; it needs a better title/snippet, richer tool UX and many sibling tools.
2. Impressions are ramping (Google is testing the site). A rebuild must **not break or de-index the URLs that are ranking** — see migration in the Master Plan.
3. Hindi/Hinglish mobile users dominate. Mobile-first Hindi UX is the product, not an add-on.

## 2. Audit of the existing site (repo `Akhairkar/BhumiRecord`)

- 1,082 files, ~112 MB, 1,067 sitemap URLs: home, 36 state pages, **794 district pages**, calculator, forms, schemes, remedies guides.
- Measured with a script on the shipped HTML: district pages are ~3,000 visible words (not the "16–18k" claimed in `pending.md`). Two districts of the same state share **~89% of word-trigrams**; districts of different states ~2%. So per-state district sets are essentially one template with names swapped.
- This is exactly what Google's *scaled content abuse* spam policy targets (template + variable substitution at volume, regardless of how it was produced) and what this repo's Rulebook forbids ("THIN / DUPLICATE PAGE PREVENTION"). Secondary sources report programmatic sites losing trust that is slow to recover; Google publishes no page-count threshold. Risk is real even though nothing has been penalised yet.
- Positives to keep: the state-hub idea, the 4-mode calculator (converter / field / partition / registry), forms, schemes content as raw material, all-India coverage intent.
- Negatives: ~108–137 KB HTML per page, no AdSense or analytics set up, URL on a shared `github.io` subdomain (no server-side redirects, no own-domain reputation, generally not accepted by AdSense).

## 3. Competitor landscape (SERP-level, from live searches on 2026-10-09)

| Cluster | Examples seen | Strength | Weakness we can exploit |
|---|---|---|---|
| Official state portals | UP Bhulekh, Mahabhulekh, MP Bhulekh, Apna Khata, Meebhoomi, AnyRoR, Bhoomi, Dharani, Himbhoomi, Devbhoomi, DLRC | Authoritative; own navigational queries | Fragmented, hard to navigate, English/jargon, captcha-heavy, no explanation of next steps |
| Finance/lender content | Bajaj Finserv/Housing, Tata Capital, Kotak, Groww, BankBazaar, GoDigit | High domain authority; rank for "bhulekh <state>" | Generic English-first guides, the same 5 steps per state, no tools, ads/loan funnels, often translated to Tamil/Malayalam but not written for Hindi-belt users |
| Property portals | Housing.com, Housiey | Real converters (bigha/biswa/acre) | **Numbers disagree** (bigha→acre: ~0.62 vs 0.16 UP vs 0.625 Rajasthan across sites). Single-factor converters; little state-wise sourcing |
| Explainer/exam blogs | StudyIQ, TechObserver, personal blogs | Fast on news (DILRMP 3.0, Bhu-Aadhaar) | Thin, secondary-sourced |
| Land-intelligence startups | BhuMe, LandSahi (Maharashtra-focused) | Aggregation, maps, risk checks | Narrow geography, commercial |
| Old private SEO sites | numerous "bhulekh" mirror/guide sites | Many URLs | Quality varies; many are template farms (our own old site included) |

Timely topic: **DILRMP 3.0 (2026–2031, ₹565.5 crore) and Bhu-Aadhaar/ULPIN** (14-character land-parcel ID; reports of 40+ crore parcels assigned by Aug 2026). Coverage so far is news-style; a plain-Hindi "what is my Bhu-Aadhaar and where do I find it" guide with official links is a fresh gap. These figures come from secondary sources and must be re-verified against dolr.gov.in/dilrmp.gov.in before publishing.

## 4. The gap (consistent with README "Product gap identified")

Nobody combines, in Hindi-first mobile UX:
1. **Correct, state-wise, sourced unit conversion** (the competitors disagree with each other).
2. **Measurement tools** beyond a converter — plot area from sides/kadi-jarib, partition, map-draw, cost-per-unit.
3. **Record-finder wizard** — "I have only the owner name / only a khasra number / only an old receipt" → which state portal, which option, which fields, what to do if "no record found".
4. **Terminology mapper** — khatauni = jamabandi = RoR = 7/12 = pahani = adangal = patta chitta, per state.
5. **Printable application/complaint templates** with correct section references and clear "not legal advice".
6. **Freshness** — verified official links with "last checked" dates and a link-health monitor.

## 5. Sources consulted
- Search results for state portal lists, Bhulekh UP khatauni steps, bigha/biswa conversions, DILRMP 3.0/Bhu-Aadhaar, scaled-content-abuse commentary (secondary sources: Groww, Bajaj Finserv, Tata Capital, BankBazaar, Housiey, Housing.com, StudyIQ, TechObserver, ppc.land, Search Engine commentary).
- GSC export `BhumiRecord Performance on Search 2026-10-09` supplied by the owner.
- Repo audit of `Akhairkar/BhumiRecord` (HEAD `56cb2c6`).
- Not done: crawl of competitor live pages (not reachable from this environment), paid keyword-volume data.
