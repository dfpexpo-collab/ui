#!/usr/bin/env node
/*
 * v02 film: renders ../frames_outlined/*.svg with film_runtime.js (camera, transitions, Text Studio motion) synced to the VO.
 * Timing lives in cues.json (edit it, re-run). Motion follows voom-brand + motion-prompt-playbook:
 * launch = expo.out, settle = power3.out, glide = sine.inOut; entrances move 2-3 properties,
 * exits are faster than entrances, idle elements drift, headline words land as they are spoken.
 * Every frame is a pure function of time (one paused GSAP timeline, seek(t)).
 *
 * Usage: node build_film.js <out_dir> <vo.mp3>
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
  return `<div class="scene" id="S${i}"><div class="whip"><div class="cam">${body}</div></div></div>`;
}).join('\n');

const textfx = fs.readFileSync(path.join(HERE, '..', '..', '..', 'tools', 'text-motion-studio', 'textfx.js'), 'utf8');
const runtime = fs.readFileSync(path.join(HERE, 'film_runtime.js'), 'utf8');
const SETTINGS = JSON.parse(fs.readFileSync(path.join(HERE, 'textfx_settings.json'), 'utf8'));
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#000024}
.scene{position:absolute;inset:0;visibility:hidden;overflow:hidden;perspective:1600px}
.whip,.cam{position:absolute;inset:0;transform-style:preserve-3d}
.scene svg{width:1920px;height:1080px;display:block;overflow:visible}
#bg{position:absolute;inset:0;z-index:0}
#fxtop{position:absolute;inset:0;z-index:500;pointer-events:none}
.slate{width:1920px;height:1080px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;
  color:#f1f1f1;font-family:'IBM Plex Sans Arabic'}
.slate .tag{font-family:Gabarito;font-weight:600;letter-spacing:.3em;color:#00b3ff;font-size:28px;border:2px dashed #00b3ff;padding:14px 34px;border-radius:999px}
.slate .ar{font-size:96px;font-weight:600;direction:rtl}
.slate .list{font-size:30px;opacity:.7;direction:rtl;max-width:1500px;text-align:center;line-height:1.6}
</style></head><body>${scenesHtml}<canvas id="bg" width="1920" height="1080"></canvas><svg id="fxtop" viewBox="0 0 1920 1080"></svg>
<script>${gsapSrc}</script><script>${textfx}</script>
<script>window.FILM = ${JSON.stringify({ scenes: CUES.scenes, settings: SETTINGS })};</script>
<script>${runtime}</script></body></html>`;

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
  const htmlPath = path.join(OUT, 'film.html');
  fs.writeFileSync(htmlPath, html);
  const total = CUES.scenes[CUES.scenes.length - 1].end;
  const n = Math.round(total * FPS);
  const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;   // ONLY=frame,frame for spot checks
  const all = only || Array.from({ length: n }, (_, f) => f);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const chunks = Array.from({ length: WORKERS }, (_, w) => all.filter((_, i) => i % WORKERS === w));
  await Promise.all(chunks.map(c => renderRange(browser, htmlPath, c)));
  await browser.close();
  if (only) { console.log('rendered', only.length, 'frames'); return; }

  const video = path.join(OUT, 'video_only.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(OUT, 'frames', '%05d.jpg'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', video]);
  const mp4 = path.join(OUT, 'voom_saas-promo_film_16x9_ar_v03.mp4');
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
