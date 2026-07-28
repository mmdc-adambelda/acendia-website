# UK City SEO Expansion — Pre-Implementation Audit

Date: 2026-07-28
Scope: Phase 1 of the UK City SEO Expansion brief — inspect the repository before making changes.

## 1. Framework and Technology

- **No framework, no build step.** This is a hand-authored static HTML site — every page is a complete, self-contained `.html` file with inline `<script type="application/ld+json">` blocks and a shared `assets/css/style.min.css` + `assets/js/main.min.js`.
- No templating engine (no Jinja/Handlebars/EJS/React/Vue), no npm build pipeline for the site itself (Node/npx is only used ad hoc in this session for minification via `terser`, not as part of a real build system).
- Deployed via **GitHub Pages** to the custom domain `acendia.uk` (confirmed via `robots.txt`: `Sitemap: https://acendia.uk/sitemap.xml`, and via `CNAME`-style custom domain behaviour observed throughout this project).
- **Consequence for this brief:** GitHub Pages does not provide server-side HTTP redirects (no `_redirects` file support like Netlify, no `vercel.json`, no reverse-proxy config in this repo). Any "redirect" would have to be a client-side HTML meta-refresh page, which is a materially weaker signal than a real 301 and adds a hop. See §6 for the URL decision this drives.

## 2. Routing Structure

There is no router. URL structure is simply the file path:

- Root pages: `acendia.uk/about.html`, `acendia.uk/services.html`, etc. (bare filename, no leading slash needed relative to root).
- Nested folders exist and are already proven to work in production: `/blog/*.html` (11 evergreen articles, depth 1), `/blog/australia/*.html` and `/blog/uk/*.html` (depth 2), `/careers/*.html` (depth 1, added this session).
- **Clean, trailing-slash URLs are technically achievable** on GitHub Pages by creating `folder-name/index.html` (static hosts serve `index.html` for a directory request). This is available as an option for *new* pages, but see §6 for why it isn't used here.

## 3. Existing Page Templates / Reusable Components

No component system exists (no partials, no includes). The de facto "template" is a copy-paste pattern that every page in this repo already follows exactly:

- Consent-mode `gtag.js` boilerplate in `<head>` (reads `localStorage.getItem('acendia_consent')` before firing GA4).
- Cookie consent modal (`#cookie`, `#ck-panel`) — identical markup on every page.
- `<nav class="nav" id="nav">` + `<div class="mobile-drawer" id="mobile-drawer">` — identical link set on every page (only the `class="active"` marker moves).
- `<footer>` — identical structure and links on every page except for the specific "Locations" sub-list.
- Closing `<script src=".../main.min.js">`.

