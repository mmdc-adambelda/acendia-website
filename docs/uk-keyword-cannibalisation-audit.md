# UK Keyword-to-Page Audit & Anti-Cannibalisation Strategy

**Date:** 2026-08-03
**Scope:** `/blog/uk/how-to-rank-higher-google-uk.html`, `/seo-services-uk.html`, new `/local-seo-uk.html`, new `/affordable-seo-services-uk.html`, homepage brand signals.

## 1. Keyword-to-page assignment (target state)

| Page | Primary keyword | Secondary keywords | Intent |
|---|---|---|---|
| `/blog/uk/how-to-rank-higher-google-uk.html` | how to rank higher on Google UK | UK SEO strategy, improve Google rankings UK, rank on Google UK | Informational |
| `/seo-services-uk.html` | SEO agency UK | SEO company UK, SEO services UK, UK SEO agency | Commercial |
| `/local-seo-uk.html` (new) | local SEO UK | local SEO services UK, local SEO agency UK, Google Maps SEO UK | Commercial |
| `/affordable-seo-services-uk.html` (new) | affordable SEO services UK | affordable SEO agency UK, small business SEO packages UK, cost-effective SEO UK | Commercial |
| `/` (homepage) | Acendia | Acendia International, Acendia SEO agency | Branded |
| `/blog/uk/local-seo-uk-guide.html` (existing, unchanged intent) | local SEO UK guide / how to do local SEO | Google Business Profile UK, NAP consistency, UK citations | Informational — kept distinct from the new commercial Local SEO page by staying a full how-to guide (setup steps, schema, DIY process) rather than a service pitch |

**Cannibalisation check:** the informational article and `local-seo-uk-guide.html` both already use exact H1/title patterns built around teaching, not selling ("How to Rank Higher on Google UK: A Practical Guide", "Local SEO UK: How to Rank in Google Maps..."). Neither will carry a primary commercial head-term title. `seo-services-uk.html` and the two new commercial pages each get one exclusive head-term (SEO agency UK / local SEO UK / affordable SEO services UK) with no overlap in `<title>`, meta description, or H1. Internal links between the four pages use varied, natural anchor text rather than repeating one exact-match phrase everywhere.

## 2. Repository structure relevant to this task

- Static HTML site, no build step, no framework (confirmed in earlier `docs/uk-city-seo-audit.md`).
- Shared stylesheet: `assets/css/style.min.css` (readable source `assets/css/style.css`), cache-busted via `?v=min4` query string on every page's `<link>` tag.
- Shared JS: `assets/js/main.min.js` (cookie consent, mobile nav, fade-in scroll observer, FAQ accordion, audit widget). No page-specific JS is required for this task.
- Article template: `.article-hero` → `.prose` inside `.section.light` → `.article-cta` → `.related-grid` → `.callout` "About This Guide" → `.cta-sec` → shared footer.
- Commercial page template: `.hero.page-hero` → `.numbers-grid` (trust stats) → `.values-grid` sections → `.process-grid` → `.services-grid` → `.faq-list` → `.cta-sec` → shared footer.
- Reusable components confirmed reusable for the two new pages: `.values-grid/.value-card`, `.process-grid/.proc-step`, `.services-grid/.svc-card`, `.faq-list/.faq-item`, `.prose/.callout` (must sit inside `.section.light`), `.related-grid/.blog-card`.
- No comparison-table component exists yet; none of the current pages use a literal `<table>`. A new `.compare-table` style is added (Phase 3/4 requirement) rather than repurposing an unrelated component.

## 3. On-page audit findings — `/blog/uk/how-to-rank-higher-google-uk.html`

| Item | Finding |
|---|---|
| Title | "How to Rank Higher on Google UK \| Acendia International" — acceptable length (54 chars) but not yet year-dated; brief asks for a 2026-dated variant |
| Meta description | Present, 155 chars, on-topic, but doesn't mention local search or measurement (both added to the article) |
| Canonical | Self-referencing, correct |
| Robots | `index, follow` — correct |
| H1 | Single H1, "How to Rank Higher on Google UK" — no year, brief asks for "...A Practical 2026 Guide" |
| Internal links | 3 existing (technical-seo-guide, local-seo-uk-guide, website-speed-seo) plus 3 related-article cards — all real, crawlable `<a>` tags, not JS-rendered. No link yet to `/seo-services-uk.html`, `seo-costs-uk.html`, or `seo-for-small-business-uk.html` |
| Alt text | Featured image has descriptive alt text; related-article thumbnails use generic "Blog thumbnail — Acendia International" alt (pre-existing site-wide pattern, out of scope to change here) |
| Image dimensions | No explicit `width`/`height` attributes on `<img>` tags (site-wide gap, not unique to this page) — flagged, not fixed here as it would require auditing every image on the site; `loading="lazy"` is present |
| OG/Twitter | OG title/description/type/url/image present; no `twitter:title`/`twitter:description` (only `twitter:card`) — pre-existing site-wide pattern |
| Article schema | Valid, but `author` is a generic Organization block with no named author, role, or reviewer — flagged for Phase 2 |
| Breadcrumb schema | Valid, 3 levels (Home → Resources → article). Brief asks for a 4-level hierarchy (Home → Resources → UK SEO → article); implemented in the rewrite |
| FAQPage schema | Present, matches visible FAQs exactly (4 questions). Expanded to 8 in the rewrite, schema updated to match |
| Sitemap | Included, `changefreq: monthly`, `priority: 0.7`, no `lastmod` (site-wide gap, addressed in Phase task on sitemap) |
| Broken links | None found on this page |
| Duplicate topic risk | None — this page already avoids the commercial head-term "SEO agency UK" |
| Unverified claims | None on this specific page |

