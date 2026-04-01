// scripts/sync-products.js
// Usage: node scripts/sync-products.js
// Requires: npm install node-fetch (or Node 18+ with native fetch)

import { writeFileSync } from 'fs';

const API = 'https://wowglamdecor.com/api/products';
const OUT = 'data/products.json';

async function fetchAll() {
  let page = 1, all = [];
  while (true) {
    const res = await fetch(`${API}?page=${page}&limit=100`);
    const data = await res.json();
    if (!data.products?.length) break;
    all = all.concat(data.products);
    if (data.products.length < 100) break;
    page++;
  }
  return all;
}

fetchAll().then(products => {
  writeFileSync(OUT, JSON.stringify(products, null, 2));
  console.log(`✅ Synced ${products.length} products → ${OUT}`);
});