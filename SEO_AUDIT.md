# SEO Audit Report — baysaass Portfolio

**Date:** 2026-05-16  
**Framework:** Next.js App Router (v16.2.6)  
**Pages audited:** `/`, `/work`, `/about`, `/contact`, `/work/[slug]`

---

## Summary

| Category | Before | After |
|----------|--------|-------|
| Critical issues | 8+ | 0 |
| Warnings resolved | 6 | 6 |
| New SEO files created | 0 | 3 |
| Pages with Open Graph | 0 | 5 |
| Pages with Twitter Card | 0 | 5 |
| Structured data (JSON-LD) | None | Person + WebSite |

---

## Changes Made

### 1. `app/layout.tsx` — Root layout overhaul

**What was wrong:** The root metadata was missing several critical and high-priority fields. There was no viewport export, no `metadataBase`, no Open Graph tags, no Twitter Card tags, no canonical URL, and no structured data.

**What was fixed:**
- Added `export const viewport` (Next.js App Router's correct way to inject `<meta name="viewport">`) with `width=device-width, initialScale=1, themeColor="#ffffff"`
- Added `metadataBase: new URL("https://baysaass.com")` — required for Next.js to resolve relative image URLs in OG/Twitter metadata
- Changed `title` to a template: `{ default: "baysaass — Brand Designer | Ulaanbaatar, Mongolia", template: "%s | baysaass" }` — subpages now automatically get suffixed titles
- Added full `openGraph` block: type, siteName, title, description, url, locale, and a 1200×630 OG image pointing to `/hero-showreel.jpg`
- Added `twitter` block: `summary_large_image` card type with title, description, and image
- Added `robots` directive: explicitly allows indexing and full Googlebot crawl
- Added `alternates.canonical: "/"`
- Added `<script type="application/ld+json">` in `<head>` with a `@graph` containing:
  - `Person` schema: name, jobTitle, email, location, sameAs (Instagram, Behance, Facebook, TikTok)
  - `WebSite` schema: url, name, description, publisher

### 2. `app/page.tsx` + `app/HomeContent.tsx` — Home page server/client split

**What was wrong:** `app/page.tsx` was a `"use client"` component. In Next.js App Router, only Server Components can export `metadata`. This meant the home page could not have page-specific metadata — it fell through entirely to the layout's default, with no way to set a canonical URL or page-specific OG override.

**What was fixed:**
- Extracted all client-side logic (Framer Motion, `useLang`, `TextRotate`, floating images) into a new `app/HomeContent.tsx` (marked `"use client"`)
- Rewrote `app/page.tsx` as a clean Server Component that exports `metadata` (title, description, canonical, openGraph) and renders `<HomeContent />`

### 3. `app/contact/page.tsx` + `app/contact/ContactContent.tsx` — Contact page server/client split

**What was wrong:** Same problem as the home page — `contact/page.tsx` was `"use client"` directly, so it could not export a `metadata` object. The contact page had zero title, description, or OG tags of its own.

**What was fixed:**
- Copied the full component to `app/contact/ContactContent.tsx` (renamed export to `ContactContent`)
- Rewrote `app/contact/page.tsx` as a Server Component with:
  - `title: "Contact"` (renders as "Contact | baysaass" via the title template)
  - Full description (155 chars) describing the contact purpose
  - Canonical URL `/contact`
  - OpenGraph block

### 4. `app/about/page.tsx` — Improved metadata + OG image

**What was wrong:** Description was too short and generic ("A brand designer based in Ulaanbaatar. Learn about the process, Branding, and clients." — 89 chars, well under 150). No OG tags or canonical URL.

**What was fixed:**
- Expanded description to 163 chars, naturally including "design process", "brand philosophy", "services"
- Added `alternates.canonical: "/about"`
- Added full `openGraph` block including an OG image pointing to `/about-portrait.jpg`

### 5. `app/work/page.tsx` — Improved metadata + OG tags

**What was wrong:** Description was too short ("Selected brand identity, packaging, and design projects." — 55 chars). No OG tags or canonical URL.

**What was fixed:**
- Expanded description to include "logo design" and "visual system projects by baysaass — a brand designer based in Ulaanbaatar, Mongolia"
- Added canonical URL and OpenGraph block

### 6. `app/work/[slug]/page.tsx` — OG image, Twitter Card, canonical per project

**What was added:**
- `alternates.canonical: "/work/${slug}"` on every project page
- Full `openGraph` block using the project's `cover` image (1200×630) — each project page now has a unique social preview using its cover photo
- `twitter` block with `summary_large_image` and project cover as image
- Description is now sliced to 160 characters to keep it within search engine limits

### 7. `app/sitemap.ts` — Dynamic XML sitemap (new file)

**What was added:** A Next.js `MetadataRoute.Sitemap` export that auto-generates `/sitemap.xml` including:
- `/` — priority 1.0, weekly
- `/work` — priority 0.9, weekly
- `/about` — priority 0.8, monthly
- `/contact` — priority 0.7, monthly
- Every project page from `getAllProjects()` — priority 0.7, monthly

Next.js serves this at `https://baysaass.com/sitemap.xml` automatically.

### 8. `public/robots.txt` — Crawl policy (new file)

**What was added:** Simple robots.txt that allows all crawlers and references the sitemap:
```
User-agent: *
Allow: /
Sitemap: https://baysaass.com/sitemap.xml
```

### 9. `public/og-image.jpg` — Fallback OG image (new file)

Copied `hero-showreel.jpg` to `og-image.jpg` as a named fallback for social share previews. The layout metadata references `/hero-showreel.jpg` directly (same image, two paths for flexibility).

### 10. `app/work/WorkContent.tsx` — Added missing `<h1>`

**What was wrong:** `ScrollFloat` renders an `<h2>` tag. The Work page had no `<h1>` at all — every page should have exactly one `<h1>` describing its primary topic.

**What was fixed:** Added a visually-hidden `<h1 className="sr-only">Work — Brand Design Portfolio by baysaass</h1>` above the section heading. Search engines read it; users see the animated ScrollFloat heading.

---

## Why These Changes Matter

**`metadataBase`** — Without it, relative URLs in OG image tags (`/hero-showreel.jpg`) are left as-is. Social crawlers (Facebook, Twitter, LinkedIn, Slack) expect absolute URLs and will fail to load the image, showing a blank card in previews.

**`export const viewport`** — Next.js App Router separates viewport from metadata. Without this, no `<meta name="viewport">` is injected and Google's mobile-first indexer treats the page as not mobile-ready.

**Server/client split for metadata** — Next.js cannot export `metadata` from `"use client"` components. Pages that were fully client components had zero title/description/OG output beyond the layout fallback.

**Sitemap + robots.txt** — Without a sitemap, Google has to discover pages by crawling links. With a sitemap, all project pages are immediately known to Googlebot. The robots.txt references the sitemap, which is the canonical way to register it.

**JSON-LD structured data** — The `Person` schema tells Google who owns the site, their job title, location, and social profiles. This can trigger rich results (Knowledge Panel) and improves entity association — especially important for a personal portfolio where the person *is* the brand.

---

## Remaining Recommendations

These items require your input or content decisions:

1. **Set your real domain.** Replace `https://baysaass.com` with your actual deployed URL in:
   - `app/layout.tsx` — `metadataBase` and `jsonLd`
   - `app/sitemap.ts` — `BASE_URL`
   - `public/robots.txt` — Sitemap line

2. **Create a proper 1200×630 OG image.** The current OG image (`/hero-showreel.jpg`) works as a fallback, but a purpose-made graphic (your name, title, and a portfolio thumbnail) performs better on social shares. Upload it to `/public/og-image.jpg`.

3. **Google Search Console.** Once deployed, submit your sitemap URL (`https://yourdomain.com/sitemap.xml`) in Google Search Console to accelerate indexing.

4. **Multilingual SEO (`hreflang`).** Your site supports English and Mongolian but serves both from the same URL, toggled client-side via `LanguageProvider`. For full multilingual SEO benefit, consider routing `/mn/` and `/en/` as separate paths with `hreflang` alternates. This is a larger architectural change — the current approach still indexes the English content served on first load.

5. **`images.unoptimized: true` in `next.config.mjs`.** This disables Next.js image optimization (WebP conversion, responsive sizes, lazy loading). If you're deploying to Vercel or another platform that supports Next.js image optimization, consider removing this flag for better Core Web Vitals (LCP, CLS).

6. **Page speed.** Run your deployed site through [PageSpeed Insights](https://pagespeed.web.dev) to identify LCP and CLS issues. The floating images on the home page load with a delay (intentional animation) which may affect LCP scores.
