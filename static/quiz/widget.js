/*!
 * WGD Home Style Quiz — widget.js v2.2
 * ─────────────────────────────────────────────────────────────
 * Self-contained. No dependencies. Scoped CSS injected once.
 *
 * EMBED:
 *   Homepage section:  <div data-wgd-quiz="homepage"></div>
 *   Sidebar widget:    <div data-wgd-quiz="sidebar"></div>
 *   Popup (auto):      add data-wgd-popup to your <body> tag
 *
 * CONFIG: edit CFG block (lines ~15-21) before deploying.
 * POSTS:  edit /posts.json — no redeploy needed.
 *
 * v2.1 changes:
 *   - _filter() now scores each field (category, tags, title) independently
 *   - A match on ANY field is enough to surface a post (OR logic)
 *   - Posts matching on more fields score higher and rank first
 *   - Fallback: if zero room-matched posts, returns style+type matches only
 */
(function (W, D) {
  'use strict';

  /* ── CONFIG ────────────────────────────────────────────────── */
  const CFG = {
    postsUrl:         '/posts.json',
    mlFormId:         'ygWEME',
    popupDelay:       6000,
    popupScroll:      45,
    popupCooldown:    7,
  };

  /* ── QUESTION DATA ─────────────────────────────────────────── */
  const Q = {
    room: {
      label: 'Which room are you decorating?',
      sub:   "Pick the space you're working on right now.",
      opts: [
        { v: 'living-room',   l: 'Living Room',     e: '🛋️' },
        { v: 'bedroom',       l: 'Bedroom',         e: '🛏️' },
        { v: 'dining-room',   l: 'Dining Room',     e: '🍽️' },
        { v: 'home-office',   l: 'Home Office',     e: '💻' },
        { v: 'kitchen',       l: 'Kitchen',         e: '🍳' },
        { v: 'bathroom',      l: 'Bathroom',        e: '🛁' },
        { v: 'outdoor',       l: 'Outdoor & Patio', e: '🌿' },
        { v: 'kids',          l: "Kids' Room",      e: '🧸' },
        { v: 'entryway',      l: 'Entryway',        e: '🚪' },
        { v: 'small-spaces',  l: 'Small Spaces',    e: '📐' },
      ],
    },
    style: {
      label: "What's your style?",
      sub:   'Pick the aesthetic that feels most like you.',
      opts: [
        { v: 'modern',       l: 'Modern',         e: '◼', d: 'Clean lines, bold shapes'      },
        { v: 'minimalist',   l: 'Minimalist',     e: '○', d: 'Calm, edited, less is more'    },
        { v: 'scandinavian', l: 'Scandinavian',   e: '❄', d: 'Cosy, natural, light-filled'   },
        { v: 'boho',         l: 'Boho & Rustic',  e: '🌾', d: 'Earthy, layered, warm'         },
        { v: 'luxury',       l: 'Luxury & Glam',  e: '✦', d: 'Elevated, rich finishes'       },
        { v: 'traditional',  l: 'Traditional',    e: '🏛', d: 'Classic, timeless quality'     },
        { v: 'industrial',   l: 'Industrial',     e: '⚙', d: 'Raw, urban, edgy'              },
      ],
    },
    type: {
      label: 'What are you looking for?',
      sub:   "We'll show the most relevant posts for you.",
      opts: [
        { v: 'furniture', l: 'Furniture',        e: '🛋️', d: 'Sofas, beds, tables, chairs'  },
        { v: 'decor',     l: 'Decor & Lighting', e: '🖼️', d: 'Walls, lamps, rugs, cushions' },
        { v: 'storage',   l: 'Storage',          e: '📦', d: 'Organisation & storage ideas'  },
        { v: 'budget',    l: 'Budget Picks',     e: '💚', d: 'Great looks for less'          },
        { v: 'luxury',    l: 'Luxury Picks',     e: '✨', d: 'Investment pieces that last'    },
        { v: 'all',       l: 'Show Everything',  e: '🎯', d: 'All ideas for my room'         },
      ],
    },
  };

  const STEPS = ['room', 'style', 'type'];

  /* ── SCOPED CSS ────────────────────────────────────────────── */
  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,400;1,600&family=Nunito:wght@400;600;700;800&display=swap');

.wgd-q, .wgd-overlay {
  --br:    #7e0882;
  --brd:   #5c0660;
  --brlt:  rgba(126,8,130,.08);
  --brmid: rgba(126,8,130,.2);
  --cream: #FAF8F3;
  --white: #ffffff;
  --sand:  #EDE5D8;
  --ink:   #1C1917;
  --mid:   #57534E;
  --muted: #A8A29E;
  --bdr:   #E7DDD2;
  --green: #5E7A60;
  --r:     12px;
  --rs:    8px;
  font-family: 'Nunito', system-ui, sans-serif;
  color: var(--ink);
}
.wgd-q *, .wgd-overlay * { box-sizing: border-box; margin: 0; padding: 0; }

.wgd-q {
  background: var(--cream);
  border-radius: var(--r);
  padding: 28px 24px;
  width: 100%;
}
.wgd-q.sidebar {
  padding: 20px 16px;
  border: 1px solid var(--bdr);
  box-shadow: 0 2px 12px rgba(126,8,130,.06);
}

/* progress bar */
.wgd-prog { display: flex; gap: 6px; margin-bottom: 24px; }
.wgd-seg { flex: 1; height: 3px; border-radius: 2px; background: var(--bdr); transition: background .3s; }
.wgd-seg.done { background: var(--br); }
.wgd-seg.on   { background: var(--br); opacity: .45; }

/* question labels */
.wgd-qlbl {
  font-size: 11px; font-weight: 800; letter-spacing: .1em;
  text-transform: uppercase; color: var(--br); margin-bottom: 8px;
  display: flex; align-items: center; gap: 8px;
}
.wgd-qlbl::after { content: ''; flex: 1; height: 1px; background: var(--bdr); }
.wgd-qtitle {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(22px, 4vw, 30px); font-weight: 600; line-height: 1.2; margin-bottom: 4px;
}
.wgd-qtitle em { color: var(--br); font-style: italic; }
.wgd-qsub { font-size: 13px; color: var(--muted); margin-bottom: 20px; }

/* option grid */
.wgd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(115px, 1fr));
  gap: 8px; margin-bottom: 20px;
}
.wgd-q.sidebar .wgd-grid { grid-template-columns: 1fr 1fr; }

