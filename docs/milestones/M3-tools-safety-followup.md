# Milestone report — Tool safety follow-up

Date: 2026-10-15 · Scope: equal-share partition calculator input validation

## Finding and change
- The equal-split UI previously allocated a label array from the entered count before checking the calculator's 1–100 limit.
- A very large pasted value could trigger an unnecessarily huge allocation and make the browser unresponsive.
- The UI now returns on invalid counts before creating labels; valid counts retain the same output and URL behavior.
- Added a regression test that enforces this validation order.

## Validation
- Unit tests, build/quality gates, and the axe accessibility gate (light and dark) must pass in CI.
- GitHub Pages deployment must succeed before this change is considered delivered.
- Pages remain draft/noindex. No URL, title, description, canonical, H1, or hreflang was changed.

## Remaining visual review
- Manual screenshot review at mobile and desktop widths, in both themes and both language settings, remains a separate launch-readiness task. This change does not authorize publishing or indexing.
