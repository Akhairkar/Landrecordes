# LandRecord Master Rulebook
Version: 1.0
Status: MANDATORY
Project: LandRecord / Indian Land & Property Information Platform

## 0. Non-negotiable AI rule

Before ANY change to this repository, every AI/agent/developer must read:
1. `README.md`
2. `RULEBOOK.md` (this file)
3. Any applicable specification inside `docs/`

No code, content, page, schema, database migration, API integration, SEO change, design change, deletion, rename, or configuration change may be made without checking these rules first.

If a requested change conflicts with this Rulebook, stop and resolve the conflict before editing.

Never silently weaken, delete, bypass, or reinterpret a Rulebook requirement.

---

## 1. Product identity

LandRecord is an independent information, guidance, discovery and utility platform about Indian land records, land-related government services, maps, documents, procedures, calculations and legal/revenue information.

It is NOT a government website and must never visually or verbally imply government ownership, affiliation, authorization or endorsement.

Primary promise:
- Make complicated land information understandable.
- Route users to the correct official source.
- Provide state-specific guidance instead of pretending every rule is India-wide.
- Combine Hindi and English clearly.
- Help users understand what to do next.

The platform must not claim that LandRecord itself issues, verifies, owns, or controls government land records unless an authorized integration genuinely provides that function.

---

## 2. Core design principles

1. Premium but simple.
2. Mobile-first.
3. Fast and lightweight.
4. Hindi + English on every public page, normally stacked together where useful.
5. Consistent header, footer, language control and theme control across every public page.
6. No hamburger-only navigation on mobile. Important navigation/options must remain visible or use an obvious bottom/action navigation and expandable sections that do not hide core destinations.
7. Clear hierarchy and large tap targets.
8. Accessible contrast, keyboard navigation, labels and focus states.
9. Minimal animation; never sacrifice speed or usability.
10. The design must feel like a modern land-tech/information product, not a government portal clone.
11. No dark/light theme mismatch between pages.
12. No page should look like an isolated microsite.

---

## 3. Global page contract

Every indexable public page must have, where applicable:

- Unique title tag.
- Unique meta description.
- Canonical URL.
- Correct language metadata.
- H1.
- Clear Hindi content and English content.
- Introductory explanation.
- State/jurisdiction scope.
- Last reviewed/source information.
- Official source link(s).
- Relevant SEO content written for users, not keyword stuffing.
- Internal links to parent hub, sibling services and related topics.
- Tools grid when a useful tool exists.
- Related services grid.
- Relevant FAQ section where genuinely useful.
- Structured data only when the visible content supports it.
- A map/location component or a clearly stated map context appropriate to that page. If a map is not meaningful for a specific page, the page must still provide a useful location/jurisdiction context rather than a decorative fake map.
- Consistent header/footer/theme/language controls.

No page may be generated solely to target a keyword.

---

## 4. Homepage master specification

Homepage objective:
Help a user identify the correct land record/service quickly, understand it in simple language, and reach the appropriate official portal or LandRecord tool.

Required homepage sections:

1. Global header
2. Hero with primary smart search
3. Quick land-service actions
4. Smart Land Assistant / Rule Engine entry
5. Interactive India/state map
6. Popular land records/services
7. "What do you need to do?" decision cards
8. Land calculators/tools
9. State → District → Tehsil explorer
10. Official portal discovery
11. Guides/knowledge section
12. Recently reviewed/updated information
13. Trust/source/disclaimer block
14. Footer

Homepage must not become an uncontrolled card wall.

---

## 5. Navigation rule

Mobile:
- Do NOT hide all important options inside a hamburger menu.
- Primary destinations must remain visible through a compact navigation/action bar.
- Secondary options may use expandable panels.
- Search must be immediately accessible.
- Language and theme controls must remain discoverable.
- No critical service should require more than two taps from a primary navigation surface.

Desktop:
- Use a clear primary navigation.
- Search remains prominent.
- Do not overload the header with dozens of links.

---

## 6. Language rule

Hindi and English are first-class content.

Default presentation:
Hindi explanation
English explanation

Do not produce machine-translated-looking filler.