## 4. On-page audit findings — `/seo-services-uk.html`

| Item | Finding |
|---|---|
| Title/meta/H1 | Already reasonably aligned to "SEO agency UK" territory from earlier work this session, but title reads "SEO Agency UK \| SEO Company for Rankings, Enquiries & Growth \| Acendia" (69 chars, slightly long) and doesn't exactly match the brief's suggested shorter title — tightened in Phase 3 |
| Trust stats | `.numbers-grid` block shows **250+ Businesses Helped, 1000+ Keywords Ranked, 95% Client Retention, 300% Avg Organic Growth, 20+ Industries Served, 100% Custom Strategies** — none of these numbers have any supporting evidence anywhere in the repository (no client list, no data source, no methodology). **Flagged as unverified per Phase 1/3/10 instructions — removed and replaced with transparent process information in Phase 3.** |
| Structured data | `Service` schema present and accurate (no false address, no LocalBusiness). `FAQPage` matches visible FAQ exactly. No `Organization`/`WebSite` duplication (correctly deferred to homepage) |
| Comparison table | Does not exist yet — added in Phase 3 |
| Ranking guarantees | None found — page already avoids "get to #1" language |

## 5. On-page audit findings — `/blog/uk/local-seo-uk-guide.html`

Confirmed informational in intent (setup instructions, schema guidance, a 90-day DIY-style plan) and will **not** be edited to add commercial language. The new `/local-seo-uk.html` will link to it as "the complete local SEO guide" for readers wanting the full educational version, and this guide already links back to `how-to-rank-higher-google-uk.html` — that reciprocal link is preserved unchanged.

## 6. Homepage / brand audit — `/`, `about.html`

| Item | Finding |
|---|---|
| `Organization` schema | Present on homepage: `name`, `url`, `logo`, `slogan`, `description`, `sameAs` (Facebook, Instagram). **Missing `alternateName: "Acendia"`** (the brief explicitly asks for this) and no `WebSite` schema entity anywhere on the site. Both added in Phase 6 |
| Name consistency | "Acendia International" used consistently in titles, footer, nav logo alt text, and schema across every page audited. No competing domain, no second Acendia-owned site referenced anywhere in the repo — nothing to reconcile |
| Homepage hero stats | `.hero-stats` shows **250+ Businesses Helped, 95% Client Retention, 300% Avg Organic Growth** — same unverified-claim issue as `seo-services-uk.html`'s trust bar. **Flagged and replaced in Phase 6** with non-numeric, verifiable positioning statements (e.g. contract terms, markets served) so the visual stat-bar format is preserved but no invented number remains |
| `<html lang>` | Homepage uses `lang="en-NZ"` (a pre-existing, site-wide legacy artifact from before the AU/UK repositioning — every page's cookie-consent text still says "NZ Privacy Act 2020" too). All UK-specific pages already correctly use `lang="en-GB"` individually. **Not in scope to fix site-wide in this task** (touches 60+ unrelated files and the legal cookie text); flagged in the final report as a separate recommendation |
| About page | Exists, has its own hero, no contradiction with homepage or contact page content found |

## 7. Case studies / testimonial audit (flagged, not edited in this task)

`case-studies.html` contains a numeric claim ("340% More organic leads") and an attributed client quote — *"We'd tried three other agencies before Acendia... 340% more leads."* — with **no supporting evidence anywhere in the repository**: no client name, no verifiable source, no case-study methodology. This page is not one of the pages this brief's Phases 2–6 instruct editing, so it is left untouched here, but per Phase 1's instruction to identify every unverified claim site-wide, it is flagged prominently in the final report as requiring business approval (real client data, explicit permission to publish the quote, or removal).

## 8. New pages — URL, template, and asset decisions

- `/local-seo-uk.html` and `/affordable-seo-services-uk.html` — flat root-level `.html` files, matching the existing convention (`seo-services-uk.html`, `seo-agency-london.html`, etc.) and GitHub Pages' lack of server-side redirects (same reasoning as the earlier city-page URL decision).
- Both reuse the existing commercial-page template components exactly (hero, values-grid, process-grid, services-grid, FAQ, CTA, footer) — no new CSS components beyond a `.compare-table` style, which both the Local SEO page and `seo-services-uk.html` share.
- No new images required — both pages use the existing CSS-only `.hero-dots`/`.hero-glow1` hero background, matching every other commercial page (no image asset gap).

## 9. Summary of unverified claims found site-wide

| Claim | Location | Disposition |
|---|---|---|
| 250+ Businesses Helped | Homepage hero, `seo-services-uk.html` trust bar | Removed/replaced (Phases 3 & 6) |
| 1000+ Keywords Ranked | `seo-services-uk.html` trust bar | Removed (Phase 3) |
| 95% Client Retention | Homepage hero, `seo-services-uk.html` trust bar | Removed/replaced (Phases 3 & 6) |
| 300% Avg Organic Growth | Homepage hero, `seo-services-uk.html` trust bar | Removed/replaced (Phases 3 & 6) |
| 20+ Industries Served | `seo-services-uk.html` trust bar | Removed (Phase 3) |
| 100% Custom Strategies | `seo-services-uk.html` trust bar | Removed (Phase 3) |
| 340% More organic leads + attributed client quote | `case-studies.html` | **Flagged only** — out of this task's edit scope, needs business-supplied evidence or removal |

No pricing figures, staff credentials, awards, or office locations were found anywhere in the repository, so none needed removal on that front.
