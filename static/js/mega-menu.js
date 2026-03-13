/**
 * WGD Mega Menu — mega-menu.js v1.0
 * ─────────────────────────────────────────────────────────────
 * Drop-in for every page (blog, category, tag, post).
 * Replaces CSS-only :hover approach on all pages.
 *
 * Features:
 *   - Desktop: JS hover with 240ms close delay so cursor can travel to submenu
 *   - Mobile:  Tap-accordion — same 4-column grid content, stacked vertically
 *   - Closes on outside click, Escape key, or hamburger toggle
 *   - No dependency on any other script
 */
(function () {
  'use strict';

  /* ── MEGA MENU POSITIONING ─────────────────────────────────── */
  function positionMenus() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    const bottom = navbar.getBoundingClientRect().bottom + window.scrollY;
    document.querySelectorAll('.mega-menu').forEach(m => {
      m.style.top = bottom + 'px';
    });
  }

  window.addEventListener('scroll', positionMenus, { passive: true });
  window.addEventListener('resize', positionMenus, { passive: true });

  /* ── DESKTOP HOVER (> 1024px) ──────────────────────────────── */
  function initDesktopMenu() {
    if (window.innerWidth <= 1024) return;

    const wrappers = document.querySelectorAll('.mega-menu-wrapper');
    const CLOSE_DELAY = 240; // ms — gives cursor time to travel to submenu

    wrappers.forEach(wrapper => {
      const menu = wrapper.querySelector('.mega-menu');
      if (!menu) return;
      let timer;

      function openMenu() {
        clearTimeout(timer);
        // Close all siblings first
        wrappers.forEach(w => {
          if (w !== wrapper) {
            w.classList.remove('mega-open');
            const m = w.querySelector('.mega-menu');
            if (m) m.classList.remove('mega-open');
          }
        });
        wrapper.classList.add('mega-open');
        menu.classList.add('mega-open');
      }

      function scheduleClose() {
        timer = setTimeout(() => {
          wrapper.classList.remove('mega-open');
          menu.classList.remove('mega-open');
        }, CLOSE_DELAY);
      }

      // Both the trigger AND the menu itself keep it open
      wrapper.addEventListener('mouseenter', openMenu);
      wrapper.addEventListener('mouseleave', scheduleClose);
      menu.addEventListener('mouseenter', () => clearTimeout(timer));
      menu.addEventListener('mouseleave', scheduleClose);
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!e.target.closest('.mega-menu-wrapper')) {
        wrappers.forEach(w => {
          w.classList.remove('mega-open');
          const m = w.querySelector('.mega-menu');
          if (m) m.classList.remove('mega-open');
        });
      }
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        wrappers.forEach(w => {
          w.classList.remove('mega-open');
          const m = w.querySelector('.mega-menu');
          if (m) m.classList.remove('mega-open');
        });
      }
    });
  }

  /* ── MOBILE ACCORDION (≤ 1024px) ───────────────────────────── */
  function initMobileAccordion() {
    document.querySelectorAll('.mega-menu-trigger').forEach(trigger => {
      trigger.addEventListener('click', function (e) {
        if (window.innerWidth > 1024) return; // desktop uses hover
        e.stopPropagation();
        const wrapper = trigger.closest('.mega-menu-wrapper');
        const alreadyOpen = wrapper.classList.contains('mobile-expanded');
        // Collapse all open menus
        document.querySelectorAll('.mega-menu-wrapper').forEach(w => w.classList.remove('mobile-expanded'));
        // Toggle this one
        if (!alreadyOpen) wrapper.classList.add('mobile-expanded');
      });
    });
  }

  /* ── HAMBURGER MENU ─────────────────────────────────────────── */
  // Expose globally so onclick="toggleMobileMenu()" in HTML still works
  window.toggleMobileMenu = function () {
    const menu = document.getElementById('navMenu');
    const btn  = document.getElementById('mobileMenuBtn');
    if (!menu) return;
    const isOpen = menu.classList.toggle('mobile-open');
    if (btn) btn.textContent = isOpen ? '✕' : '☰';
    if (!isOpen) {
      document.querySelectorAll('.mega-menu-wrapper').forEach(w => w.classList.remove('mobile-expanded'));
    }
  };

  // Close hamburger on outside click
  document.addEventListener('click', e => {
    const menu = document.getElementById('navMenu');
    const btn  = document.getElementById('mobileMenuBtn');
    if (
      menu &&
      menu.classList.contains('mobile-open') &&
      !menu.contains(e.target) &&
      btn && !btn.contains(e.target)
    ) {
      menu.classList.remove('mobile-open');
      if (btn) btn.textContent = '☰';
      document.querySelectorAll('.mega-menu-wrapper').forEach(w => w.classList.remove('mobile-expanded'));
    }
  });

  /* ── INIT ───────────────────────────────────────────────────── */
  function init() {
    positionMenus();
    initDesktopMenu();
    initMobileAccordion();

    // Re-init desktop hover on resize (phone rotated to landscape etc.)
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        // Reset all open states on resize
        document.querySelectorAll('.mega-menu-wrapper').forEach(w => {
          w.classList.remove('mega-open', 'mobile-expanded');
          const m = w.querySelector('.mega-menu');
          if (m) m.classList.remove('mega-open');
        });
        if (window.innerWidth > 1024) initDesktopMenu();
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
