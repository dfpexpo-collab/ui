#!/usr/bin/env node
/*
 * Renders the storyboard frames (../frames_outlined/*.svg) into an animatic MP4.
 * Motion follows STORYBOARD.md and the voom-brand motion tokens:
 * launch = expo.out, settle = power3.out, glide = sine.inOut, stagger 0.08-0.12 s.
 *
 * Usage: node build_animatic.js <out_dir>   (needs playwright + gsap installed, ffmpeg on PATH)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const HERE = __dirname;
const FRAMES = path.join(HERE, '..', 'frames_outlined');
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'out'));
const FPS = 30;
const gsapSrc = fs.readFileSync(require.resolve('gsap/dist/gsap.min.js'), 'utf8');

// [frame, seconds, transition into this scene]
const SCENES = [
  ['F01', 2.2, 'none'], ['F02', 1.8, 'fade'], ['F03', 1.8, 'sweep'], ['F04', 1.9, 'fade'],
  ['F05', 1.7, 'fade'], ['F06', 1.9, 'fade'], ['F07', 2.0, 'fade'], ['F08', 1.9, 'sweep'],
  ['F09', 2.1, 'fade'], ['F10', 2.3, 'fade'], ['F11', 2.3, 'fade'], ['F12', 2.8, 'fade'],
  ['F13', 3.4, 'fade'], ['F14', 1.6, 'fade'], ['SLATE', 2.6, 'cut'], ['F15', 2.6, 'sweep'],
  ['F16', 2.5, 'fade'], ['F17', 2.4, 'fade'], ['F18', 2.4, 'fade'], ['F19', 3.4, 'sweep'],
];

const slate = `<div class="slate"><div class="tag">PROJECT FOOTAGE</div>
<div class="ar">هنا فيديوهات المشروع</div>
<div class="list">الخريطة التفاعلية · الماستر بلان 16K · Smart Filtration · Availability · Live Inventory · Exterior Tour · 3D Floor Plan · Interior Tour</div></div>`;

const scenesHtml = SCENES.map(([id], i) => {
  const body = id === 'SLATE' ? slate : fs.readFileSync(path.join(FRAMES, id + '.svg'), 'utf8').replace(/<\?xml[^>]*>/, '');
  return `<div class="scene" id="S${i}" data-frame="${id}">${body}</div>`;
}).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#000024}
.scene{position:absolute;inset:0;visibility:hidden;opacity:0}
.scene svg{width:1920px;height:1080px;display:block}
#sweep{position:absolute;top:0;left:0;width:3200px;height:1080px;z-index:99;pointer-events:none;
  background:linear-gradient(90deg,rgba(0,179,255,0) 0%,#00b3ff 30%,#0012d6 50%,#00b3ff 70%,rgba(0,179,255,0) 100%);
  transform:translateX(-3200px)}
.slate{width:1920px;height:1080px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;
  background:radial-gradient(ellipse at 50% 60%,#0012d6 0%,#000024 70%);color:#f1f1f1;font-family:'IBM Plex Sans Arabic'}
.slate .tag{font-family:Gabarito;font-weight:600;letter-spacing:.3em;color:#00b3ff;font-size:28px;border:2px dashed #00b3ff;padding:14px 34px;border-radius:999px}
.slate .ar{font-size:96px;font-weight:600;direction:rtl}
.slate .list{font-size:30px;opacity:.7;direction:rtl;max-width:1500px;text-align:center;line-height:1.6}
</style></head><body>${scenesHtml}<div id="sweep"></div>
<script>${gsapSrc}</script>
<script>
const SCENES = ${JSON.stringify(SCENES)};
const tl = gsap.timeline({ paused: true });
const LAUNCH = 'expo.out', SETTLE = 'power3.out', GLIDE = 'sine.inOut';
const q = (root, sel) => Array.from(root.querySelectorAll(sel));
const topLayers = svg => Array.from(svg.children).filter(n => n.tagName === 'g' && /^L\\d/.test(n.id));

function draw(path, at, d) {
  const len = path.getTotalLength();
  tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: SETTLE }, at);
}

function innerMotion(layer, at, dur) {
  q(layer, '[id^="UNIT_GRID"]').forEach(grid => {
    tl.from(Array.from(grid.children), { opacity: 0, scale: 0.3, transformOrigin: '50% 50%', duration: 0.35, ease: LAUNCH,
      stagger: { amount: Math.min(0.7, dur * 0.35), from: 'start' } }, at + 0.15);
  });
  const tiles = q(layer, '[id^="TILE"]');
  if (tiles.length) tl.from(tiles, { opacity: 0, y: 30, duration: 0.5, ease: LAUNCH, stagger: { amount: 0.6, from: 'random' } }, at);
  q(layer, '#CHART_LINE').forEach(p => draw(p, at + 0.2, 0.9));
  q(layer, '#CHART_AREA').forEach(p => tl.from(p, { opacity: 0, duration: 0.8, ease: GLIDE }, at + 0.35));
  q(layer, '#CHART_DOT').forEach(p => tl.from(p, { scale: 0, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(2)' }, at + 1.0));
  q(layer, '#LINK_PATH').forEach(p => {
    if (p.getAttribute('stroke-dasharray')) tl.to(p, { strokeDashoffset: -120, duration: dur, ease: 'none' }, at);
    else draw(p, at + 0.3, 0.6);
  });
  q(layer, '[id^="DATA_DOT"]').forEach((p, i) => tl.fromTo(p, { x: -40 }, { x: 40, duration: 0.8, ease: GLIDE, repeat: 3, yoyo: true }, at + i * 0.15));
  const pills = q(layer, ':scope > [id^="PILL_"]');
  if (pills.length > 1) tl.from(pills, { opacity: 0, scale: 0.92, transformOrigin: '50% 50%', duration: 0.3, ease: LAUNCH, stagger: 0.12 }, at + 0.35);
}

function animateScene(el, start, dur, frame) {
  const svg = el.querySelector('svg');
  if (!svg) {  // slate
    tl.from(el.querySelectorAll('.slate > *'), { opacity: 0, y: 30, duration: 0.6, ease: LAUNCH, stagger: 0.15 }, start + 0.1);
    return;
  }
  let elemIdx = 0, wordAt = start + 0.25;
  topLayers(svg).forEach(layer => {
    const id = layer.id;
    if (id.startsWith('L95')) { layer.style.display = 'none'; return; }
    if (id.startsWith('L90')) return;
    if (id === 'L01_BG') {
      tl.fromTo(layer, { scale: 1.06 }, { scale: 1, transformOrigin: '50% 50%', duration: dur + 0.5, ease: 'power1.out' }, start);
      q(layer, '[id^="GLOW_MAIN"]').forEach(g => tl.fromTo(g, { opacity: 0.55 }, { opacity: 1, duration: dur, ease: GLIDE }, start));
      return;
    }
    q(layer, '[id^="ORBIT_DASHED"]').forEach((o, i) =>
      tl.fromTo(o, { rotation: 0 }, { rotation: (i % 2 ? -1 : 1) * dur * 8, svgOrigin: '960 540', duration: dur + 0.5, ease: 'none' }, start));
    if (id === 'L05_STREAK') {
      tl.fromTo(layer, { x: -1100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: LAUNCH }, start + 0.05);
      return;
    }
    if (/LOGO/.test(id)) {
      tl.fromTo(layer, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: 1.3, ease: LAUNCH }, start + 0.25);
      return;
    }
    const words = q(layer, '[id*="__w"]');
    if (/^L1\\d/.test(id) && words.length) {      // headline: word by word, reading order
      words.forEach(w => {
        tl.fromTo(w, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.55, ease: LAUNCH }, wordAt);
        wordAt += 0.11;
      });
      // pill/scrim shapes in a headline layer fade with the first word
      Array.from(layer.children).filter(c => !c.id || !c.id.startsWith('TXT_')).forEach(c =>
        tl.from(c, { opacity: 0, duration: 0.4 }, start + 0.15));
      return;
    }
    if (/CURSOR|TAP/.test(id)) {
      const at = start + Math.min(0.95, dur * 0.45);
      tl.fromTo(layer, { x: 160, y: 110, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.6, ease: SETTLE }, at);
      q(layer, '[id^="TAP_PING"]').forEach(p =>
        tl.fromTo(p, { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, transformOrigin: '50% 50%', duration: 0.45, ease: LAUNCH }, at + 0.55));
      return;
    }
    // element layers: rise + settle, staggered
    const at = start + 0.12 + elemIdx * 0.12;
    elemIdx++;
    if (/WALL/.test(id)) {
      tl.fromTo(layer, { x: 40, y: 20 }, { x: -40, y: -20, duration: dur + 0.5, ease: 'none' }, start);
      innerMotion(layer, at, dur);
      return;
    }
    if (/BIG_10X|COUNTER/.test(id)) {
      tl.fromTo(layer, { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.9, ease: LAUNCH }, start + 0.45);
      return;
    }
    tl.fromTo(layer, { opacity: 0, y: 50, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, transformOrigin: '50% 50%', duration: 0.9, ease: LAUNCH }, at);
    innerMotion(layer, at, dur);
  });
  if (frame === 'F14') tl.to(svg, { scale: 2.7, transformOrigin: '50% 50%', duration: 1.0, ease: 'power2.in' }, start + dur - 1.0);
  if (frame === 'F17') tl.fromTo(svg, { scale: 1 }, { scale: 1.07, transformOrigin: '50% 50%', duration: dur, ease: GLIDE }, start);
}

let t = 0;
SCENES.forEach(([frame, dur, trans], i) => {
  const el = document.getElementById('S' + i);
  const fadeIn = trans === 'fade' ? 0.3 : trans === 'sweep' ? 0.05 : 0;
  const inAt = trans === 'sweep' ? t - 0.05 : t;
  if (trans === 'sweep') tl.fromTo('#sweep', { x: -3200 }, { x: 1920, duration: 0.8, ease: 'power2.inOut' }, t - 0.4);
  tl.set(el, { visibility: 'visible', zIndex: i + 1 }, inAt);
  tl.fromTo(el, { opacity: fadeIn ? 0 : 1 }, { opacity: 1, duration: fadeIn || 0.001 }, inAt);
  tl.set(el, { visibility: 'hidden' }, t + dur + 0.35);
  animateScene(el, t, dur, frame);
  t += dur;
});
tl.set({}, {}, t);
window.TOTAL = t;
window.seek = s => tl.seek(s, false);
</script></body></html>`;

(async () => {
  fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
  const htmlPath = path.join(OUT, 'animatic.html');
  fs.writeFileSync(htmlPath, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + htmlPath);
  await page.evaluate(() => document.fonts.ready);
  const total = await page.evaluate(() => window.TOTAL);
  const n = Math.round(total * FPS);
  for (let f = 0; f < n; f++) {
    await page.evaluate(s => window.seek(s), f / FPS);
    await page.screenshot({ path: path.join(OUT, 'frames', String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
    if (f % 150 === 0) console.log(`frame ${f}/${n}`);
  }
  await browser.close();
  const mp4 = path.join(OUT, 'voom_saas-promo_animatic_16x9_ar_v01.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(OUT, 'frames', '%05d.jpg'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', mp4]);
  console.log('wrote', mp4, `${total.toFixed(1)} s`);
})();
