import {chromium} from 'playwright';  // run from storyboard/reel: node render.mjs
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1080,height:1920}});
const extra=process.argv[2]||'';
for(let f=1;f<=9;f++){ await p.goto(`file://${process.cwd()}/frames.html?f=${f}${extra}`); await p.waitForFunction(()=>document.body.dataset.ready==='1'); await p.waitForTimeout(300);
 await p.locator('#f'+f).screenshot({path:`frames/f${f}.png`}); }
await b.close();
