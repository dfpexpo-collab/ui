#!/usr/bin/env node
/*
 * Live preview of the film, before any render: wraps film.html (from `HTML_ONLY=1 node build_film.js <dir>`)
 * in a player with play/pause, VO, a scrubber with scene markers, frame steps and scene loop.
 * Plays in real time in the browser, so the user reviews motion and timing without a render.
 *
 * Usage: node build_preview.js <film.html> <vo.mp3> <out.html>
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const [filmPath, voPath, outPath] = process.argv.slice(2);
const CUES = JSON.parse(fs.readFileSync(path.join(__dirname, 'cues.json'), 'utf8'));
const film = fs.readFileSync(filmPath, 'utf8');
const style = film.match(/<style>([\s\S]*?)<\/style>/)[1].replace(/html,body\{[^}]*\}/, '');
const body = film.slice(film.indexOf('<body>') + 6, film.lastIndexOf('</body>'));
const total = CUES.scenes[CUES.scenes.length - 1].end;

// VO mixed exactly like the render (segments placed on the film timeline)
const tmp = path.join(path.dirname(outPath), '_vo_preview.mp3');
const segs = CUES.audio.segments, fd = CUES.audio.fade;
const parts = segs.map((s, i) => `[0:a]atrim=${s.from}:${s.to},asetpts=PTS-STARTPTS,afade=t=in:d=${fd},afade=t=out:st=${(s.to - s.from - fd).toFixed(3)}:d=${fd},adelay=${Math.round(s.at * 1000)}:all=1[a${i}]`);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', voPath, '-filter_complex', `${parts.join(';')};${segs.map((_, i) => `[a${i}]`).join('')}amix=inputs=${segs.length}:normalize=0,apad=whole_dur=${total}[aout]`,
  '-map', '[aout]', '-t', String(total), '-ac', '1', '-b:a', '64k', tmp]);
const audio = 'data:audio/mpeg;base64,' + fs.readFileSync(tmp).toString('base64');
fs.rmSync(tmp);

const marks = CUES.scenes.map(s => ({ id: s.id, start: s.start, end: s.end }));
const page = `<title>VOOM Promo Preview</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gabarito:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Poppins:wght@500;600&display=swap">
<style>
/* layout: the film fills the width, transport bar and scene strip sit under it */
:root { --ink: #000024; --panel: #0a0d3a; --line: #1d2466; --text: #eef0ff; --muted: #9aa3d9; --accent: #00b3ff; --brand: #0012d6;
  --ui: 'Gabarito', 'Poppins', system-ui, sans-serif; color-scheme: dark; }
