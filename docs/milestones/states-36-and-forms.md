# Milestone — all 36 states/UTs + application drafts tool

Date: 2026-10-25 · Status: published (indexable)

- Added 16 states/UTs: Kerala, Assam, Goa, Tripura, Ladakh, Chandigarh, Puducherry, Sikkim, Meghalaya, Manipur, Mizoram, Nagaland, Arunachal Pradesh, Andaman & Nicobar, Lakshadweep, Dadra & Nagar Haveli and Daman & Diu. Each has sourced portal data, Hindi + English content, cautions and FAQs.
- New confidence label `offline` for Meghalaya and Nagaland (sources say no public online portal). Manipur's "Loucha Pathap" has no URL because no source gave an official address.
- New tool `tools/application-templates/`: client-side drafts for mutation, record correction, certified copy, demarcation and encroachment complaint (Hindi/English). No legal sections; nothing saved or put in the URL.
- Checks: build gates (similarity gate forced genuine per-state examples for small states), 36 unit tests, SEO check (68 sitemap URLs, 0 problems), axe on 70 pages × light/dark × hi/en: 0 violations.