Technical names may remain in English where they are commonly used, but the meaning must be explained in Hindi.

A language toggle may change emphasis/display, but the underlying page architecture must remain consistent.

Never create separate language pages merely to duplicate thin content unless there is a real SEO/content reason.

---

## 7. Maps rule

Maps are a core platform capability.

Where relevant, pages should show:
- India/state/district context.
- State/district selection.
- Relevant official map service.
- Bhu-Naksha or equivalent official map portal where available.
- Nearby revenue office information where reliable data exists.
- Location hierarchy.

Never fabricate:
- Ownership boundaries.
- Cadastral parcels.
- Survey numbers.
- Land ownership.
- Coordinates.
- Government records.

Third-party maps must not be presented as official cadastral records.

---

## 8. Rule Engine / Smart Land Assistant

The Rule Engine is a first-class platform component.

Possible inputs:
- State
- District
- Tehsil
- User goal
- Land-record type
- Property situation
- Document available
- Transaction type

Possible outputs:
- Recommended record/service
- Required documents
- Process overview
- Official portal
- Relevant calculator/tool
- Related services
- Caveats/jurisdiction

Rules must be explainable. The system must never present an inference as a government decision.

Every recommendation should be traceable to documented rules/content where practical.

---

## 9. SEO master rules

SEO is architecture, not a final patch.

Every indexable page must be evaluated for:
- Search intent
- Unique value
- Correct jurisdiction
- Internal-link role
- Canonical
- Title
- Description
- H1/H2 hierarchy
- Schema eligibility
- Crawlability
- Content freshness
- Source quality

Do not:
- Stuff keywords.
- Generate thousands of near-identical state/district pages.
- Create doorway pages.
- Invent search-volume claims.
- Repeat the same paragraph with only a district name changed.
- Index empty, placeholder, thin or broken pages.
- Use misleading titles.

Sitemaps must contain only intended canonical/indexable URLs.

---

## 10. SEO metadata master pattern

Titles must be unique and intent-led.

Descriptions must accurately summarize the page and its jurisdiction.

Canonical URLs must be absolute and consistent.

H1 must describe the primary user intent.

Every page should have meaningful H2 sections.

Metadata must never promise an action that the page cannot actually perform.

---

## 11. Structured data / Schema rules

Use schema only when supported by visible page content.

Possible types:
- WebSite
- WebPage
- BreadcrumbList
- FAQPage where eligible and genuinely present
- HowTo where the page is actually a how-to guide
- Article where appropriate
- ItemList for genuine lists
- LocalBusiness/Place only when factual location data is maintained accurately

Never generate fake ratings, reviews, prices, organizations, events or government affiliations.

Schema must match the visible page.

---

## 12. Content architecture

Core topic clusters:

A. Land Records
- 7/12
- RoR
- Khatauni
- Jamabandi
- Khasra
- Khata
- B1
- Property Card
- Record extracts

B. Land Changes
- Mutation
- Ferfar
- Namantaran
- Dakhil-Kharij
- Ownership update guidance

C. Maps
- Bhu-Naksha
- Cadastral map guidance
- Location hierarchy
- Survey/plot map guidance

D. Land Measurement
- Area conversion
- Regional units
- Plot measurement
- Boundary/dimensions

E. Registration & Transactions
- Sale/registration guidance
- Stamp duty information
- Circle/ready-reckoner guidance
- Document checklists

F. Revenue & Administration
- Tehsil
- Patwari/Talathi/revenue offices
- Certificates and applications
- Status/help guidance

G. Legal & Dispute Information
- General land-law explainers
- Mutation disputes
- Boundary disputes
- Record correction guidance
- Court/revenue pathway explainers

H. Tools
- Area calculator
- Unit converter
- Document checklist
- Decision/rule engine
- Land value tools where data is reliable

---

## 13. Internal linking rule

Every service page must link to:
1. Parent state/service hub.
2. At least two relevant sibling/related services where available.
3. At least one relevant tool.
4. Official portal/source.
5. Relevant guide/knowledge page.
6. Relevant map page.
7. Breadcrumb path.

