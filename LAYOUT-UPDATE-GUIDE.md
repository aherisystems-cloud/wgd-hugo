# Layout Update Guide — Navbar Partial + Linkification
## Apply to: list.html, single.html, term.html, index.html

---

## STEP 1 — Replace CSS link in every `<head>`

Find (in every layout):
```html
<link rel="stylesheet" href="/css/mega-menu-patch.css">
```

Replace with:
```html
<link rel="stylesheet" href="/css/navbar.css">
<link rel="stylesheet" href="/css/linkify.css">
```

Note: `single.html` has this CSS inlined in a `<style>` block instead of a link.
For single.html, ADD these two lines after the closing `</style>` tag.

---

## STEP 2 — Replace hardcoded navbar in every layout

In each layout, find the entire block starting with:
```html
<!-- DISCLOSURE BAR -->
<div class="disclosure-bar">
```
...and ending with the closing `</nav>` tag of the navbar.

Replace the ENTIRE block with:
```hugo
{{ partial "navbar.html" . }}
```

The disclosure bar is included inside the navbar partial already.

---

## STEP 3 — Remove inlined navbar CSS from `<style>` blocks

In each layout, find and DELETE these CSS rule blocks from the `<style>` section.
(They are now in navbar.css — keeping them causes conflicts.)

Delete everything matching these selectors:
```
.navbar { ... }
.nav-container { ... }
.logo { ... }
.search-box { ... }
.search-input { ... }
.search-btn { ... }
.search-suggestions { ... }
.search-suggestions.active { ... }
.suggestion-item { ... }
.suggestion-thumb { ... }
.suggestion-content { ... }
.suggestion-title { ... }
.suggestion-meta { ... }
.suggestion-category { ... }
.search-footer { ... }
.no-results { ... }  (or .no-results-search)
.popular-searches { ... }
.popular-tag { ... }
.highlight { ... }
.search-loading { ... }
.loading-dots { ... }
.loading-dots span { ... }
@keyframes bounce { ... }
.nav-menu { ... }
.nav-link { ... }
.mobile-menu-btn { ... }
.mega-menu-wrapper { ... }
.mega-menu-trigger { ... }
.mega-menu { ... }
.mega-menu.mega-open { ... }
.mega-menu-grid { ... }
.mega-menu-section h4 { ... }
.mega-menu-links { ... }
.mega-menu-links li a { ... }
.mega-menu-links .icon { ... }
```

---

## STEP 4 — Remove inlined search JS

In each layout, find and DELETE the inline search script block.
It looks like this (may vary slightly per layout):

```javascript
(function(){
  const searchInput=document.getElementById('searchInput')
  ...
  window.performSearch=()=>{...}
})();
```

This is now handled by `/js/mega-menu.js` which is already loaded via:
```html
<script src="/js/mega-menu.js" defer></script>
```

Also DELETE the old mega menu JS block that looks like:
```javascript
(function(){
  const triggers = document.querySelectorAll('.mega-menu-trigger')
  ...
})();
```

---

## STEP 5 — Wire linkification into layouts

### single.html (blog posts) — add BOTH of these:

After `.post-content` closing div, add related products:
```hugo
{{ partial "related-products.html" . }}
```

Before the closing `</article>` or before related posts section, add related guides:
```hugo
{{ partial "related-guides.html" (dict "page" . "cat" .Params.product_category "room" .Params.room "style" .Params.style "limit" 3) }}
```

Add linkify.js before `</body>`:
```html
<script src="/js/linkify.js" defer></script>
```

Add class to your post body content wrapper:
Find: `<div class="post-content">` (or equivalent)
Make sure it has class `post-content` — linkify.js targets this selector.

### list.html (hub pages) — add related guides:

Before the newsletter block, add:
```hugo
{{ partial "related-guides.html" (dict "page" . "cat" .Params.category_slug "limit" 3) }}
```

### pseo-list.html (pSEO pages) — add related guides:

Before the hub CTA block, add:
```hugo
{{ partial "related-guides.html" (dict "page" . "cat" .Params.category_slug "room" (cond (eq .Params.pseo_type "room") .Params.filter_value "") "style" (cond (eq .Params.pseo_type "style") .Params.filter_value "") "limit" 3) }}
```

### term.html and index.html — no linkification needed.

---

## STEP 6 — Add frontmatter keys to blog posts

For the related products system to work, blog posts need these frontmatter fields:

```yaml
product_category: "lighting-lamps"   # matches D1 category_slug
room: "bedroom"                       # matches room slug
style: "luxury-glam"                  # matches style slug
pinned_products:                      # optional: force specific products to appear
  - "gold-arc-floor-lamp"
  - "crystal-table-lamp"
```

These are already in the content workflow — just make sure new posts include them.

---

## STEP 7 — Update your sync workflow

Add `generate-link-map.js` to your publish workflow, after `sync-products.js`:

```bash
node scripts/sync-products.js
node scripts/generate-link-map.js
git add data/products.json static/data/link-map.json
git commit -m "sync products + link map"
git push
```

---

## FILE PLACEMENT SUMMARY

```
layouts/partials/navbar.html          ← new (already built)
layouts/partials/breadcrumb.html      ← new (already built)
layouts/partials/related-products.html ← new
layouts/partials/related-guides.html  ← new
static/css/navbar.css                 ← new (replaces mega-menu-patch.css)
static/css/linkify.css                ← new
static/js/mega-menu.js                ← updated (replaces old)
static/js/linkify.js                  ← new
static/data/link-map.json             ← generated by script (gitignored or committed)
scripts/generate-link-map.js          ← new
```

---

## WHAT THIS GIVES YOU

**Blog posts:**
- Auto-linked product/category mentions in body text (max 2 per keyword)
- Related product cards block after body content
- Related guide cards block (if posts exist with matching tags)

**Hub pages:**
- Related guide cards block showing relevant blog posts
- Internal links from style/room cards → pSEO pages (already in hub template)

**pSEO pages:**
- Related guide cards block
- All navigation consistent via navbar partial

**Every layout:**
- Single source of truth for navbar — change once, updates everywhere
- No more 200-line navbar duplicated across 4 files
