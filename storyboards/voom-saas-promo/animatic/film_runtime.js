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
  // how each scene comes in (varied: pixel reveal, particle dissolve, zoom-through, push + blur, element morph)
  const TRANS = { F02: 'zoom', F03: 'push', F04: 'pixel', F05: 'morph', F06: 'dissolve', F07: 'morph', F08: 'zoom', F09: 'push',
    F10: 'pixel', F11: 'push', F12: 'zoom', F13: 'push', F14: 'morph', SLATE: 'cut', F15: 'push', F16: 'zoom', F17: 'fade', F18: 'dissolve', F19: 'zoom' };
  const PUSH_DIR = { F03: [0, 1], F09: [1, 0], F11: [-1, 0], F13: [0, 1], F15: [1, 0] };
  const MORPH = { F05: ['L05_CARD_UNITS', 'L05_DASHBOARD'], F07: ['L06_DASHBOARD', 'L05_TOGGLE'], F14: ['L05_STAT_CARDS', 'L05_DEVICE'] };
  const OUT = { push: 0.45, zoom: 0.45, pixel: 0.45, dissolve: 0.5, morph: 0.35, fade: 0.3, cut: 0 };   // when the old scene starts leaving, before the cut
  const HOLD = 0.35, TEXT_REPORT = []; window.TEXT_REPORT = TEXT_REPORT;
  const LEAD = { pixel: 0.4, dissolve: 0.45, zoom: 0.3, push: 0.3, morph: 0.12, fade: 0.2, cut: 0 };   // how early elements start entering before the cut
  const PIXEL_FROM = { F04: [960, 540], F10: [440, 660] };
  // click visual effects (from the reference): halftone ripple or glowing pixels
  const CLICK_FX = { F02: 'halftone', F05: 'halftone', F07: 'halftone', F09: 'glow', F10: 'glow', F17: 'glow' };
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
  const scEls = [], FX = [], MORPHS = [];
  let uid = 0;
  const clickPoint = svg => { const r = svg && svg.querySelector('#PING_RING_1'); if (r) return [+r.getAttribute('cx'), +r.getAttribute('cy')];
    const c = svg && svg.querySelector('#CURSOR'); const m = c && /translate\(([\d.]+)[ ,]+([\d.]+)/.exec(c.getAttribute('transform') || ''); return m ? [+m[1], +m[2]] : null; };
  SCENES.forEach((sc, i) => {
    const el = document.getElementById('S' + i), whip = el.firstElementChild, cam = whip.firstElementChild, svg = cam.querySelector('svg');
    sc.el = el; sc.whip = whip; sc.cam = cam; sc.svg = svg; scEls.push(sc);
    const bg = svg && svg.querySelector('#BG_FILL rect'); sc.light = !!bg && /^#f1f1f1$/i.test(bg.getAttribute('fill') || '');
    sc.brand = !!(svg && svg.querySelector('#BG_GRADIENT'));
    sc.clickAt = clickPoint(svg); if (sc.clickAt) sc.focus = `${sc.clickAt[0] / 19.2}% ${sc.clickAt[1] / 10.8}%`;
  });

  SCENES.forEach((sc, i) => {
    const { el, whip, cam, svg } = sc, start = sc.start, end = sc.end, dur = end - start;
    const next = SCENES[i + 1], tin = TRANS[sc.id] || 'fade';
    const prev = SCENES[i - 1], T = start;
    tl.set(el, { visibility: 'visible', zIndex: tin === 'dissolve' ? 2 * i - 1 : 2 * i + 2 }, start - 0.6);
    tl.set(el, { visibility: 'hidden' }, end + 0.6);
    tl.set(whip, { opacity: 0 }, start - 0.6);
    const pw = prev && prev.whip;
    if (!prev || tin === 'cut') { tl.set(whip, { opacity: 1 }, T); if (prev) tl.set(pw, { opacity: 0 }, T); }
    else if (tin === 'fade') { tl.fromTo(whip, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.inOut' }, T - 0.3); tl.to(pw, { opacity: 0, duration: 0.6, ease: 'power1.inOut' }, T - 0.3); }
    else if (tin === 'push') {
      const [dx, dy] = PUSH_DIR[sc.id] || [0, 1];
      tl.to(pw, { x: -dx * 180, y: -dy * 130, opacity: 0, filter: 'blur(14px)', duration: 0.6, ease: 'power2.inOut' }, T - 0.45);
      tl.fromTo(whip, { x: dx * 220, y: dy * 170, opacity: 0, filter: 'blur(14px)' }, { x: 0, y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.95, ease: 'power3.out' }, T - 0.15);
      tl.set(whip, { filter: 'none' }, T + 0.82);
    } else if (tin === 'zoom') {
      tl.to(pw, { scale: 2.2, opacity: 0, filter: 'blur(16px)', transformOrigin: prev.focus || '50% 50%', duration: 0.6, ease: 'power2.in' }, T - 0.45);
      tl.fromTo(whip, { scale: 0.82, opacity: 0, filter: 'blur(12px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.95, ease: 'power3.out' }, T - 0.1);
      tl.set(whip, { filter: 'none' }, T + 0.87);
    } else if (tin === 'morph') {
      // real morph: the old element itself flies and reshapes into the new one's box, then hands over
      const [A, B] = MORPH[sc.id], ea = prev.svg.querySelector('#' + A), eb = svg.querySelector('#' + B);
      const a = ea.getBBox(), b = eb.getBBox(), M = 0.85, t0 = T - 0.45;
      const others = Array.from(prev.wrap.children).filter(n => /^L\d/.test(n.id) && n !== ea && n.id !== 'L01_BG');
      tl.to(others, { opacity: 0, duration: 0.35, ease: 'power1.in' }, t0);
      tl.to(ea, { x: b.x - a.x, y: b.y - a.y, scaleX: b.width / a.width, scaleY: b.height / a.height, svgOrigin: `${a.x} ${a.y}`, duration: M, ease: 'power3.inOut' }, t0);
      tl.to(ea, { opacity: 0, duration: 0.3, ease: 'power1.in' }, t0 + M * 0.55);
      tl.set(pw, { opacity: 0 }, t0 + M);
      tl.set(whip, { opacity: 1 }, t0);
      tl.fromTo(eb, { x: a.x - b.x, y: a.y - b.y, scaleX: a.width / b.width, scaleY: a.height / b.height, svgOrigin: `${b.x} ${b.y}` },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: M, ease: 'power3.inOut' }, t0);
      tl.fromTo(eb, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' }, t0 + M * 0.4);
      sc.morphTarget = B;
    } else if (tin === 'pixel') {
      tl.set(whip, { opacity: 1 }, T - 0.45);
      FX.push(pixelReveal(sc, T, PIXEL_FROM[sc.id] || [960, 540]));
      tl.set(pw, { opacity: 0 }, T + 0.59);   // the mask comes off after the reveal: the old scene must not come back
    } else if (tin === 'dissolve') {
      tl.set(whip, { opacity: 1 }, T - 0.5);
      FX.push(dissolve(prev, T, prev.clickAt || [960, 540]));
      tl.set(pw, { opacity: 0 }, T + 0.64);
    }
    if (!svg) {   // slate
      tl.from(el.querySelectorAll('.slate > *'), { opacity: 0, y: 30, duration: 0.6, ease: LAUNCH, stagger: 0.15 }, start + 0.1);
      return;
    }
    // camera
    const c = CAM[sc.id];
    if (c) { gsap.set(cam, { transformOrigin: c[0] }); tl.fromTo(cam, c[1], Object.assign({ duration: dur + 0.35, ease: GLIDE }, c[2]), start - 0.05); }

    const layers = Array.from(svg.children).filter(n => n.tagName === 'g' && /^L\d/.test(n.id));
    const layerAt = {}, enter = start - (LEAD[tin] ?? 0.2);
    let ei = 0;
    const cells = wrapCells(svg);

    layers.forEach(layer => {
      const id = layer.id;
      if (/^L9/.test(id)) { layer.style.display = id.startsWith('L95') ? 'none' : ''; return; }
      if (id === 'L01_BG') {     // the live gradient canvas is the background; keep only line work
        q(layer, '[id^="BG_"], [id^="GLOW"], [id^="VIGNETTE"]').forEach(g => g.style.display = 'none');
        q(layer, '[id^="GRID_FLOOR"]').forEach(g => tl.fromTo(g, { y: 0 }, { y: 18, duration: dur, ease: 'none' }, start));
        return;
      }
      if (/FLOAT/.test(id)) {    // F01: feature words glitch in, then float
        Array.from(layer.children).forEach((w, k) => {
          const op = Math.min(1, 1.8 * +(w.getAttribute('opacity') || 1)), at = enter + 0.15 + k * 0.08;
          tl.set(w, { opacity: 0 }, start - 0.3);
          tl.to(w, { keyframes: [{ opacity: op, x: -14, duration: 0.04 }, { opacity: op * 0.15, x: 10, duration: 0.04 }, { opacity: op, x: -5, duration: 0.05 }, { opacity: op * 0.4, x: 4, duration: 0.04 }, { opacity: op, x: 0, duration: 0.05 }] }, at);
          tl.fromTo(w, { y: 0 }, { y: (k % 2 ? -1 : 1) * (14 + k * 3), duration: dur, ease: GLIDE }, at + 0.22);
        });
        return;
      }
      if (/ORBIT/.test(id)) {
        tl.from(layer, { opacity: 0, duration: 0.6 }, enter);
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
        if (CLICK_FX[sc.id] && sc.clickAt) FX.push((CLICK_FX[sc.id] === 'glow' ? clickGlow : halftone)(sc, click, sc.clickAt));
        return;
      }
      if (/BIG_10X|COUNTER/.test(id)) { layerAt[id] = start; return; }   // counted by TextFX
      if (id === 'L05_STREAK') { tl.fromTo(layer, { x: -1100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: LAUNCH }, start + 0.05); return; }
      if (/LOGO/.test(id)) {     // mask reveal left → right
        const img = layer.querySelector('image'), b = img.getBBox();
        const cp = document.createElementNS(NS, 'clipPath'); cp.id = 'logoclip' + i;
        const r = document.createElementNS(NS, 'rect'); r.setAttribute('x', b.x - 10); r.setAttribute('y', b.y - 20); r.setAttribute('height', b.height + 40);
        cp.appendChild(r); svg.appendChild(cp); img.setAttribute('clip-path', `url(#${cp.id})`);
        tl.fromTo(r, { attr: { width: 0 } }, { attr: { width: b.width + 20 }, duration: 0.85, ease: LAUNCH }, enter + 0.12);
        tl.fromTo(layer, { scale: 0.97, transformOrigin: '50% 50%' }, { scale: 1.02, duration: dur, ease: GLIDE }, start);
        return;
      }
      if (/WALL/.test(id)) {     // F16/F17 project wall: tiles fly in with depth
        if (sc.id === 'F16') tl.from(cells.map(c => c.inner), { opacity: 0, scale: 0.55, y: 90, transformOrigin: '50% 50%', duration: 0.7, ease: LAUNCH, stagger: { amount: 0.9, from: 'center' } }, enter);
        tl.fromTo(layer, { x: 50, y: 20 }, { x: -50, y: -20, duration: dur + 0.4, ease: 'none' }, start);
        layerAt[id] = start;
        return;
      }
      if (id === 'L05_TOGGLE' && sc.id === 'F07') {
        if (sc.morphTarget !== id) { tl.from(layer, { opacity: 0, y: 50, filter: 'blur(10px)', duration: 0.8, ease: LAUNCH }, enter + 0.05); tl.set(layer, { filter: 'none' }, enter + 0.85); }
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
      if (sc.morphTarget === id) { layerAt[id] = start - 0.1; return; }
      const at = enter + 0.06 + ei * 0.1; ei++;
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
      if (from.filter) tl.set(layer, { filter: 'none' }, at + (from.duration || 0.85) + 0.02);
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
      q(layer, '[id^="UNIT_GRID"]').forEach(grid => {     // squares build in a wave from the corner, each with a glow flash
        const cl = cells.filter(c => grid.contains(c.w)); if (!cl.length) return;
        const x0 = Math.min(...cl.map(c => c.cx)), y0 = Math.min(...cl.map(c => c.cy));
        const span = Math.max(...cl.map(c => c.cx - x0 + c.cy - y0)) || 1;
        cl.forEach(c => tl.fromTo(c.inner, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%', filter: 'brightness(2.6) drop-shadow(0 0 8px #00b3ff)' },
          { opacity: 1, scale: 1, filter: 'brightness(1) drop-shadow(0 0 0px #00b3ff)', duration: 0.5, ease: 'back.out(2.2)' }, at + 0.2 + 0.75 * (c.cx - x0 + c.cy - y0) / span));
        tl.set(cl.map(c => c.inner), { filter: 'none' }, at + 1.5);
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
    // wrap the scene so transitions can mask it; fx layer sits on top, unmasked
    sc.wrap = document.createElementNS(NS, 'g');
    Array.from(svg.childNodes).filter(n => !(n.tagName === 'defs' || n.tagName === 'clipPath')).forEach(n => sc.wrap.appendChild(n));
    svg.appendChild(sc.wrap); sc.fx = document.createElementNS(NS, 'g'); svg.appendChild(sc.fx);
    // the scene may only start leaving once all its text is on screen and has been read for HOLD seconds
    const deadline = (next ? next.start - (OUT[TRANS[next.id]] ?? 0.3) : end) - HOLD;
    let done = 0;
    items.forEach(it => {
      const s = Object.assign({}, eff(it.key, it.kind)), la = (layerAt[it.layer] ?? start) + 0.3;
      if (it.kind === 'count') {
        const at = it.inHead ? (sc.big != null ? sc.big : vt[0]) : Math.max(la, start + 0.25 + it.idx * SET.fields.stagger);
        let t0 = Math.max(start, at + s.delay);
        if (t0 + s.duration > deadline) t0 = Math.max(start - 0.1, deadline - s.duration);
        if (t0 + s.duration > deadline) s.duration = Math.max(0.35, deadline - t0);   // short shot: count faster
        TextFX.countUp(tl, it.g, t0, s); done = Math.max(done, t0 + s.duration);
      } else if (it.kind === 'field') {
        let t0 = Math.max(la, start + 0.25 + it.idx * s.stagger) + s.delay;
        const n = Math.max(1, it.g.id.replace(/^TXT_/, '').replace(/_\d+$/, '').replace(/_/g, '').length);
        if (t0 > deadline - 0.35) t0 = Math.max(start - 0.2, deadline - 0.35);
        if (t0 + n / s.typeSpeed > deadline) s.typeSpeed = n / Math.max(0.3, deadline - t0);   // type faster rather than leave early
        TextFX.typewrite(tl, it.g, t0, s, sc.light); done = Math.max(done, t0 + n / s.typeSpeed);
      } else {
        let times = it.words.map(w => Math.max(start, vt[headWords.indexOf(w)] + s.delay));
        const last = Math.max(...times), lim = deadline - s.duration;
        if (last > lim) { const a = Math.min(times[0], lim), k = last > a ? (lim - a) / (last - times[0] || 1) : 0; times = times.map(x => a + (x - times[0]) * Math.max(0, k)); }
        TextFX.apply(tl, it.words, times, s, sc.light); done = Math.max(done, Math.max(...times) + s.duration);
      }
    });
    TEXT_REPORT.push({ id: sc.id, done: +done.toFixed(2), leaves: +(deadline + HOLD).toFixed(2), ok: done <= deadline + 0.01 });
  });

  // ---- per-frame effects (transitions + click FX): each is { a, b, init, render(t), reset }, built lazily, driven by runFx(t)
  function rng(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const c01 = v => Math.max(0, Math.min(1, v));


  // new scene grows out of a pixelated disc of glass squares (reference 0:15)
  function pixelReveal(sc, T, [ox, oy]) {
    const CELL = 64, cells = [], id = 'pxm' + (uid++);
    return { a: T - 0.45, b: T + 0.6,
      init() {
        const r = rng(7), m = mk('mask', { id, maskUnits: 'userSpaceOnUse', x: -400, y: -300, width: 2720, height: 1680 }, sc.svg);
        mk('rect', { x: -400, y: -300, width: 2720, height: 1680, fill: '#000' }, m);
        this.prev = SCENES[SCENES.indexOf(sc) - 1];
        const m2 = mk('mask', { id: id + 'o', maskUnits: 'userSpaceOnUse', x: -400, y: -300, width: 2720, height: 1680 }, this.prev.svg);
        mk('rect', { x: -400, y: -300, width: 2720, height: 1680, fill: '#fff' }, m2);
        this.ring = mk('g', {}, sc.fx);
        for (let x = -384; x < 2304; x += CELL) for (let y = -320; y < 1400; y += CELL) {
          const cx = x + CELL / 2, cy = y + CELL / 2, n = r();
          cells.push({ d: Math.hypot(cx - ox, cy - oy), n, lit: r() > 0.72,
            m: mk('rect', { x, y, width: CELL + 0.5, height: CELL + 0.5, fill: '#fff', visibility: 'hidden' }, m),
            o: mk('rect', { x, y, width: CELL + 0.5, height: CELL + 0.5, fill: '#000', visibility: 'hidden' }, m2),
            g: mk('rect', { x: x + 2, y: y + 2, width: CELL - 4, height: CELL - 4, rx: 6, fill: LBLUE, stroke: '#fff', 'stroke-width': 1.2, opacity: 0 }, this.ring) });
        }
      },
      render(t) {
        const p = c01((t - this.a) / 1.05), R = Math.pow(p, 1.6) * 2700;
        sc.wrap.setAttribute('mask', `url(#${id})`); this.prev.wrap.setAttribute('mask', `url(#${id}o)`); this.ring.style.display = '';
        cells.forEach(c => {
          const e = R - c.d - c.n * 150;
          c.m.setAttribute('visibility', e > 0 ? 'visible' : 'hidden'); c.o.setAttribute('visibility', e > 0 ? 'visible' : 'hidden');
          const a = c01(1 - Math.abs(e - 40) / 120);
          c.g.setAttribute('opacity', (a * (c.lit ? 0.85 : 0.45)).toFixed(3));
          c.g.setAttribute('fill', c.lit ? '#cfeeff' : LBLUE);
        });
      },
      reset() { sc.wrap.removeAttribute('mask'); this.prev.wrap.removeAttribute('mask'); this.ring.style.display = 'none'; } };
  }

  // old scene breaks into particles that blow away from the click (reference 0:12.5)
  function dissolve(sc, T, [ox, oy]) {
    const CELL = 20, holes = [], parts = [], id = 'dsm' + (uid++), t0 = T - 0.5, LEN = 1.1, SPAN = 2600, JIT = 220;
    const frontAt = d => t0 + LEN * Math.pow(Math.max(0, d) / SPAN, 1 / 1.3);
    return { a: t0, b: T + 0.65,
      init() {
        const r = rng(11), m = mk('mask', { id, maskUnits: 'userSpaceOnUse', x: -400, y: -300, width: 2720, height: 1680 }, sc.svg);
        mk('rect', { x: -400, y: -300, width: 2720, height: 1680, fill: '#fff' }, m);
        for (let x = -100; x < 2020; x += CELL) for (let y = -60; y < 1140; y += CELL) {
          const n = r(); holes.push({ d: Math.hypot(x - ox, y - oy) + n * JIT, c: mk('circle', { cx: x, cy: y, r: 0, fill: '#000' }, m) });
        }
        const pal = sc.light ? [BLUE, LBLUE, '#6f8dff', DEEP, '#b9d9ff'] : [LBLUE, '#4d7cff', OFF, BLUE, '#9fe1ff'];
        this.g = mk('g', {}, sc.fx);
        for (let k = 0; k < 900; k++) {
          const hx = r() * 1920, hy = r() * 1080, dx = hx - ox, dy = hy - oy, dl = Math.hypot(dx, dy) || 1, sp = 220 + r() * 520;
          parts.push({ hx, hy, tb: frontAt(dl + r() * JIT), vx: dx / dl * sp + (r() - 0.5) * 160, vy: dy / dl * sp * 0.6 - 120 - r() * 260,
            life: 0.35 + r() * 0.45, s: 2 + r() * 5.5, c: mk('circle', { r: 0, fill: pal[k % pal.length] }, this.g) });
        }
      },
      render(t) {
        const front = Math.pow(c01((t - t0) / LEN), 1.3) * SPAN;
        sc.wrap.setAttribute('mask', `url(#${id})`); this.g.style.display = '';
        holes.forEach(h => h.c.setAttribute('r', (c01((front - h.d) / 140) * CELL * 0.8).toFixed(2)));
        parts.forEach(p => {
          const a = t - p.tb, k = a / p.life;
          if (a < 0 || k >= 1) { p.c.setAttribute('r', 0); return; }
          p.c.setAttribute('cx', (p.hx + p.vx * a).toFixed(1)); p.c.setAttribute('cy', (p.hy + p.vy * a + 260 * a * a).toFixed(1));
          p.c.setAttribute('r', (p.s * (1 - k * k)).toFixed(2)); p.c.setAttribute('opacity', (1 - k).toFixed(3));
        });
      },
      reset() { sc.wrap.removeAttribute('mask'); this.g.style.display = 'none'; } };
  }

  // click: halftone dots ripple out from the cursor (reference 0:08)
  function halftone(sc, tc, [ox, oy]) {
    const dots = [], RAD = 560, STEP = 24;
    return { a: tc, b: tc + 1.0,
      init() {
        this.g = mk('g', { fill: sc.light ? BLUE : LBLUE }, sc.fx);
        for (let x = -RAD; x <= RAD; x += STEP) for (let y = -RAD; y <= RAD; y += STEP) {
          const d = Math.hypot(x, y); if (d > RAD) continue;
          dots.push({ d, c: mk('circle', { cx: ox + x, cy: oy + y, r: 0 }, this.g) });
        }
      },
      render(t) {
        const w = c01((t - tc) / 1.0), W = Math.pow(w, 0.7) * (RAD + 80);
        this.g.style.display = '';
        dots.forEach(o => o.c.setAttribute('r', (6.5 * c01(1 - Math.abs(o.d - W) / 120) * (1 - w) * (1 - 0.5 * o.d / RAD)).toFixed(2)));
      },
      reset() { this.g.style.display = 'none'; } };
  }

  // click: a cluster of glowing pixels flickers next to the cursor (reference 0:10.5)
  function clickGlow(sc, tc, [ox, oy]) {
    const px = [];
    return { a: tc - 0.02, b: tc + 0.85,
      init() {
        if (!sc.svg.querySelector('#pxglow')) {
          const f = mk('filter', { id: 'pxglow', x: '-100%', y: '-100%', width: '300%', height: '300%' }, sc.svg);
          mk('feGaussianBlur', { stdDeviation: 7, result: 'b' }, f);
          const mg = mk('feMerge', {}, f); mk('feMergeNode', { in: 'b' }, mg); mk('feMergeNode', { in: 'SourceGraphic' }, mg);
        }
        const r = rng(5); this.g = mk('g', { filter: 'url(#pxglow)' }, sc.fx);
        const S = 24, used = new Set();
        while (px.length < 18) {
          const gx = Math.floor(r() * 7) - 6, gy = Math.floor(r() * 5) - 3, key = gx + ',' + gy;
          if (used.has(key)) continue; used.add(key);
          px.push({ dl: r() * 0.4, life: 0.22 + r() * 0.2, c: mk('rect', { x: ox + gx * (S + 3) - 10, y: oy + gy * (S + 3), width: S, height: S, rx: 3, fill: r() > 0.6 ? '#dff4ff' : LBLUE, opacity: 0 }, this.g) });
        }
      },
      render(t) {
        this.g.style.display = '';
        px.forEach(p => { const k = (t - this.a - p.dl) / p.life; p.c.setAttribute('opacity', k < 0 || k > 1 ? 0 : Math.sin(k * Math.PI).toFixed(3)); });
      },
      reset() { this.g.style.display = 'none'; } };
  }

  function runFx(t) {
    FX.forEach(f => {
      if (t >= f.a && t <= f.b) { if (!f.ready) { f.init(); f.ready = true; } f.render(t); f.on = true; }
      else if (f.on) { f.reset(); f.on = false; }
    });
  }

  // ---- background: blurred brand gradient with an evolving turbulent displacement (AE: Gaussian Blur + Turbulent Displace, evolution keyed)
  const BG = (() => {
    const cv = document.getElementById('bg'), gl = cv.getContext('webgl', { preserveDrawingBuffer: true });
    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    const PAL = { dark: ['#000024', '#000a6b', '#0012d6', '#0a8fff'], light: ['#f1f1f1', '#e4ecff', '#c2dbff', '#8fd6ff'], brand: ['#0012d6', '#0a28f5', '#000a8f', '#00b3ff'] };
    Object.keys(PAL).forEach(k => PAL[k] = PAL[k].map(hex));
    const kind = sc => sc.light ? 'light' : sc.brand ? 'brand' : 'dark';
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision highp float;uniform vec2 R;uniform float T;uniform vec3 c0,c1,c2,c3;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return mod289(((x*34.)+1.)*x);}vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
float sn(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
i=mod289(i);vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 nm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=nm.x;p1*=nm.y;p2*=nm.z;p3*=nm.w;
vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
float fbm(vec3 p){float a=.55,s=0.;for(int i=0;i<3;i++){s+=a*sn(p);p*=1.9;a*=.42;}return s;}
void main(){vec2 uv=gl_FragCoord.xy/R;vec2 p=(uv-.5)*vec2(R.x/R.y,1.);float t=T*.11;
vec2 q=vec2(fbm(vec3(p*.55,t)),fbm(vec3(p*.55+vec2(5.2,1.3),t+3.1)));
vec2 w=vec2(fbm(vec3(p*.5+1.3*q+vec2(1.7,9.2),t*1.3)),fbm(vec3(p*.5+1.3*q+vec2(8.3,2.8),t*1.3)));
float f=fbm(vec3(p*.45+1.1*w,t*.7));
vec3 col=mix(c0,c1,smoothstep(-.4,.5,f));
col=mix(col,c2,smoothstep(.1,.85,length(q)*1.15)*.8);
col=mix(col,c3,smoothstep(.35,.95,w.x*.8+f*.7)*.55);
col*=1.-.22*dot(uv-.5,uv-.5);
col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.;
gl_FragColor=vec4(col,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pr, n), uc = ['c0', 'c1', 'c2', 'c3'].map(U);
    gl.uniform2f(U('R'), cv.width, cv.height);
    return { draw(t) {
      let i = SCENES.findIndex(s => t < s.end); if (i < 0) i = SCENES.length - 1;
      let pal = PAL[kind(SCENES[i])];
      const nx = SCENES[i + 1], BL = 0.4;    // blend toward the next scene's palette across the cut
      if (nx && t > SCENES[i].end - BL) {
        const k = gsap.parseEase('sine.inOut')((t - SCENES[i].end + BL) / (2 * BL)), b = PAL[kind(nx)];
        pal = pal.map((c, j) => c.map((v, m) => v + (b[j][m] - v) * k));
      } else if (i > 0 && t < SCENES[i].start + BL) {
        const k = gsap.parseEase('sine.inOut')(0.5 + (t - SCENES[i].start) / (2 * BL)), a = PAL[kind(SCENES[i - 1])];
        pal = a.map((c, j) => c.map((v, m) => v + (pal[j][m] - v) * k));
      }
      uc.forEach((u, j) => gl.uniform3fv(u, pal[j]));
      gl.uniform1f(U('T'), t); gl.drawArrays(gl.TRIANGLES, 0, 3);
    } };
  })();

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
  window.seek = t => { real.seek(t + PAD, false); proximity(t); runFx(t); BG.draw(t); };
})();
