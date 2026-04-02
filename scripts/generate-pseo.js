#!/usr/bin/env node
// scripts/generate-pseo.js
// ─────────────────────────────────────────────────────────────────────────────
// Reads data/pseo-config.json and writes all pSEO _index.md files.
//
// Usage:
//   node scripts/generate-pseo.js           → generate all pages
//   node scripts/generate-pseo.js --dry-run → preview paths only, no writes
//   node scripts/generate-pseo.js --force   → overwrite existing files
//
// Output example:
//   content/bedroom/lamps/_index.md
//   content/living-room/mirrors/_index.md
//   content/luxury-glam/lamps/_index.md
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const CONFIG    = join(ROOT, 'data', 'pseo-config.json');

const args    = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE   = args.includes('--force');

// ── helpers ──────────────────────────────────────────────────────────────────

function yamlString(value) {
  if (!value) return '""';
  // Wrap in double quotes, escape inner quotes
  return `"${String(value).replace(/"/g, '\\"')}"`;
}

function yamlMultiline(value) {
  if (!value) return '""';
  // Use YAML literal block scalar for body text
  const indented = value.split('\n').map(l => `  ${l}`).join('\n');
  return `|\n${indented}`;
}

function buildFrontmatter(page, config) {
  const cat     = config.categories.find(c => c.slug === page.category_slug);
  const catName = cat ? cat.name : page.category_slug;
  const catHub  = cat ? cat.hub : `/${page.category_slug}/`;

  const isRoom  = page.pseo_type === 'room';
  const filter  = isRoom
    ? config.rooms.find(r => r.slug === page.filter_value)
    : config.styles.find(s => s.slug === page.filter_value);

  const filterLabel = filter ? filter.label : page.filter_value;
  const parentUrl   = filter ? filter.url   : `/${page.filter_value}/`;

  // Build related pages: other categories for same filter + other rooms/styles for same category
  const relatedPages = [];

  // Other categories with same filter
  config.categories
    .filter(c => c.slug !== page.category_slug)
    .slice(0, 3)
    .forEach(c => {
      relatedPages.push({
        name: `${filterLabel} ${c.name}`,
        url:  `${parentUrl}${c.slug === 'lighting-lamps' ? 'lamps' : c.slug.split('-')[0]}/`
      });
    });

  // Other filters for same category
  const otherFilters = isRoom
    ? config.rooms.filter(r => r.slug !== page.filter_value).slice(0, 2)
    : config.styles.filter(s => s.slug !== page.filter_value).slice(0, 2);

  const catUrlSlug = catHub.replace(/\//g, '');
  otherFilters.forEach(f => {
    relatedPages.push({
      name: `${f.label} ${catName}`,
      url:  `${f.url}${catUrlSlug}/`
    });
  });

  // Use page-level related_pages if provided, else use auto-generated
  const related = page.related_pages || relatedPages;

  const faqs = (page.faqs || []).map(faq => `
  - question: ${yamlString(faq.question)}
    answer: ${yamlString(faq.answer)}`).join('');

  const relatedYaml = related.map(r => `
  - name: ${yamlString(r.name)}
    url: ${yamlString(r.url)}`).join('');

  const featuredYaml = page.featured_products
    ? page.featured_products.map(p => `
  - slug: ${yamlString(p.slug)}
    name: ${yamlString(p.name)}
    price_label: ${yamlString(p.price_label)}
    image_key: ${yamlString(p.image_key)}
    affiliate_url: ${yamlString(p.affiliate_url)}`).join('')
    : '';

  return `---
title: ${yamlString(page.title)}
description: ${yamlString(page.description)}
type: pseo

pseo_type: ${yamlString(page.pseo_type)}
filter_value: ${yamlString(page.filter_value)}
filter_label: ${yamlString(filterLabel)}
category_slug: ${yamlString(page.category_slug)}
category_name: ${yamlString(catName)}

parent_hub: ${yamlString(catHub)}
parent_url: ${yamlString(parentUrl)}

hero_image: ${yamlString(page.hero_image || '')}
hero_image_alt: ${yamlString(page.hero_image_alt || page.title)}

intro: ${yamlString(page.intro || '')}
tip: ${yamlString(page.tip || '')}
${featuredYaml ? `\nfeatured_products:${featuredYaml}\n` : ''}
faqs:${faqs}

related_pages:${relatedYaml}
---

${page.body || ''}
`;
}

function getOutputPath(page, config) {
  const cat    = config.categories.find(c => c.slug === page.category_slug);
  const catUrl = cat ? cat.hub.replace(/\//g, '') : page.category_slug;

  // /bedroom/lamps/ → content/bedroom/lamps/_index.md
  const filterSlug = page.filter_value;
  return join(ROOT, 'content', filterSlug, catUrl, '_index.md');
}

// ── main ──────────────────────────────────────────────────────────────────────

const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
const pages  = config.pages || [];

if (pages.length === 0) {
  console.log('⚠  No pages found in data/pseo-config.json → pages array.');
  console.log('   Add page entries to the pages array and re-run.');
  process.exit(0);
}

let written = 0, skipped = 0, previewed = 0;

for (const page of pages) {
  const outPath = getOutputPath(page, config);
  const relPath = outPath.replace(ROOT + '/', '');

  if (DRY_RUN) {
    console.log(`  [preview] ${relPath}`);
    previewed++;
    continue;
  }

  if (existsSync(outPath) && !FORCE) {
    console.log(`  [skip]    ${relPath}  (exists — use --force to overwrite)`);
    skipped++;
    continue;
  }

  const dir      = dirname(outPath);
  const content  = buildFrontmatter(page, config);

  mkdirSync(dir, { recursive: true });
  writeFileSync(outPath, content, 'utf8');
  console.log(`  [wrote]   ${relPath}`);
  written++;
}

console.log('');
if (DRY_RUN) {
  console.log(`✅ Dry run complete — ${previewed} pages would be written.`);
  console.log('   Run without --dry-run to generate files.');
} else {
  console.log(`✅ Done — ${written} written, ${skipped} skipped.`);
  if (skipped > 0) console.log('   Use --force to overwrite existing files.');
}
