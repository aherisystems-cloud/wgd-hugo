// /static/js/mega-menu.js
// Two-trigger mega menu: Inspiration | Shop
// + Mobile drawer with accordion sections
// ─────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // ── MEGA MENU (desktop) ───────────────────────────────────────

  const menus = [
    { wrapper: 'inspirationWrapper', trigger: 'inspirationTrigger', panel: 'inspirationMega' },
    { wrapper: 'shopWrapper',        trigger: 'shopTrigger',        panel: 'shopMega'        },
  ];

  function closeAll(except) {
    menus.forEach(({ wrapper, trigger, panel }) => {
      if (wrapper === except) return;
      const w = document.getElementById(wrapper);
      const t = document.getElementById(trigger);
      const p = document.getElementById(panel);
      if (!w || !t || !p) return;
      w.classList.remove('mega-open');
      p.classList.remove('mega-open');
      t.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleMenu(wrapperId, triggerId, panelId) {
    const wrapper = document.getElementById(wrapperId);
    const trigger = document.getElementById(triggerId);
    const panel   = document.getElementById(panelId);
    if (!wrapper || !trigger || !panel) return;

    const isOpen = wrapper.classList.contains('mega-open');

    closeAll(wrapperId);

    if (isOpen) {
      wrapper.classList.remove('mega-open');
      panel.classList.remove('mega-open');
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      wrapper.classList.add('mega-open');
      panel.classList.add('mega-open');
      trigger.setAttribute('aria-expanded', 'true');

      // Position panel below the navbar
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        const rect = navbar.getBoundingClientRect();
        panel.style.top = (rect.bottom) + 'px';
      }
    }
  }

  // Wire triggers
  menus.forEach(({ wrapper, trigger, panel }) => {
    const btn = document.getElementById(trigger);
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(wrapper, trigger, panel);
    });

    // Keyboard support
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu(wrapper, trigger, panel);
      }
      if (e.key === 'Escape') closeAll();
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    const inMenu = menus.some(({ wrapper }) => {
      const w = document.getElementById(wrapper);
      return w && w.contains(e.target);
    });
    if (!inMenu) closeAll();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  // Reposition on scroll (navbar is sticky)
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const rect = navbar.getBoundingClientRect();
    menus.forEach(({ panel }) => {
      const p = document.getElementById(panel);
      if (p && p.classList.contains('mega-open')) {
        p.style.top = rect.bottom + 'px';
      }
    });
  }, { passive: true });


  // ── MOBILE DRAWER ─────────────────────────────────────────────

  const mobileBtn     = document.getElementById('mobileMenuBtn');
  const drawer        = document.getElementById('mobileDrawer');
  const overlay       = document.getElementById('mobileOverlay');
  const closeBtn      = document.getElementById('mobileClose');

  function openDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.removeAttribute('aria-hidden');
    mobileBtn && mobileBtn.setAttribute('aria-expanded', 'true');
    mobileBtn && mobileBtn.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!drawer || !overlay) return;
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    mobileBtn && mobileBtn.setAttribute('aria-expanded', 'false');
    mobileBtn && mobileBtn.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  }

  mobileBtn  && mobileBtn.addEventListener('click',  openDrawer);
  closeBtn   && closeBtn.addEventListener('click',   closeDrawer);
  overlay    && overlay.addEventListener('click',    closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) closeDrawer();
  });


  // ── MOBILE ACCORDION ──────────────────────────────────────────

  document.querySelectorAll('.mobile-section__trigger').forEach((trigger) => {
    const content = trigger.nextElementSibling;
    if (!content) return;

    // Start closed
    content.style.display = 'flex';
    content.classList.remove('open');

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close all other sections
      document.querySelectorAll('.mobile-section__trigger').forEach((t) => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          const c = t.nextElementSibling;
          if (c) c.classList.remove('open');
        }
      });

      if (isOpen) {
        trigger.setAttribute('aria-expanded', 'false');
        content.classList.remove('open');
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        content.classList.add('open');
      }
    });
  });


  // ── SEARCH (existing logic preserved) ─────────────────────────

  const inp = document.getElementById('searchInput');
  const box = document.getElementById('searchSuggestions');
  if (!inp || !box) return;

  let timeout, cache = null;

  async function loadPosts() {
    if (cache) return cache;
    try {
      const r = await fetch('/posts.json');
      if (r.ok) { cache = await r.json(); return cache; }
    } catch(e) {}
    return [];
  }

  function highlight(text, query) {
    if (!query || !text) return text;
    return text.replace(
      new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'),
      '<span class="highlight">$1</span>'
    );
  }

  async function search(q) {
    const posts = await loadPosts();
    if (!posts.length) return [];
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    return posts
      .map(p => ({
        ...p,
        score: terms.reduce((s, t) => s + (
          ((p.title + ' ' + (p.description || '') + ' ' +
            ((p.tags || []).join(' ')) + ' ' +
            ((p.categories || []).join(' '))).toLowerCase().split(t).length - 1)
        ), 0)
      }))
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  function renderResults(results, q) {
    if (!results.length) {
      box.innerHTML = `<div class="no-results-search"><p>No results for "${q}"</p></div>`;
      box.classList.add('active');
      return;
    }
    box.innerHTML = results.map((p, i) =>
      `<a href="${p.url || '/posts/' + p.slug + '.html'}" class="suggestion-item" data-index="${i}">
        <img src="${p.featured_image || '/content/images/bedroom-decor-ideas.png'}" alt="${p.title}" class="suggestion-thumb" loading="lazy">
        <div class="suggestion-content">
          <div class="suggestion-title">${highlight(p.title, q)}</div>
          <div class="suggestion-meta">
            <span class="suggestion-category">${(p.categories && p.categories[0]) || 'Decor'}</span>
          </div>
        </div>
      </a>`
    ).join('') +
    `<div class="search-footer"><a href="/search.html?q=${encodeURIComponent(q)}">View all results →</a></div>`;
    box.classList.add('active');
  }

  inp.addEventListener('input', (e) => {
    const q = e.target.value.trim();
    clearTimeout(timeout);
    if (!q) { box.classList.remove('active'); return; }
    if (q.length < 2) return;
    box.innerHTML = `<div class="search-loading">Searching<div class="loading-dots"><span></span><span></span><span></span></div></div>`;
    box.classList.add('active');
    timeout = setTimeout(async () => renderResults(await search(q), q), 280);
  });

  document.addEventListener('click', (e) => {
    if (!inp.contains(e.target) && !box.contains(e.target)) box.classList.remove('active');
  });

  window.performSearch = () => {
    const q = inp.value.trim();
    if (q) window.location.href = '/search.html?q=' + encodeURIComponent(q);
  };

})();
