const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const mode = process.argv[2] || 'stills';
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[err]', e.message));
  await page.goto('file://' + path.resolve('index.html') + '?render');
  const info = await page.evaluate(() => window.READY);
  console.log('sched', JSON.stringify(info));
  const grab = async t => {
    const url = await page.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, t);
    return Buffer.from(url.split(',')[1], 'base64');
  };
  if (mode === 'stills') {
    fs.mkdirSync((process.env.OUT||'stills'), { recursive: true });
    const ts = process.argv.slice(3).map(Number);
    for (const t of ts) fs.writeFileSync(`${process.env.OUT||'stills'}/t${t.toFixed(2)}.jpg`, await grab(t));
  } else {
    const fps = 60, n = 15 * fps;
    const ff = spawn(FFMPEG, ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-i', 'audio.wav', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
      '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', 'showreel.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await grab(i / fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 120 === 0) console.log('frame', i, ((Date.now() - t0) / 1000).toFixed(1) + 's');
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
