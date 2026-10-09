# Milestone report — 8 more states + quality automation

Date: 2026-10-09 · Status: built; all pages still `draft`, indexing off.

## Delivered
- **States 12 → 20:** Karnataka, Telangana, Andhra Pradesh, Tamil Nadu, West Bengal, Odisha, Chhattisgarh, Jharkhand (portal, address confidence, local terms, steps, cautions, FAQ, sources). Telangana's Bhu Bharati (replaced Dharani per news reports) has **no URL** because no source confirmed the official domain. No fees are stated.
- **Glossary and record-finder** extended to 20 states; mutation record page updated.
- **Accessibility gate (axe-core)**: all 50 pages, light and dark, 390 px — zero violations after fixing heading order, an empty table header, keyboard access for scrollable tables and unique landmark labels. Added to CI.
- **Official-link checker**: weekly workflow + `--write` mode; results stored in `data/link-status.json` and shown on state pages. First run (from the build sandbox): reachable (HTTP 200) — UP, Maharashtra, Bihar, Punjab, Delhi (`dlrc.delhi.gov.in`); Rajasthan root address returned 404; `himbhoomi.nic.in` and `bhulekh.odisha.gov.in` did not resolve; most other government hosts returned 503/401/403 (likely IP blocking) — treated as "check manually".
- Thin/duplicate gate worked as intended: it rejected near-duplicate MP/CG pages and boilerplate-heavy state pages; fixed by adding genuine per-state content (CG history, labelled hypothetical examples) and trimming shared text, not by renaming.

## Still open
- 16 states/UTs not covered; maps hub, price tool, district pages deferred.
- Portal addresses not live-verified for ~half the states (see link status).
- Hindi copy needs human review before `published`.
- Lighthouse performance run; launch wiring (domain, redirects, indexing switch).
