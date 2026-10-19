import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const br = await chromium.launch(); const p = await br.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+process.cwd()+'/film_built.html'); await p.waitForFunction(()=>document.body.dataset.ready==='1',null,{timeout:60000});
fs.writeFileSync('sfx.json', JSON.stringify(await p.evaluate(()=>({sfx:window.SFX,total:window.TOTAL,scenes:window.SCENES}))));
await br.close(); console.log('ok');