.wgd-opt {
  position: relative; cursor: pointer;
  background: var(--white); border: 2px solid var(--bdr);
  border-radius: var(--r); padding: 14px 10px 12px;
  text-align: center; display: flex; flex-direction: column;
  align-items: center; gap: 5px; transition: all .18s; user-select: none;
}
.wgd-opt:hover { border-color: var(--br); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(126,8,130,.12); }
.wgd-opt.sel { border-color: var(--br); background: var(--brlt); box-shadow: 0 0 0 1px var(--br); }
.wgd-opt .wgd-chk {
  position: absolute; top: 6px; right: 6px; width: 18px; height: 18px;
  background: var(--br); border-radius: 50%; color: #fff;
  font-size: 9px; display: flex; align-items: center; justify-content: center;
  opacity: 0; transform: scale(.5); transition: all .18s;
}
.wgd-opt.sel .wgd-chk { opacity: 1; transform: scale(1); }
.wgd-opt-e { font-size: 24px; line-height: 1; }
.wgd-opt-l { font-size: 12px; font-weight: 700; line-height: 1.3; }
.wgd-opt-d { font-size: 10px; color: var(--muted); line-height: 1.3; }

/* nav buttons */
.wgd-nav { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.wgd-back {
  background: none; border: 2px solid var(--bdr);
  font-family: 'Nunito', system-ui, sans-serif; font-size: 13px; font-weight: 700;
  color: var(--mid); padding: 9px 18px; border-radius: 30px; cursor: pointer; transition: all .18s;
}
.wgd-back:hover { border-color: var(--mid); color: var(--ink); }
.wgd-next {
  background: var(--br); color: #fff; border: none;
  font-family: 'Nunito', system-ui, sans-serif; font-size: 13px; font-weight: 800;
  padding: 10px 22px; border-radius: 30px; cursor: pointer;
  transition: all .18s; display: flex; align-items: center; gap: 6px;
  opacity: .28; pointer-events: none;
}
.wgd-next.on { opacity: 1; pointer-events: all; }
.wgd-next.on:hover { background: var(--brd); transform: translateY(-1px); }

/* loading */
.wgd-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 20px; gap: 14px; }
.wgd-ring { width: 44px; height: 44px; border-radius: 50%; border: 3px solid var(--bdr); border-top-color: var(--br); animation: wgd-spin .8s linear infinite; }
@keyframes wgd-spin { to { transform: rotate(360deg); } }
.wgd-load-t { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; font-style: italic; color: var(--mid); }

