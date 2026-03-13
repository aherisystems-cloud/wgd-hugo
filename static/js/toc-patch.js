/**
 * WGD Inline TOC — toc-patch.js
 * ─────────────────────────────────────────────────────────────
 * The floating TOC in post-template.html is hidden at < 1300px.
 * This script injects an inline TOC inside .content-body
 * for tablets and mobile — styled to match the existing
 * .toc-inline CSS already present in post-template.html.
 *
 * USAGE: Add <script src="/js/toc-patch.js" defer></script>
 * to post-template.html, just before </body>.
 */
(function () {
  'use strict';

  function buildInlineTOC() {
    // Only run on screens where the floating TOC is hidden
    // (matches the CSS breakpoint: max-width 1300px)
    // We always build it but keep it hidden on wide screens via CSS.

    const contentBody = document.querySelector('.content-body');
    if (!contentBody) return;

    const headings = Array.from(contentBody.querySelectorAll('h2'));
    if (headings.length < 3) return; // mirror the floating TOC threshold

    // Build inline TOC element
    const toc = document.createElement('nav');
    toc.className = 'toc-inline toc-inline-auto';
    toc.setAttribute('aria-label', 'Table of contents');

    const heading = document.createElement('h4');
    heading.textContent = '📋 In This Article';
    toc.appendChild(heading);

    const ol = document.createElement('ol');
    headings.forEach((h, i) => {
      const li  = document.createElement('li');
      const a   = document.createElement('a');
      // Strip leading numbers / "Upgrade N:" prefixes for cleaner display
      a.textContent = h.textContent
        .replace(/^[\d]+[\.\:\s]+/, '')
        .replace(/^Upgrade\s\d+:\s*/i, '')
        .trim();
      a.href = '#';
      a.addEventListener('click', e => {
        e.preventDefault();
        h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      li.appendChild(a);
      ol.appendChild(li);
    });
    toc.appendChild(ol);

    // Insert immediately before the first paragraph of content-body
    const firstEl = contentBody.firstElementChild;
    if (firstEl) {
      contentBody.insertBefore(toc, firstEl);
    } else {
      contentBody.appendChild(toc);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildInlineTOC);
  } else {
    buildInlineTOC();
  }
})();
