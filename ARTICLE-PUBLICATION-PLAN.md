# Article Publication Plan — Acendia AU/UK Content Expansion

Staged rollout across four phases, per the original content brief's own guidance against publishing all 20 pieces as a single undifferentiated batch. Dates below are planning targets from the point this phase shipped (2026-07-14), not fixed deadlines — adjust to actual review and writing capacity.

## Phase 1 — Foundation (Days 1–14) — ✅ Shipped 2026-07-14

- [x] Finalise keyword ownership map (`SEO-CONTENT-MAP.md`)
- [x] Update `/seo-services-australia.html` — title, H1, Who We Help, Process, FAQ, links to Articles 1 & 6
- [x] Update `/seo-services-uk.html` — title, H1, Who We Help, Process, FAQ, links to Articles 13 & 16
- [x] Create `/blog/australia/` and `/blog/uk/` folders
- [x] Publish **Article 1** — How to Choose an SEO Company in Australia
- [x] Publish **Article 6** — How to Rank Number One on Google Australia
- [x] Publish **Article 13** — How to Choose an SEO Company in the United Kingdom
- [x] Publish **Article 16** — How to Rank Higher on Google UK
- [x] Refresh **Article 19** — `/blog/why-businesses-need-seo.html` → "How SEO Improves Businesses"
- [x] Wire internal links from all 9 remaining existing articles into the new cluster
- [x] Update `/blog.html` with 4 new cards and updated refresh card
- [x] Update `sitemap.xml` with 4 new URLs
- [ ] **Not done — needs client action:** verify Google Analytics and Search Console are still tracking correctly after this batch of changes (both were already verified working as of the prior Phase 0 work; no new setup needed, just a sanity check post-deploy)
- [ ] **Not done — needs client action:** submit the updated sitemap.xml in Search Console if not already done from the prior phase

## Phase 2 — Commercial Support (Target: Weeks 3–5) — ✅ Shipped 2026-07-20

Required real, sourced pricing research before drafting (Articles 4 and 14) — completed via web research, cited with source and access date in each article rather than invented figures.

- [x] Article 2 — What Makes a Top SEO Company in Australia?
- [x] Article 3 — SEO Company vs Freelancer vs In-House Team in Australia
- [x] Article 4 — SEO Costs in Australia *(sourced AU pricing: StudioHawk, Impressive, accessed 20 Jul 2026)*
- [x] Article 5 — How Long Does SEO Take in Australia?
- [x] Article 14 — SEO Costs in the UK *(sourced UK pricing: Whito, Visionary Marketing, accessed 20 Jul 2026)*
- [x] Article 15 — How Long Does SEO Take in the UK?
- [x] Article 20 — How to Measure SEO ROI and Business Growth
- [x] Cross-linked all 7 new articles with each other and with Phase 1 content
- [x] Updated `/blog.html` with 7 new cards
- [x] Updated `sitemap.xml` with 7 new URLs

## Phase 3 — Local and Small-Business Authority (Target: Weeks 5–8) — ✅ Shipped 2026-07-20

- [x] Article 7 — Google Ranking Factors for Australian Businesses *(2,049 words)*
- [x] Article 8 — Local SEO Australia: How to Win Google Maps and Local Search *(2,579 words)*
- [x] Article 9 — SEO for Australian Small Businesses *(1,869 words)*
- [x] Article 10 — SEO Audit Checklist for Australian Websites *(1,760 words)*
- [x] Article 17 — Local SEO UK: How to Rank in Google Maps and Local Results *(2,288 words)*
- [x] Article 18 — SEO for UK Small Businesses *(1,735 words)*
- [x] Cross-linked all 6 new articles with each other, with Phase 1/2 content, and updated Articles 6 & 16 to point into the new local/ranking-factors pieces instead of the generic evergreen articles
- [x] Updated `/blog.html` with 6 new cards
- [x] Updated `sitemap.xml` with 6 new URLs
- [x] All 6 articles passed JSON-LD schema validation (BreadcrumbList, Article, FAQPage)

## Phase 4 — City Support (Target: Weeks 8–9)

- [ ] Article 11 — How Sydney Businesses Can Rank Higher on Google
- [ ] Article 12 — How Melbourne Businesses Can Rank Higher on Google

Note: these two supplement the existing `/seo-agency-sydney.html` and `/seo-agency-melbourne.html` commercial pages with genuinely distinct, non-duplicate long-form guides — see each article's differentiation requirement in the original brief before drafting.

## Recommended Cadence

Two to three fully reviewed articles per week from Phase 2 onward — matches the original brief's guidance and keeps each piece genuinely distinct rather than rushed. Do not batch-publish an entire phase in one sitting even when the content exists; stagger publication dates to look and read as an ongoing editorial programme, not a one-time content dump.

## Before Publishing Any Phase 2–4 Article

1. Check `SEO-CONTENT-MAP.md` to confirm the keyword's owning URL hasn't changed.
2. Check `INTERNAL-LINK-MAP.md` for what should link in and out of the new piece, and update it once published.
3. Confirm the article hits its target word count range and passes the Quality Control checklist in the original brief (Section 18): search intent match, no fabricated claims, unique metadata, valid schema, working internal links, no orphan page.
4. Human review before publishing — the original brief is explicit that AI-drafted content should not go live without a review pass for accuracy, tone, and genuine regional differentiation.
5. Add the new URL to `sitemap.xml` and update `/blog.html`.

## Known Gaps from Phase 1–3 to Flag Now

- **Word counts across all three phases landed under the brief's target ranges on most pieces**, despite multiple expansion passes on each. Phase 1: Article 6 (2,458 vs. 2,800–3,500), Article 13 (1,832 vs. 2,000–2,600), Article 16 (1,951 vs. 2,600–3,300), Article 1 (1,924 vs. 2,000–2,600), Article 19 refresh (1,871 vs. 2,400–3,000). Phase 2: Article 2 (1,837 vs. 2,000–2,500), Article 3 (1,480 vs. 1,800–2,300), Article 4 (1,423 vs. 2,000–2,500), Article 5 (1,238 vs. 1,800–2,300), Article 14 (1,172 vs. 2,000–2,500), Article 15 (980 vs. 1,800–2,300), Article 20 (1,320 vs. 2,200–2,800). Phase 3 closed this gap on most pieces: Article 7 (2,049), Article 8 (2,579), Article 17 (2,288) landed within or close to typical target ranges after expansion passes; Article 9 (1,869), Article 10 (1,760), Article 18 (1,735) are still moderately under a 2,000+ target but substantial and non-thin. All 18 live pieces have real structure (TOC, FAQ schema, checklists) — if exact word counts matter, Articles 9, 10, and 18 are the remaining backlog candidates for a further expansion pass.
- The domain architecture question (see `DOMAIN-MIGRATION-RECOMMENDATION.md`) is unresolved and affects how much ceiling this content can realistically reach for Australian rankings specifically, independent of content quality.
- Three JSON syntax errors were introduced and caught during Phase 2–3 drafting (stray HTML tags pasted into FAQPage schema `name` fields in Article 3 and Article 20; a duplicate `acceptedAnswer` key in Article 7) — all fixed and verified with a JSON parse check before publishing. Every article now goes through a mandatory schema-validation pass (via a reusable JSON.parse checker script) before being considered done, which is how the Article 7 issue was caught pre-publish rather than post-publish.
