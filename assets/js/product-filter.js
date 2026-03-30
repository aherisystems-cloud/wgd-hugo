/**
 * assets/js/product-filter.js
 * Handles the main filter bar + all inline-products blocks on hub pages
 */

const API = '/api/products';
const R2  = window.HUB_CONFIG?.R2Base || 'https://images.wowglamdecor.com/';
const CAT = window.HUB_CONFIG?.category || '';

let debounceTimer;
let currentPage = 1;

/* ─── MAIN FILTER BAR ─── */

function getFilters() {
  const price = (document.getElementById('pf-price')?.value || '').split('-');
  return {
    category:  CAT,
    room:      document.getElementById('pf-room')?.value  || '',
    style:     document.getElementById('pf-style')?.value || '',
    q:         document.getElementById('pf-search')?.value || '',
    price_min: price[0] || '',
    price_max: price[1] || '',
  };
}

function syncURL(filters, page) {
  const params = new URLSearchParams();
  Object.entries({ ...filters, page }).forEach(([k, v]) => {
    if (v && v !== '1') params.set(k, v);
  });
  const qs = params.toString();
  history.replaceState({}, '', location.pathname + (qs ? '?' + qs : ''));
}

function readURL() {
  const p = new URLSearchParams(location.search);
  ['room', 'style'].forEach(k => {
    const el = document.getElementById('pf-' + k);
    if (el && p.get(k)) el.value = p.get(k);
  });
  if (p.get('q')) {
    const el = document.getElementById('pf-search');
    if (el) el.value = p.get('q');
  }
  if (p.get('price_min') && p.get('price_max')) {
    const el = document.getElementById('pf-price');
    if (el) el.value = p.get('price_min') + '-' + p.get('price_max');
  }
  return parseInt(p.get('page') || '1', 10);
}

function showSkeletons(container, n = 6) {
  container.innerHTML = Array(n).fill(
    '<div class="product-card product-card--skeleton" aria-hidden="true">' +
    '<div class="skeleton-img"></div>' +
    '<div class="skeleton-line skeleton-line--lg"></div>' +
    '<div class="skeleton-line"></div>' +
    '<div class="skeleton-line skeleton-line--sm"></div>' +
    '</div>'
  ).join('');
}

function renderCard(p) {
  const img = p.image_url || (p.image_key ? R2 + p.image_key : '');
  const stars = p.rating
    ? `<span class="product-card__rating" aria-label="Rating: ${p.rating} out of 5">
        ${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}
        <span class="product-card__review-count">(${p.review_count})</span>
       </span>`
    : '';
  return `
    <article class="product-card">
      <a href="${p.affiliate_url}" target="_blank" rel="noopener nofollow sponsored">
        <div class="product-card__image">
          <img src="${img}" alt="${p.name}" loading="lazy" width="400" height="400">
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${p.name}</h3>
          ${stars}
          <span class="product-card__room">${p.room || ''}</span>
          <span class="product-card__price">${p.price_label || ''}</span>
          <span class="product-card__cta" aria-label="View ${p.name} on retailer site">
            Check Current Price →
          </span>
        </div>
      </a>
    </article>
  `;
}

function renderPagination(container, pagination) {
  if (!pagination || pagination.pages <= 1) {
    container.innerHTML = '';
    return;
  }
  const { page, pages } = pagination;
  let html = '<nav class="pagination" aria-label="Product pages"><ul>';
  if (page > 1) {
    html += `<li><button onclick="goToPage(${page - 1})" aria-label="Previous page">‹ Prev</button></li>`;
  }
  for (let i = 1; i <= pages; i++) {
    html += `<li><button onclick="goToPage(${i})" ${i === page ? 'aria-current="page" class="active"' : ''}>${i}</button></li>`;
  }
  if (page < pages) {
    html += `<li><button onclick="goToPage(${page + 1})" aria-label="Next page">Next ›</button></li>`;
  }
  html += '</ul></nav>';
  container.innerHTML = html;
}

async function fetchProducts(page = 1) {
  const grid = document.getElementById('pf-results');
  const pager = document.getElementById('pf-pagination');
  if (!grid) return;

  const filters = getFilters();
  syncURL(filters, page);
  showSkeletons(grid);
  currentPage = page;

  try {
    const params = new URLSearchParams({
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      page,
      limit: 12
    });
    const res  = await fetch(`${API}?${params}`);
    if (!res.ok) throw new Error('API error ' + res.status);
    const { products, pagination } = await res.json();

    if (!products.length) {
      grid.innerHTML = `
        <div class="no-results">
          <p>No products found for these filters.</p>
          <button onclick="clearFilters()">Clear filters</button>
        </div>`;
      if (pager) pager.innerHTML = '';
      return;
    }

    grid.innerHTML = products.map(renderCard).join('');
    if (pager) renderPagination(pager, pagination);
  } catch (err) {
    console.error('Product fetch error:', err);
    grid.innerHTML = '<p class="fetch-error">Could not load products. Please refresh and try again.</p>';
  }
}

window.goToPage = (page) => fetchProducts(page);

function clearFilters() {
  ['pf-room', 'pf-style', 'pf-price'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const search = document.getElementById('pf-search');
  if (search) search.value = '';
  fetchProducts(1);
}

/* ─── INLINE PRODUCT BLOCKS (hub mid-page + shortcodes) ─── */

async function loadInlineBlock(el) {
  const category = el.dataset.category || CAT;
  const room     = el.dataset.room     || '';
  const style    = el.dataset.style    || '';
  const featured = el.dataset.featured || '';
  const limit    = parseInt(el.dataset.limit || '6', 10);

  showSkeletons(el, limit);

  try {
    const params = new URLSearchParams({ category, limit, page: 1 });
    if (room)     params.set('room', room);
    if (style)    params.set('style', style);
    if (featured) params.set('featured', featured);

    const res = await fetch(`${API}?${params}`);
    if (!res.ok) throw new Error('API error ' + res.status);
    const { products } = await res.json();

    if (!products.length) {
      el.innerHTML = '<p class="no-results-inline">No products available for this selection.</p>';
      return;
    }
    el.innerHTML = products.map(renderCard).join('');
  } catch (err) {
    console.error('Inline block fetch error:', err);
    /* Leave static Hugo fallback in place on error — don't clear it */
  }
}

/* ─── INIT ─── */

document.addEventListener('DOMContentLoaded', () => {
  /* Read URL params and pre-fill filters */
  const startPage = readURL();

  /* Wire up main filter bar */
  if (document.getElementById('pf-results')) {
    fetchProducts(startPage);

    ['pf-room', 'pf-style', 'pf-price'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => fetchProducts(1));
    });

    document.getElementById('pf-search')?.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fetchProducts(1), 380);
    });
  }

  /* Wire up all inline-products blocks */
  document.querySelectorAll('.inline-products[data-category]').forEach(el => {
    /* Only dynamic-load if the block has a data-category (not the main grid) */
    if (el.id !== 'pf-results') {
      loadInlineBlock(el);
    }
  });
});
