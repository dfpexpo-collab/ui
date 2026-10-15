#!/usr/bin/env node
/*
 * Renders the storyboard frames (../frames_outlined/*.svg) into an animatic MP4 synced to the VO.
 * Timing lives in cues.json (edit it, re-run). Motion follows voom-brand + motion-prompt-playbook:
 * launch = expo.out, settle = power3.out, glide = sine.inOut; entrances move 2-3 properties,
 * exits are faster than entrances, idle elements drift, headline words land as they are spoken.
 * Every frame is a pure function of time (one paused GSAP timeline, seek(t)).
 *
 * Usage: node build_animatic.js <out_dir> <vo.mp3>
 *        (needs playwright + gsap resolvable, ffmpeg on PATH)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const HERE = __dirname;
const FRAMES = path.join(HERE, '..', 'frames_outlined');
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'out'));
const VO = process.argv[3];
const CUES = JSON.parse(fs.readFileSync(path.join(HERE, 'cues.json'), 'utf8'));
const FPS = CUES.fps;
const WORKERS = 4;
const gsapSrc = fs.readFileSync(require.resolve('gsap/dist/gsap.min.js'), 'utf8');

const slate = `<div class="slate"><div class="tag">PROJECT FOOTAGE</div>
<div class="ar">هنا فيديوهات المشروع</div>
<div class="list">الخريطة التفاعلية · الماستر بلان 16K · Smart Filtration · Availability · Live Inventory · Exterior Tour · 3D Floor Plan · Interior Tour</div></div>`;

const scenesHtml = CUES.scenes.map((sc, i) => {
  const body = sc.id === 'SLATE' ? slate : fs.readFileSync(path.join(FRAMES, sc.id + '.svg'), 'utf8').replace(/<\?xml[^>]*>/, '');
  return `<div class="scene" id="S${i}">${body}</div>`;
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
const SCENES = ${JSON.stringify(CUES.scenes)};
const tl = gsap.timeline({ paused: true });
const LAUNCH = 'expo.out', SETTLE = 'power3.out', GLIDE = 'sine.inOut', EXIT = 'power2.in';
const q = (root, sel) => Array.from(root.querySelectorAll(sel));
const topLayers = svg => Array.from(svg.children).filter(n => n.tagName === 'g' && /^L\\d/.test(n.id));

function draw(p, at, d) {
  const len = p.getTotalLength();
  tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: d, ease: SETTLE }, at);
}

function innerMotion(layer, at, dur) {
  q(layer, '[id^="UNIT_GRID"]').forEach(grid => {
    tl.from(Array.from(grid.children), { opacity: 0, scale: 0.3, transformOrigin: '50% 50%', duration: 0.35, ease: LAUNCH,
      stagger: { amount: Math.min(0.7, dur * 0.3), from: 'start' } }, at + 0.15);
  });
  const tiles = q(layer, '[id^="TILE"]');
  if (tiles.length) tl.from(tiles, { opacity: 0, y: 30, duration: 0.5, ease: LAUNCH, stagger: { amount: 0.6, from: 'random' } }, at);
  q(layer, '#CHART_LINE').forEach(p => draw(p, at + 0.2, 0.9));
  q(layer, '#CHART_AREA').forEach(p => tl.from(p, { opacity: 0, duration: 0.8, ease: GLIDE }, at + 0.35));
  q(layer, '#CHART_DOT').forEach(p => tl.from(p, { scale: 0, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(1.6)' }, at + 1.0));
  q(layer, '#LINK_PATH').forEach(p => {
    if (p.getAttribute('stroke-dasharray')) tl.to(p, { strokeDashoffset: -160, duration: dur, ease: 'none' }, at);
    else draw(p, at + 0.3, 0.6);
  });
  q(layer, '[id^="DATA_DOT"]').forEach((p, i) => tl.fromTo(p, { x: -40 }, { x: 40, duration: 0.8, ease: GLIDE, repeat: Math.max(1, Math.floor(dur / 0.8)), yoyo: true }, at + i * 0.15));
  const pills = q(layer, ':scope > [id^="PILL_"]');
  if (pills.length > 1) tl.from(pills, { opacity: 0, scale: 0.92, transformOrigin: '50% 50%', duration: 0.3, ease: LAUNCH, stagger: 0.12 }, at + 0.35);
}

function wordTimes(sc, n) {
  if (sc.words) return sc.words.slice(0, n).concat(Array(Math.max(0, n - sc.words.length)).fill(sc.words[sc.words.length - 1]));
  const [a, b] = sc.vo || [sc.start + 0.2, sc.start + (sc.end - sc.start) * 0.6];
  const span = Math.max(0.1, (b - a) * 0.85);
  return Array.from({ length: n }, (_, i) => a + (n > 1 ? span * i / (n - 1) : 0));
}

function animateScene(el, sc) {
  const start = sc.start, dur = sc.end - sc.start, end = sc.end;
  const svg = el.querySelector('svg');
  if (!svg) {  // slate
    tl.from(el.querySelectorAll('.slate > *'), { opacity: 0, y: 30, duration: 0.6, ease: LAUNCH, stagger: 0.15 }, start + 0.1);
    return;
  }
  const layers = topLayers(svg);
  const headline = layers.filter(l => /^L1\\d/.test(l.id) && q(l, '[id*="__w"]').length);
  const words = headline.flatMap(l => q(l, '[id*="__w"]'));
  const wt = wordTimes(sc, words.length);
  let elemIdx = 0;

  layers.forEach(layer => {
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
      tl.fromTo(layer, { x: -1100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: LAUNCH }, start + 0.02);
      return;
    }
    if (/LOGO/.test(id)) {
      tl.fromTo(layer, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: Math.min(1.2, dur), ease: LAUNCH }, start + 0.15);
      tl.to(layer, { scale: 1.03, duration: Math.max(0.3, dur - 0.9), ease: GLIDE }, start + 0.9);
      return;
    }
    if (headline.includes(layer)) {
      Array.from(layer.children).filter(c => !c.id || !c.id.startsWith('TXT_')).forEach(c =>
        tl.from(c, { opacity: 0, duration: 0.4 }, Math.max(start, wt[0] - 0.2)));
      return;
    }
    if (/CURSOR|TAP/.test(id)) {
      const at = start + Math.min(0.95, dur * 0.4);
      tl.fromTo(layer, { x: 160, y: 110, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.6, ease: SETTLE }, at);
      q(layer, '[id^="TAP_PING"]').forEach(p =>
        tl.fromTo(p, { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, transformOrigin: '50% 50%', duration: 0.45, ease: LAUNCH }, at + 0.55));
      return;
    }
    if (/BIG_10X|COUNTER/.test(id)) {
      const at = sc.big != null ? sc.big : start + 0.45;
      tl.fromTo(layer, { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.8, ease: LAUNCH }, at);
      tl.to(layer, { scale: 1.04, transformOrigin: '50% 50%', duration: Math.max(0.3, end - at - 0.8), ease: GLIDE }, at + 0.8);
      return;
    }
    const at = start + 0.1 + elemIdx * 0.12;
    elemIdx++;
    if (/WALL/.test(id)) {
      tl.fromTo(layer, { x: 40, y: 20 }, { x: -40, y: -20, duration: dur + 0.5, ease: 'none' }, start);
      innerMotion(layer, at, dur);
      return;
    }
    // entrance (opacity + y + scale), then idle drift until the scene ends
    tl.fromTo(layer, { opacity: 0, y: 50, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, transformOrigin: '50% 50%', duration: 0.85, ease: LAUNCH }, at);
    if (end - at > 1.3) tl.to(layer, { y: -8, duration: end - at - 0.85, ease: GLIDE }, at + 0.85);
    innerMotion(layer, at, dur);
  });

  // headline words land as they are spoken, then leave fast before the cut
  words.forEach((w, i) => tl.fromTo(w, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.5, ease: LAUNCH }, wt[i]));
  if (words.length && sc.id !== 'F18') tl.to(words, { opacity: 0, y: -18, duration: 0.2, ease: EXIT, stagger: 0.02 }, end - 0.26);

  if (sc.id === 'F14') tl.to(svg, { scale: 2.7, transformOrigin: '50% 50%', duration: 1.0, ease: 'power2.in' }, end - 1.0);
  if (sc.id === 'F17') tl.fromTo(svg, { scale: 1 }, { scale: 1.07, transformOrigin: '50% 50%', duration: dur, ease: GLIDE }, start);
}

SCENES.forEach((sc, i) => {
  const el = document.getElementById('S' + i);
  const t = sc.start, dur = sc.end - sc.start;
  const fadeIn = sc.trans === 'fade' ? 0.28 : sc.trans === 'sweep' ? 0.05 : 0;
  const inAt = sc.trans === 'sweep' ? t - 0.05 : t;
  if (sc.trans === 'sweep') tl.fromTo('#sweep', { x: -3200 }, { x: 1920, duration: 0.8, ease: 'power2.inOut' }, t - 0.4);
  tl.set(el, { visibility: 'visible', zIndex: i + 1 }, inAt);
  tl.fromTo(el, { opacity: fadeIn ? 0 : 1 }, { opacity: 1, duration: fadeIn || 0.001 }, inAt);
  tl.set(el, { visibility: 'hidden' }, t + dur + 0.35);
  animateScene(el, sc);
});
const TOTAL = SCENES[SCENES.length - 1].end;
tl.set({}, {}, TOTAL);
window.TOTAL = TOTAL;
window.seek = s => { tl.seek(s, false); };
</script></body></html>`;

async function renderRange(browser, htmlPath, frames) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => { throw e; });
  await page.goto('file://' + htmlPath);
  await page.evaluate(() => document.fonts.ready);
  for (const f of frames) {
    await page.evaluate(s => window.seek(s), f / FPS);
    await page.screenshot({ path: path.join(OUT, 'frames', String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
  }
  await page.close();
}

(async () => {
  fs.rmSync(path.join(OUT, 'frames'), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
  const htmlPath = path.join(OUT, 'animatic.html');
  fs.writeFileSync(htmlPath, html);
  const total = CUES.scenes[CUES.scenes.length - 1].end;
  const n = Math.round(total * FPS);
  const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;   // ONLY=frame,frame for spot checks
  const all = only || Array.from({ length: n }, (_, f) => f);
  const browser = await chromium.launch();
  const chunks = Array.from({ length: WORKERS }, (_, w) => all.filter((_, i) => i % WORKERS === w));
  await Promise.all(chunks.map(c => renderRange(browser, htmlPath, c)));
  await browser.close();
  if (only) { console.log('rendered', only.length, 'frames'); return; }

  const video = path.join(OUT, 'video_only.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(OUT, 'frames', '%05d.jpg'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', video]);
  const mp4 = path.join(OUT, 'voom_saas-promo_animatic_16x9_ar_v01.mp4');
  if (VO) {
    const segs = CUES.audio.segments, fd = CUES.audio.fade;
    const parts = segs.map((s, i) => `[1:a]atrim=${s.from}:${s.to},asetpts=PTS-STARTPTS,afade=t=in:d=${fd},afade=t=out:st=${(s.to - s.from - fd).toFixed(3)}:d=${fd},adelay=${Math.round(s.at * 1000)}:all=1[a${i}]`);
    const mix = `${parts.join(';')};${segs.map((_, i) => `[a${i}]`).join('')}amix=inputs=${segs.length}:normalize=0,apad=whole_dur=${total}[aout]`;
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-i', VO, '-filter_complex', mix, '-map', '0:v', '-map', '[aout]',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(total), '-movflags', '+faststart', mp4]);
  } else {
    fs.renameSync(video, mp4);
  }
  console.log('wrote', mp4, `${total.toFixed(1)} s, ${n} frames`);
})();
