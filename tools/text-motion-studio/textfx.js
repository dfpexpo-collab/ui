/*
 * TextFX: word-by-word text entrances for outlined SVG text (one <g> per word).
 * Shared by the Text Motion Studio (live preview) and the video renderer, so the
 * render matches the preview exactly. Depends on a global `gsap` (3.x).
 *
 * Effects (per word): slide in from a direction, blur -> sharp, colour from the
 * echo colour -> the word's own colour, an echo trail of ghost copies that leads
 * the word by a few frames, and a soft glow behind it.
 */
(function (root) {
  const DEFAULTS = {
    preset: 'echo',        // echo | blur | fade | none
    direction: 'right',    // right | left | up | down | none (where the word comes from)
    distance: 60,          // px of travel
    duration: 0.6,         // s per word
    blur: 14,              // px blur at the start
    echoColor: '#00b3ff',  // echo/glow colour on dark scenes
    echoColorLight: '#0012d6', // echo/glow colour on light scenes
    ghosts: 3,             // number of echo copies
    ghostGap: 2,           // frames between echo copies
    ghostOpacity: 0.55,
    echoBlur: 18,          // px blur of the echo copies (separate from the word's blur)
    lead: 3,               // frames the first echo copy leads the word
    glow: 0.35,            // glow opacity at its peak (0 = off)
    glowStay: 0.12,        // glow opacity it settles to
    tint: true,            // word starts in the echo colour and turns to its own colour
    ease: [0.16, 1, 0.3, 1],   // word motion curve (cubic-bezier handles)
    echoEase: [0.22, 1, 0.36, 1], // echo motion curve
    stagger: 0.09,         // s between words when no spoken timing is given
  };
  const FPS = 30;

  // cubic-bezier(x1, y1, x2, y2) like CSS / After Effects graph handles; returns an ease function for GSAP
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = t => ((ax * t + bx) * t + cx) * t, Y = t => ((ay * t + by) * t + cy) * t;
    const dX = t => (3 * ax * t + 2 * bx) * t + cx;
    return p => {
      if (p <= 0) return 0; if (p >= 1) return 1;
      let t = p;
      for (let i = 0; i < 8; i++) { const e = X(t) - p, d = dX(t); if (Math.abs(e) < 1e-5) break; if (Math.abs(d) < 1e-6) break; t -= e / d; }
      if (t < 0 || t > 1) { let lo = 0, hi = 1; t = p; for (let i = 0; i < 30; i++) { (X(t) < p ? (lo = t) : (hi = t)); t = (lo + hi) / 2; } }
      return Y(t);
    };
  }
  const easeOf = e => Array.isArray(e) ? bezier(...e) : e;
  const SVGNS = 'http://www.w3.org/2000/svg';

  function vec(dir, d) {
    return { right: [d, 0], left: [-d, 0], up: [0, -d], down: [0, d] }[dir] || [0, 0];
  }

  function paint(g, color) {
    g.querySelectorAll('path').forEach(p => p.setAttribute('fill', color));
  }

  // Remove ghosts/glows from a previous build (the studio rebuilds on every change).
  function clean(rootEl) {
    rootEl.querySelectorAll('[data-tfx]').forEach(n => n.remove());
    rootEl.querySelectorAll('[data-tfx-word]').forEach(w => {
      gsap.killTweensOf(w);
      w.querySelectorAll('path').forEach(p => {
        gsap.killTweensOf(p);
        if (p.dataset.fill) p.setAttribute('fill', p.dataset.fill);
      });
      gsap.set(w, { clearProps: 'all' });
    });
  }

  /**
   * Add the entrance of `words` (SVG <g> elements, in reading order) to timeline `tl`.
   * times: start time of each word (s). opts: settings (merged over DEFAULTS); light: light scene.
   */
  function apply(tl, words, times, opts, light) {
    const s = Object.assign({}, DEFAULTS, opts || {});
    if (s.preset === 'none' || !words.length) {
      words.forEach((w, i) => tl.fromTo(w, { opacity: 0 }, { opacity: 1, duration: 0.01 }, times[i]));
      return;
    }
    const echo = light ? s.echoColorLight : s.echoColor;
    const [dx, dy] = s.direction === 'none' ? [0, 0] : vec(s.direction, s.distance);
    const useEcho = s.preset === 'echo';
    const blur = s.preset === 'fade' ? 0 : s.blur;
    const ease = easeOf(s.ease), echoEase = easeOf(s.echoEase || s.ease);

    words.forEach((w, i) => {
      const t = times[i];
      w.setAttribute('data-tfx-word', '');
      const paths = Array.from(w.querySelectorAll('path'));
      paths.forEach(p => { if (!p.dataset.fill) p.dataset.fill = p.getAttribute('fill') || '#000'; });

      if (useEcho) {
        // glow: blurred copy behind the word
        if (s.glow > 0) {
          const glow = w.cloneNode(true);
          glow.removeAttribute('id'); glow.setAttribute('data-tfx', 'glow');
          paint(glow, echo);
          w.parentNode.insertBefore(glow, w);
          tl.fromTo(glow, { opacity: 0, x: dx, y: dy, filter: 'blur(18px)' },
            { opacity: s.glow, x: 0, y: 0, duration: s.duration, ease: echoEase }, t - s.lead / FPS);
          tl.to(glow, { opacity: s.glowStay, duration: s.duration * 1.2, ease: 'sine.out' }, t + s.duration);
        }
        // echo copies lead the word: each one starts a few frames earlier, lands first, then fades as the word arrives
        const lead = s.lead / FPS, gap = s.ghostGap / FPS;
        for (let k = 1; k <= s.ghosts; k++) {
          const gh = w.cloneNode(true);
          gh.removeAttribute('id'); gh.setAttribute('data-tfx', 'ghost');
          paint(gh, echo);
          w.parentNode.insertBefore(gh, w);
          const op = s.ghostOpacity * (1 - (k - 1) / (s.ghosts + 1));
          const t0 = t - lead - (s.ghosts - k) * gap;
          tl.fromTo(gh, { opacity: 0, x: dx, y: dy, filter: `blur(${s.echoBlur}px)` },
            { opacity: op, x: 0, y: 0, filter: `blur(${s.echoBlur * 0.4}px)`, duration: s.duration * 0.8, ease: echoEase }, t0);
          tl.to(gh, { opacity: 0, duration: s.duration * 0.5, ease: 'power1.out' }, t + s.duration * 0.55);
        }
      }

      // the word itself
      tl.fromTo(w, { opacity: 0, x: dx, y: dy, filter: `blur(${blur}px)` },
        { opacity: 1, x: 0, y: 0, filter: 'blur(0px)', duration: s.duration, ease }, t);
      if (useEcho && s.tint) {
        paths.forEach(p => {
          if (/^url\(/.test(p.dataset.fill)) return;   // gradient fills keep their paint
          tl.fromTo(p, { attr: { fill: echo } }, { attr: { fill: p.dataset.fill }, duration: s.duration * 1.1, ease: 'power1.inOut' }, t);
        });
      }
    });
  }

  // ---- typewriter for text inside bars, sheets and fields: letter by letter with a cursor
  const TYPE_DEFAULTS = {
    preset: 'type',            // type | none
    typeSpeed: 45,             // letters per second
    cursor: false,
    cursorColor: '#00b3ff',
    cursorColorLight: '#0012d6',
    stagger: 0.01,             // s between fields in the same scene
    delay: 0,
  };
  let clipN = 0;

  /** Type the text group `g` (outlined <g id="TXT_…">) starting at time t. */
  function typewrite(tl, g, t, opts, light) {
    const s = Object.assign({}, TYPE_DEFAULTS, opts || {});
    if (s.preset === 'none') { tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.01 }, t); return; }
    const svg = g.ownerSVGElement, bb = g.getBBox();
    if (!svg || !bb.width) return;
    const label = (g.id || '').replace(/^TXT_/, '').replace(/_\d+$/, '');
    const rtl = /[؀-ۿ]/.test(label);
    const n = Math.max(1, label.replace(/_/g, '').length);
    const pad = 4, x0 = bb.x - pad, w = bb.width + pad * 2, dur = n / s.typeSpeed;

    const cp = document.createElementNS(SVGNS, 'clipPath');
    cp.id = 'tfxclip' + (++clipN); cp.setAttribute('data-tfx', 'clip');
    const r = document.createElementNS(SVGNS, 'rect');
    r.setAttribute('y', bb.y - pad); r.setAttribute('height', bb.height + pad * 2);
    cp.appendChild(r); svg.appendChild(cp);
    g.setAttribute('clip-path', `url(#${cp.id})`); g.setAttribute('data-tfx-clip', '');
    // RTL reveals from the right edge, LTR from the left, one letter step at a time
    tl.fromTo(r, { attr: { x: rtl ? x0 + w : x0, width: 0 } },
      { attr: { x: x0, width: w }, duration: dur, ease: `steps(${n})` }, t);

    if (s.cursor) {
      const c = document.createElementNS(SVGNS, 'rect');
      c.setAttribute('data-tfx', 'cursor');
      c.setAttribute('y', bb.y - 2); c.setAttribute('width', 2.5); c.setAttribute('height', bb.height + 4);
      c.setAttribute('fill', light ? s.cursorColorLight : s.cursorColor);
      g.parentNode.insertBefore(c, g.nextSibling);
      const startX = rtl ? x0 + w : x0 - 2.5, endX = rtl ? x0 - 2.5 : x0 + w;
      tl.fromTo(c, { attr: { x: startX }, opacity: 0 }, { opacity: 1, duration: 0.01 }, t - 0.05);
      tl.to(c, { attr: { x: endX }, duration: dur, ease: `steps(${n})` }, t);
      [0, 1, 0, 1, 0].forEach((o, i) => tl.set(c, { opacity: o }, t + dur + 0.12 + i * 0.12));
    }
  }

  // ---- count-up for numbers and prices, with motion blur that clears as the value settles
  const COUNT_DEFAULTS = { preset: 'count', duration: 0.9, blur: 10, rise: 14, delay: 0, ease: [0.16, 1, 0.3, 1] };
  const NUM = /^([+\u00d7]?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(\s?(?:x|\u00d7|%|M|K|m\u00b2|units))?$/;
  const isCount = txt => NUM.test((txt || '').trim());

  /** Count the text group g (outlined, carrying data-text/font/size…) up from zero, starting at t. */
  function countUp(tl, g, t, opts) {
    const s = Object.assign({}, COUNT_DEFAULTS, opts || {});
    const m = NUM.exec((g.dataset.text || '').trim());
    if (!m || s.preset === 'none') { tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.01 }, t); return; }
    const [, pre, int, frac = '', suf = ''] = m;
    const target = parseFloat(int.replace(/,/g, '') + frac), dec = frac ? frac.length - 1 : 0, commas = int.includes(',');
    const fmt = v => pre + (commas ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec)) + suf;
    const rtl = g.dataset.rtl === '1', a = g.dataset.anchor;
    const anchor = a === 'middle' ? 'middle' : ((a === 'start') !== rtl ? 'start' : 'end');
    const tx = document.createElementNS(SVGNS, 'text');
    tx.setAttribute('data-tfx', 'count');
    tx.setAttribute('x', g.dataset.x); tx.setAttribute('y', g.dataset.y);
    tx.setAttribute('font-family', `${g.dataset.font}, "IBM Plex Sans Arabic", sans-serif`);
    tx.setAttribute('font-size', g.dataset.size); tx.setAttribute('font-weight', g.dataset.weight);
    tx.setAttribute('text-anchor', anchor); tx.setAttribute('fill', g.dataset.fill);
    if (+g.dataset.ls) tx.setAttribute('letter-spacing', g.dataset.ls);
    tx.style.fontVariantNumeric = 'tabular-nums';
    if (g.getAttribute('opacity')) tx.setAttribute('opacity', g.getAttribute('opacity'));
    tx.textContent = fmt(0);
    g.parentNode.insertBefore(tx, g.nextSibling);
    g.setAttribute('data-tfx-hide', ''); g.style.visibility = 'hidden';
    const ease = easeOf(s.ease), box = { v: 0 };
    tl.fromTo(tx, { opacity: 0, y: s.rise, filter: `blur(${s.blur}px)` },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: s.duration, ease }, t);
    tl.fromTo(box, { v: 0 }, { v: target, duration: s.duration, ease, onUpdate: () => { tx.textContent = fmt(box.v); } }, t);
  }

  function cleanType(rootEl) {
    rootEl.querySelectorAll('[data-tfx-clip]').forEach(g => { g.removeAttribute('clip-path'); g.removeAttribute('data-tfx-clip'); gsap.set(g, { clearProps: 'opacity' }); });
    rootEl.querySelectorAll('[data-tfx-hide]').forEach(g => { g.style.visibility = ''; g.removeAttribute('data-tfx-hide'); });
  }
  const _clean = clean;
  function cleanAll(rootEl) { cleanType(rootEl); _clean(rootEl); }

  root.TextFX = { DEFAULTS, TYPE_DEFAULTS, COUNT_DEFAULTS, isCount, countUp, bezier, apply, typewrite, clean: cleanAll };
})(typeof window !== 'undefined' ? window : globalThis);