/* results header */
.wgd-rh { margin-bottom: 16px; }
.wgd-rbadge { display: inline-flex; align-items: center; gap: 6px; background: var(--brlt); color: var(--br); font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; margin-bottom: 10px; }
.wgd-rtitle { font-family: 'Cormorant Garamond', Georgia, serif; font-size: clamp(22px, 4vw, 28px); font-weight: 600; line-height: 1.2; margin-bottom: 4px; }
.wgd-rtitle em { font-style: italic; color: var(--br); }
.wgd-rsub { font-size: 13px; color: var(--mid); margin-bottom: 10px; }
.wgd-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.wgd-tag { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: var(--white); border: 1px solid var(--bdr); color: var(--mid); }
.wgd-tag.r { background: var(--brlt); color: var(--br); border-color: var(--brmid); }
.wgd-tag.s { background: rgba(126,8,130,.05); color: var(--brd); border-color: var(--brmid); }
.wgd-tag.t { background: #EEF2FF; color: #4338CA; border-color: #EEF2FF; }

/* post cards */
.wgd-posts { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
.wgd-post {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 13px; background: var(--white);
  border: 1px solid var(--bdr); border-radius: var(--r);
  text-decoration: none; color: var(--ink); transition: all .18s;
}
.wgd-post:hover { border-color: var(--br); background: var(--brlt); transform: translateX(2px); }
.wgd-post-img { width: 52px; height: 52px; border-radius: var(--rs); object-fit: cover; flex-shrink: 0; }
.wgd-post-ph {
  width: 52px; height: 52px; border-radius: var(--rs); flex-shrink: 0;
  background: linear-gradient(135deg, var(--brlt), var(--sand));
  display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.wgd-post-info { flex: 1; min-width: 0; }
.wgd-post-title { font-size: 13px; font-weight: 700; line-height: 1.35; margin-bottom: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.wgd-post-meta { font-size: 11px; color: var(--muted); display: flex; align-items: center; gap: 6px; }
.wgd-post-arr { font-size: 14px; color: var(--br); font-weight: 800; flex-shrink: 0; }

/* count badge */
.wgd-count { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--mid); margin-bottom: 8px; }

/* empty state */
.wgd-empty { text-align: center; padding: 28px 16px; background: var(--white); border: 1px dashed var(--bdr); border-radius: var(--r); margin: 8px 0; }
.wgd-empty-i { font-size: 32px; margin-bottom: 8px; }
.wgd-empty-t { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.wgd-empty-s { font-size: 13px; color: var(--muted); }

/* newsletter CTA */
.wgd-cta { background: linear-gradient(135deg, var(--brlt), rgba(126,8,130,.04)); border: 1px solid var(--brmid); border-radius: var(--r); padding: 20px; margin-top: 16px; }
.wgd-cta-t { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; font-weight: 600; font-style: italic; margin-bottom: 4px; }
.wgd-cta-s { font-size: 13px; color: var(--mid); margin-bottom: 14px; line-height: 1.5; }
.wgd-erow { display: flex; gap: 8px; }
.wgd-ein {
  flex: 1; padding: 10px 14px; border: 2px solid var(--bdr); border-radius: 30px;
  font-family: 'Nunito', system-ui, sans-serif; font-size: 13px;
  background: var(--white); color: var(--ink); outline: none; transition: border-color .2s;
}
.wgd-ein:focus { border-color: var(--br); }
.wgd-ein::placeholder { color: var(--muted); }
.wgd-ein.err { border-color: #EF4444; }
.wgd-esub {
  background: var(--br); color: #fff; border: none;
  font-family: 'Nunito', system-ui, sans-serif; font-size: 13px; font-weight: 800;
  padding: 10px 18px; border-radius: 30px; cursor: pointer; white-space: nowrap; transition: all .18s;
}
.wgd-esub:hover:not(:disabled) { background: var(--brd); }
.wgd-esub:disabled { opacity: .6; cursor: not-allowed; }
.wgd-enote { font-size: 11px; color: var(--muted); margin-top: 6px; }
.wgd-eerr  { font-size: 11px; color: #EF4444; margin-top: 4px; font-weight: 700; display: none; }
.wgd-eok   { font-size: 13px; font-weight: 700; color: var(--green); padding: 6px 0; }

/* restart */
.wgd-restart { text-align: center; margin-top: 12px; }
.wgd-rbtn { background: none; border: none; font-family: 'Nunito', system-ui, sans-serif; font-size: 12px; color: var(--muted); cursor: pointer; text-decoration: underline; padding: 4px; transition: color .18s; }
.wgd-rbtn:hover { color: var(--ink); }

/* step entrance animation */
.wgd-step-in { animation: wgd-fadein .3s ease; }
@keyframes wgd-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* POPUP overlay */
.wgd-overlay {
  position: fixed; inset: 0; z-index: 999999;
  background: rgba(28,25,23,.6); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; animation: wgd-fadein .25s ease;
}
.wgd-popup-wrap {
  position: relative; background: var(--cream);
  border-radius: 16px; padding: 0; max-width: 500px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
  animation: wgd-slideup .3s ease;
}
@keyframes wgd-slideup { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.wgd-popup-close {
  position: absolute; top: 12px; right: 12px; z-index: 1;
  background: var(--white); border: 1px solid var(--bdr); border-radius: 50%;
  width: 32px; height: 32px; font-size: 18px; color: var(--mid);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .15s; line-height: 1;
}
.wgd-popup-close:hover { color: var(--ink); border-color: var(--mid); }
.wgd-popup-hdr {
  background: linear-gradient(135deg, var(--brlt), rgba(126,8,130,.04));
  border-bottom: 1px solid var(--bdr);
  padding: 20px 24px 16px; border-radius: 16px 16px 0 0;
}
.wgd-popup-badge { font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--br); margin-bottom: 6px; }
.wgd-popup-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 600; line-height: 1.2; margin-bottom: 3px; }
.wgd-popup-title em { font-style: italic; color: var(--br); }
.wgd-popup-sub { font-size: 12px; color: var(--muted); }
.wgd-popup-body { padding: 4px 0; }
.wgd-popup-body .wgd-q { border-radius: 0 0 16px 16px; background: var(--cream); }

@media (max-width: 480px) {
  .wgd-grid { grid-template-columns: 1fr 1fr; }
  .wgd-erow { flex-direction: column; }
  .wgd-popup-hdr { padding: 18px 18px 14px; }
}
  `;

  /* ── HELPERS ─────────────────────────────────────────────── */
  let _cssInjected = false;
  function injectCSS() {
    if (_cssInjected) return;
    const s = D.createElement('style');
    s.id = 'wgd-quiz-css';
    s.textContent = CSS;
    D.head.appendChild(s);
    _cssInjected = true;
  }

  function el(tag, props, children) {
    const node = D.createElement(tag);
    if (props) {
      Object.entries(props).forEach(([k, v]) => {
        if (k === 'cls')      node.className = v;
        else if (k === 'html')  node.innerHTML = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v);
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null || c === false) return;
        node.appendChild(typeof c === 'string' ? D.createTextNode(c) : c);
      });
    }
    return node;
  }

  /* ── QUIZ CLASS ──────────────────────────────────────────── */
  class WGDQuiz {
    constructor(container, mode) {
      this.container = container;
      this.mode      = mode;
      this.step      = 0;
      this.ans       = { room: null, style: null, type: null };
      this.posts     = [];
      this._load();
    }

    /* ── DATA LOADING ── */
    async _load() {
      try {
        const r = await fetch(CFG.postsUrl + '?t=' + Math.floor(Date.now() / 60000));
        if (!r.ok) throw new Error('fetch failed');
        this.posts = await r.json();
      } catch (e) {
        this.posts = SAMPLE_POSTS;
      }
      this._render();
    }

    /* ── MAIN RENDER ── */
    _render() {
      this.container.innerHTML = '';
      const cls = 'wgd-q wgd-step-in' + (this.mode === 'sidebar' ? ' sidebar' : '');
      const wrap = el('div', { cls });

      if (this.step <= 2) {
        this._renderQuestion(wrap);
      } else if (this.step === 3) {
        this._renderLoading(wrap);
      } else {
        this._renderResults(wrap);
      }
      this.container.appendChild(wrap);
    }

    /* ── QUESTION STEP ── */
    _renderQuestion(wrap) {
      const key = STEPS[this.step];
      const q   = Q[key];

      wrap.appendChild(this._makeProgress());
      wrap.appendChild(el('div', { cls: 'wgd-qlbl' }, `Question ${this.step + 1} of 3`));
      wrap.appendChild(el('h3', { cls: 'wgd-qtitle' }, q.label));
      wrap.appendChild(el('p', { cls: 'wgd-qsub' }, q.sub));
      wrap.appendChild(this._makeGrid(key, q.opts));
      wrap.appendChild(this._makeNav(key));
    }

    _makeProgress() {
      const prog = el('div', { cls: 'wgd-prog' });
      for (let i = 0; i < 3; i++) {
        let cls = 'wgd-seg';
        if (i < this.step)       cls += ' done';
        else if (i === this.step) cls += ' on';
        prog.appendChild(el('div', { cls }));
      }
      return prog;
    }

    _makeGrid(key, opts) {
      const grid = el('div', { cls: 'wgd-grid' });
      opts.forEach(opt => {
        const isSel = this.ans[key] === opt.v;
        const card  = el('div', {
          cls: 'wgd-opt' + (isSel ? ' sel' : ''),
          onclick: () => this._pick(key, opt.v, card, grid),
        }, [
          el('span', { cls: 'wgd-chk' }, '✓'),
          el('div',  { cls: 'wgd-opt-e' }, opt.e),
          el('div',  { cls: 'wgd-opt-l' }, opt.l),
          opt.d ? el('div', { cls: 'wgd-opt-d' }, opt.d) : null,
        ]);
        grid.appendChild(card);
      });
      return grid;
    }

    _makeNav(key) {
      const nav  = el('div', { cls: 'wgd-nav' });
      const isOn = !!this.ans[key];
      const isLast = this.step === 2;

      if (this.step > 0) {
        nav.appendChild(el('button', {
          cls: 'wgd-back',
          onclick: () => { this.step--; this._render(); },
        }, '← Back'));
      } else {
        nav.appendChild(el('div', {}));
      }

      const nextBtn = el('button', {
        cls: 'wgd-next' + (isOn ? ' on' : ''),
        onclick: () => this._advance(),
      }, isLast ? 'Find My Posts ✦' : 'Next →');

      nav.appendChild(nextBtn);
      return nav;
    }

    _pick(key, val, card, grid) {
      grid.querySelectorAll('.wgd-opt').forEach(c => c.classList.remove('sel'));
      card.classList.add('sel');
      this.ans[key] = val;
      const btn = this.container.querySelector('.wgd-next');
      if (btn) btn.classList.add('on');
    }

    _advance() {
      if (!this.ans[STEPS[this.step]]) return;
      if (this.step < 2) {
        this.step++;
        this._render();
      } else {
        this._showResults();
      }
    }

    /* ── LOADING ── */
    _renderLoading(wrap) {
      wrap.appendChild(el('div', { cls: 'wgd-loading' }, [
        el('div', { cls: 'wgd-ring' }),
        el('div', { cls: 'wgd-load-t' }, 'Finding your posts…'),
      ]));
    }

    _showResults() {
      this.step = 3;
      this._render();
      setTimeout(() => { this.step = 4; this._render(); }, 1500);
    }

    /* ── RESULTS ── */
    _renderResults(wrap) {
      const { room, style, type } = this.ans;
      const roomOpt  = Q.room.opts.find(o => o.v === room) || {};
      const styleOpt = Q.style.opts.find(o => o.v === style) || {};
      const typeOpt  = Q.type.opts.find(o => o.v === type) || {};
      const matched  = this._filter();

      const hdr = el('div', { cls: 'wgd-rh' });
      hdr.appendChild(el('div', { cls: 'wgd-rbadge' }, '✦ Your Picks'));
      const title = el('h3', { cls: 'wgd-rtitle' });
      title.innerHTML = `${styleOpt.l || 'Your'} <em>${roomOpt.l || 'Room'}</em> Ideas`;
      hdr.appendChild(title);
      hdr.appendChild(el('p', { cls: 'wgd-rsub' }, `${matched.length} post${matched.length !== 1 ? 's' : ''} matched to your choices`));
      const tags = el('div', { cls: 'wgd-tags' }, [
        el('span', { cls: 'wgd-tag r' }, `${roomOpt.e || '🏠'} ${roomOpt.l || ''}`),
        el('span', { cls: 'wgd-tag s' }, `✦ ${styleOpt.l || ''}`),
        el('span', { cls: 'wgd-tag t' }, typeOpt.l || ''),
      ]);
      hdr.appendChild(tags);
      wrap.appendChild(hdr);

      const list = el('div', { cls: 'wgd-posts' });
      if (matched.length === 0) {
        list.appendChild(el('div', { cls: 'wgd-empty' }, [
          el('div', { cls: 'wgd-empty-i' }, '🔍'),
          el('div', { cls: 'wgd-empty-t' }, 'No posts found yet'),
          el('div', { cls: 'wgd-empty-s' }, 'Add your posts to /posts.json tagged with this room & style.'),
        ]));
      } else {
        matched.forEach(p => list.appendChild(this._postCard(p, roomOpt)));
      }
      wrap.appendChild(list);

      wrap.appendChild(this._makeCTA());

      const row = el('div', { cls: 'wgd-restart' });
      row.appendChild(el('button', {
        cls: 'wgd-rbtn',
        onclick: () => { this.step = 0; this.ans = { room: null, style: null, type: null }; this._render(); },
      }, '↩ Start over with a different room'));
      wrap.appendChild(row);
    }

    _postCard(post, roomOpt) {
      const img = post.featured_image || post.image || '';
      const rt  = post.readTime ? `⏱ ${post.readTime} min` : '';

      const a = el('a', { cls: 'wgd-post', href: post.url, rel: 'noopener' });
      if (img) {
        a.appendChild(el('img', { cls: 'wgd-post-img', src: img, alt: post.title, loading: 'lazy' }));
      } else {
        a.appendChild(el('div', { cls: 'wgd-post-ph' }, (roomOpt && roomOpt.e) || '🏠'));
      }
      const info = el('div', { cls: 'wgd-post-info' });
      info.appendChild(el('div', { cls: 'wgd-post-title' }, post.title));
      const meta = el('div', { cls: 'wgd-post-meta' });
      if (rt)           meta.appendChild(el('span', {}, rt));
      if (post.category) meta.appendChild(el('span', {}, `· ${post.category}`));
      info.appendChild(meta);
      a.appendChild(info);
      a.appendChild(el('span', { cls: 'wgd-post-arr' }, '→'));
      return a;
    }

    _makeCTA() {
      const box = el('div', { cls: 'wgd-cta' });
      box.appendChild(el('div', { cls: 'wgd-cta-t' }, '✉ Want picks like these in your inbox?'));
      box.appendChild(el('p', { cls: 'wgd-cta-s' }, 'Join free — room ideas and style guides curated for you, every week.'));
      const btn = el('button', {
        cls: 'wgd-esub ml-onclick-form',
        onclick: () => {
          if (typeof ml === 'function') {
            ml('show', CFG.mlFormId, true);
          } else {
            console.warn('MailerLite ml() not found — make sure the MailerLite script is loaded.');
          }
        },
      }, '✉ Join the Newsletter — Free');
      box.appendChild(btn);
      box.appendChild(el('p', { cls: 'wgd-enote' }, 'No spam. Unsubscribe anytime.'));
      return box;
    }

    /* ── POST FILTERING v2.2 ────────────────────────────────────
     *
     * LOGIC:
     *   Each post is scored across three independent fields:
     *     - category / categories array   (strongest signal)
     *     - tags array                    (strong signal)
     *     - title                         (weaker signal)
     *
     *   NOTE: URL/slug is intentionally excluded from room matching
     *   because URLs like /bedroom-home-office-ideas would cause false
     *   matches for both rooms.
     *
     *   For ROOM:  match on ANY ONE field includes the post (OR logic).
     *   For STYLE: bonus points if matched in any field.
     *   For TYPE:  bonus points if matched in any field.
     *
     *   Posts matching room in more fields rank higher.
     *   Fallback: if zero posts match the room at all, relax to
     *   style + type only so the user always sees something.
     *
     * KEY FIX vs v2.1:
     *   - Tags/categories are joined with " | " not " " so keywords
     *     from adjacent tags can't bleed into each other.
     *     e.g. tags ['living room','office chair'] → "living room | office chair"
     *     Searching for "home office" won't accidentally span that boundary.
     *   - Bare generic words like "office" removed from room keywords —
     *     only explicit multi-word phrases used for room detection.
     *   - URL excluded from room matching entirely (too noisy).
     *
     * SCORING:
     *   Room match in category  → +12
     *   Room match in tags      → +10
     *   Room match in title     → +6
     *   Style match (cat/tags)  → +6
     *   Style match in title    → +2
     *   Type match (any field)  → +4
     * ─────────────────────────────────────────────────────────── */
    _filter() {
      const { room, style, type } = this.ans;
      if (!room) return [];

      /* ── keyword maps ─────────────────────────────────────────
       * ROOM: use only explicit multi-word or clearly scoped phrases.
       * Avoid single generic words (e.g. "office", "dining") that can
       * appear incidentally in posts about other rooms.
       * ────────────────────────────────────────────────────────── */
      const ROOM_KW = {
        'living-room':  ['living room', 'lounge room', 'sitting room'],
        'bedroom':      ['bedroom', 'master bedroom', 'guest bedroom'],
        'dining-room':  ['dining room', 'dining area'],
        'home-office':  ['home office', 'home-office', 'office room', 'work from home'],
        'kitchen':      ['kitchen'],
        'bathroom':     ['bathroom', 'spa bathroom', 'ensuite', 'wet room'],
        'outdoor':      ['outdoor', 'patio', 'garden', 'balcony', 'terrace', 'backyard'],
        'kids':         ['kids room', "kids'", 'nursery', 'playroom', "children's room"],
        'entryway':     ['entryway', 'hallway', 'entrance hall', 'foyer'],
        'small-spaces': ['small space', 'small spaces', 'studio apartment', 'compact living'],
      };

      const STYLE_KW = {
        'modern':       ['modern style', 'modern', 'contemporary'],
        'minimalist':   ['minimalist style', 'minimalist', 'minimal'],
        'scandinavian': ['scandinavian style', 'scandinavian', 'scandi', 'nordic', 'hygge'],
        'boho':         ['boho & rustic', 'boho', 'rustic', 'bohemian', 'eclectic'],
        'luxury':       ['luxury & glam', 'luxury', 'glam', 'glamour', 'opulent'],
        'traditional':  ['traditional & classic', 'traditional', 'classic', 'elegant', 'timeless'],
        'industrial':   ['industrial style', 'industrial', 'urban industrial'],
      };

      const TYPE_KW = {
        'furniture': ['sofa', 'bed frame', 'dining table', 'chair', 'wardrobe', 'tv stand', 'shelving', 'furniture', 'headboard', 'mattress', 'bookcase', 'sideboard'],
        'decor':     ['wall decor', 'lighting', 'lamp', 'rug', 'curtain', 'mirror', 'cushion', 'vase', 'plant', 'decor', 'accent', 'pillow', 'throw', 'artwork'],
        'storage':   ['storage', 'organization', 'organisation', 'closet', 'shoe storage', 'drawers'],
        'budget':    ['budget', 'affordable', 'cheap', 'under $', 'under £', 'inexpensive', 'bargain'],
        'luxury':    ['luxury', 'glam', 'investment piece', 'premium', 'high-end', 'designer'],
      };

      const roomKw  = ROOM_KW[room]   || [room.replace(/-/g, ' ')];
      const styleKw = STYLE_KW[style] || [];
      const typeKw  = type !== 'all' ? (TYPE_KW[type] || []) : [];

      /* ── hits(): check if any keyword appears in a text string ──
       * Uses " | " as the separator when joining arrays (see fields())
       * so keywords never bleed across tag/category boundaries.
       * ────────────────────────────────────────────────────────── */
      function hits(text, keywords) {
        if (!text || !keywords.length) return false;
        // wrap with spaces so boundary checks work at start/end too
        const t = ' ' + text.toLowerCase() + ' ';
        return keywords.some(k => {
          const kl = k.toLowerCase();
          // always use substring match — boundaries are guaranteed by
          // the " | " separator used when building the field strings
          return t.includes(kl);
        });
      }

      /* ── fields(): normalise a post into searchable strings ────
       * CRITICAL: join arrays with " | " not " " so that
       * ['living room', 'office chair'] → "living room | office chair"
       * A search for 'home office' will NOT match across that boundary.
       * ────────────────────────────────────────────────────────── */
      function fields(p) {
        const cats = [].concat(p.categories || [], p.category ? [p.category] : []);
        return {
          category: cats.join(' | '),
          tags:     (p.tags || []).join(' | '),
          title:    p.title || '',
          // slug intentionally excluded from ROOM matching — URLs like
          // /bedroom-home-office-corner cause false cross-room matches
        };
      }

      /* ── scorePost(): score a single post ─────────────────────── */
      function scorePost(p) {
        const f = fields(p);

        // Room — OR across category, tags, title
        const roomInCat   = hits(f.category, roomKw);
        const roomInTags  = hits(f.tags,     roomKw);
        const roomInTitle = hits(f.title,    roomKw);
        const roomMatched = roomInCat || roomInTags || roomInTitle;

        if (!roomMatched) return null;

        let score = 0;
        if (roomInCat)   score += 12;
        if (roomInTags)  score += 10;
        if (roomInTitle) score += 6;

        // Style bonus — OR across category + tags (title gets extra)
        if (styleKw.length) {
          if (hits(f.category, styleKw) || hits(f.tags, styleKw)) score += 6;
          if (hits(f.title,    styleKw)) score += 2;
        }

        // Type bonus — OR across all fields
        if (typeKw.length) {
          if (hits(f.category, typeKw) || hits(f.tags, typeKw) || hits(f.title, typeKw)) {
            score += 4;
          }
        }

        return { p, score };
      }

      let results = this.posts
        .map(scorePost)
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .map(x => x.p);

      /*
       * FALLBACK — if no room match at all (posts.json not yet room-tagged),
       * relax to style + type only so the user always sees something.
       */
      if (results.length === 0 && (styleKw.length || typeKw.length)) {
        results = this.posts
          .map(p => {
            const f = fields(p);
            let score = 0;
            if (styleKw.length) {
              if (hits(f.category, styleKw) || hits(f.tags, styleKw)) score += 6;
              if (hits(f.title,    styleKw)) score += 2;
            }
            if (typeKw.length) {
              if (hits(f.category, typeKw) || hits(f.tags, typeKw) || hits(f.title, typeKw)) score += 4;
            }
            return score > 0 ? { p, score } : null;
          })
          .filter(Boolean)
          .sort((a, b) => b.score - a.score)
          .map(x => x.p);
      }

      return results;
    }
  }

  /* ── SAMPLE POSTS (shown only if /posts.json fails to load) ── */
  const SAMPLE_POSTS = [
    {
      title: '⚠ Could not load posts.json — check the file is at /posts.json',
      url: '/posts.json', featured_image: '', category: 'Setup', readTime: 1,
    },
  ];

  /* ── POPUP ───────────────────────────────────────────────── */
  function createPopup() {
    try {
      const ts = localStorage.getItem('wgd_popup_ts');
      if (ts && (Date.now() - +ts) < CFG.popupCooldown * 86400000) return;
    } catch (e) {}

    let shown = false;

    function show() {
      if (shown) return;
      shown = true;
      try { localStorage.setItem('wgd_popup_ts', Date.now()); } catch (e) {}

      const overlay = el('div', { cls: 'wgd-overlay', onclick: e => { if (e.target === overlay) close(); } });
      const popup   = el('div', { cls: 'wgd-popup-wrap' });
      const closeBtn = el('button', { cls: 'wgd-popup-close', onclick: close }, '×');

      const hdr = el('div', { cls: 'wgd-popup-hdr' }, [
        el('div', { cls: 'wgd-popup-badge' }, '✦ Free Style Finder'),
        el('h2',  { cls: 'wgd-popup-title', html: 'Find your perfect <em>room style</em>' }),
        el('p',   { cls: 'wgd-popup-sub' }, '3 questions → posts matched just for you'),
      ]);

      const body = el('div', { cls: 'wgd-popup-body' });
      const quizContainer = el('div', {});
      body.appendChild(quizContainer);

      popup.appendChild(closeBtn);
      popup.appendChild(hdr);
      popup.appendChild(body);
      overlay.appendChild(popup);
      D.body.appendChild(overlay);

      new WGDQuiz(quizContainer, 'popup');

      function close() { overlay.remove(); }
      D.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { once: true });
    }

    setTimeout(show, CFG.popupDelay);

    let scrolled = false;
    W.addEventListener('scroll', function onScroll() {
      if (scrolled) return;
      const dh  = D.documentElement.scrollHeight - W.innerHeight;
      const pct = dh > 0 ? (W.scrollY / dh) * 100 : 0;
      if (pct >= CFG.popupScroll) { scrolled = true; show(); W.removeEventListener('scroll', onScroll); }
    }, { passive: true });
  }

  /* ── BOOTSTRAP ───────────────────────────────────────────── */
  function bootstrap() {
    injectCSS();

    D.querySelectorAll('[data-wgd-quiz]').forEach(container => {
      const mode = container.getAttribute('data-wgd-quiz');
      if (mode !== 'popup') new WGDQuiz(container, mode);
    });

    if (D.body && (D.body.hasAttribute('data-wgd-popup') || D.querySelector('[data-wgd-quiz="popup"]'))) {
      createPopup();
    }
  }

  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', bootstrap);
  else bootstrap();

})(window, document);
