# WowGlamDecor — Hub Page Generation Prompt
## Version 2.0 · Visual-First · Zero AI Markers · Comprehensive Buyer Guide · R2 Images

---

## HOW TO USE THIS PROMPT

Provide:
- **Category name** — e.g. "Floor Rugs & Carpets"
- **Category slug** — e.g. `rugs-carpets` (must match D1 categories table)
- **Target buyer** — e.g. "woman, 28-45, renting or owns, wants luxury look on a real budget"
- **Existing product images in R2** — list any already uploaded to `products/` folder

What you get back:
1. Complete `_index.md` ready to save to `content/{category}/`
2. Image Brief with exact R2 upload paths and AI generation prompts
3. Nothing else to edit — drop file in, commit, done

---

## THE CORE RULES

**This is a buyer destination, not a content article.**
Every person who lands on this page is shopping or about to shop. Give them everything they need to make a confident decision. When they leave, they should feel like they just spoke to the most knowledgeable friend they have in home decor.

**Visuals are everything on a decor site.**
Every major section gets an image. Every type gets an image. Every style gets an image. Every room gets an image. A reader who skims images and headings only should still understand exactly what to buy and why.

**Comprehensive beats minimal.**
Do NOT limit types to 5. Do NOT limit styles to 4. Do NOT limit rooms to 3. Cover every type, every style, every room that is genuinely relevant to this category. A potential buyer searching for "coastal bedroom rug" should find their answer on this page — not have to leave.

**Short, punchy, skimmable.**
This is a decor site. No walls of text. Short sentences. Each paragraph: 2-4 sentences maximum. Use h3 headings to break up every section. Bullets over prose wherever a list is more scannable.

---

## ZERO AI MARKERS — NON-NEGOTIABLE

**These phrases trigger an automatic rewrite. Never use:**
- Long em dashes as clause connectors (use a full stop or comma instead)
- "There are many ways to..." / "It is important to note..."
- "In this guide, we will..." / "As you can see..."
- "Additionally," / "Furthermore," / "Moreover,"
- "When it comes to..." / "Having said that..."
- Hedging: "may," "might," "could potentially," "it seems"
- Three or more abstract nouns in one sentence
- Any sentence that reads like it could appear in any article about any topic
- Consecutive sentences with identical grammatical structure
- Starting a paragraph with "One of the most..."

**Write like a brilliant, trusted friend who knows exactly what to buy.**

---

## SABRI SUBY RULES — APPLIED TO HUB PAGES

Hub pages are not blog posts. They do not follow the 17-step sales sequence.
But these rules still apply:

1. **Name the real pain in the intro.** The reader is here because something in their home bothers them. Name it specifically. "You know what you want. You've saved 50 pins. And yet..."
2. **Sell the feeling, not the feature.** Nobody buys a lamp. They buy the glow that makes their bedroom feel like a five-star suite.
3. **Every product CTA leads with outcome.** "Check Current Price" is fine. But the card name and description above it should create desire first.
4. **Price anchor luxury first.** Show the $500 option before the $50 option. Make the $150 option feel like the smart middle choice.
5. **Fear of regret.** "Get the size wrong and even the most expensive rug looks cheap." Useful warnings convert.

---

## IMAGE SYSTEM — HUB PAGES

**R2 Base URL:** `https://images.wowglamdecor.com/`

**Hub page folder structure:**
```
hubs/{category-slug}/
  hero.jpg                    (1200x630px landscape — 16:9)
  types-overview.jpg          (1000x1500px portrait — 2:3)  optional
  type-{type-slug}.jpg        (1000x1500px portrait — 2:3)  one per type
  style-{style-slug}.jpg      (1000x1500px portrait — 2:3)  one per style
  room-{room-slug}.jpg        (1000x1500px portrait — 2:3)  one per room
  how-to-choose.jpg           (1000x1500px portrait — 2:3)  optional
  sizing-guide.jpg            (1000x1500px portrait — 2:3)  optional
  materials-guide.jpg         (1000x1500px portrait — 2:3)  optional
```

**Image style rules:**
- Every image: luxury interior photography aesthetic
- Warm, editorial lighting — never flat studio light
- Always show the product IN its natural environment
- No white backgrounds ever
- For type images: lifestyle shot showing the specific type in use
- For style images: fully styled room shot representing that aesthetic
- For room images: that specific room with the product featured prominently
- Hero: wide-angle lifestyle shot showing the category at its most aspirational

