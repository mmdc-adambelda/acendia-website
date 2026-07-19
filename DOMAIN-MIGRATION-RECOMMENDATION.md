# Domain Migration Recommendation — acendia.uk and Multi-Region SEO

**Status: informational only. No domain or production DNS changes have been made or are recommended without explicit client approval.**

## The Core Issue

`acendia.uk` is a United Kingdom country-code top-level domain (ccTLD). Google treats a ccTLD as a strong geo-targeting signal toward that specific country. This is genuinely useful for UK rankings — it reinforces every other UK signal on the site — but it works against Australian visibility in the same way: a `.uk` domain gives Google a structural reason to weight the site toward the UK, which can quietly cap how well any single domain can rank for "SEO company in Australia" long-term, independent of content quality or authority.

This is separate from (and compounds) the brand-name collision with "Asendia" (an unrelated, established international shipping company) flagged earlier in this engagement — that issue affects brand-name search specifically; this issue affects country-targeting more broadly.

## Preferred Long-Term Architecture: Generic Domain + Country Subdirectories

Move to a generic top-level domain (e.g. `.com`, `.agency`, or similar) with country subdirectories:

- `https://acendia.agency/au/`
- `https://acendia.agency/uk/`
- `https://acendia.agency/nz/` (if NZ targeting is reinstated in future)

Each regional section would carry:

- A self-referencing canonical for every page within its own subdirectory
- Reciprocal `hreflang` annotations across equivalent pages:
  - `en-AU` → `/au/...`
  - `en-GB` → `/uk/...`
  - `en-NZ` → `/nz/...` (if applicable)
  - `x-default` → the primary/global fallback version
- One consolidated domain accumulating all authority, backlinks, and trust signals — rather than splitting them across multiple properties

**Important caveat specific to this business:** `acendia.agency` is not a placeholder domain — it is a separate, already-operating business site with different branding (flagged in the original technical SEO audit, Phase 0). Before this architecture could be implemented, the client needs to resolve the acendia.uk ↔ acendia.agency brand relationship first (see the original SEO audit's roadmap callout). This recommendation assumes that decision has been made in favour of consolidating under one flagship domain — it does not resolve that decision itself.

## Alternative Architecture: Separate Country Domains

Maintain (or acquire) fully separate domains per market:

- A `.co.uk` or `.uk` domain dedicated solely to the UK
- A `.com.au` domain dedicated solely to Australia

**Trade-offs:** this gives each market the strongest possible local ccTLD signal, but requires building authority, backlinks, and content independently for each domain — effectively running two (or three) separate SEO programmes indefinitely, with no shared authority between them. For a business this early in its SEO maturity (see the original audit's zero-backlink finding), this is a materially slower path to competitive visibility in either market than consolidating under one domain.

## Recommendation

Subdirectory architecture on a generic domain is the better long-term structure for this business, once the acendia.uk/acendia.agency brand question is resolved. Separate country domains are defensible only if the business plans to operate the AU and UK arms as genuinely distinct brands long-term.

## What This Phase Did Instead (No Migration)

Per the brief's explicit instruction not to migrate domains without approval, this phase kept all new content on the existing `acendia.uk` domain, structured so a future migration is straightforward:

- New content lives under `/blog/australia/` and `/blog/uk/` — the same subdirectory pattern the target architecture would use, just without a top-level `/au/` or `/uk/` regional root yet
- All new pages use root-relative asset and navigation paths (`/assets/...`, `/index.html`, etc.), which will resolve identically after a domain change with no path rewriting required
- Each new page's `lang` attribute is already set correctly (`en-AU` / `en-GB`) — the exact signal `hreflang` implementation would build on
- No `hreflang` tags were added in this phase, since a single-domain site serving one canonical version per topic does not need them yet; add them at the point a true parallel AU/UK page structure exists

## If a Migration Is Approved in Future

1. **Confirm the brand decision** — acendia.uk vs acendia.agency — before any technical migration work starts.
2. **Register and configure the target domain**, with hosting/CDN in place before cutover.
3. **301-redirect every existing acendia.uk URL** to its equivalent new-domain URL, mapped 1:1 — no redirect chains, no redirects to an unrelated page.
4. **Update every canonical tag, `og:url`, and schema `url`/`mainEntityOfPage`** to the new domain.
5. **Rebuild `sitemap.xml` and `robots.txt`** against the new domain and resubmit both in Google Search Console.
6. **Verify the new domain as a fresh property in Search Console** (in addition to keeping the old property to monitor the redirect transition) and in Google Analytics.
7. **Add `hreflang` annotations** across every AU/UK page pair once true parallel regional structure exists.
8. **QA checklist before go-live:**
   - Every redirect resolves with a single 301 hop (no chains)
   - No redirect points to a 404 or an unrelated page
   - Canonical tags match the live URL on every page
   - Structured data validates on a sample of pages per section
   - Search Console shows the new property picking up impressions within 1–2 weeks
   - Old domain's Search Console shows the expected drop in indexed pages as redirects are recognised
9. **Monitor rankings closely for 4–8 weeks post-migration** — a well-executed migration typically sees a temporary dip before recovering, but a large or sustained drop signals a redirect or canonical error that needs immediate investigation.

This is a multi-week project requiring client sign-off at the brand-decision stage before any technical work begins. It is not part of this content phase's scope.
