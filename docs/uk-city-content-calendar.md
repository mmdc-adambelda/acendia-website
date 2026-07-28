# UK City SEO Content Calendar — 20-Week Programme

**Programme start:** Monday, 3 August 2026
**Cadence:** One article per week, 20 weeks, running to Monday, 14 December 2026
**Status of this document:** Living reference — update the Status column as each article is published

## Scheduling Mechanism

This site is a static, framework-free HTML site deployed via GitHub Pages with no CMS, database, or built-in scheduling system — confirmed in [uk-city-seo-audit.md](uk-city-seo-audit.md). It cannot auto-publish content on a future date.

To satisfy the brief's requirement that future-dated content never appears live before its publish date, all 20 articles are written now as **complete, publish-ready drafts** and stored in a dedicated draft directory rather than the live blog folders:

```
blog/drafts/uk-city/week-01-how-london-businesses-rank-higher-google.html
blog/drafts/uk-city/week-02-local-seo-manchester.html
... (one file per week, numbered)
```

Each draft file:
- Is a complete, finished article meeting all Phase 8 writing standards (word count, schema, FAQs, CTAs, metadata).
- Carries `<meta name="robots" content="noindex, nofollow">` so it cannot be indexed if a crawler somehow discovers it before publication.
- Carries an HTML comment at the top of the file recording its intended `publishDate`, e.g. `<!-- publishDate: 2026-08-03 -->`.
- Is **not** linked from `blog.html`, any city page's "Related UK Resources" section, `sitemap.xml`, or any other live page — it is only reachable by direct URL, and only Acendia staff have that URL.

### Publication Instructions (repeat for each article, on or after its scheduled date)

1. Move the file from `blog/drafts/uk-city/week-NN-slug.html` to its live location:
   - `blog/uk/slug.html` for articles targeting a UK-wide or single-city UK topic (all 20 articles in this programme).
2. Remove the `<meta name="robots" content="noindex, nofollow">` tag and the `publishDate` HTML comment.
3. Update the canonical URL, Open Graph URL, and BreadcrumbList/Article schema `item`/`mainEntityOfPage` fields from the draft path to the live `blog/uk/` path.
4. Set `datePublished` in the Article schema to the actual go-live date (update it if the article is published later than originally scheduled — never backdate).
5. Add the article to `blog.html`'s article grid, in reverse-chronological order with the other UK articles.
6. Add the article's `<url>` entry to `sitemap.xml`.
7. Add the internal link from the article's primary city landing page's "Related UK Resources" section, replacing or supplementing one of the three general UK guides currently linked there (see [uk-internal-link-map.md](uk-internal-link-map.md)).
8. Update the Status column in this document to "Published" and record the actual publish date if different from scheduled.
9. Commit and push with a message referencing the week number and title.

## Twenty-Week Schedule

