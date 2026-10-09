# Milestone report — full-site build (M4–M8 first pass)

Date: 2026-10-09 · Status: **built, all pages `draft`**, indexing off.

## Delivered
- **Records (8 + hub):** RoR, khasra number, khatauni, jamabandi/fard, 7/12 & 8-A, property card/CTS, mutation names, Bhu-Aadhaar.
- **States (12 + hub), data-driven:** UP, MH, RJ, MP, BR, GJ, HR, PB, DL, UK, HP, J&K — each with portal, address-confidence label, alternate domains, local terms, steps, cautions, FAQ and sources. No fees are stated anywhere.
- **Guides (6 + hub):** find khasra number, mutation pending, record correction, buying checklist, online vs certified copy, encroachment overview (no legal sections/deadlines).
- **Tools (7):** converter, plot area, partition, record finder (rule engine v1, explainable), terms glossary, purchase checklist (print), site search.
- **Site-wide:** disclaimer moved to footer; nav Records/States/Tools/Guides + search; privacy page; 404; related-links gate; search index with Hinglish keywords; homepage v2 (search, task cards, states, records, recently reviewed).
- **Research:** `docs/seo/SERP_ANALYSIS_2026-10.md` (who ranks for the GSC queries and what gap we fill).

## Gates / tests
- Build gates pass (43 pages incl. 404); unit tests 15/15.
- Browser crawl at 390 px: 42 pages return 200, one H1, no horizontal overflow, no console errors, footer disclaimer present and no top banner, light theme default. Tools verified: glossary, record finder (state/goal/have rules), search (Devanagari, Hinglish, "7/12"), checklist, home search.

## Known gaps
- Portal addresses were corroborated through search listings, not live-fetched (egress blocked); Uttarakhand's address is unconfirmed, Delhi/Rajasthan/Punjab/HP have conflicting sources — flagged on-page. CI link-check (non-blocking) is a follow-up.
- Hindi copy is AI-drafted; needs owner/human review before any page becomes `published`.
- 24 states/UTs not yet covered; maps hub, price-per-unit tool and district pages deferred (thin-content rule).
- No Lighthouse/axe run yet.
