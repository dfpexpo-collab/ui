#!/usr/bin/env node
/*
 * Build a Text Motion Studio page for any project.
 *
 *   node build_studio.js --frames <dir of outlined SVGs> --cues <cues.json> --audio <vo.mp3> --out <studio.html> [--title "Name"]
 *
 * frames: SVGs with one <g id="TXT_…__wNN_…"> per word (see storyboards/<project>/outline_text.py).
 * cues:   { scenes: [{ id, start, end, vo?, words? }], audio: { segments: [{from,to,at}] } }  (id "SLATE" = placeholder card)
 * audio:  source VO; the cues' segments are cut and joined so it lines up with the scene timeline.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? a.concat([[v.slice(2), arr[i + 1]]]) : a), []));
const HERE = __dirname;
const cues = JSON.parse(fs.readFileSync(args.cues, 'utf8'));
const total = cues.scenes[cues.scenes.length - 1].end;

// scenes markup
const scenes = cues.scenes.map((sc, i) => {
  const body = sc.id === 'SLATE'
    ? '<div class="slate"><span>PROJECT FOOTAGE</span><b>هنا فيديوهات المشروع</b></div>'
    : fs.readFileSync(path.join(args.frames, sc.id + '.svg'), 'utf8').replace(/<\?xml[^>]*>/, '').replace(/<title>[^<]*<\/title>/, '');
  return `<div class="scene" id="S${i}">${body}</div>`;
}).join('\n');

// VO cut to the timeline, as a data URI
let audio = '';
if (args.audio && cues.audio) {
  const tmp = path.join(require('os').tmpdir(), 'tms_vo_' + process.pid + '.mp3');
  const segs = cues.audio.segments;
  const parts = segs.map((s, i) => `[0:a]atrim=${s.from}:${s.to},asetpts=PTS-STARTPTS,adelay=${Math.round(s.at * 1000)}:all=1[a${i}]`);
  const mix = `${parts.join(';')};${segs.map((_, i) => `[a${i}]`).join('')}amix=inputs=${segs.length}:normalize=0,apad=whole_dur=${total}[o]`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', args.audio, '-filter_complex', mix, '-map', '[o]', '-t', String(total), '-ac', '1', '-b:a', '64k', tmp]);
  audio = 'data:audio/mpeg;base64,' + fs.readFileSync(tmp).toString('base64');
  fs.unlinkSync(tmp);
}

const tpl = fs.readFileSync(path.join(HERE, 'studio.template.html'), 'utf8');
const html = tpl
  .split('__TITLE__').join(args.title || 'Text Motion Studio')
  .replace('__SCENES__', () => scenes)
  .replace('__AUDIO__', () => audio)
  .replace('__TEXTFX__', () => fs.readFileSync(path.join(HERE, 'textfx.js'), 'utf8'))
  .replace('__SCENES_JSON__', () => JSON.stringify(cues.scenes.map(({ id, start, end, vo, words }) => ({ id, start, end, vo, words }))));
fs.writeFileSync(args.out, html);
console.log('wrote', args.out, (html.length / 1048576).toFixed(2) + ' MB');