| Week | Publish Date | Title | Primary Keyword | Secondary Keywords | Search Intent | Target City | Slug | City Page Link | Supporting Service Links | CTA | Status | Owner | Last Updated |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-08-03 | How London Businesses Can Rank Higher on Google | how to rank higher on Google London | SEO tips London, improve Google rankings London | Informational | London | how-london-businesses-rank-higher-google | seo-agency-london.html | services.html#seo, services.html#local-seo | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 2 | 2026-08-10 | Local SEO Manchester: How to Win More Local Customers | local SEO Manchester | Manchester Google Business Profile, Manchester Map Pack | Informational | Manchester | local-seo-manchester | seo-agency-manchester.html | services.html#local-seo, services.html#google-business-profile | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 3 | 2026-08-17 | SEO for Birmingham Businesses: A Practical Growth Guide | SEO for Birmingham businesses | Birmingham SEO strategy, West Midlands SEO | Informational | Birmingham | seo-for-birmingham-businesses | seo-agency-birmingham.html | services.html#seo, services.html#local-seo | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 4 | 2026-08-24 | How Leeds Businesses Can Improve Their Google Rankings | improve Google rankings Leeds | Leeds SEO tips, Leeds search visibility | Informational | Leeds | improve-google-rankings-leeds | seo-agency-leeds.html | services.html#seo, services.html#content-marketing | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 5 | 2026-08-31 | Local SEO Glasgow: How to Rank in Search and Google Maps | local SEO Glasgow | Glasgow Map Pack, Glasgow Google Business Profile | Informational | Glasgow | local-seo-glasgow | seo-agency-glasgow.html | services.html#local-seo, services.html#google-business-profile | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 6 | 2026-09-07 | SEO for Bristol Small Businesses: Where to Start | SEO for small businesses Bristol | Bristol SEO basics, Bristol website SEO | Informational | Bristol | seo-for-small-businesses-bristol | seo-agency-bristol.html | services.html#seo, services.html#website-development | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 7 | 2026-09-14 | How Liverpool Businesses Can Generate More Leads from Google | generate leads from Google Liverpool | Liverpool lead generation, Liverpool SEO | Informational | Liverpool | generate-leads-google-liverpool | seo-agency-liverpool.html | services.html#lead-generation, services.html#local-seo | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 8 | 2026-09-21 | Local SEO Edinburgh: A Guide to Search and Maps Visibility | local SEO Edinburgh | Edinburgh Google Business Profile, Edinburgh Map Pack | Informational | Edinburgh | local-seo-edinburgh | seo-agency-edinburgh.html | services.html#local-seo, services.html#seo | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 9 | 2026-09-28 | SEO for Sheffield Service Businesses: A Step-by-Step Strategy | SEO for Sheffield businesses | Sheffield SEO strategy, South Yorkshire SEO | Informational | Sheffield | seo-for-sheffield-businesses | seo-agency-sheffield.html | services.html#seo, services.html#lead-generation | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 10 | 2026-10-05 | How Newcastle Businesses Can Rank Higher on Google | rank higher on Google Newcastle | Newcastle SEO tips, North East SEO | Informational | Newcastle | rank-higher-google-newcastle | seo-agency-newcastle.html | services.html#seo, services.html#local-seo | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 11 | 2026-10-12 | How Much Does SEO Cost in London? | SEO cost London | London SEO pricing, SEO fees London | Commercial investigation | London | seo-cost-london | seo-agency-london.html | services.html#seo, contact.html | Request Tailored Proposal | Drafted | TBC | 2026-07-28 |
| 12 | 2026-10-19 | How to Choose an SEO Agency in Manchester | choose an SEO agency Manchester | Manchester SEO agency comparison, hiring an SEO company Manchester | Commercial investigation | Manchester | choose-seo-agency-manchester | seo-agency-manchester.html | services.html#seo, case-studies.html | Book a Strategy Call | Drafted | TBC | 2026-07-28 |
| 13 | 2026-10-26 | Birmingham SEO Audit Checklist for Business Websites | SEO audit Birmingham | Birmingham technical SEO, website audit checklist | Informational | Birmingham | seo-audit-checklist-birmingham | seo-agency-birmingham.html | services.html#seo, contact.html#audit | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 14 | 2026-11-02 | Local Keyword Research for Leeds Businesses | local keyword research Leeds | Leeds keyword strategy, Leeds search terms | Informational | Leeds | local-keyword-research-leeds | seo-agency-leeds.html | services.html#seo, services.html#content-marketing | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 15 | 2026-11-09 | Google Business Profile Optimisation for Glasgow Businesses | Google Business Profile optimisation Glasgow | Glasgow GBP setup, Glasgow local listings | Informational | Glasgow | google-business-profile-optimisation-glasgow | seo-agency-glasgow.html | services.html#google-business-profile, services.html#local-seo | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 16 | 2026-11-16 | Website Speed and SEO for Bristol Businesses | website speed SEO Bristol | Bristol Core Web Vitals, Bristol site performance | Informational | Bristol | website-speed-seo-bristol | seo-agency-bristol.html | services.html#website-development, services.html#seo | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 17 | 2026-11-23 | Content Marketing and SEO for Liverpool Businesses | content marketing SEO Liverpool | Liverpool content strategy, Liverpool blog SEO | Informational | Liverpool | content-marketing-seo-liverpool | seo-agency-liverpool.html | services.html#content-marketing, services.html#seo | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 18 | 2026-11-30 | Technical SEO for Edinburgh Business Websites | technical SEO Edinburgh | Edinburgh site audit, Edinburgh crawlability | Informational | Edinburgh | technical-seo-edinburgh | seo-agency-edinburgh.html | services.html#seo, contact.html#audit | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 19 | 2026-12-07 | Local Link Building for Sheffield Businesses | local link building Sheffield | Sheffield backlinks, Sheffield digital PR | Informational | Sheffield | local-link-building-sheffield | seo-agency-sheffield.html | services.html#seo, case-studies.html | Free SEO Audit | Drafted | TBC | 2026-07-28 |
| 20 | 2026-12-14 | How Newcastle Businesses Should Measure SEO ROI | SEO ROI Newcastle | Newcastle SEO reporting, Newcastle SEO results | Informational | Newcastle | seo-roi-newcastle | seo-agency-newcastle.html | services.html#seo, contact.html | Free SEO Audit | Drafted | TBC | 2026-07-28 |

## Status Legend

- **Drafted** — complete article written and stored in `blog/drafts/uk-city/`, not yet live.
- **Published** — moved to `blog/uk/`, linked from `blog.html`, `sitemap.xml`, and its city page.
- **Delayed** — scheduled date passed without publication; note the reason and revised date in a comment row.

## Notes for Whoever Publishes These

- Do not publish a Week N article before Week N-1 has published, to avoid an odd gap in the visible archive — publish in order even if you're catching up after a delay.
- Every article's primary keyword is intentionally distinct from its supporting city landing page's commercial head term (see [uk-seo-keyword-map.md](uk-seo-keyword-map.md) for the full cannibalisation check) — city pages own the "SEO agency [City]" commercial terms, these articles own informational and comparison terms.
- Week 11 ("How Much Does SEO Cost in London?") explicitly avoids stating an Acendia price — it explains the cost factors and points to a tailored proposal request. Do not add specific pricing when publishing.
