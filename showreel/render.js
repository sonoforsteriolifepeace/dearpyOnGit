// Frame-by-frame renderer: drives render(T) in headless Chromium and pipes JPEG frames to ffmpeg.
//   node render.js stills 1.5 3 4.2        → stills/tX.XX.jpg (STILLS=dir to change the folder)
//   node render.js timeline timeline.json  → dump the cut's timeline + audio cues (long cuts)
//   node render.js video                   → OUT (default showreel.mp4), muxed with AUDIO
// Env: PAGE (index.html | long.html), QUERY (e.g. cut=60), AUDIO, OUT, CRF, FFMPEG.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const env = process.env;
const FFMPEG = env.FFMPEG || 'ffmpeg';
const PAGE = env.PAGE || 'index.html', QUERY = env.QUERY ? '&' + env.QUERY : '';
const mode = process.argv[2] || 'stills';
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[err]', e.message));
  await page.goto('file://' + path.resolve(PAGE) + '?render' + QUERY);
  const info = await page.evaluate(() => window.READY);
  const dur = await page.evaluate(() => window.DUR || 15);
  console.log('duration', dur);
  const grab = async t => {
    const url = await page.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, t);
    return Buffer.from(url.split(',')[1], 'base64');
  };
  if (mode === 'timeline') {
    fs.writeFileSync(process.argv[3] || 'timeline.json', JSON.stringify(info, null, 1));
  } else if (mode === 'stills') {
    const dir = env.STILLS || 'stills';
    fs.mkdirSync(dir, { recursive: true });
    for (const t of process.argv.slice(3).map(Number)) fs.writeFileSync(`${dir}/t${t.toFixed(2)}.jpg`, await grab(t));
  } else {
    const fps = 60, n = Math.round(dur * fps);
    const ff = spawn(FFMPEG, ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-i', env.AUDIO || 'audio.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', env.CRF || '15', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
      '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', env.OUT || 'showreel.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await grab(i / fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 300 === 0) console.log('frame', i, '/', n, ((Date.now() - t0) / 1000).toFixed(1) + 's');
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
