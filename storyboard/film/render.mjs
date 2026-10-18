// node render.mjs stills t1,t2,...   |   node render.mjs frames <fps> <outdir>
import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const [mode, a, b, c0, c1] = process.argv.slice(2);
const br = await chromium.launch({args:['--disable-web-security','--allow-file-access-from-files']});
const p = await br.newPage({viewport:{width:1080,height:1920}});
p.on('console', m => { if (m.type()==='error') console.log('console:', m.text()); });
p.on('pageerror', e => console.log('pageerror:', e.message));
await p.goto('file://'+process.cwd()+'/film_built.html'); await p.waitForFunction(()=>document.body.dataset.ready==='1', null, {timeout:60000});
const total = await p.evaluate(()=>window.TOTAL);
if (mode==='stills') {
  fs.mkdirSync('stills',{recursive:true});
  for (const t of a.split(',').map(Number)) { await p.evaluate(t=>window.seek(t), t); await p.waitForTimeout(30); await p.screenshot({path:`stills/t${t.toFixed(2)}.jpg`, type:'jpeg', quality:85}); }
} else {
  const fps = +a, out = b; fs.mkdirSync(out,{recursive:true});
  const n = Math.round(total*fps);
  for (let i=(+c0||0);i<(+c1||n);i++){ await p.evaluate(t=>window.seek(t), i/fps); await p.screenshot({path:`${out}/f${String(i).padStart(5,'0')}.jpg`, type:'jpeg', quality:93}); if(i%60===0) console.log('frame',i,'/',n); }
  fs.writeFileSync('sfx.json', JSON.stringify(await p.evaluate(()=>({sfx:window.SFX,total:window.TOTAL,scenes:window.SCENES}))));
}
console.log('total', total);
await br.close();
