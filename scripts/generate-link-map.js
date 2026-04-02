// scripts/generate-link-map.js
// ─────────────────────────────────────────────────────────────────────────────
// Builds static/data/link-map.json from:
//   - data/products.json        (product names → affiliate URLs)
//   - Hard-coded hub + pSEO URLs (category/room/style keywords → hub pages)
//
// Output goes to static/data/link-map.json so Hugo serves it at /data/link-map.json
//
// Usage:
//   node scripts/generate-link-map.js
//
// Run this after sync-products.js, before git commit.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname }                           from 'path';
import { fileURLToPath }                           from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const PRODUCTS  = join(ROOT, 'data', 'products.json');
const OUT_DIR   = join(ROOT, 'static', 'data');
const OUT       = join(OUT_DIR, 'link-map.json');

// ── HUB + PSEO KEYWORD MAP ────────────────────────────────────────────────────
// Keys: phrases that should auto-link in blog posts
// These are category-level terms → hub pages

const HUB_KEYWORDS = [
  // Lamps
  { keywords: ['floor lamp', 'floor lamps', 'arc lamp', 'arc floor lamp'],        url: '/lamps/', type: 'hub' },
  { keywords: ['table lamp', 'table lamps', 'bedside lamp', 'bedside lamps'],     url: '/lamps/', type: 'hub' },
  { keywords: ['glam lamp', 'glam lamps', 'luxury lamp', 'luxury lamps'],         url: '/lamps/', type: 'hub' },
  { keywords: ['crystal lamp', 'crystal lamps'],                                   url: '/lamps/', type: 'hub' },
  { keywords: ['gold lamp', 'gold lamps'],                                         url: '/lamps/', type: 'hub' },

  // Mirrors
  { keywords: ['wall mirror', 'wall mirrors', 'sunburst mirror', 'sunburst mirrors'], url: '/mirrors/', type: 'hub' },
  { keywords: ['floor mirror', 'floor mirrors', 'arch mirror', 'arch mirrors'],       url: '/mirrors/', type: 'hub' },
  { keywords: ['decorative mirror', 'decorative mirrors'],                            url: '/mirrors/', type: 'hub' },
  { keywords: ['gold mirror', 'gold mirrors'],                                        url: '/mirrors/', type: 'hub' },

  // Rugs
  { keywords: ['area rug', 'area rugs', 'glam rug', 'glam rugs'],                url: '/rugs/', type: 'hub' },
  { keywords: ['luxury rug', 'luxury rugs', 'plush rug', 'plush rugs'],           url: '/rugs/', type: 'hub' },
  { keywords: ['bedroom rug', 'bedroom rugs', 'living room rug', 'living room rugs'], url: '/rugs/', type: 'hub' },

  // Wall Décor
  { keywords: ['wall art', 'wall decor', 'wall decoration'],                      url: '/wall-decor/', type: 'hub' },
  { keywords: ['canvas art', 'framed art', 'wall prints'],                        url: '/wall-decor/', type: 'hub' },

  // Throw Pillows
  { keywords: ['throw pillow', 'throw pillows', 'accent pillow', 'accent pillows'], url: '/throw-pillows/', type: 'hub' },
  { keywords: ['velvet pillow', 'velvet pillows'],                                   url: '/throw-pillows/', type: 'hub' },

  // Vases
  { keywords: ['vase', 'vases', 'decorative vase', 'decorative vases'],          url: '/vases/', type: 'hub' },
  { keywords: ['floral arrangement', 'floral arrangements', 'faux florals'],      url: '/vases/', type: 'hub' },

  // Bedding
  { keywords: ['duvet', 'duvet cover', 'duvet covers', 'bedding set', 'bedding sets'], url: '/bedding/', type: 'hub' },
  { keywords: ['luxury bedding', 'glam bedding', 'velvet bedding'],                    url: '/bedding/', type: 'hub' },

  // Candles
  { keywords: ['candle', 'candles', 'scented candle', 'scented candles'],        url: '/candles/', type: 'hub' },
  { keywords: ['luxury candle', 'luxury candles', 'pillar candle'],              url: '/candles/', type: 'hub' },

  // pSEO room crosslinks
  { keywords: ['bedroom decor', 'bedroom decoration'],                           url: '/bedroom/', type: 'hub' },
  { keywords: ['living room decor', 'living room decoration'],                   url: '/living-room/', type: 'hub' },
  { keywords: ['entryway decor', 'entryway decoration'],                         url: '/entryway/', type: 'hub' },
  { keywords: ['dining room decor', 'dining room decoration'],                   url: '/dining-room/', type: 'hub' },

  // Style crosslinks
  { keywords: ['luxury glam', 'glam decor', 'glam interior'],                   url: '/luxury-glam/', type: 'hub' },
  { keywords: ['coastal decor', 'coastal style'],                                url: '/coastal/', type: 'hub' },
  { keywords: ['boho decor', 'bohemian decor'],                                  url: '/boho-eclectic/', type: 'hub' },
  { keywords: ['art deco decor', 'art deco style'],                              url: '/art-deco/', type: 'hub' },
  { keywords: ['minimalist decor', 'modern minimalist'],                         url: '/modern-minimalist/', type: 'hub' },
];

// ── BUILD MAP ─────────────────────────────────────────────────────────────────

const map = {};

// 1. Hub keywords
HUB_KEYWORDS.forEach(({ keywords, url, type }) => {
  keywords.forEach(kw => {
    map[kw.toLowerCase()] = { url, type, label: kw };
  });
});

// 2. Product names from data/products.json
let products = [];
try {
  products = JSON.parse(readFileSync(PRODUCTS, 'utf8'));
} catch (e) {
  console.warn('⚠  Could not read data/products.json — skipping product links.');
}

products.forEach(p => {
  if (!p.name || !p.affiliate_url) return;
  // Full product name
  map[p.name.toLowerCase()] = {
    url:   p.affiliate_url,
    type:  'product',
    label: p.name,
    slug:  p.slug
  };
  // Shorter version (remove trailing descriptors after comma, if any)
  const shortName = p.name.split(',')[0].trim();
  if (shortName !== p.name && shortName.length > 8) {
    map[shortName.toLowerCase()] = {
      url:   p.affiliate_url,
      type:  'product',
      label: shortName,
      slug:  p.slug
    };
  }
});

// ── WRITE OUTPUT ──────────────────────────────────────────────────────────────

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify(map, null, 2), 'utf8');

const hubCount     = HUB_KEYWORDS.reduce((n, e) => n + e.keywords.length, 0);
const productCount = products.length;

console.log(`✅ link-map.json written`);
console.log(`   Hub keywords:  ${hubCount}`);
console.log(`   Product names: ${productCount}`);
console.log(`   Total entries: ${Object.keys(map).length}`);
console.log(`   Output:        static/data/link-map.json`);
