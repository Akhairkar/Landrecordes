# Competitor and growth plan — LandRecord

Reviewed: 2026-10-14. This is a qualitative SERP/product review, not a paid traffic or keyword-volume report. Do not infer competitor traffic or rankings from these observations.

## Competitor groups and gaps

| Group | Examples | What they do well | Opportunity for LandRecord |
|---|---|---|---|
| Official portals | Maharashtra Mahabhumi/Mahabhulekh; state Bhulekh and cadastral map portals | Authoritative records and official applications | Explain which record/service to choose, clarify view-only vs digitally signed copy, then send the user directly to the official source. |
| Finance/property publishers | Bajaj Finserv, BankBazaar, Housing.com and property guides | Established domains and broad explanatory content | Add Hindi-first instructions, source/review dates, state terminology, practical tools, error troubleshooting and clear limits. |
| Independent land-record directories | Bhulekh India, Bhu Naksha-oriented guides | State directories, FAQs and portal discovery | Avoid name-swapped thin pages; verify local details, provide a helpful next action and maintain reliable internal links. |

Reference pages:
- https://bhulekhindia.in/
- https://bhunakshaa.com/
- https://www.bajajfinserv.in/
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/essentials
- https://support.google.com/adsense/answer/9724
- https://support.google.com/adsense/answer/10502938

## Positioning

1. **Official-link clarity:** show the correct state/district government destination, state what the portal can do, and label uncertain or conflicting URLs instead of guessing.
2. **Hindi + English:** explain local terms such as 7/12, 8-A, CTS/property card, khasra/gata, khatauni, jamabandi and mutation.
3. **Actionable pages:** each guide should answer the question, show the next steps, include verified official links, explain common failure cases, and point to a related calculator or record guide.
4. **Trust:** visible review date, cited sources, independent-site disclaimer, privacy/contact pages and no invented fees, phone numbers, reviews or traffic figures.
5. **Useful tools:** unit converter with user-supplied local factors, plot-area calculator, partition arithmetic, checklist and record-finder. Explain assumptions and legal limits.

## Local SEO roadmap (quality before quantity)

Start with Maharashtra/Nagpur because the official district directory exposes distinct services and office contacts:
- Nagpur land records: rural 7/12/8-A vs urban property card/CTS.
- Nagpur land measurement: link only through the official district service page; recheck the destination because the directory may include a non-HTTPS legacy endpoint.
- Nagpur legal-heir mutation and office-contact discovery.
- Later local pages only when at least three verifiable local facts differ from the parent and sibling pages (office, official service route, local terminology/unit practice, helpline or official district instructions).

Do **not** mass-create city, tehsil or village pages by replacing place names. The build rules require real local value and a uniqueness gate. No search volume is claimed without a reliable keyword source.

## AdSense readiness (not an application)

- No ad boxes, ad code, auto ads or placeholder ad containers until explicitly requested.
- Keep the privacy policy accurate now; when advertising/analytics are actually added, update it to disclose third-party cookies, identifiers, data use and the relevant consent requirements before serving ads.
- Keep About, Contact/feedback route, Privacy, Disclaimer, source citations, working navigation and substantial original content.
- Prioritize an owned custom domain before the application; GitHub Pages shared-subdomain hosting is a known constraint in the existing migration plan.
- Review the current AdSense policies at application time. Approval is not guaranteed by a checklist or by adding schema.
- Do not enable indexing or publish the sitemap until the site's launch approval; current build must remain noindex/nofollow.

## Milestones

1. Fix shared internal discovery and structured-data coverage.
2. Publish a small number of sourced local pages and improve existing core pages.
3. Use Search Console impressions, query/page CTR, crawl/index status and real user feedback to choose the next pages.
4. Expand only clusters that demonstrate demand and distinct utility. A million visits/day is a long-term ambition, not a forecast or guarantee.


## Batch 2 update — Pune local intent (2026-10-14)

Added a draft Pune district guide based on the district administration's official View Property Card service page. It provides the Mahabhulekh destination, district land-records office phone/address, rural 7/12 versus city-survey property-card guidance, eMojni route, FAQ content and links to calculators/record explainers/maps. The page remains draft and is not promoted into the sitemap; it needs editorial/owner launch approval.

Official local source: https://pune.gov.in/en/service/view-property-card/
Official measurement department source: https://emojni.mahabhumi.gov.in/citizensite/Contactus.aspx

The Pune page is intentionally not a mass-generated template. It contains verified Pune-specific office information and service links. Continue to add districts only when a meaningful local source and distinct next steps exist.


## Batch 3 update — state portal trust and quality gates (2026-10-15)

The state directory is a useful search-intent hub, but a portal URL alone is not enough. The next quality pass strengthens every generated state page with a Hindi/English safety note: users should confirm the destination through the official state/district website, never disclose OTPs/passwords to unknown agents, and use only fees/instructions published by the portal. This is practical fraud-prevention guidance, not a claim that every linked portal has the same login or fee flow.

Added regression checks for all 20 state entries: HTTPS primary destinations where a URL is supplied, bilingual introductions, actionable steps, cautions, FAQs, and at least one official reference. The generator also has a test asserting the safety note appears on every state page. This improves trust and catches thin or incomplete data before deployment.

**Next audit order:** (1) resolve entries explicitly marked conflicting/unconfirmed by checking state revenue-department or district-government sources; (2) validate any redirected or legacy domain manually before changing URLs; (3) update `data/states.json` only when the official evidence is clear. Automated HTTP failures are not proof that a government site is dead. Keep all pages draft/noindex until owner approval.