This pattern is what every one of the 60+ pages already built in this repo uses, and it is what the new UK city pages will reuse (see §11 for why a literal reusable "component" in the JS-framework sense isn't attempted).

### CSS component classes already available and reusable for this work

- `.hero.page-hero`, `.hero-badge`, `.breadcrumb` — page hero + eyebrow + breadcrumb.
- `.values-grid` / `.value-card` — 2×2 feature grid (used for "Why Acendia" sections).
- `.process-grid` / `.proc-step` / `.proc-num` — 3-step process sections.
- `.services-grid` / `.svc-card` — service tie-in grids.
- `.faq-list` / `.faq-item` / `.faq-q` / `.faq-a` — accordion FAQ (JS-driven open/close already wired in `main.js`).
- `.prose` / `.callout` — long-form article typography (headings, lists, pull-quote boxes). **Must be used inside a `.section light` wrapper** — `.prose` headings/body text hardcode dark colours and render invisible on dark backgrounds (a real bug caught and fixed on the Careers page earlier this session).
- `.related-grid` / `.blog-card` — related-content cards, used at the end of every article.
- `.numbers-grid` — animated stat counters.
- `.cta-sec` — final page CTA band.
- `.jobs-list` / `.job-card` — newest addition (Careers page), a pattern for "list of items, some clickable, some not" that the UK Locations grid can borrow the visual language from.

## 4. Existing SEO Metadata System

Every page manually sets, in this exact order: `<meta charset>`, `<link rel="icon">`, `<meta viewport>`, `<title>`, `<meta name="description">`, `<link rel="canonical">`, `og:title`, `og:description`, `og:type`, `og:url`, (`og:image` on article-type pages), `twitter:card`, `<meta name="robots" content="index, follow">`. This is consistent across all existing pages and will be replicated exactly for new pages.

## 5. Existing Structured Data

JSON-LD is hand-written per page, no schema library. Patterns already in production:

- `Organization` (homepage) — no `slogan` property yet (Phase 2 will add one).
- `BreadcrumbList` — on every non-homepage page.
- `Service` — on commercial pages (`seo-services-uk.html`, `seo-agency-london.html`, `seo-agency-sydney.html`, `seo-agency-melbourne.html`), with `areaServed` correctly scoped to a `City` or `Country`.
- `FAQPage` — only where the questions are genuinely visible on the page (already policy-compliant; no hidden FAQ schema found anywhere in the repo).
- `Article` / `BlogPosting`-equivalent (`Article`) + `BreadcrumbList` + `FAQPage` — on all 20 AU/UK blog articles built earlier this session.
- `JobPosting` — on the Careers detail page (most recent addition).
- **No `LocalBusiness` schema anywhere in the repo for city pages** — confirmed by inspection of `seo-agency-london.html`, `seo-agency-sydney.html`, `seo-agency-melbourne.html`. This is correct and must stay this way: Acendia is a remote agency with no physical office in any of these cities, and the brief explicitly prohibits implying one.

## 6. URL Decision (Phase 3 requirement)

**Decision: retain the existing flat `.html` convention for all ten city pages, including new ones.** New pages will be created as `seo-agency-manchester.html`, `seo-agency-birmingham.html`, etc. at the site root — not `/seo-agency-manchester/`.

Reasoning, directly against the brief's own decision rules:

1. **"Do not delete an existing indexed London page."** `seo-agency-london.html` already exists, is already linked from the footer of every page in the site, already has a `<link rel="canonical">` self-reference, and (per the brief's own instruction to "preserve existing URL authority wherever possible") should not move.
2. **"Do not create two indexable versions of the same page."** Moving London to `/seo-agency-london/` while leaving `seo-agency-london.html` live would require either deleting the old file (violates the rule above) or leaving both live (creates exactly the duplicate-indexing problem the brief prohibits) unless a real redirect exists.
3. **"When clean routes are supported, use the preferred clean URL and implement a permanent redirect from the old `.html` URL. ... Avoid redirect chains."** This static host has no real 301 capability (§1). The only available "redirect" is an HTML meta-refresh + canonical-pointing page, which search engines treat as a much weaker signal than a genuine 301 and which would still leave the old URL crawlable as a near-duplicate for a period. Introducing that mechanism for one page (London) while every other page on the site uses plain `.html` also adds a second URL *pattern* to maintain, which cuts against Phase 15's scalability goal.
4. **"When the architecture requires `.html` URLs, retain the existing convention rather than creating duplicate versions."** This is the exact fallback clause the brief provides for a site like this one, and it's the one that applies.

**Net effect:** all ten city pages — London (existing, expanded in place) and nine new ones — live at `acendia.uk/seo-agency-<city>.html`, matching the two AU city pages already in production (`seo-agency-sydney.html`, `seo-agency-melbourne.html`). One URL pattern, one canonical per page, zero redirect infrastructure required, zero risk to London's existing authority.

## 7. Existing UK-Relevant Pages (full inventory)

| URL | Role today | Status for this project |
|---|---|---|
| `/seo-services-uk.html` | National UK commercial hub — already targets "SEO company UK" family terms, already has a "City Focus" section name-checking Manchester/Birmingham/Leeds | **Improve into the required UK SEO hub** (Phase 4) rather than create a new page — avoids a duplicate page competing for the same head terms |
| `/seo-agency-london.html` | London commercial page, ~1,500 words, has FAQ/Service/Breadcrumb schema | **Expand in place** to the fuller Phase 5 structure; canonical URL unchanged |
| `/blog/uk/how-to-choose-seo-company-united-kingdom.html` | Evergreen article, "SEO company United Kingdom" (informational/comparison intent) | Keep as-is; owns a different keyword than the city pages (no cannibalisation) |
| `/blog/uk/how-to-rank-higher-google-uk.html` | Evergreen article, national ranking guide | Keep; link target for new city-page "related resources" sections |
| `/blog/uk/local-seo-uk-guide.html` | Evergreen article, national local-SEO framework | Keep; primary link target for the local-SEO section of every new city page |
| `/blog/uk/seo-costs-uk.html` | Evergreen article, sourced UK pricing | Keep; link target for the Week 11 "SEO cost London" article — that article must NOT re-target the same head term (see keyword map) |
| `/blog/uk/how-long-does-seo-take-uk.html` | Evergreen article, timeline | Keep |
| `/blog/uk/seo-for-small-business-uk.html` | Evergreen article, small-business framework | Keep |
| `/seo-agency-sydney.html`, `/seo-agency-melbourne.html` | AU city pages (out of scope, but the template this project's city pages will match stylistically) | No change |
| `/services.html` | Main service catalogue (`#seo`, `#local-seo`, `#google-business-profile`, `#website-development`, `#content-marketing`, `#lead-generation`, `#ai-automation` anchors) | Link target from every hub/city page |
| `/case-studies.html` | Case studies index | Link target; **no city-specific case study exists in the repo**, so city pages will link to the general case studies page rather than fabricate a city-specific one (per the brief's prohibition on fake case studies) |
| `/contact.html` | Audit/strategy-call form (Web3Forms) | The conversion destination for every CTA on every new/updated page |
| `sitemap.xml` | Flat list of `<url>` entries, manually maintained | Every new page must be added here |
| `robots.txt` | `Allow: /` sitewide, points to sitemap | No blocking directives exist that would affect new pages |

## 8. Existing Navigation and Footer

- **Main nav** (`nav-links`): Home, About, Services, Industries, Case Studies, Careers, Resources, Contact — already at 8 items, which is the practical ceiling for the current nav bar design before it crowds on smaller desktop widths. **Per Phase 13, no new top-level nav item will be added for UK Locations** — city pages will be discoverable via the UK hub and the footer, not the primary nav.
- **Footer "Locations" column**: currently lists SEO in Australia, SEO in the UK, SEO Agency Sydney, SEO Agency Melbourne, SEO Agency London — five links, present on every page. Adding nine more UK cities here would roughly triple this column's length on every page sitewide. Per Phase 13's instruction to feature London/Manchester/Birmingham more prominently while keeping the rest discoverable via the hub rather than crowding global chrome, **the footer will gain Manchester and Birmingham (making it 7 links) with the remaining 7 cities discoverable only via the UK hub's "UK Locations We Serve" grid**, not the sitewide footer.

## 9. Existing CTA Components

Two CTA patterns are used consistently everywhere: `<a href="contact.html" class="btn ...">Book a Call</a>` and `<a href="contact.html#audit" class="btn ...">Get Free Audit</a>`. The homepage's own audit flow (hero widget with simulated loading + Roam booking embed) is homepage-only and out of scope for city pages, which will keep the simpler, already-proven "link straight to `/contact.html#audit`" pattern used by every other non-homepage page in the site.

## 10. Analytics and Conversion Tracking

- GA4 via `gtag.js`, consent-mode gated on the cookie banner's stored preference (`localStorage['acendia_consent']`).
- One conversion event already wired: `gtag('event', 'ads_conversion_SUBMIT_LEAD_FORM_1', {})`, fired on successful `#contact-form` submission (`initWeb3Form()` helper in `assets/js/main.js`).
- **No per-CTA click event tracking exists anywhere in the repo today** (Phase 12 asks for CTA location/page type/target city event properties "when the existing analytics setup supports it" — it doesn't yet, and building a generic click-tracking layer sitewide is a larger change than this brief's own guardrail against redesigning the site. Recorded as a **recommended next action** in the implementation report rather than implemented speculatively).

## 11. Reusable "Components" Decision (Phase 15)

There is no build system, so a literal reusable JS/template component (in the React/Vue sense) cannot be introduced without adding a build step — which the brief explicitly prohibits ("Do not redesign the entire website"). The scalable pattern this repo already uses successfully for 60+ near-identical pages (blog articles, AU/UK clusters, careers) is: **a consistent hand-authored structure + a documented SOP**, not literal shared code. `docs/uk-location-page-sop.md` (Phase 15) captures this structure precisely enough that a future page can be produced consistently by a human or an agent without a templating engine. A markdown "location data" reference table (in the SOP and the keyword map) serves the same *purpose* as a structured data file, without requiring a build step to consume it.

## 12. Technical SEO Issues Found

- None blocking. `robots.txt` is permissive, `sitemap.xml` is well-formed, canonical tags are self-referencing and correct across the sample checked.
- Minor: the footer "Locations" list currently omits a link back to `about.html`'s sibling `industries.html` and `contact.html` on `seo-agency-london.html`'s Company sub-column specifically (present on most other pages) — noted for the QC pass but not part of this project's core scope.
- No fabricated claims found in existing city/UK pages (`seo-agency-london.html`, `seo-services-uk.html`) — good precedent to continue.

## 13. Files/Work In Progress That Must Not Be Overwritten

`git status` was checked before starting; the working tree was clean at the start of this task (no uncommitted work from a prior session). This audit and all subsequent files are new additions or in-place expansions of the specific files named above — no unrelated page is touched.

## 14. Missing Pages (to be created this project)

`seo-agency-manchester.html`, `seo-agency-birmingham.html`, `seo-agency-leeds.html`, `seo-agency-glasgow.html`, `seo-agency-bristol.html`, `seo-agency-liverpool.html`, `seo-agency-edinburgh.html`, `seo-agency-sheffield.html`, `seo-agency-newcastle.html` — nine new files, plus 20 new article files (staged as drafts per Phase 7, since this static site has no scheduling/publish-date mechanism beyond "is it in the sitemap and blog index or not").

## 15. Duplicate/Overlapping Topic Risk Identified

- `seo-services-uk.html` (national) vs. `seo-agency-london.html` (London) both currently mention "London" — acceptable, since the hub references London only as an example/link-out, and London owns the actual head term. This pattern will be preserved for the other 9 cities: the hub links out and gives one sentence of context per city; it does not attempt to rank for "SEO agency Manchester" itself.
- The planned Week 11 article "How Much Does SEO Cost in London?" targets an informational/cost-research term distinct from the commercial "SEO agency London" head term already owned by `seo-agency-london.html` — no cannibalisation, confirmed in the keyword map (Phase 16 deliverable).

---

*Audit complete. Proceeding to Phase 2 (homepage tagline) and Phase 3–4 (city page architecture + UK hub) per the brief's instruction not to pause after the audit.*
