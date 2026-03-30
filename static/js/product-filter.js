/**
 * static/js/product-filter.js
 * Handles the main filter bar + all inline-products blocks on hub pages
 */

var API = '/api/products';
var R2  = (window.HUB_CONFIG && window.HUB_CONFIG.R2Base) ? window.HUB_CONFIG.R2Base : 'https://images.wowglamdecor.com/';
var CAT = (window.HUB_CONFIG && window.HUB_CONFIG.category) ? window.HUB_CONFIG.category : '';
var debounceTimer;

function getFilters() {
  var priceEl = document.getElementById('pf-price');
  var price = priceEl ? priceEl.value.split('-') : ['',''];
  return {
    category:  CAT,
    room:      (document.getElementById('pf-room')   || {value:''}).value,
    style:     (document.getElementById('pf-style')  || {value:''}).value,
    q:         (document.getElementById('pf-search') || {value:''}).value,
    price_min: price[0] || '',
    price_max: price[1] || ''
  };
}

function syncURL(filters, page) {
  var params = new URLSearchParams();
  Object.keys(filters).forEach(function(k) {
    if (k === 'category') return; // never put category in URL
    if (filters[k]) params.set(k, filters[k]);
  });
  if (page && page > 1) params.set('page', page);
  var qs = params.toString();
  history.replaceState({}, '', location.pathname + (qs ? '?' + qs : ''));
}

function readURL() {
  var p = new URLSearchParams(location.search);
  ['room','style'].forEach(function(k) {
    var el = document.getElementById('pf-' + k);
    if (el && p.get(k)) el.value = p.get(k);
  });
  var sq = document.getElementById('pf-search');
  if (sq && p.get('q')) sq.value = p.get('q');
  var pe = document.getElementById('pf-price');
  if (pe && p.get('price_min') && p.get('price_max')) {
    pe.value = p.get('price_min') + '-' + p.get('price_max');
  }
  return parseInt(p.get('page') || '1', 10);
}

function showSkeletons(container, n) {
  n = n || 6;
  var html = '';
  for (var i = 0; i < n; i++) {
    html += '<div class="product-card product-card--skeleton" aria-hidden="true">' +
            '<div class="skeleton-img"></div>' +
            '<div class="skeleton-line skeleton-line--lg"></div>' +
            '<div class="skeleton-line"></div>' +
            '<div class="skeleton-line skeleton-line--sm"></div>' +
            '</div>';
  }
  container.innerHTML = html;
}

function renderCard(p) {
  var img = p.image_url || (p.image_key ? R2 + p.image_key : '');
  var stars = '';
  if (p.rating) {
    var filled = Math.round(p.rating);
    stars = '<span class="product-card__rating">' +
            '★'.repeat(filled) + '☆'.repeat(5 - filled) +
            '<span class="product-card__review-count">(' + p.review_count + ')</span>' +
            '</span>';
  }
  return '<article class="product-card">' +
    '<a href="' + p.affiliate_url + '" target="_blank" rel="noopener nofollow sponsored">' +
    '<div class="product-card__image">' +
    '<img src="' + img + '" alt="' + p.name + '" loading="lazy" width="400" height="400">' +
    '</div>' +
    '<div class="product-card__body">' +
    '<div class="product-card__name">' + p.name + '</div>' +
    stars +
    '<span class="product-card__room">' + (p.room || '') + '</span>' +
    '<div class="product-card__price">' + (p.price_label || '') + '</div>' +
    '<span class="product-card__cta">Check Current Price →</span>' +
    '</div></a></article>';
}

function renderPagination(container, pagination) {
  if (!pagination || pagination.pages <= 1) { container.innerHTML = ''; return; }
  var page = pagination.page;
  var pages = pagination.pages;
  var html = '';
  if (page > 1) html += '<button onclick="goToPage(' + (page-1) + ')">‹ Prev</button>';
  for (var i = 1; i <= pages; i++) {
    html += '<button onclick="goToPage(' + i + ')" class="' + (i === page ? 'active' : '') + '">' + i + '</button>';
  }
  if (page < pages) html += '<button onclick="goToPage(' + (page+1) + ')">Next ›</button>';
  container.innerHTML = html;
}

function fetchProducts(page) {
  page = page || 1;
  var grid = document.getElementById('pf-results');
  var pager = document.getElementById('pf-pagination');
  if (!grid) return;

  var filters = getFilters();
  syncURL(filters, page);
  showSkeletons(grid);

  var params = new URLSearchParams();
  Object.keys(filters).forEach(function(k) { if (filters[k]) params.set(k, filters[k]); });
  params.set('page', page);
  params.set('limit', 12);

  fetch(API + '?' + params.toString())
    .then(function(res) {
      if (!res.ok) throw new Error('API error ' + res.status);
      return res.json();
    })
    .then(function(data) {
      var products = data.products;
      if (!products || !products.length) {
        grid.innerHTML = '<div class="no-results"><p>No products found. Try different filters.</p><button onclick="clearFilters()">Clear filters</button></div>';
        if (pager) pager.innerHTML = '';
        return;
      }
      grid.innerHTML = products.map(renderCard).join('');
      if (pager) renderPagination(pager, data.pagination);
    })
    .catch(function(err) {
      console.error('Product fetch error:', err);
    });
}

window.goToPage = function(page) { fetchProducts(page); };

function clearFilters() {
  ['pf-room','pf-style','pf-price'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var s = document.getElementById('pf-search');
  if (s) s.value = '';
  fetchProducts(1);
}

function loadInlineBlock(el) {
  var category = el.dataset.category || CAT;
  var room     = el.dataset.room     || '';
  var style    = el.dataset.style    || '';
  var featured = el.dataset.featured || '';
  var limit    = parseInt(el.dataset.limit || '6', 10);

  showSkeletons(el, limit);

  var params = new URLSearchParams();
  params.set('category', category);
  params.set('limit', limit);
  params.set('page', 1);
  if (room)     params.set('room', room);
  if (style)    params.set('style', style);
  if (featured) params.set('featured', featured);

  fetch(API + '?' + params.toString())
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.products || !data.products.length) {
        el.innerHTML = '<p style="color:#757575;font-size:14px;padding:16px">No products available.</p>';
        return;
      }
      el.innerHTML = data.products.map(renderCard).join('');
    })
    .catch(function(err) {
      console.error('Inline block error:', err);
    });
}

document.addEventListener('DOMContentLoaded', function() {
  var startPage = readURL();

  if (document.getElementById('pf-results')) {
    fetchProducts(startPage);
    ['pf-room','pf-style','pf-price'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', function() { fetchProducts(1); });
    });
    var search = document.getElementById('pf-search');
    if (search) {
      search.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() { fetchProducts(1); }, 380);
      });
    }
  }

  document.querySelectorAll('.inline-products[data-category]').forEach(function(el) {
    if (el.id !== 'pf-results') loadInlineBlock(el);
  });
});