Do not create random links merely to increase link count.

---

## 14. Related Services and Tools grids

Every suitable service page should end with:
- Related Services
- Useful Tools
- Official Sources

Cards must be contextually relevant.

No generic "20 tools" block repeated unchanged on every page.

---

## 15. State and district scaling

Hierarchy:
India → State/UT → District → Tehsil/Taluka → Village/service context

Do not publish a location page until it contains meaningful location-specific value.

State rules override generic national statements.

District pages must not claim services that are unavailable in that jurisdiction.

---

## 16. Government links

Use official government domains whenever an official source exists.

Store official URLs in a controlled data source so they can be updated.

Every important government link should be periodically checked.

Do not:
- Copy government branding.
- Claim affiliation.
- Deep-link to an endpoint without understanding its stability.
- Present an unofficial mirror as the official portal.

---

## 17. API rules

API integration is allowed only when:
- Legitimate use is confirmed.
- Terms/authorization permit the intended use.
- The source is reliable.
- The integration adds real user value.
- Credentials remain server-side.
- Errors and downtime are handled.
- User data is minimized.

Never scrape or expose restricted land records.

Never call an API response an "official record" unless the authorization/source supports that statement.

---

## 18. Supabase rules

Supabase may be used for:
- State/district/tehsil data.
- Service metadata.
- Official links.
- Source/review records.
- Search indexes.
- Rule-engine data.
- Admin content management.
- Controlled analytics or saved-user features.

Do not move static content into a database without a clear benefit.

Security:
- RLS must be enabled where user data is involved.
- Service-role credentials never go to the frontend.
- Public tables expose only intended fields.
- Admin functions must be separated from public access.

---

## 19. Data/source governance

Important factual records should have:
- Source URL
- Source organization
- Jurisdiction
- Last reviewed date
- Optional next review date
- Notes/limitations

When government rules change, update the affected content and metadata.

Do not rely on memory for current fees, portals, procedures or legal rules when authoritative verification is possible.

---

## 20. Legal and high-stakes content

Legal information is educational guidance, not individualized legal advice.

For legal/revenue content:
- State jurisdiction must be explicit.
- Source must be identified.
- Date/review status should be visible.
- Avoid absolute claims where interpretation varies.
- Encourage professional/legal authority where appropriate.

Never speculate about ownership or legal outcomes.

---

## 21. Trust and transparency

The site should clearly distinguish:
- LandRecord guidance
- Official government information
- Third-party information
- API-derived information
- User-entered calculations

Where useful, show:
"Source", "Last reviewed", "Official portal", and "What this page can/cannot do".

---

## 22. Performance

Target:
- Fast mobile loading.
- Minimal JavaScript.
- Optimized images.
- Lazy-load non-critical media.
- Avoid heavy libraries when native HTML/CSS/JS is sufficient.
- Avoid blocking scripts.
- Maintain good Core Web Vitals.

Every feature must justify its performance cost.

---

## 23. Accessibility

Required:
- Semantic HTML
- Keyboard access
- Visible focus
- Accessible labels
- Adequate contrast
- Touch targets
- Reduced-motion support
- Alt text
- Logical heading hierarchy
- No color-only meaning

---

## 24. Security

Never commit:
- API keys
- Supabase service-role keys
- Razorpay secret keys
- Private tokens
- Passwords
- Personal data

Use environment/server-side secrets.

Validate and sanitize user input.

---

## 25. Admin architecture

Admin must be separate from the public information architecture.

Admin capabilities may include:
- Content editing
- Official URL management
- Source verification
- Review dates
- State/service management
- Rule-engine rules
- Broken-link status
- Sitemap/indexing controls

Admin pages must never accidentally enter public sitemaps.

---

## 26. Indexing / launch control

During development:
- Keep GSC submission disabled.
- Do not intentionally request indexing.
- Keep unfinished pages out of sitemap.
- Use noindex for pages that could accidentally be discovered/indexed where appropriate.
- Robots policy must be coordinated with the chosen noindex strategy.