**Image keys in frontmatter use the path after the R2 base URL:**
```yaml
hero_image: "hubs/rugs-carpets/hero.jpg"
types:
  - name: "Area Rugs"
    image: "hubs/rugs-carpets/type-area-rugs.jpg"
```

---

## FRONTMATTER SCHEMA — COMPLETE

Generate ALL of these fields. Do not skip any section.

```yaml
---
title: "[SEO H1 — target primary buyer keyword + emotional hook. Example: Glam Rugs That Make Every Room Feel Finished]"
description: "[150-160 characters exactly. Primary keyword + specific outcome. No hedging.]"
category_slug: "[matches D1 categories.slug exactly]"
category_name: "[display name — e.g. Rugs & Carpets]"
hero_image: "hubs/[category-slug]/hero.jpg"
hero_image_alt: "[descriptive alt text with primary keyword]"
layout: [category-slug]
type: [category-slug]

# ── SECTION INTROS (unique per category — no generic text) ─────────────
types_intro: "[1 sentence. Specific to this category. No 'not all X are created equal'.]"
shop_intro: "[1 sentence. Specific outcome — e.g. 'Filter by room to find the right pile height for your space.']"
styles_intro: "[1 sentence. Specific to how style choices differ in this category.]"
rooms_intro: "[1 sentence. Specific to how this category performs differently room by room.]"
choose_intro: "[1 sentence. The single biggest mistake buyers make with this category.]"
price_intro: "[1 sentence. What the money actually buys in this category.]"

# ── HERO PRODUCTS (static SEO fallback — 2-4 products) ─────────────────
featured_products:
  - slug: "[product-slug-matching-D1]"
    name: "[Product Name]"
    price_label: "$XX–$XX"
    image_key: "products/[filename.png]"
    affiliate_url: "https://amzn.to/YOURLINK"
    room: "[room-slug]"

# ── TYPES (cover ALL relevant types — no minimum, no maximum) ───────────
# Each type gets a lifestyle image. Short description. 2-3 sentences max.
types:
  - name: "[Type Name]"
    image: "hubs/[category-slug]/type-[type-slug].jpg"
    image_alt: "[alt text]"
    description: "[2-3 sentences. What it is. Where it works. What makes it different. Short punchy sentences.]"
    best_for: "[specific rooms or situations — be specific, not generic]"

# ── STYLES (cover ALL relevant styles for this category) ────────────────
# Do not limit to 5. If 8 styles apply, write 8. Each gets an image.
styles:
  - name: "[Style Name]"
    slug: "[style-slug — must match: luxury-glam, modern-minimalist, boho-eclectic, art-deco, coastal, rustic-farmhouse, scandinavian, traditional, industrial]"
    image: "hubs/[category-slug]/style-[style-slug].jpg"
    image_alt: "[alt text]"
    description: "[2-3 sentences. What this style looks like in this specific category. Specific materials and details.]"
    materials: "[specific materials — comma separated]"
    price_range: "$XX–$XX+"
    best_room: "[specific rooms]"

# ── ROOMS (cover ALL relevant rooms — no minimum, no maximum) ───────────
# Every room where someone would realistically use this category gets a card.
# Each room gets an image.
rooms:
  - name: "[Room Name]"
    slug: "[room-slug — must match: bedroom, living-room, dining-room, bathroom, home-office, entryway, kids-room, outdoor]"
    image: "hubs/[category-slug]/room-[room-slug].jpg"
    image_alt: "[alt text]"
    recommendation: "[Specific product type recommendation for this room. 1-2 sentences.]"
    spec_label: "[Category-specific spec label — e.g. 'Pile height' for rugs, 'Brightness' for lamps, 'Fabric weight' for curtains]"
    spec_value: "[Specific value — e.g. '0.5 inches or less for high traffic']"
    placement: "[Specific placement rule for this room. Numbers where possible.]"

# ── HOW TO CHOOSE ────────────────────────────────────────────────────────
# Specific to this category — no generic advice
# 4-6 sections. Short paragraphs. Real information buyers need.
choose_intro: "[The single biggest buying mistake in this category — in one sentence.]"
choose_image: "hubs/[category-slug]/how-to-choose.jpg"
choose_image_alt: "[alt text]"
choose_sections:
  - heading: "[Specific heading — e.g. 'By room traffic level' not 'By room size']"
    content: "[2-4 sentences. Specific, useful, numbers where possible. No hedging.]"
red_flags:
  - "[Specific red flag — what to look for in a listing. Start with the signal, not the consequence.]"
  - "[Another specific red flag]"

# ── SIZING GUIDE (include for all categories where size matters) ─────────
sizing_title: "[Category-appropriate title — e.g. 'Rug Sizing Guide' or 'Curtain Length Guide']"
sizing_intro: "[1 sentence — the most common sizing mistake in this category.]"
sizing_image: "hubs/[category-slug]/sizing-guide.jpg"
sizing_image_alt: "[alt text]"
sizing_rules:
  - label: "[Specific measurement or situation]"
    value: "[Specific rule — numbers, inches, feet, percentages where applicable]"

# ── MATERIALS GUIDE ──────────────────────────────────────────────────────
materials_title: "[Category-appropriate title — e.g. 'Fabric Guide' or 'Materials + Finish Guide']"
materials_intro: "[1 sentence — why materials matter more than most buyers realise in this category.]"
materials_image: "hubs/[category-slug]/materials-guide.jpg"
materials_image_alt: "[alt text]"
materials_sections:
  - heading: "[Material name or comparison — e.g. 'Wool vs Polypropylene']"
    content: "[3-4 sentences. What it is. How it performs. Who it's for. Specific not generic.]"
quality_signals:
  - "[One-line quality signal — what to look for in product listings]"

# ── CARE + MAINTENANCE ───────────────────────────────────────────────────
care_title: "Care + Maintenance"
care_image: "hubs/[category-slug]/care-guide.jpg"  # optional
care_sections:
  - heading: "[Specific care task — e.g. 'Removing a pet hair from a shag rug']"
    content: "[Step-by-step or practical. Short sentences. Actionable.]"

# ── CATEGORY BASICS (educational — unique title per category) ────────────
basics_title: "[Category-specific title — e.g. 'Lighting Basics' / 'Rug Pile Basics' / 'Thread Count Explained']"
basics_intro: "[1 sentence — the one thing most buyers get wrong in this category.]"
basics_sections:
  - heading: "[Concept name]"
    content: "[3-4 sentences. Explain like talking to a smart friend. No jargon without definition.]"

# ── PRICE TIERS (4 tiers — luxury anchored first) ────────────────────────
price_tiers:
  - range: "$500+ Luxury"
    content: "[What you get at this level — specific materials, brands, craftsmanship. 2 sentences.]"
    highlight: false
  - range: "$150–$500"
    content: "[What you get — real materials, noticeable quality difference. 2 sentences.]"
    highlight: false
  - range: "$50–$150 Sweet Spot"
    content: "[Why this is the best value tier — specific reasons. 2 sentences.]"
    highlight: true
  - range: "Under $50"
    content: "[Honest assessment — when it works, when it doesn't. 2 sentences.]"
    highlight: false

# ── FAQ (8-12 questions — target People Also Ask) ────────────────────────
# Questions must match real PAA results for this category
# Answers: 3-5 sentences. Specific. No hedging. Short sentences.
faqs:
  - question: "[Real question people search — specific to this category]"
    answer: "[3-5 sentences. Direct answer first. Then supporting detail. No fluff.]"

# ── RELATED HUBS ─────────────────────────────────────────────────────────
related_hubs:
  - name: "[Related category name]"
    url: "/[category-slug]/"
---
```

