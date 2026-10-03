# M2 — Global Shell

Status: implemented foundation.

M2 establishes the reusable public shell for the homepage and future pages.

Included: independent LandRecord branding; desktop primary navigation; mobile-visible navigation; search entry point; English/Hindi state; light/dark theme state; independent-platform disclaimer; keyboard focus treatment; 44px interaction targets; responsive behavior.

Usage: load design-system.css, shell.css and site-shell.js. Place a div with data-landrecord-shell, then call LandRecordShell.mount({ active: 'records' }). Supported active values: records, services, maps, tools.

Architecture: the shell does not own homepage content, Rule Engine logic, map code, SEO content, or state/district data. Those belong to later milestones.

Indexing: no production sitemap or GSC submission is added by M2. Development indexing remains disabled according to the Rulebook.