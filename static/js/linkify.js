// /static/js/linkify.js
// ─────────────────────────────────────────────────────────────────────────────
// Auto-links product names and hub category mentions in blog post body text.
// Runs after page load. Only operates on .post-content elements.
//
// Reads from:
//   /data/link-map.json  — built by scripts/generate-link-map.js
//
// Link map format:
//   {
//     "gold arc floor lamp": { "url": "/lamps/", "type": "hub", "label": "Gold Arc Floor Lamp" },
//     "floor lamps": { "url": "/lamps/", "type": "hub", "label": "floor lamps" },
//     ...
//   }
//
// Rules:
//   - Only links text nodes inside .post-content
//   - Never links inside existing <a> tags (no double-linking)
//   - Never links inside <h1>–<h6> headings
//   - Max 2 links per keyword per page (prevents over-linking)
//   - Longer phrases matched before shorter ones (avoids partial matches)
//   - All matches are case-insensitive
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const LINK_MAP_URL  = '/data/link-map.json';
  const CONTENT_SEL   = '.post-content';
  const MAX_PER_KEY   = 2;        // max times one keyword gets linked per page
  const SKIP_TAGS     = new Set(['A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
                                  'SCRIPT', 'STYLE', 'CODE', 'PRE', 'BUTTON']);

  async function loadLinkMap() {
    try {
      const res = await fetch(LINK_MAP_URL);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  function buildPatterns(linkMap) {
    // Sort keywords longest-first so longer phrases match before shorter ones
    const keys = Object.keys(linkMap).sort((a, b) => b.length - a.length);
    return keys.map(key => ({
      key,
      regex: new RegExp('(?<![\\w-])(' + escapeRegex(key) + ')(?![\\w-])', 'gi'),
      ...linkMap[key]
    }));
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function processTextNode(node, patterns, counts) {
    let text = node.textContent;
    if (!text.trim()) return;

    // Check if we're inside a skipped element
    let parent = node.parentElement;
    while (parent) {
      if (SKIP_TAGS.has(parent.tagName)) return;
      parent = parent.parentElement;
    }

    let matched = false;
    let html = text;

    // We'll process text → HTML by replacing matches
    // Use a placeholder system to avoid double-replacing
    const replacements = [];

    for (const pattern of patterns) {
      if ((counts[pattern.key] || 0) >= MAX_PER_KEY) continue;

      let localCount = 0;
      const maxHere  = MAX_PER_KEY - (counts[pattern.key] || 0);

      html = html.replace(pattern.regex, (match) => {
        if (localCount >= maxHere) return match;
        localCount++;
        const id = `%%LINK_${replacements.length}%%`;

        const classes = pattern.type === 'product'
          ? 'auto-link auto-link--product'
          : 'auto-link auto-link--hub';

        replacements.push(
          `<a href="${pattern.url}" class="${classes}"${
            pattern.type === 'product'
              ? ' target="_blank" rel="nofollow noopener sponsored"'
              : ''
          }>${match}</a>`
        );
        return id;
      });

      if (localCount > 0) {
        counts[pattern.key] = (counts[pattern.key] || 0) + localCount;
        matched = true;
      }
    }

    if (!matched) return;

    // Restore placeholders
    replacements.forEach((replacement, i) => {
      html = html.replace(`%%LINK_${i}%%`, replacement);
    });

    // Replace the text node with the new HTML
    const span = document.createElement('span');
    span.innerHTML = html;
    node.parentNode.replaceChild(span, node);
  }

  function walkTextNodes(root, patterns, counts) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          let p = node.parentElement;
          while (p && p !== root) {
            if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
            p = p.parentElement;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    // Process collected nodes (not live — avoids mutation during walk)
    nodes.forEach(n => processTextNode(n, patterns, counts));
  }

  async function run() {
    const content = document.querySelector(CONTENT_SEL);
    if (!content) return;

    const linkMap = await loadLinkMap();
    if (!linkMap || Object.keys(linkMap).length === 0) return;

    const patterns = buildPatterns(linkMap);
    const counts   = {};

    walkTextNodes(content, patterns, counts);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

})();