---

## BODY CONTENT (after the closing ---)

Write 3 paragraphs. 40-60 words each. Total: 120-180 words.

**Paragraph 1 — The real pain.**
Name the specific frustration a buyer feels when this category is wrong in their home. Use the Sabri Suby agitation approach — describe what they see, what they feel, what guests notice. Make it real. No generic "home decor is important."

**Paragraph 2 — The glam angle.**
What specifically does getting this category right look like in a luxury glam interior? Paint the specific outcome. Name specific materials, specific feelings, specific moments. Short sentences. High imagery.

**Paragraph 3 — What this guide does.**
One sentence only: tell them exactly what this page covers, in plain language. No "In this comprehensive guide we will explore..."

---

## IMAGE BRIEF

After the `_index.md`, output this block:

```
IMAGE BRIEF — hubs/[category-slug]/
R2 bucket folder: hubs/[category-slug]/

HERO (1 image · 1200x630px landscape)
  Upload to: hubs/[category-slug]/hero.jpg
  AI prompt: [Detailed lifestyle scene. Specific room. Specific lighting. Specific mood.
              Include: warm editorial lighting, luxury interior, aspirational but achievable,
              no text overlays, no people's faces visible, photorealistic style.]

TYPES ([n] images · 1000x1500px portrait)
  [For each type:]
  Upload to: hubs/[category-slug]/type-[type-slug].jpg
  AI prompt: [Specific lifestyle shot of this type in its ideal setting.]

STYLES ([n] images · 1000x1500px portrait)
  [For each style:]
  Upload to: hubs/[category-slug]/style-[style-slug].jpg
  AI prompt: [Fully styled room shot. Name the specific style. Name the dominant colours,
              materials, and mood. Warm editorial lighting. No people.]

ROOMS ([n] images · 1000x1500px portrait)
  [For each room:]
  Upload to: hubs/[category-slug]/room-[room-slug].jpg
  AI prompt: [This specific room with the category product as a featured element.
              Natural lighting. Luxury styling. Aspirational but realistic.]

HOW TO CHOOSE (1 image · 1000x1500px portrait)
  Upload to: hubs/[category-slug]/how-to-choose.jpg
  AI prompt: [Flat-lay or styled shot showing multiple options side by side for comparison.
              Clean editorial styling. Warm light. No text.]

SIZING GUIDE (1 image · 1000x1500px portrait)  [if applicable]
  Upload to: hubs/[category-slug]/sizing-guide.jpg
  AI prompt: [Styled room shot showing correct sizing/placement. Shows the rule visually.]

MATERIALS (1 image · 1000x1500px portrait)  [if applicable]
  Upload to: hubs/[category-slug]/materials-guide.jpg
  AI prompt: [Close-up detail shot showing material textures. Warm light. Luxury feel.]

TOTALS:
  Hero: 1 · Types: [n] · Styles: [n] · Rooms: [n] · Other: [n] · TOTAL: [n]
```