body { background: var(--ink); color: var(--text); font-family: var(--ui); }
.wrap { max-width: 1280px; margin: 0 auto; padding-block: 20px 32px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 14px; }
header { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; }
h1 { font-size: 20px; font-weight: 600; margin: 0; letter-spacing: .01em; }
.hint { color: var(--muted); font-size: 13px; }
.viewport { position: relative; width: 100%; max-width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 10px; background: #000; }
#stage { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; overflow: hidden; }
${style}
.bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
button { font: 600 14px var(--ui); color: var(--text); background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 8px 12px; cursor: pointer; }
button:hover { border-color: var(--accent); }
button:focus-visible, input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
#play { background: var(--brand); border-color: var(--brand); min-width: 84px; }
.time { font-variant-numeric: tabular-nums; font-size: 14px; color: var(--muted); }
.time b { color: var(--text); font-weight: 600; }
.loop { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--muted); }
.track { position: relative; height: 44px; cursor: pointer; touch-action: none; }
.rail { position: absolute; left: 0; right: 0; top: 18px; height: 8px; border-radius: 4px; background: var(--line); }
.fill { position: absolute; left: 0; top: 18px; height: 8px; border-radius: 4px; background: var(--accent); }
.tick { position: absolute; top: 12px; width: 1px; height: 20px; background: var(--muted); opacity: .5; }
.tick span { position: absolute; top: 22px; left: 3px; font-size: 10px; color: var(--muted); white-space: nowrap; }
.head { position: absolute; top: 12px; width: 4px; height: 20px; margin-left: -2px; border-radius: 2px; background: #fff; }
.scenes { display: flex; flex-wrap: wrap; gap: 6px; }
.scenes button { padding: 5px 9px; font-size: 12px; font-weight: 500; }
.scenes button.on { border-color: var(--accent); color: var(--accent); }
@media (prefers-reduced-motion: reduce) { #play { transition: none; } }
</style>
<div class="wrap">
  <header><h1>VOOM promo · live preview</h1><span class="hint">Space play/pause · ← → one frame · Shift+← → one second</span></header>
  <div class="viewport" id="vp"><div id="stage">${body}</div></div>
  <div class="track" id="track"><div class="rail"></div><div class="fill" id="fill"></div><div class="head" id="head"></div></div>
  <div class="bar">
    <button id="play" type="button">Play</button>
    <button id="back" type="button" aria-label="Back one frame">−1f</button>
    <button id="fwd" type="button" aria-label="Forward one frame">+1f</button>
    <span class="time"><b id="now">0.00</b> / ${total.toFixed(2)} s · <b id="scene">F01</b> · frame <b id="frame">0</b></span>
    <label class="loop"><input type="checkbox" id="loop"> Loop this scene</label>
    <button id="copy" type="button">Copy timecode</button>
  </div>
  <div class="scenes" id="scenes"></div>
</div>
<audio id="vo" src="${audio}" preload="auto"></audio>
<script>
(() => {
  const MARKS = ${JSON.stringify(marks)}, TOTAL = ${total}, FPS = ${CUES.fps};
  const vp = document.getElementById('vp'), stage = document.getElementById('stage'), vo = document.getElementById('vo');
  const fit = () => { stage.style.transform = 'scale(' + vp.clientWidth / 1920 + ')'; };
  new ResizeObserver(fit).observe(vp); fit();
  const track = document.getElementById('track'), fill = document.getElementById('fill'), head = document.getElementById('head');
  MARKS.forEach(m => { const d = document.createElement('div'); d.className = 'tick'; d.style.left = (m.start / TOTAL * 100) + '%';
    d.innerHTML = '<span>' + m.id.replace('SLATE', '▢') + '</span>'; track.appendChild(d); });
  const strip = document.getElementById('scenes');
  MARKS.forEach(m => { const b = document.createElement('button'); b.type = 'button'; b.textContent = m.id + ' · ' + m.start.toFixed(1) + 's';
    b.onclick = () => { go(m.start); }; strip.appendChild(b); });
  let t = 0, playing = false, last = 0;
  const sceneAt = x => MARKS.find(m => x < m.end) || MARKS[MARKS.length - 1];
  function show(x) {
    t = Math.max(0, Math.min(TOTAL - 0.001, x)); window.seek(t);
    const p = t / TOTAL * 100; fill.style.width = p + '%'; head.style.left = p + '%';
    const sc = sceneAt(t);
    document.getElementById('now').textContent = t.toFixed(2);
    document.getElementById('scene').textContent = sc.id;
    document.getElementById('frame').textContent = Math.round(t * FPS);
    Array.from(strip.children).forEach((b, i) => b.classList.toggle('on', MARKS[i] === sc));
  }
  function go(x) { show(x); try { vo.currentTime = t; } catch (e) {} }
  function tick(now) {
    if (!playing) return;
    let x = vo.paused ? t + (now - last) / 1000 : vo.currentTime; last = now;
    const sc = sceneAt(t);
    if (document.getElementById('loop').checked && x >= sc.end) { x = sc.start; try { vo.currentTime = x; } catch (e) {} }
    if (x >= TOTAL) { pause(); show(TOTAL - 0.001); return; }
    show(x); requestAnimationFrame(tick);
  }
  function play() { playing = true; last = performance.now(); document.getElementById('play').textContent = 'Pause';
    try { vo.currentTime = t; } catch (e) {} vo.play().catch(() => {}); requestAnimationFrame(tick); }
  function pause() { playing = false; vo.pause(); document.getElementById('play').textContent = 'Play'; }
  document.getElementById('play').onclick = () => playing ? pause() : play();
  document.getElementById('back').onclick = () => { pause(); go(t - 1 / FPS); };
  document.getElementById('fwd').onclick = () => { pause(); go(t + 1 / FPS); };
  const scrub = e => { const r = track.getBoundingClientRect(); go((e.clientX - r.left) / r.width * TOTAL); };
  track.addEventListener('pointerdown', e => { pause(); track.setPointerCapture(e.pointerId); scrub(e);
    const mv = ev => scrub(ev), up = () => { track.removeEventListener('pointermove', mv); track.removeEventListener('pointerup', up); };
    track.addEventListener('pointermove', mv); track.addEventListener('pointerup', up); });
  document.getElementById('copy').onclick = () => { const s = sceneAt(t).id + ' @ ' + t.toFixed(2) + 's (frame ' + Math.round(t * FPS) + ')';
    navigator.clipboard.writeText(s).catch(() => {}); document.getElementById('copy').textContent = 'Copied ' + s; setTimeout(() => document.getElementById('copy').textContent = 'Copy timecode', 1600); };
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') { e.preventDefault(); pause(); go(t + (e.code === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 1 : 1 / FPS)); }
  });
  show(0);
})();
</script>`;
fs.writeFileSync(outPath, page);
console.log('wrote', outPath, (page.length / 1e6).toFixed(2), 'MB');