Before launch:
- Remove accidental noindex.
- Validate canonicals.
- Generate production sitemap.
- Validate robots.txt.
- Check 404/redirects.
- Check structured data.
- Check internal links.
- Then submit the final sitemap to GSC.

---

## 27. Million-visitor growth architecture

The goal is not to manufacture a million URLs. Growth must come from useful coverage.

Growth pillars:
1. High-intent land-record searches.
2. State-specific service coverage.
3. District-level useful content.
4. Evergreen educational guides.
5. Calculators/tools.
6. Smart service discovery.
7. Map/navigation utility.
8. Strong internal linking.
9. Fresh official-source updates.
10. Discoverable search architecture.
11. Social/Telegram distribution where appropriate.
12. Fast mobile UX.
13. PWA/return-user utility.
14. Long-tail queries based on genuine user problems.

Scaling rule:
Quality and usefulness must scale before URL count.

---

## 28. Anti-thin-content rule

A page must not exist only because a keyword exists.

Before publishing a state/district/service page, it must answer:
- What unique user problem does this page solve?
- What local facts differ?
- Which official source applies?
- Which services/tools are relevant?
- What internal links does it add?
- What evidence supports the content?

If those answers are weak, do not publish the page.

---

## 29. Change management

Preferred development flow:
1. Read Rulebook.
2. Inspect existing implementation.
3. Define exact scope.
4. Make the smallest safe change.
5. Test affected functionality.
6. Check mobile and desktop.
7. Check links/SEO if relevant.
8. Review diff.
9. Commit with a clear message.
10. Never mix unrelated changes in one commit.

Never delete working functionality to simplify a task without explicit approval.

---

## 30. Repository structure

Preferred future structure:

```
/
├── index.html
├── states/
├── districts/
├── tehsils/
├── services/
├── maps/
├── tools/
├── guides/
├── legal/
├── assets/
├── data/
├── admin/
├── api/
├── docs/
│   ├── architecture/
│   ├── seo/
│   ├── content/
│   └── data/
├── README.md
├── RULEBOOK.md
├── robots.txt
└── sitemap.xml
```

Structure may evolve, but changes must preserve discoverability and maintainability.

---

## 31. Homepage and page-design consistency

No individual developer/AI may invent a separate header, footer, theme, language selector, card style, button system or typography system for one page.

Global components must be reused.

A page may have unique content modules, but the design language remains shared.

---

## 32. "High-tech" feature rule

Advanced features must solve a real user problem.

Potential differentiated capabilities:
- Land Service Decision Engine
- Record-type recommender
- Document readiness checker
- State-specific process navigator
- Map-to-service navigation
- Official-source health monitor
- Rule/version change tracking
- Land terminology translator (Hindi ↔ English)
- Context-aware related-service engine
- Saved land-service checklist
- Guided application preparation
- Natural-language land-service search

Do not claim a feature is globally unique unless independently verified.

---

## 33. No fake data rule

Demo/sample data must be clearly labeled.

Never create fake:
- land owners
- survey numbers
- plot boundaries
- government approvals
- case outcomes
- official fees
- government statistics

---

## 34. Final quality gate

Before any major release, verify:

[ ] Mobile navigation
[ ] Desktop navigation
[ ] Hindi/English
[ ] Theme
[ ] Header/footer consistency
[ ] Search
[ ] Maps
[ ] Rule engine
[ ] Internal links
[ ] Tools grid
[ ] Related services
[ ] Official links
[ ] Titles/descriptions
[ ] Canonicals
[ ] H1/H2
[ ] Schema
[ ] Sitemap
[ ] Robots
[ ] No accidental noindex
[ ] Accessibility
[ ] Core Web Vitals
[ ] Broken links
[ ] Source/review dates
[ ] Security/secrets
[ ] Admin isolation
[ ] Thin-content check
[ ] Final diff review

---

## 35. Rulebook authority

This file is the project's master implementation contract.

If another document, prompt, AI agent, generated code, or future contributor conflicts with this Rulebook, this Rulebook wins unless the owner explicitly approves an updated Rulebook version.

Rulebook changes themselves must be intentional, documented, reviewed and committed separately from unrelated feature work.
