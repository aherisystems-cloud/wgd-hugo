# WowGlamDecor — Project Context & Progress Tracker
**Site:** wowglamdecor.com
**Stack:** Hugo + Cloudflare D1 + Workers + R2 + KV
**Last Updated:** 2026-03-26

---

## Architecture Summary

```
Hugo (SSG)          → Static HTML, SEO content, pSEO pages, blog
Cloudflare Workers  → /api/products endpoint (search + filters)
Cloudflare D1       → Product database (SQLite)
Cloudflare KV       → API response cache (1hr TTL)
Cloudflare R2       → Image CDN → images.wowglamdecor.com
GitHub              → Source control + deploy trigger → CF Pages
```

---

## PHASE 1 — Infrastructure

### Step 1 — D1 Database ✅ DONE
- Database name: `wowglamdecor-db`
- Tables created: `categories`, `products`
- Indexes created on: category_id, room, style, featured, published

### Step 2 — R2 Images ✅ DONE
- Bucket: `wgd-images`
- CDN URL: `https://images.wowglamdecor.com/`
- Image keys stored flat (no subfolders) — e.g. `gold-arc-floor-lamp.png`
- NOTE: images are mixed — product images + blog post images in same bucket

### Step 3 — Worker API ✅ DONE
- Worker name: `wowglamdecor-api`
- Live at: `wowglamdecor-api.wowglamdecor.workers.dev`
- Endpoints working:
  - GET /api/products ✅
  - GET /api/products/:slug ✅
  - GET /api/categories ✅
- Features: KV caching, CORS, input sanitization, pagination ✅

### Step 4 — Worker Bindings ✅ DONE
- Binding: `DB` → wowglamdecor-db (D1) ✅
- Binding: `CACHE` → wowglamdecor-cache (KV namespace) ✅

### Step 5 — Worker Route ✅ DONE
- Route: `wowglamdecor.com/api/*` → wowglamdecor-api ✅
- Tested on real domain: wowglamdecor.com/api/products ✅
- Tested on real domain: wowglamdecor.com/api/categories ✅

---

## PHASE 2 — Data

### Step 6 — Categories ✅ DONE
| id | slug | name | room | style |
|----|------|------|------|-------|
| 1 | lighting-lamps | Lighting & Lamps | any | luxury-glam |
| 2 | wall-decor | Wall Décor | living-room | any |
| 3 | mirrors | Mirrors | any | any |
| 4 | rugs-carpets | Rugs & Carpets | any | any |
| 5 | throw-pillows | Throw Pillows | living-room | any |
| 6 | vases-florals | Vases & Florals | any | any |
| 7 | bedding-linens | Bedding & Linens | bedroom | any |
| 8 | candles-scent | Candles & Scent | any | any |

### Step 7 — Products ✅ PARTIAL (5 of 100+ done)
| id | slug | name | price | room | featured |
|----|------|------|-------|------|----------|
| 1 | gold-arc-floor-lamp | Gold Arc Floor Lamp with Marble Base | $89–$149 | living-room | ✅ |
| 2 | crystal-table-lamp | Crystal Table Lamp with Gold Base | $49–$89 | bedroom | ✅ |
| 3 | gold-sunburst-mirror | Gold Sunburst Wall Mirror | $65–$120 | any | ✅ |
| 4 | velvet-throw-pillow-blush | Blush Velvet Throw Pillow Set | $28–$45 | living-room | ❌ |
| 5 | glam-area-rug-ivory | Ivory & Gold Glam Area Rug | $79–$199 | bedroom | ✅ |

**TODO:** 
- [ ] Replace all `affiliate_url` placeholder values with real Amazon links
- [ ] Match image_key values to actual R2 filenames
- [ ] Bulk import remaining 95+ products (use Google Sheet → SQL workflow)

---

## PHASE 3 — Hugo Frontend

### Step 8 — Filter + Search UI ✅ BUILT
### Step 9 — JS Fetch Logic ✅ BUILT
### Step 10 — Dynamic Product Shortcode ✅ BUILT

### Hub Page Template ✅ FULLY WORKING (2026-03-27)
- File: `layouts/lamps/list.html` — complete standalone HTML matching site design
- Live at: `http://localhost:1313/lamps/`
- ⚠️ KEY LESSON: Hugo uses list.html for _index.md section pages
- ⚠️ KEY LESSON: No baseof.html — each layout is a complete standalone HTML file
- ⚠️ KEY LESSON: JS goes in `static/js/` not `assets/js/` — served as `/js/` on site
- ⚠️ KEY LESSON: Never use `with` inside a parenthesized pipeline in Hugo templates
- All 16 sections rendering correctly
- Product filter bar working
- Dynamic API fetch working
- JSON-LD schemas injected
- Matches site brand (purple/gold, Nunito font, navbar, footer)

### Partials Built ✅
- `layouts/partials/product-card.html` — single product card
- `layouts/partials/product-block.html` — grid of cards with filter bar
- `layouts/partials/hub-jsonld.html` — all JSON-LD schemas
- `assets/js/product-filter.js` — fetch + render + URL sync + pagination

---

## PHASE 4 — Image Migration ✅ DONE

