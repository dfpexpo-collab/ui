#!/usr/bin/env node
/*
 * Layout QA for SVG frames: catches the mistakes that are easy to miss by eye.
 *
 *   node check_layout.js <dir-or-svg>...      (needs playwright)
 *
 * Flags, per frame:
 *  - OVERLAP   sibling components (pills, cards, tiles, icon tiles) that overlap each other
 *  - TEXT×TEXT two texts whose boxes collide
 *  - SPILL     text that runs outside (or within 6px of the edge of) the pill/badge holding it
 *  - CUT       text that leaves the canvas
 * Exit code 1 when anything is flagged, so it can gate a build.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const files = process.argv.slice(2).flatMap(p => fs.statSync(p).isDirectory()
  ? fs.readdirSync(p).filter(f => f.endsWith('.svg')).sort().map(f => path.join(p, f)) : [p]);

const probe = () => {
  const svg = document.querySelector('svg');
  const W = svg.viewBox.baseVal.width || svg.clientWidth, H = svg.viewBox.baseVal.height || svg.clientHeight;
  const k = W / svg.getBoundingClientRect().width;
  const box = el => { const r = el.getBoundingClientRect(); return { x: r.left * k, y: r.top * k, w: r.width * k, h: r.height * k, id: el.id }; };
  const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const hidden = el => el.closest('[id^="L95"]');
  const out = [];
  const COMP = /^(PILL_|STATUS_PILL|ICON_TILE|TILE|DEVICE|DASHBOARD|GLASS)/;
  // sibling components
  const parents = new Set(Array.from(svg.querySelectorAll('g[id]')).filter(g => COMP.test(g.id)).map(g => g.parentNode));
  parents.forEach(par => {
    if (par.id && /^(PILL_|STATUS_PILL)/.test(par.id)) return;   // a pill's own parts (glass, icon tile + glow, label) are meant to stack
    // siblings share the parent's coordinate space, so compare local boxes (works for rotated/skewed groups)
    const local = el => { const b = el.getBBox(); return { x: b.x, y: b.y, w: b.width, h: b.height, id: el.id }; };
    const kids = Array.from(par.children).filter(c => c.id && COMP.test(c.id) && !hidden(c) && !c.getAttribute('transform')).map(local).filter(b => b.w && b.h);
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      const a = kids[i], b = kids[j], o = inter(a, b), small = Math.min(a.w * a.h, b.w * b.h);
      if (o > 0.02 * small && o < 0.9 * small) out.push(['OVERLAP', a.id, b.id, Math.round(o)]);   // >=90%: one sits inside the other on purpose
    }
  });
  // texts: the outlined word groups' parent, or live <text>
  const texts = Array.from(svg.querySelectorAll('g[id^="TXT_"]:not([id*="__w"]), text[id^="TXT_"]')).filter(t => !hidden(t)).map(t => ({ el: t, b: box(t) })).filter(t => t.b.w);
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i].b, b = texts[j].b;
    if (inter(a, b) > 0.05 * Math.min(a.w * a.h, b.w * b.h)) out.push(['TEXT×TEXT', a.id, b.id]);
  }
  texts.forEach(({ el, b }) => {
    if (b.x < 0 || b.y < 0 || b.x + b.w > W || b.y + b.h > H) out.push(['CUT', b.id]);
    const holder = el.closest('[id^="PILL_"], [id^="STATUS_PILL"]');
    if (holder) {
      const shape = holder.querySelector(':scope > g[id^="GLASS"] rect, :scope > rect');
      if (shape) {
        const s = box(shape), m = 6;
        if (b.x < s.x + m || b.y < s.y + 2 || b.x + b.w > s.x + s.w - m || b.y + b.h > s.y + s.h - 2) out.push(['SPILL', b.id, holder.id]);
      }
    }
  });
  return out;
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  let total = 0;
  for (const f of files) {
    await page.goto('file://' + path.resolve(f));
    const issues = await page.evaluate(probe);
    total += issues.length;
    console.log(`${path.basename(f)}: ${issues.length ? issues.length + ' issue(s)' : 'ok'}`);
    issues.forEach(i => console.log('   ' + i.join('  ')));
  }
  await browser.close();
  process.exit(total ? 1 : 0);
})();
