# WowGlamDecor — pSEO Config Generation Prompt
## Version 1.0 · Bulk Page Generation · Zero AI Markers

---

## HOW TO USE

1. Paste the prompt below into a new Claude conversation
2. Tell Claude which combos to generate (see INPUT TYPES)
3. Copy the JSON output into the `pages` array in `data/pseo-config.json`
4. Run `node scripts/generate-pseo.js`
5. All `_index.md` files are written automatically

---
---

## PROMPT — COPY FROM HERE ↓

You are generating page config entries for WowGlamDecor's pSEO system.
Each entry in the output becomes one page on the site (e.g. /bedroom/lamps/).

Your output goes directly into a JSON config file. It will be processed by a script —
no human editing happens after you output it. Accuracy of every field is critical.

---

## SITE MODEL

WowGlamDecor is a luxury glam home decor affiliate site targeting women 28–45 who want
an aspirational look on a real budget. Voice: knowledgeable friend, never generic, never
salesy. The audience is shopping-ready. Every page must feel like the most useful resource
they've found for that specific room + category or style + category combination.

---

## CONTROLLED VOCABULARY — USE EXACTLY THESE VALUES

**category_slug / category name / hub URL:**
- lighting-lamps → Lamps → /lamps/
- mirrors → Mirrors → /mirrors/
- rugs-carpets → Rugs → /rugs/
- wall-decor → Wall Décor → /wall-decor/
- throw-pillows → Throw Pillows → /throw-pillows/
- vases-florals → Vases → /vases/
- bedding-linens → Bedding → /bedding/
- candles-scent → Candles → /candles/

**room slugs / labels / parent URLs:**
- bedroom → Bedroom → /bedroom/
- living-room → Living Room → /living-room/
- dining-room → Dining Room → /dining-room/
- bathroom → Bathroom → /bathroom/
- home-office → Home Office → /home-office/
- entryway → Entryway → /entryway/

**style slugs / labels / parent URLs:**
- luxury-glam → Luxury Glam → /luxury-glam/
- modern-minimalist → Modern Minimalist → /modern-minimalist/
- boho-eclectic → Boho Eclectic → /boho-eclectic/
- art-deco → Art Deco → /art-deco/
- coastal → Coastal → /coastal/
- rustic-farmhouse → Rustic Farmhouse → /rustic-farmhouse/
- scandinavian → Scandinavian → /scandinavian/
- traditional → Traditional → /traditional/
- industrial → Industrial → /industrial/

---

## OUTPUT FORMAT

Output a JSON array of page objects. Nothing else — no preamble, no explanation,
no markdown fences. Pure JSON array starting with `[` and ending with `]`.

Each page object must have ALL of these fields:

```json
{
  "pseo_type": "room",
  "filter_value": "bedroom",
  "category_slug": "lighting-lamps",
  "title": "SEO title — primary keyword + emotional hook. Max 65 characters.",
  "description": "Meta description. 150–160 characters exactly. Primary keyword + specific outcome. No hedging.",
  "hero_image": "hubs/lighting-lamps/room-bedroom.jpg",
  "hero_image_alt": "descriptive alt text with primary keyword",
  "intro": "1–2 sentences. Specific to this exact room + category combination. No generic openers.",
  "tip": "One specific buyer tip for this combination. Real numbers or specific advice. Not generic.",
  "faqs": [
    {
      "question": "Real question people search for this room + category combo",
      "answer": "3–5 sentences. Direct answer first. Specific advice. No hedging. Short sentences."
    }
  ],
  "body": "Three paragraphs separated by \\n\\n. 40–60 words each. See BODY RULES below.",
  "related_pages": [
    { "name": "Bedroom Mirrors", "url": "/bedroom/mirrors/" },
    { "name": "Living Room Lamps", "url": "/living-room/lamps/" },
    { "name": "Luxury Glam Lamps", "url": "/luxury-glam/lamps/" },
    { "name": "Bedroom Rugs", "url": "/bedroom/rugs/" }
  ]
}
```

---

## FIELD RULES

**title:** Target the primary search query for this combo. Include the room or style name
and the category name. Add an emotional or outcome hook. No clickbait. Max 65 characters.
Example: "Bedroom Lamps That Make Your Room Feel Like a Luxury Hotel"

**description:** Exactly 150–160 characters. Primary keyword near the start.
Specific outcome — what will the visitor find or be able to do after reading this page.
No "In this guide" or "We will cover". Count characters before finalising.

**hero_image:** Use the image that already exists from the hub page for this category.
Pattern: `hubs/{category-slug}/{pseo_type}-{filter-value}.jpg`
Example for room page: `hubs/lighting-lamps/room-bedroom.jpg`
Example for style page: `hubs/lighting-lamps/style-luxury-glam.jpg`

**intro:** This appears in the hero section. 1–2 sentences max. It must name the specific
benefit or tension of this exact combination. No "Are you looking for..." ever.

**tip:** One practical tip specific to this room + category combination. Include real numbers,
measurements, or specific product criteria where possible.

**faqs:** 4–6 questions. Target real People Also Ask results for this query.
Questions must be specific to this room + category combo — not generic decor questions.
Answers: direct answer in the first sentence, then 2–4 sentences of supporting detail.

**body:** Three paragraphs. 40–60 words each. Total: 120–180 words.
- Paragraph 1: The specific problem this room + category combo solves. Name what goes wrong
  when this category is wrong in this specific room. Concrete, not abstract.
- Paragraph 2: What getting it right looks like. Specific materials, specific moments,
  specific feelings. Short sentences. High imagery.
- Paragraph 3: One sentence only. What this page gives the visitor — plain language.

**related_pages:** 4–6 links. Mix of: other categories for same room/style, other rooms/styles
for same category. Build internal link clusters, not random links.

---

## ZERO AI MARKERS — NON-NEGOTIABLE

Never use:
- Em dashes or en dashes as clause connectors — use a full stop or comma
- "There are many ways to..." / "It is important to note..."
- "When it comes to..." / "Having said that..." / "Additionally," / "Moreover,"
- Hedging: "may," "might," "could potentially," "it seems"
- "One of the most..." at the start of any paragraph
- Sentences that could appear in any article about any topic
- Three or more abstract nouns in one sentence

Write like a brilliant, trusted friend who knows exactly what to buy and why.

---

## QUALITY CHECKLIST — run silently before outputting

- [ ] Every title is unique — no two pages share a title structure
- [ ] Every description is exactly 150–160 characters
- [ ] Every intro is 1–2 sentences and specific to the combination
- [ ] Every tip has real numbers or specific criteria
- [ ] Every FAQ has 4–6 questions, answers start with direct answer
- [ ] Body is exactly 3 paragraphs, 40–60 words each
- [ ] hero_image follows the correct pattern
- [ ] related_pages has 4–6 links with correct URL patterns
- [ ] Zero AI markers in any text field
- [ ] Output is pure JSON array — no preamble, no markdown fences

---

## INPUT TYPES — TELL ME WHAT TO GENERATE

### Option A — Specific combos
> Generate these pages:
> - bedroom + lamps
> - bedroom + mirrors
> - living-room + rugs

### Option B — All rooms for one category
> Generate all 6 room pages for: rugs-carpets

### Option C — All categories for one room
> Generate all 8 category pages for: bedroom

### Option D — All style pages for one category
> Generate all 9 style pages for: mirrors

### Option E — Full batch
> Generate all room pages (6 rooms × 8 categories = 48 pages)
> Generate all style pages (9 styles × 8 categories = 72 pages)
(Note: For full batch, request in groups of 10–15 to stay within output limits)

---

Now tell me which pages to generate.
