// Flags copy that moves after it has landed, in an HTML film driven by window.seek(t) / window.TOTAL.
// node text_stability.mjs film.html [selector=.tw] [fps=30]
// Prints every element whose position changes > 2 px while fully visible (reveal 0.8 s and exit 0.7 s excluded).
let chromium; try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs')); }
import path from 'path';
const [file, sel = '.tw', fpsArg = '30'] = process.argv.slice(2); const fps = +fpsArg;
const br = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + path.resolve(file)); await p.waitForFunction(() => window.seek && (window.TOTAL || 0) > 0, null, { timeout: 60000 });
await p.waitForTimeout(1500);
const res = await p.evaluate(({ sel, fps }) => {
  const ws = [...document.querySelectorAll(sel)], n = Math.round(window.TOTAL * fps), tr = ws.map(() => []);
  for (let i = 0; i < n; i++) { window.seek(i / fps); ws.forEach((w, k) => { const r = w.getBoundingClientRect(); let o = 1, e = w;
    while (e && e !== document.body) { const cs = getComputedStyle(e); o *= +cs.opacity; if (cs.visibility === 'hidden') o = 0; e = e.parentElement; } tr[k].push([r.x, r.y, o]); }); }
  const out = [], a = Math.round(.8 * fps), b = Math.round(.7 * fps);
  ws.forEach((w, k) => { const f = tr[k]; let run = [];
    const flush = () => { const r = run.slice(a, run.length - b); if (r.length > 5) { const d = Math.max(Math.abs(f[r.at(-1)][0] - f[r[0]][0]), Math.abs(f[r.at(-1)][1] - f[r[0]][1]),
      ...r.slice(1).map((j, q) => Math.abs(f[j][1] - f[r[q]][1]) > 1.5 ? 99 : 0)); if (d > 2) out.push({ text: w.textContent.trim().slice(0, 30), from: (r[0] / fps).toFixed(2), to: (r.at(-1) / fps).toFixed(2), moved_px: +d.toFixed(1) }); } run = []; };
    f.forEach((v, i) => { if (v[2] > .95) run.push(i); else flush(); }); flush(); });
  return out; }, { sel, fps });
console.log(res.length ? res : 'OK: no copy moves after landing'); await br.close();