### What was done
- R2 bucket reorganized into two folders:
  - `blog/` → all blog post images
  - `products/` → all product images
- Hugo posts updated: `/content/images/` → `https://images.wowglamdecor.com/blog/`
- D1 product image_keys updated to use `products/` prefix
- hugo.toml params merged (was duplicate [params] blocks)
- Site builds cleanly: 190 pages, 0 errors

### Image conventions going forward
- Blog images: upload to R2 `/blog/` → reference as `https://images.wowglamdecor.com/blog/filename.jpg`
- Product images: upload to R2 `/products/` → reference in D1 as `products/filename.png`
- hugo.toml params available: `site.Params.r2Base`, `site.Params.blogImgs`, `site.Params.prodImgs`

---

## PHASE 5 — Content Architecture

### Hub Pages to Build
| URL | Category | Status |
|-----|----------|--------|
| /lamps/ | lighting-lamps | ⏳ Template ready, content needed |
| /wall-decor/ | wall-decor | ⏳ |
| /mirrors/ | mirrors | ⏳ |
| /rugs/ | rugs-carpets | ⏳ |
| /throw-pillows/ | throw-pillows | ⏳ |
| /vases/ | vases-florals | ⏳ |
| /bedding/ | bedding-linens | ⏳ |
| /candles/ | candles-scent | ⏳ |

### Hub Page Sections (all hub pages follow this structure)
1. Hero H1 + intro (150 words)
2. Types of [category]
3. ★ Featured products block (static top 3 + dynamic)
4. How to choose (buyer guide)
5. Style-by-style breakdown (glam / boho / minimalist / art deco / coastal / farmhouse)
6. Room-by-room pairing guide
7. Mid-page product block (filtered by room)
8. Sizing + placement guide
9. Materials + quality guide
10. Care + maintenance
11. Lighting/category basics
12. Price guide (budget tiers)
13. ★ Price-filtered product block
14. FAQ (8–12 questions — FAQPage schema)
15. Related categories + internal links
16. pSEO room sub-pages links

### pSEO Pages to Build
| URL Pattern | Example |
|-------------|---------|
| /{room}/{category}/ | /bedroom/lamps/ |
| /{style}/{category}/ | /luxury-glam/lighting/ |

### Blog Post Types
- Roundups: "15 Best X for Y" → links to hub
- Guides: "How to Style X Room" → links to 3–4 hubs
- Comparisons: "X vs Y" → links to category hub
- Room Makeovers: "Before & After" → embeds product shortcodes

---

## PHASE 6 — SEO Safety ⏳ PENDING
- [ ] Create `data/products.json` (static export of D1)
- [ ] Add static top-3 fallback to all hub/category pages
- [ ] Add JSON-LD ItemList + FAQPage schemas
- [ ] Add BreadcrumbList to all pages
- [ ] Set canonical URLs on all pSEO pages

---

## PHASE 7 — Workflows

### Content Workflow (per new post)
1. Generate post content
2. Upload images → R2 (naming: `{post-slug}-{n}.png`)
3. Add affiliate links → `data/links.json`
4. Set frontmatter: `product_category`, `room`, `style`
5. Add `{{< products >}}` shortcode where relevant
6. `hugo server` — verify locally
7. `git add . && git commit && git push` → auto-deploy

### Product Workflow (per new product)
1. Insert product into D1 via dashboard SQL console
2. Export: `wrangler d1 export wowglamdecor-db --output data/products.json`
3. Commit `data/products.json` → triggers Hugo rebuild
4. Product appears site-wide automatically

---

## Key Decisions Made
- Image keys stored as flat filenames in R2 (no subfolders)
- Worker builds full R2 URL at runtime from `image_key`
- Hub pages: ~4,000–6,000 words, 3 affiliate product blocks each
- pSEO pages: lighter version of hub, room+category specific
- Static top-3 products in Hugo data = SEO fallback for Googlebot
- FAQPage JSON-LD on every hub = People Also Ask targeting

---

## Controlled Vocabulary

### Room slugs
`bedroom` · `living-room` · `dining-room` · `bathroom` · `home-office` · `entryway`

### Style slugs
`luxury-glam` · `modern-minimalist` · `boho-eclectic` · `art-deco` · `coastal` · `rustic-farmhouse`

### Price tiers
`under-50` · `50-150` · `150-500` · `500-plus`

---

## Files Built This Session
| File | Purpose |
|------|---------|
| `layouts/hub/single.html` | Master hub page template |
| `layouts/partials/product-card.html` | Single product card partial |
| `layouts/partials/product-block.html` | Product grid + filter bar |
| `layouts/partials/hub-jsonld.html` | All JSON-LD schemas |
| `assets/js/product-filter.js` | Dynamic fetch, render, URL sync |
| `data/links.json` | Affiliate link store |
| `wowglamdecor-context.md` | This file |

---

## Next Session — Pick Up From
➡ **Step 3: Create the Worker** in Cloudflare dashboard
- User is at: Cloudflare → Workers & Pages → Create Worker
- Worker named: `wowglamdecor-api`
- After deploy → Edit Code → paste Worker JS