---

## QUALITY CHECKLIST — Run before outputting

- [ ] Every text field is unique to this category — zero copy-paste from other hub pages
- [ ] Zero AI markers — no em dashes as connectors, no banned phrases
- [ ] Every type has an image field with the correct R2 path
- [ ] Every style has an image field with the correct R2 path
- [ ] Every room has an image field with the correct R2 path
- [ ] Body content: 3 paragraphs, 40-60 words each, zero hedging
- [ ] FAQ answers: 3-5 sentences, specific, direct answer first
- [ ] Price tiers: luxury anchored first (not cheapest first)
- [ ] choose_sections: specific to THIS category, not generic buying advice
- [ ] sizing_rules: real numbers wherever applicable
- [ ] materials_sections: specific materials for THIS category
- [ ] All room slugs match: bedroom, living-room, dining-room, bathroom, home-office, entryway, kids-room, outdoor
- [ ] All style slugs match: luxury-glam, modern-minimalist, boho-eclectic, art-deco, coastal, rustic-farmhouse, scandinavian, traditional, industrial
- [ ] Image Brief included after the frontmatter
- [ ] hero_image_alt contains primary keyword
- [ ] description is exactly 150-160 characters

---

## EXAMPLE — LAMPS (use as reference, not template)

```yaml
types_intro: "The lamp type you choose changes the entire light plan of a room — not just how bright it is, but how it feels at 9pm."
shop_intro: "Filter by room to find lamps sized and styled for your specific space."
styles_intro: "Gold looks completely different in a Luxury Glam context versus an Art Deco one — here's how each aesthetic plays out in lighting."
choose_intro: "Most buyers get the height wrong — a lamp that's too short looks like an afterthought, no matter the price."
```

---

*wowglamdecor.com · Hub Page Prompt v2.0 · Visual-First · Zero AI Markers · Comprehensive Coverage*
