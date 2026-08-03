# UK Keyword-to-Page Strategy — Final Implementation Report

**Date:** 2026-08-03
**Scope:** Prevent keyword cannibalisation across five UK-targeted pages by giving each a distinct primary keyword, rewriting/creating content and metadata accordingly, and correcting related technical/schema/brand issues. See [`docs/uk-keyword-cannibalisation-audit.md`](uk-keyword-cannibalisation-audit.md) for the Phase 1 audit this report follows.

---

## 1. Files Created

| File | Purpose |
|---|---|
| `local-seo-uk.html` | New commercial page targeting **local SEO UK** (~1,068 words) |
| `affordable-seo-services-uk.html` | New commercial page targeting **affordable SEO services UK** (~1,298 words) |
| `docs/uk-keyword-cannibalisation-audit.md` | Phase 1 audit deliverable |
| `docs/uk-keyword-cannibalisation-final-report.md` | This report |

## 2. Files Modified

| File | Reason |
|---|---|
| `blog/uk/how-to-rank-higher-google-uk.html` | Full content/metadata/schema rewrite (Phase 2) |
| `seo-services-uk.html` | Retargeted to "SEO agency UK", trust-stats removed, services table added (Phase 3) |
| `index.html` | Brand signals, Organization/WebSite schema, hero-stats replaced (Phase 6) |
| `about.html` | Editorial-approach section added, unverified stats replaced (Phases 2 & 6 support) |
| `blog/uk/local-seo-uk-guide.html` | One reciprocal link added to new commercial local page |
| `blog/uk/seo-costs-uk.html` | One reciprocal link added to new affordable page |
| `assets/css/style.css` / `assets/css/style.min.css` | New `.table-wrap`, `.checklist`, `.direct-answer`, `.summary-box`, `.byline-row` styles |
| `sitemap.xml` | Two new URLs added; `<lastmod>` added to all 56 entries |
| 60 HTML files sitewide | Cache-busting bump `style.min.css?v=min4` → `v=min5` (required by the CSS additions above; no content changes) |

## 3. Keyword Assigned to Each Page

| Page | Primary Keyword | Intent |
|---|---|---|
| `/blog/uk/how-to-rank-higher-google-uk.html` | how to rank higher on Google UK | Informational |
| `/seo-services-uk.html` | SEO agency UK | Commercial |
| `/local-seo-uk.html` | local SEO UK | Commercial |
| `/affordable-seo-services-uk.html` | affordable SEO services UK | Commercial |
| `/` (homepage) | Acendia / Acendia International | Brand |

`/blog/uk/local-seo-uk-guide.html` was deliberately left informational and untouched in intent — it now links forward to the new commercial local page rather than competing with it.

## 4. Metadata Changes

All five pages carry unique, keyword-aligned title tags, meta descriptions, H1s, and self-referencing canonicals — verified programmatically with zero duplicates:

- Article: *"How to Rank Higher on Google UK: 2026 SEO Guide | Acendia"*
- SEO Agency UK: *"SEO Agency UK | SEO Services for Rankings and Leads | Acendia"*
- Local SEO UK: *"Local SEO UK | Google Maps and Local Search Services | Acendia"*
- Affordable SEO: *"Affordable SEO Services UK for Small Businesses | Acendia"*
- Homepage: *"Acendia International | AI-Native Digital Growth Agency"*

## 5. Content Sections Added

- **Article**: direct-answer paragraph, summary box, UK SEO priority-matrix table, 15-item checklist, National vs Local SEO comparison table, hypothetical (explicitly labelled) example, 8-metric measurement framework, expanded 8-question FAQ, byline/editorial callout, 5-card Related Articles.
- **`seo-services-uk.html`**: services-breakdown comparison table, expanded process section (proposal scoping, deliverables), "Why Businesses Choose Acendia" section.
- **`local-seo-uk.html`** (new): service description, who-needs-it, GBP optimisation, citation/review/local-content/local-link sections, 3-step process, 5-question FAQ, guide callout.
- **`affordable-seo-services-uk.html`** (new): who-it's-for, affordability positioning, what's-included/not-included, prioritisation approach, indicative engagement options, pricing-factors explanation, cheap-vs-cost-effective section, 5-question FAQ.
- **Homepage/About**: verified-claim replacements ("Month-to-Month", "UK & AU Markets Served", "100% Account Ownership") and new "Our Editorial Approach" section on About.

## 6. Internal Links Added

- Article → `/seo-services-uk.html` ("SEO agency UK"), → `/local-seo-uk.html` ("local SEO UK"), → `/blog/uk/local-seo-uk-guide.html` ("complete local SEO guide for UK businesses"), → `/blog/uk/seo-costs-uk.html`, → homepage/About ("Acendia International"), plus 3 outbound Google Search Central references and a 5-item Related Articles grid.
- `seo-services-uk.html` → `/local-seo-uk.html` (services card + comparison table row) and → `/affordable-seo-services-uk.html` (CTA + process copy).
- `local-seo-uk.html` → `/seo-services-uk.html` and → `/blog/uk/local-seo-uk-guide.html` (prominent callout).
- `affordable-seo-services-uk.html` → `/blog/uk/seo-costs-uk.html` (pricing-factors section).
- `blog/uk/local-seo-uk-guide.html` → `/local-seo-uk.html` (new reciprocal sentence).
- `blog/uk/seo-costs-uk.html` → `/affordable-seo-services-uk.html` (new reciprocal sentence).

