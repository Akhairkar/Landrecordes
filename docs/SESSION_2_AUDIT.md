# Session 2 — State and district land-record content audit

Date: 2026-10-15
Scope: state portal trust labels and district/record cross-link review.

## Finding addressed

The generated state pages previously used the heading “Official portal” for every state, even where the data explicitly marked the URL as conflicting, single-source, or unconfirmed. A confidence badge existed, but the heading could still imply a level of verification the data did not support.

## Change made

- State pages with conflicting, single-source, or unconfirmed portal addresses now use a “Verify the portal address” heading in Hindi and English.
- Those pages show an explicit safety note before the outbound portal link, telling users to confirm the domain through the state/district administration and not to submit OTPs, documents, or payments until confirmed.
- State pages whose data is marked official-document or multi-source retain the “Official portal” heading and their existing confidence note.
- Added a regression test covering every state with an uncertain portal-address confidence label.

## Content/link review

- The state data includes state-specific record names, mutation terms, steps, cautions, bilingual FAQs, source references, and related links.
- Existing Nagpur and Pune district pages distinguish rural 7/12/8-A from city-survey property cards/CTS, and link to Maharashtra services and relevant record/tool pages.
- No state was silently promoted from uncertain to verified. No portal URL, page slug, title, description, canonical, H1, or hreflang was changed.
- All pages remain draft/noindex; sitemap publication rules are unchanged. No ad code or ad placeholders were added.

## Validation

- Run `npm test` and `npm run build` in CI; both must pass for this session.
- The weekly external-link checker can be blocked by government sites; an HTTP failure from CI is not proof that a portal is down.
- The first build exposed four existing state-page similarity failures because the new common safety note added repeated text. The note was shortened and the build must be rerun before this session is considered complete. Remaining content work: deeper source-by-source review of state portal addresses and richer state-specific district coverage, without generating thin location pages.
