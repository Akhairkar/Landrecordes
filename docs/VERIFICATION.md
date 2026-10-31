# Verification workflow (portals, maps, registration, district facts)

Status: adopted in batch 1 (2026-10-31). Authority: RULEBOOK > BUILD_RULES > this file.

## What counts as evidence
1. **Official document**: a government page, PDF, gazette or court judgment on a `gov.in` / `nic.in` domain that names the address or fact. Stored as a source with `kind: official`.
2. **Live official page**: the address was opened by a person or a browser-like check, and its page title or heading matches the service (for example "BhuNaksha", "Punjab Land Records"). Record the date in `verified.<field>` (or `map_checked`).
3. **Secondary sources**: private guides, news and bank blogs. They can corroborate a domain (`multi-source`) but never alone make a value "verified".

An automated HTTP failure (timeout, 403, 503, DNS error) is **not** evidence that a government site is down. Many state servers block cloud IPs. Failures stay in the CI report and are never shown as "closed" on the site.

## Who checks and where
- **Weekly:** `.github/workflows/links.yml` runs `check-links.mjs --write` from GitHub's network and commits `data/link-status.json`. State pages show only successful checks.
- **Manual:** the owner (phone) or an editor opens the address, confirms the title/heading, and records the date. Don't write link status from other cloud environments.
- **New fields** (`registration_url`, `documents`, `helpdesk`, `signed_copy`) are filled only with evidence of type 1 or 2. Otherwise they stay empty and the site shows nothing, or says "not yet verified".

## Confidence labels (stored key → meaning → master-plan name)

| Stored key | Shown (hi / en) | Master-plan level |
|---|---|---|
| `official-doc` | सरकारी दस्तावेज़ में / In a govt document | Official Document Confirmed |
| `multi-source` | कई स्रोत / Several sources | (between Single Official Source and Verified; add a live-check date for "Verified Official Source") |
| `single-source` | एक स्रोत / One source | Single Source |
| `conflicting` | पते अलग-अलग / Addresses differ | Conflicting Information |
| `unconfirmed` | पुष्टि जारी / Unconfirmed | Unconfirmed |
| `offline` | सिर्फ ऑफ़लाइन / Offline only | Offline / No Online Service Confirmed |

The stored keys stay unchanged so that tests, data and pages remain stable. A future "verified-live" key needs an owner decision plus a test.

## District pages
Publish only with at least 3 verified local facts that differ from the state page (BUILD_RULES E4), each with an official source or a dated live check.
