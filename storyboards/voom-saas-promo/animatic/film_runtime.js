/*
 * VOOM promo v02 film timeline (runs in the page). See MOTION_BRIEF.md.
 * Needs: gsap, TextFX (tools/text-motion-studio/textfx.js), window.FILM = { scenes, settings }.
 * Every frame is a pure function of time: window.seek(t).
 */
(function () {
  const { scenes: SCENES, settings: SET } = window.FILM;
  const TOTAL = SCENES[SCENES.length - 1].end;
  // scene overlaps start before 0, so every position is shifted by PAD (GSAP misplays children at negative times)
  const PAD = 1, real = gsap.timeline({ paused: true });
  const sh = f => (...a) => { const n = a.length - 1; if (typeof a[n] === 'number') a[n] += PAD; real[f](...a); return tl; };
  const tl = { to: sh('to'), from: sh('from'), fromTo: sh('fromTo'), set: sh('set') };
  const LAUNCH = 'expo.out', GLIDE = 'sine.inOut';
  const q = (r, s) => Array.from(r.querySelectorAll(s));
  const NS = 'http://www.w3.org/2000/svg';
  const BLUE = '#0012d6', LBLUE = '#00b3ff', DEEP = '#000024', OFF = '#f1f1f1';
  const byId = id => SCENES.find(s => s.id === id);

  // ---- camera per scene: [transform-origin, from, to]
  const CAM = {
    F01: ['50% 50%', { scale: 1.0, y: 10 }, { scale: 1.07, y: -10 }],
    F02: ['50% 50%', { scale: 1.06, x: 35 }, { scale: 1.09, x: -35 }],
    F03: ['50% 62%', { scale: 1.0 }, { scale: 1.12 }],
    F04: ['50% 55%', { scale: 1.06, x: -40 }, { scale: 1.06, x: 40 }],
    F05: ['50% 60%', { scale: 1.14 }, { scale: 1.03 }],
    F06: ['50% 55%', { scale: 1.03, x: 25 }, { scale: 1.05, x: -25 }],
    F07: ['50% 50%', { scale: 1.0 }, { scale: 1.14 }],
    F08: ['50% 50%', { scale: 1.0 }, { scale: 1.05 }],
    F09: ['50% 62%', { scale: 1.0 }, { scale: 1.1 }],
    F10: ['50% 62%', { scale: 1.1, rotationY: -6, x: 20 }, { scale: 1.08, rotationY: 5, x: -20 }],
    F11: ['70% 55%', { scale: 1.05, x: 30 }, { scale: 1.1, x: -30 }],
    F12: ['50% 62%', { scale: 1.06, x: 60 }, { scale: 1.06, x: -60 }],
    F13: ['50% 50%', { scale: 1.0 }, { scale: 1.08 }],
    F15: ['50% 60%', { scale: 1.0 }, { scale: 1.1 }],
    F16: ['50% 50%', { scale: 1.08, rotation: -1.2 }, { scale: 1.12, rotation: 1.2 }],
    F17: ['55% 46%', { scale: 1.0 }, { scale: 1.12 }],
    F18: ['50% 50%', { scale: 1.0 }, { scale: 1.06 }],
    F19: ['50% 50%', { scale: 1.05 }, { scale: 1.0 }],
  };
  // how each scene comes in
  const TRANS = { F02: 'whip', F03: 'wipe', F04: 'balls', F05: 'fade', F06: 'fade', F07: 'fade', F08: 'wipe', F09: 'whip',
    F10: 'balls', F11: 'whip', F12: 'whip', F13: 'whip', F14: 'fade', SLATE: 'cut', F15: 'whip', F16: 'whip', F17: 'fade', F18: 'whip', F19: 'wipe' };
  const BALL_FROM = { F04: [960, 560], F10: [510, 670] };
  // cursor: click time (absolute) per scene; default near the middle
  const CLICK = { F02: 2.95, F05: 7.9, F07: 11.35, F09: 14.75, F10: 17.4, F17: 39.25 };

  // ---- text settings (from Text Studio)
  const kindBase = k => k === 'field' ? SET.fields : k === 'count' ? SET.counts : SET.global;
  const eff = (key, k) => Object.assign({}, kindBase(k), SET.overrides[key] || {});
  function voTimes(sc, n) {
    if (sc.words) return Array.from({ length: n }, (_, i) => sc.words[Math.min(i, sc.words.length - 1)]);
    const [a, b] = sc.vo || [sc.start + 0.2, sc.start + (sc.end - sc.start) * 0.6];
    const span = Math.max(0.1, (b - a) * 0.85);
    return Array.from({ length: n }, (_, i) => a + (n > 1 ? span * i / (n - 1) : 0));
  }

  // ---- proximity bookkeeping (applied after each seek)
  const PROX = [];
  function wrapCells(scope) {
    const cells = [];
    q(scope, '[id^="UNIT_GRID"] > rect').forEach(r => {
      const w = document.createElementNS(NS, 'g'); r.parentNode.insertBefore(w, r); w.appendChild(r);
      const x = +r.getAttribute('x') + +r.getAttribute('width') / 2, y = +r.getAttribute('y') + +r.getAttribute('height') / 2;
      cells.push({ w, inner: r, cx: x, cy: y });
    });
    q(scope, 'g[id^="TILE"]').forEach(t => {
      const w = document.createElementNS(NS, 'g'); t.parentNode.insertBefore(w, t); w.appendChild(t);
      const b = t.getBBox(); cells.push({ w, inner: t, cx: b.x + b.width / 2, cy: b.y + b.height / 2 });
    });
    return cells;
  }

  function draw(p, at, d) {
    const len = p.getTotalLength();
    tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: 'power3.out' }, at);
  }

  // ---- scene build
  const scEls = [];
  SCENES.forEach((sc, i) => {
    const el = document.getElementById('S' + i), whip = el.firstElementChild, cam = whip.firstElementChild, svg = cam.querySelector('svg');
    sc.el = el; sc.whip = whip; sc.cam = cam; sc.svg = svg; scEls.push(sc);
    const bg = svg && svg.querySelector('#BG_FILL rect'); sc.light = !!bg && /^#f1f1f1$/i.test(bg.getAttribute('fill') || '');
  });

  SCENES.forEach((sc, i) => {
    const { el, whip, cam, svg } = sc, start = sc.start, end = sc.end, dur = end - start;
    const next = SCENES[i + 1], tin = TRANS[sc.id] || 'fade';
    // visibility window (overlap for the incoming transition of the next scene)
    tl.set(el, { visibility: 'visible', zIndex: i + 1 }, start - 0.3);
    tl.set(el, { visibility: 'hidden' }, end + 0.35);
    if (tin === 'fade') tl.fromTo(whip, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }, start - 0.05);
    else tl.set(whip, { opacity: 1 }, start - 0.3);
    if (tin === 'whip') {
      tl.fromTo(whip, { x: 260, filter: 'blur(14px)' }, { x: 0, filter: 'blur(0px)', duration: 0.32, ease: 'power3.out' }, start);
      const prev = SCENES[i - 1];
      if (prev) tl.to(prev.whip, { x: -260, filter: 'blur(14px)', duration: 0.22, ease: 'power2.in' }, start - 0.22);
      tl.set(el, { visibility: 'hidden' }, start - 0.3).set(el, { visibility: 'visible' }, start - 0.001);
    }
    if (tin === 'cut') tl.set(el, { visibility: 'visible' }, start);
    if (!svg) {   // slate
      tl.from(el.querySelectorAll('.slate > *'), { opacity: 0, y: 30, duration: 0.6, ease: LAUNCH, stagger: 0.15 }, start + 0.1);
      return;
    }
    // camera
    const c = CAM[sc.id];
    if (c) { gsap.set(cam, { transformOrigin: c[0] }); tl.fromTo(cam, c[1], Object.assign({ duration: dur + 0.35, ease: GLIDE }, c[2]), start - 0.05); }

    const layers = Array.from(svg.children).filter(n => n.tagName === 'g' && /^L\d/.test(n.id));
    const layerAt = {};
    let ei = 0;
    const cells = wrapCells(svg);

    layers.forEach(layer => {
      const id = layer.id;
      if (/^L9/.test(id)) { layer.style.display = id.startsWith('L95') ? 'none' : ''; return; }
      if (id === 'L01_BG') {     // frame stays; the light inside moves
        q(layer, '[id^="GLOW"]').forEach((g, k) => tl.fromTo(g, { x: k % 2 ? 60 : -60, y: k % 2 ? -30 : 30, scale: 1, transformOrigin: '50% 50%' },
          { x: k % 2 ? -60 : 60, y: k % 2 ? 30 : -30, scale: 1.15, duration: dur + 0.4, ease: GLIDE }, start - 0.1));
        q(layer, '[id^="GRID_FLOOR"]').forEach(g => tl.fromTo(g, { y: 0 }, { y: 18, duration: dur, ease: 'none' }, start));
        return;
      }
      if (/FLOAT/.test(id)) {    // F01: feature words glitch in, then float
        Array.from(layer.children).forEach((w, k) => {
          const op = Math.min(1, 1.8 * +(w.getAttribute('opacity') || 1)), at = start + 0.15 + k * 0.08;
          tl.set(w, { opacity: 0 }, start - 0.3);
          tl.to(w, { keyframes: [{ opacity: op, x: -14, duration: 0.04 }, { opacity: op * 0.15, x: 10, duration: 0.04 }, { opacity: op, x: -5, duration: 0.05 }, { opacity: op * 0.4, x: 4, duration: 0.04 }, { opacity: op, x: 0, duration: 0.05 }] }, at);
          tl.fromTo(w, { y: 0 }, { y: (k % 2 ? -1 : 1) * (14 + k * 3), duration: dur, ease: GLIDE }, at + 0.22);
        });
        return;
      }
      if (/ORBIT/.test(id)) {
        tl.from(layer, { opacity: 0, duration: 0.6 }, start);
        q(layer, '[id^="ORBIT_DASHED"]').forEach((o, k) => tl.fromTo(o, { rotation: 0 }, { rotation: (k % 2 ? -1 : 1) * dur * 9, svgOrigin: '960 520', duration: dur + 0.4, ease: 'none' }, start));
        return;
      }
      if (/CURSOR|TAP/.test(id)) {
        const click = CLICK[sc.id] ?? start + dur * 0.55, t0 = Math.max(start + 0.15, click - 1.15);
        tl.fromTo(layer, { x: 360, y: 240, opacity: 0 }, { x: -170, y: -70, opacity: 1, duration: 0.7, ease: 'power2.inOut' }, t0);
        tl.to(layer, { x: 0, y: 0, duration: 0.45, ease: 'power3.out' }, t0 + 0.7);
        const cur = layer.querySelector('[id^="CURSOR"]');
        if (cur) tl.to(cur, { scale: 0.82, transformOrigin: '0% 0%', duration: 0.07, yoyo: true, repeat: 1 }, click);
        q(layer, '[id^="TAP_PING"]').forEach(p => tl.fromTo(p, { scale: 0.2, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.4, ease: LAUNCH }, click));
        if (cur && cells.length) PROX.push({ sc, cur, cells, from: t0 });
        sc.click = click;
        return;
      }
      if (/BIG_10X|COUNTER/.test(id)) { layerAt[id] = start; return; }   // counted by TextFX
      if (id === 'L05_STREAK') { tl.fromTo(layer, { x: -1100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: LAUNCH }, start + 0.05); return; }
      if (/LOGO/.test(id)) {     // mask reveal left → right
        const img = layer.querySelector('image'), b = img.getBBox();
        const cp = document.createElementNS(NS, 'clipPath'); cp.id = 'logoclip' + i;
        const r = document.createElementNS(NS, 'rect'); r.setAttribute('x', b.x - 10); r.setAttribute('y', b.y - 20); r.setAttribute('height', b.height + 40);
        cp.appendChild(r); svg.appendChild(cp); img.setAttribute('clip-path', `url(#${cp.id})`);
        tl.fromTo(r, { attr: { width: 0 } }, { attr: { width: b.width + 20 }, duration: 0.85, ease: LAUNCH }, start + 0.12);
        tl.fromTo(layer, { scale: 0.97, transformOrigin: '50% 50%' }, { scale: 1.02, duration: dur, ease: GLIDE }, start);
        return;
      }
      if (/WALL/.test(id)) {     // F16/F17 project wall: tiles fly in with depth
        if (sc.id === 'F16') tl.from(cells.map(c => c.inner), { opacity: 0, scale: 0.55, y: 90, transformOrigin: '50% 50%', duration: 0.7, ease: LAUNCH, stagger: { amount: 0.9, from: 'center' } }, start);
        tl.fromTo(layer, { x: 50, y: 20 }, { x: -50, y: -20, duration: dur + 0.4, ease: 'none' }, start);
        layerAt[id] = start;
        return;
      }
      if (id === 'L05_TOGGLE' && sc.id === 'F07') {
        tl.from(layer, { opacity: 0, y: 50, filter: 'blur(10px)', duration: 0.8, ease: LAUNCH }, start + 0.05);
        const knob = layer.querySelector('#TOGGLE_KNOB'), off = layer.querySelector('#OPT_OFFLINE'), on = layer.querySelector('#OPT_ONLINE');
        const T = CLICK.F07 + 0.05, move = -(800 / 2 - 14);
        tl.to(knob, { x: move, duration: 0.45, ease: 'back.out(1.2)' }, T);
        q(off, 'path').forEach(p => tl.to(p, { attr: p.getAttribute('stroke') ? { stroke: OFF } : { fill: OFF }, duration: 0.3 }, T + 0.05));
        q(on, 'path').forEach(p => tl.to(p, { attr: p.getAttribute('stroke') ? { stroke: DEEP } : { fill: DEEP }, duration: 0.3 }, T + 0.05));
        q(off, 'g[id^="TXT_"]').forEach(g => tl.to(g, { opacity: 1, duration: 0.3 }, T + 0.05));
        q(on, 'g[id^="TXT_"]').forEach(g => tl.to(g, { opacity: 0.55, duration: 0.3 }, T + 0.05));
        layerAt[id] = start;
        return;
      }
      // generic element entrance, varied by role
      const at = start + 0.06 + ei * 0.1; ei++;
      layerAt[id] = at;
      let from;
      if (/STATUS_PILL/.test(id) && sc.id === 'F07') { const T = CLICK.F07 + 0.45; layerAt[id] = T; tl.from(layer, { opacity: 0, scale: 0.85, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(1.7)' }, T); return; }
      if (/CHIP|PILL|ICON_TILE/.test(id)) from = { opacity: 0, scale: 0.8, transformOrigin: '50% 50%', ease: 'back.out(1.7)', duration: 0.55 };
      else if (/DEVICE/.test(id)) from = { opacity: 0, y: 140, scale: 0.9, filter: 'blur(12px)', transformOrigin: '50% 100%', ease: LAUNCH, duration: 1.0 };
      else if (/SHEET|PLAN|CRM/.test(id)) from = { opacity: 0, x: -80, filter: 'blur(10px)', ease: LAUNCH, duration: 0.85 };
      else if (/DASHBOARD|DATA/.test(id)) from = { opacity: 0, x: 80, filter: 'blur(10px)', ease: LAUNCH, duration: 0.85 };
      else if (/LINK|LEADER|ARROWS/.test(id)) from = { opacity: 0, duration: 0.4, ease: 'none' };
      else from = [{ opacity: 0, y: 60, filter: 'blur(10px)' }, { opacity: 0, scale: 0.92, filter: 'blur(10px)', transformOrigin: '50% 50%' }, { opacity: 0, y: -40, filter: 'blur(10px)' }][ei % 3];
      tl.from(layer, Object.assign({ ease: LAUNCH, duration: 0.85 }, from), at);
      // inner parts
      q(layer, '[id^="ICON_TILE"]').forEach((t, k) => tl.from(t, { scale: 0, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2)' }, at + 0.25 + k * 0.06));
      q(layer, 'circle').filter(cn => +cn.getAttribute('r') <= 10 && !cn.id).forEach((cn, k) => tl.from(cn, { scale: 0, transformOrigin: '50% 50%', duration: 0.35, ease: 'back.out(2.5)' }, at + 0.3 + (k % 14) * 0.03));
      q(layer, '#CHART_LINE').forEach(p => draw(p, at + 0.2, 0.9));
      q(layer, '#CHART_AREA').forEach(p => tl.from(p, { opacity: 0, duration: 0.8 }, at + 0.35));
      q(layer, '#CHART_DOT').forEach(p => tl.from(p, { scale: 0, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(2)' }, at + 1.0));
      q(layer, '#LINK_PATH').forEach(p => p.getAttribute('stroke-dasharray') ? tl.to(p, { strokeDashoffset: -160, duration: dur, ease: 'none' }, at) : draw(p, at + 0.3, 0.6));
      q(layer, '[id^="DATA_DOT"]').forEach((p, k) => tl.fromTo(p, { x: -40 }, { x: 40, duration: 0.7, ease: GLIDE, repeat: Math.max(1, Math.floor(dur / 0.7)), yoyo: true }, at + k * 0.12));
      q(layer, '[id^="SELECTED_UNIT"]').forEach(p => tl.from(p, { scale: 1.6, opacity: 0, transformOrigin: '50% 50%', duration: 0.5, ease: LAUNCH }, at + 0.5));
      // pixel build for small squares
      q(layer, '[id^="UNIT_GRID"]').forEach(grid => {
        const inners = cells.filter(cl => grid.contains(cl.w)).map(cl => cl.inner);
        tl.from(inners, { opacity: 0, scale: 0.2, transformOrigin: '50% 50%', duration: 0.3, ease: 'steps(3)', stagger: { amount: Math.min(0.9, dur * 0.4), from: 'random' } }, at + 0.15);
      });
    });

    // F17: click on the empty tile — it pulses and its word bounces
    if (sc.id === 'F17') {
      const tile = svg.querySelector('[id^="TILE_EMPTY"]');
      if (tile) {
        tl.to(tile, { scale: 1.1, transformOrigin: '50% 50%', duration: 0.18, ease: 'power2.out' }, CLICK.F17);
        tl.to(tile, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' }, CLICK.F17 + 0.18);
        q(tile, 'rect').slice(0, 1).forEach(r => tl.to(r, { attr: { 'fill-opacity': 0.6 }, duration: 0.2, yoyo: true, repeat: 1 }, CLICK.F17));
      }
    }
    if (sc.id === 'F14') tl.to(svg, { scale: 2.7, transformOrigin: '50% 50%', duration: 1.0, ease: 'power2.in' }, end - 1.0);
    if (sc.id === 'F15' && sc.big) tl.to(cam, { scale: '+=0.05', duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, sc.big + 0.55);

    // ---- text (Text Studio settings)
    const headWords = [], items = [];
    let fieldIdx = 0;
    layers.forEach(layer => {
      if (/^L9|FLOAT|L01_BG/.test(layer.id)) return;
      const head = /^L1\d/.test(layer.id) || /BIG_10X|COUNTER/.test(layer.id);
      q(layer, 'g[id^="TXT_"]').forEach(g => {
        if (g.id.includes('__w')) return;
        const words = Array.from(g.querySelectorAll(':scope > g[id*="__w"]')); if (!words.length) return;
        const kind = TextFX.isCount(g.dataset.text) ? 'count' : head ? 'head' : 'field';
        items.push({ g, words, kind, inHead: head, layer: layer.id, idx: head ? 0 : fieldIdx++, key: sc.id + '/' + g.id });
        if (head) headWords.push(...words);
      });
    });
    const vt = voTimes(sc, headWords.length);
    items.forEach(it => {
      const s = eff(it.key, it.kind), la = (layerAt[it.layer] ?? start) + 0.3;
      if (it.kind === 'count') {
        const at = it.inHead ? (sc.big != null ? sc.big : vt[0]) : Math.max(la, start + 0.25 + it.idx * SET.fields.stagger);
        TextFX.countUp(tl, it.g, Math.max(start, at + s.delay), s);
      } else if (it.kind === 'field') {
        TextFX.typewrite(tl, it.g, Math.max(la, start + 0.25 + it.idx * s.stagger) + s.delay, s, sc.light);
      } else {
        const times = it.words.map(w => Math.max(start, vt[headWords.indexOf(w)] + s.delay));
        TextFX.apply(tl, it.words, times, s, sc.light);
        if (!/F08|F18|F19/.test(sc.id) && next && TRANS[next.id] !== 'balls' && TRANS[next.id] !== 'wipe')
          tl.to(it.words, { opacity: 0, y: -16, duration: 0.18, ease: 'power2.in', stagger: 0.02 }, end - 0.24);
      }
    });
  });

  // ---- gradient wipe (dark ↔ light and into the logo)
  const wipe = document.getElementById('wipe');
  SCENES.forEach(sc => {
    if (TRANS[sc.id] !== 'wipe') return;
    tl.fromTo(wipe, { xPercent: -100, visibility: 'visible' }, { xPercent: 100, duration: 0.9, ease: 'power2.inOut' }, sc.start - 0.45);
    tl.set(wipe, { visibility: 'hidden' }, sc.start + 0.46);
  });

  // ---- dot-grid "ball" transitions
  const balls = document.getElementById('balls'), BALLS = [];
  const COLS = 48, ROWS = 27, CELL = 40, R = 30;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const e = document.createElementNS(NS, 'circle'); const x = c * CELL + CELL / 2, y = r * CELL + CELL / 2;
    e.setAttribute('cx', x); e.setAttribute('cy', y); e.setAttribute('r', 0);
    e.setAttribute('fill', [BLUE, LBLUE, BLUE, DEEP][(r * 7 + c * 3) % 4]);
    balls.appendChild(e); BALLS.push({ e, x, y });
  }
  function ballFrame(ox, oy, p, closing) {
    const maxd = Math.hypot(1920, 1080);
    BALLS.forEach(b => {
      const d = Math.hypot(b.x - ox, b.y - oy) / maxd;
      let k = Math.min(1, Math.max(0, p * 1.7 - d * 0.7));
      k = k * k * (3 - 2 * k);
      b.e.setAttribute('r', (closing ? 1 - k : k) * R);
    });
  }
  // computed straight from t after each seek (no tween state to go stale)
  const BALL_T = SCENES.filter(sc => TRANS[sc.id] === 'balls').map(sc => ({ T: sc.start, o: BALL_FROM[sc.id] || [960, 540] }));
  let ballsOn = true;
  function ballsAt(t) {
    const b = BALL_T.find(x => t >= x.T - 0.42 && t <= x.T + 0.52);
    if (!b) { if (ballsOn) { BALLS.forEach(x => x.e.setAttribute('r', 0)); ballsOn = false; } return; }
    ballsOn = true;
    if (t < b.T) ballFrame(b.o[0], b.o[1], gsap.parseEase('power1.in')((t - b.T + 0.42) / 0.42), false);
    else ballFrame(b.o[0], b.o[1], gsap.parseEase('power1.out')(Math.min(1, (t - b.T) / 0.5)), true);
  }

  tl.set({}, {}, TOTAL);

  // ---- proximity: grid cells near the cursor grow toward it (applied every frame, after the timeline)
  function proximity(t) {
    PROX.forEach(pr => {
      const active = t >= pr.from && t <= pr.sc.end + 0.3;
      const cr = active ? pr.cur.getBoundingClientRect() : null;
      pr.cells.forEach(cl => {
        if (!active) { cl.w.removeAttribute('transform'); return; }
        const br = cl.inner.getBoundingClientRect();
        const dx = cr.left - (br.left + br.width / 2), dy = cr.top - (br.top + br.height / 2), d = Math.hypot(dx, dy);
        const f = Math.max(0, 1 - d / 190), s = 1 + 0.38 * f * f;
        const m = cl.w.getScreenCTM(), k = m ? 1 / m.a : 1;
        const tx = dx * 0.08 * f * k, ty = dy * 0.08 * f * k;
        cl.w.setAttribute('transform', f > 0 ? `translate(${tx} ${ty}) translate(${cl.cx} ${cl.cy}) scale(${s}) translate(${-cl.cx} ${-cl.cy})` : '');
      });
    });
  }

  window.TOTAL = TOTAL;
  window.seek = t => { real.seek(t + PAD, false); proximity(t); ballsAt(t); };
})();
