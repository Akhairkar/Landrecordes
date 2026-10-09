# LandRecord M1 — Design System

Status: **M1 foundation locked**  
Scope: design tokens and product-level UI decisions. Global shell and components belong to M2.

## Product visual direction

LandRecord is a modern independent land-information and utility platform. It must not resemble a government department website or imply government ownership, endorsement, or affiliation.

The visual system is:
- premium but restrained
- information-dense without feeling crowded
- mobile-first
- accessible
- trustworthy through evidence and source transparency rather than government-style branding
- designed for long-form guidance as well as interactive tools

## Design tokens

The canonical CSS tokens live in `assets/css/design-system.css`.

### Color roles

Light and dark themes use role-based tokens:
- page background
- surface
- muted surface
- primary text
- secondary text
- borders
- brand
- accent
- status colors

Components must consume semantic tokens rather than hard-coded page colors.

### Typography

Use the system sans stack by default. Typography should prioritize:
- clear Hindi/English rendering
- readable body copy
- strong but restrained headings
- compact labels for filters and metadata
- readable long-form content width

Do not introduce decorative display fonts without a documented product reason.

### Layout

- Maximum content width: 1200px
- Reading width: approximately 760px
- Mobile-first spacing
- Cards should group a clear task or decision, not merely decorate the page.
- Avoid excessive rounded containers and excessive shadows.

### Interaction

Minimum interactive target: 44px.

Keyboard focus must be visible. Do not rely on color alone for state.

Primary actions should be visually distinct from secondary navigation.

## Mobile navigation decision

The mobile header must not hide all important navigation behind a hamburger.

Primary destinations should remain directly discoverable:
- Records / Services
- Maps
- Tools
- Search
- Language
- Theme

Secondary navigation may use a menu or drawer.

## Core component inventory

M1 defines the component families; M2 will implement them:
1. Global header
2. Primary navigation
3. Mobile quick navigation
4. Search box / search launcher
5. Breadcrumbs
6. Hero
7. Quick-action cards
8. Service cards
9. Record cards
10. State selector
11. District/tehsil selector
12. Rule Engine stepper
13. Result/recommendation card
14. Official-source card
15. Source/review metadata
16. Map preview
17. Tool card
18. Problem-solver card
19. Related-service grid
20. FAQ accordion
21. Trust/disclaimer block
22. Footer

## Homepage composition

The intended homepage sequence is:

Header
→ Hero + natural-language search
→ Quick actions
→ Smart Land Assistant
→ Explore by state
→ Map Explorer
→ Popular records/services
→ Tools
→ Problem Solver
→ Guides
→ Recently reviewed
→ Source/trust/disclaimer
→ Footer

Every section must have a user task or discovery purpose. Sections must not exist solely for SEO keywords.

## Service / record page pattern

A strong page should normally contain:

1. Clear title and user intent
2. Short answer / what this service or record is
3. State/jurisdiction context
4. Official source/action
5. Required information/documents where verified
6. Step-by-step guidance
7. Useful tool or checker where relevant
8. Common problems / next actions
9. Related services and records
10. Source + last reviewed metadata
11. Limitations/disclaimer
12. FAQ only where it adds genuinely useful coverage

Do not force every page to use every block. Page structure follows user intent.

## Accessibility baseline

- semantic HTML
- visible focus
- keyboard navigation
- sufficient contrast
- labels for controls
- no color-only meaning
- reduced-motion support
- readable line length
- Hindi and English text must render correctly
- touch targets >= 44px

## Performance baseline

- no framework is required for the static public layer
- minimize JavaScript
- defer non-critical scripts
- optimize images
- avoid unnecessary third-party widgets
- keep CSS reusable and token-based
- do not load maps until a page actually needs them

## Anti-patterns

Do not use:
- government-like emblems, seals or visual imitation
- fake official badges
- giant repetitive grids
- keyword-stuffed hero text
- auto-generated state/district pages without unique value
- duplicate language URLs without architecture
- dark mode that becomes nearly black with unreadable low-contrast text
- desktop-first layouts that collapse poorly on mobile
- hamburger-only primary navigation
- decorative animations that delay task completion

## Colour direction (owner-approved 2026-10-09)

Land-inspired, not government-like: warm paper background, deep field green as the brand colour, soil/terracotta as the accent, wheat-toned neutral surfaces. Blue-and-saffron or emblem-like palettes remain forbidden.

All text/background pairs used by components meet WCAG AA (measured 5.0:1 or higher for muted text, brand and accent on their surfaces, in both themes). Change tokens in `assets/css/design-system.css` only; components must not hard-code colours.

## Design v2 — land palette (owner request 2026-10-09: "more attractive colours")

- Category colours: field green, soil/terracotta, wheat/mustard, river blue, dusk violet (`--lr-c-*` with `-soft` backgrounds). Cards, chips, section rules and result boxes cycle through them; every foreground/soft pair passes WCAG AA in light and dark (verified by the axe gate).
- Green gradient hero with a subtle field-furrow pattern, coloured full-bleed section bands, a four-colour land stripe on the header, deep-green footer.
- Inline SVG icon set (`scripts/icons.mjs`, used as `{{icon:name}}`); no icon font or library.

## Language architecture (decision 2026-10-09)

- One URL per page; Hindi and English live on the same page and `html[lang]` decides which is shown (`[data-l="hi"]` / `[data-l="en"]`). The header toggle switches instantly and is remembered in the browser.
- Sources: `index.en.html` next to a page holds its English body; tool pages carry inline `data-l` blocks so the interactive tool exists once; state pages render English from `*_en` fields in `data/states.json`.
- `हिंदी <span class="lr-en">/ English</span>` in headings, labels and buttons is converted at build time into a language pair.
- Meta title/description stay Hindi-first (primary audience). No separate language URLs, so no hreflang yet.
