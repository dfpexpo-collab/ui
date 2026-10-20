#!/usr/bin/env node
/*
 * Action-safe check for a seek(t) film (film.html from build_film.js HTML_ONLY=1).
 *
 *   node safe_area.js <film.html> [--margin 5] [--step 2] [--exclude REGEX]
 *
 * Walks the film every <step> frames and flags any content layer (top-level L## group of the visible scene)
 * whose on-screen box leaves the action-safe rect (<margin>% in from every edge, default 5%).
 * Soft drop shadows are ignored. Exempt by design: the background (L01_BG and the shader), full-bleed decor (--exclude, default WALL|ORBIT|FLOOR|STREAK),
 * transition FX layers, and any scene while it is in a transition (its wrapper moved/faded, or a reveal mask on).
 * Exit 1 when anything is flagged. Needs playwright.
 */
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const file = args[0], margin = +opt('margin', 5), step = +opt('step', 2), exclude = opt('exclude', 'WALL|ORBIT|FLOOR|STREAK|SCRIM');

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-compositing'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve(file));
  const out = await page.evaluate(({ margin, step, exclude }) => {
    const W = 1920, H = 1080, mx = W * margin / 100, my = H * margin / 100, FPS = 30, ex = new RegExp(exclude);
    const scenes = window.FILM.scenes, hits = {};
    const n = Math.round(window.TOTAL * FPS);
    for (let f = 0; f < n; f += step) {
      window.seek(f / FPS);
      scenes.forEach((sc, i) => {
        const el = document.getElementById('S' + i), whip = el.firstElementChild;
        if (getComputedStyle(el).visibility === 'hidden') return;
        const ws = getComputedStyle(whip);
        // in a transition: wrapper moved/scaled/blurred/faded, or a reveal mask on the content
        if (+ws.opacity < 0.99 || (ws.transform !== 'none' && ws.transform !== 'matrix(1, 0, 0, 1, 0, 0)') || ws.filter !== 'none') return;
        const svg = el.querySelector('svg'); if (!svg) return;
        const wrap = svg.querySelector(':scope > g:not([id])');
        if (wrap && wrap.getAttribute('mask')) return;
        // a mask on the previous scene means this one is being revealed over it
        const layers = Array.from((wrap || svg).children).filter(g => /^L\d/.test(g.id) && !/^L0?1_BG/.test(g.id) && !/^L9/.test(g.id) && !ex.test(g.id));
        layers.forEach(g => {
          // visible opacity along the chain
          let o = 1, e = g; while (e && e !== document.body) { const c = getComputedStyle(e); o *= +c.opacity; if (c.display === 'none' || c.visibility === 'hidden') o = 0; e = e.parentElement; }
          if (o < 0.05) return;
          // soft drop shadows (gradient ellipses that fade to nothing) don't count as content
          const sh = g.querySelectorAll('[fill="url(#gShadow)"]'); sh.forEach(e => e.style.display = 'none');
          const r = g.getBoundingClientRect(); sh.forEach(e => e.style.display = '');
          if (!r.width || !r.height) return;
          const over = Math.max(mx - r.left, my - r.top, r.right - (W - mx), r.bottom - (H - my));
          if (over > 1) {
            const k = sc.id + ' ' + g.id, h = hits[k] || (hits[k] = { from: f, to: f, worst: 0, box: null });
            h.to = f; if (over > h.worst) { h.worst = Math.round(over); h.box = [r.left, r.top, r.right, r.bottom].map(Math.round); h.at = f; }
          }
        });
      });
    }
    return hits;
  }, { margin, step, exclude });
  await browser.close();
  const keys = Object.keys(out);
  keys.forEach(k => { const h = out[k]; console.log(`OUT  ${k.padEnd(28)} ${(h.from / 30).toFixed(2)}–${(h.to / 30).toFixed(2)}s  worst ${h.worst}px at ${(h.at / 30).toFixed(2)}s  box ${h.box.join(',')}`); });
  console.log(`${keys.length} layer(s) outside action-safe (${margin}%)`);
  process.exit(keys.length ? 1 : 0);
})();
