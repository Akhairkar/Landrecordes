# Keyword research sheet

`keywords.csv` lists the search intents this site targets, one target URL each. Rules:
- **No invented search volumes.** Evidence is only: Search Console data (old BhumiRecord export and the new property), observed competitor coverage, and official service demand. When GSC data for the new property grows (from Nov 2026), add clicks, impressions, CTR and position columns from exports. Don't use estimates.
- One primary intent per URL. Before writing a new page, check this sheet and the existing pages for the same intent.
- Monthly review per BUILD_RULES F4: pages with >100 impressions and CTR <1% get a title/snippet test; pages with impressions but position >20 get content and link work. Record results in `docs/seo/reviews/YYYY-MM.md`.
- Google Trends and autocomplete could not be queried from the build environment. Add them manually as evidence when checked from a browser.