No exact-match commercial head-term appears as anchor text pointing away from its assigned page, and the article never targets the commercial terms as primary anchors.

## 7. Structured Data Added

- Article: `BreadcrumbList` (Home → Resources → UK SEO → Article), `Article` (author: Acendia International Editorial Team, `dateModified`), `FAQPage` (8 Q&As, text-matched to visible content).
- `seo-services-uk.html`, `local-seo-uk.html`, `affordable-seo-services-uk.html`: `BreadcrumbList`, `Service`, `FAQPage` each.
- `index.html`: `Organization` (added `alternateName: "Acendia"`, `email`, `contactPoint`) + new `WebSite` block.

All schema blocks across all 8 touched files validated **VALID** via `validate-schema.js`; all FAQ schema blocks verified to exactly match visible text.

## 8. Technical Issues Corrected

- Stale-CSS-cache risk: bumped `style.min.css?v=min5` sitewide after adding new CSS rules (caught proactively during this validation pass).
- Mobile horizontal-overflow bug on `affordable-seo-services-uk.html` (hardcoded `1fr 1fr` grid) — fixed with `repeat(auto-fit,minmax(260px,1fr))`; re-verified no overflow at 375px, 768px, and desktop widths.
- Missing `.proc-num` contrast on `local-seo-uk.html`'s process section (no background on a light section) — fixed with an inline black-bg/white-text override, consistent with existing patterns.
- `sitemap.xml` missing `<lastmod>` on all 56 entries — populated using `git log` dates (or today's date for dirty/new files).
- Internal-link check across all 8 key files: **0 broken links**.

## 9. Unverified Claims Removed or Flagged

**Removed/replaced (edited in this task):**
- Homepage & About hero-stats/numbers-grid: "250+ businesses helped", "1000+ keywords ranked", "95% retention", "300% growth", "20+ years combined experience", "100+ [count]" — all removed and replaced with verifiable, non-numeric claims (contract terms, market coverage, account-ownership policy).
- Article: softened confident claims about bounce rate/pogo-sticking as a direct ranking factor, specific content-length requirements, and any implied guaranteed ranking timeframe — reworded to cautious, sourced language.
- `seo-services-uk.html`: entire unverified trust-stats block (same fabricated figures as above) removed and replaced with a factual services-comparison table.
- No page in this task's scope promises guaranteed rankings, fabricates testimonials, or invents pricing.

**Flagged, not edited (outside this task's Phase 2–6 scope):**
- `case-studies.html` contains a "340% More organic leads" statistic and an attributed client quote that could not be verified against any source in the repository. This file was **not modified** — flagged here and in the audit doc for business sign-off (see §10).

## 10. Recommendations Requiring Business Approval

1. **`case-studies.html` unverified stat/testimonial** — the "340% More organic leads" figure and attributed client quote need either supporting evidence or removal/rewrite. Not touched in this task since it fell outside the Phase 2–6 edit scope.
2. **Pricing** — no page in this task states actual prices; `affordable-seo-services-uk.html` explains cost *factors* only. If Acendia wants to publish indicative price bands, that requires real, business-approved figures.
3. **Client results/case studies for `seo-services-uk.html`, `local-seo-uk.html`** — both pages currently rely on process/transparency messaging in lieu of case studies, per the "only verified" instruction. Real, approved case studies could strengthen conversion once available.
4. **Author credentials** — the article uses "Acendia International Editorial Team" rather than a named individual, since no verified named author with real credentials was supplied. If a specific person should be credited, their name/role/experience need business confirmation before publishing.
5. **Relationship between Acendia-owned domains** — `about.html` still contains a legacy `lang="en-NZ"` attribute and NZ-oriented cookie-consent text; this is a pre-existing, sitewide (60+ file) issue explicitly out of scope for this task but worth a dedicated cleanup pass. No domain merges, redirects, or canonicalisation were made or recommended without ownership verification.

---

## Validation Summary

- ✅ All 8 key files: JSON-LD schema valid (Organization, WebSite, BreadcrumbList, Article, Service, FAQPage)
- ✅ All 8 FAQPage blocks text-matched to visible content exactly
- ✅ 0 broken internal links across the 8 key files
- ✅ Unique title/meta description/H1/canonical confirmed across all 5 keyword-target pages — no duplicates
- ✅ No cannibalisation: each commercial/informational term maps to exactly one page, cross-linked rather than competing
- ✅ No horizontal overflow at mobile (375px), tablet (768px), or desktop widths on any new/edited page
- ✅ Reduced-motion handling present and functioning for both animated sections (`about.html` shader hero, homepage lamp section) — page content fully present in the DOM independent of animation state
- ✅ No new unverified claims introduced; existing unverified claims on in-scope pages removed
