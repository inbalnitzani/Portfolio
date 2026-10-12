// Records short walkthrough videos of the real apps (running on demo data) for the portfolio.
// Needs the three demo servers running (see design/demos/README.md). Output: design/demos/out/*.mp4
// Usage: node design/demos/record.mjs [music|trakaboo|joblog]...
import { createRequire } from 'node:module'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const req = createRequire(path.join(process.env.HOME, 'projects/expense-tracker/package.json'))
const { chromium } = req('playwright')
const OUT = path.join(here, 'out')
fs.mkdirSync(OUT, { recursive: true })

// A visible cursor for the video (Playwright doesn't draw one)
const CURSOR = `
addEventListener('DOMContentLoaded', () => {
  const c = document.createElement('div');
  c.style.cssText = 'position:fixed;z-index:2147483647;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(255,79,163,.85);box-shadow:0 0 0 4px rgba(255,79,163,.25);pointer-events:none;transition:transform .12s;';
  document.body.appendChild(c);
  addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
  addEventListener('mousedown', () => c.style.transform = 'scale(.7)', true);
  addEventListener('mouseup', () => c.style.transform = 'scale(1)', true);
});`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Frames come from Chrome's screencast (CDP); they're encoded to video inside Chrome with
// MediaRecorder, so no ffmpeg is needed (Playwright's recorder doesn't support macOS 13).
async function encode(browser, frames, size, dest) {
  const page = await browser.newPage()
  await page.setContent('<canvas></canvas>')
  // ship frames in batches
  await page.evaluate(() => (window.__frames = []))
  for (let i = 0; i < frames.length; i += 40) {
    await page.evaluate((batch) => window.__frames.push(...batch), frames.slice(i, i + 40))
  }
  const b64 = await page.evaluate(async ({ w, h }) => {
    const frames = window.__frames
    const canvas = document.querySelector('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    const imgs = await Promise.all(frames.map((f) => new Promise((r) => { const im = new Image(); im.onload = () => r(im); im.src = 'data:image/jpeg;base64,' + f.data })))
    const mime = ['video/mp4;codecs=avc1.42E01F', 'video/webm;codecs=vp9', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m))
    const rec = new MediaRecorder(canvas.captureStream(30), { mimeType: mime, videoBitsPerSecond: 3_000_000 })
    const chunks = []
    rec.ondataavailable = (e) => chunks.push(e.data)
    const done = new Promise((r) => (rec.onstop = r))
    ctx.drawImage(imgs[0], 0, 0, w, h)
    rec.start()
    const t0 = frames[0].t
    const start = performance.now()
    for (let i = 0; i < imgs.length; i++) {
      const due = (frames[i].t - t0) * 1000
      const wait = due - (performance.now() - start)
      if (wait > 0) await new Promise((r) => setTimeout(r, wait))
      ctx.drawImage(imgs[i], 0, 0, w, h)
    }
    await new Promise((r) => setTimeout(r, 600))
    rec.stop()
    await done
    const blob = new Blob(chunks, { type: mime })
    const buf = new Uint8Array(await blob.arrayBuffer())
    let bin = ''
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000))
    return { data: btoa(bin), mime }
  }, { w: size.width, h: size.height })
  const ext = b64.mime.startsWith('video/mp4') ? 'mp4' : 'webm'
  const file = `${dest}.${ext}`
  fs.writeFileSync(file, Buffer.from(b64.data, 'base64'))
  console.log('saved', file, (fs.statSync(file).size / 1e6).toFixed(1) + ' MB', frames.length + ' frames')
}

async function session(name, size, fn) {
  const browser = await chromium.launch({ channel: 'chrome' })
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1 })
  await ctx.addInitScript(CURSOR)
  const page = await ctx.newPage()
  const cdp = await ctx.newCDPSession(page)
  const frames = []
  const chapters = []
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    frames.push({ data, t: metadata.timestamp })
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  const ui = {
    page,
    // caption shown on the portfolio from this moment of the video
    mark(caption) {
      chapters.push({ t: frames.length ? +(Date.now() / 1000 - frames[0].t).toFixed(2) : 0, caption })
    },
    async record() {
      await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 82, maxWidth: size.width, maxHeight: size.height, everyNthFrame: 1 })
    },
    async to(loc) {
      const el = typeof loc === 'string' ? page.locator(loc).first() : loc.first()
      await el.scrollIntoViewIfNeeded()
      const b = await el.boundingBox()
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 22 })
      await sleep(180)
      return el
    },
    async click(loc, wait = 900) {
      await ui.to(loc)
      await page.mouse.down()
      await sleep(70)
      await page.mouse.up()
      await sleep(wait)
    },
    async type(loc, text, wait = 500) {
      await ui.click(loc, 200)
      await page.keyboard.type(text, { delay: 75 })
      await sleep(wait)
    },
    async select(loc, value, wait = 700) {
      const el = await ui.to(loc)
      await el.selectOption(value)
      await sleep(wait)
    },
    async scroll(dy, steps = 30) {
      for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, dy / steps)
        await sleep(16)
      }
      await sleep(600)
    },
  }
  try {
    await fn(ui)
  } finally {
    await cdp.send('Page.stopScreencast').catch(() => {})
    await page.close()
    if (frames.length) await encode(browser, frames, size, path.join(OUT, name))
    fs.writeFileSync(path.join(OUT, `${name}.chapters.json`), JSON.stringify(chapters, null, 2))
    await browser.close()
  }
}

const flows = {
  async music() {
    await session('music', { width: 1280, height: 920 }, async (ui) => {
      const { page } = ui
      await page.goto('http://localhost:5190/')
      await page.getByRole('button', { name: 'English' }).waitFor()
      await ui.record()
      await sleep(800)
      ui.mark('Real app, demo data: the music licensing calculator')
      await ui.click(page.getByRole('button', { name: 'English' }), 1200)
      // Licensing calculator
      await ui.type(page.locator('input[type="text"]'), 'Golden Hour Drive')
      await ui.select(page.locator('select').nth(1), { index: 4 })
      await ui.select(page.locator('select').nth(2), { index: 3 })
      await ui.select(page.locator('select').nth(3), '2')
      ui.mark('Instant quote by production, media, territory and length')
      await ui.click(page.getByRole('button', { name: /calculate/i }), 900)
      await ui.scroll(320, 20)
      await sleep(1800)
      // Catalog
      ui.mark('Admin catalog: search and filter ~1,000 songs')
      await ui.click(page.getByRole('link', { name: /^songs$/i }), 2000)
      await ui.scroll(450, 25)
      await ui.scroll(-450, 20)
      const search = page.locator('input[type="text"], input[type="search"]').first()
      await ui.type(search, 'sea', 2200)
      // AI song finder
      ui.mark('AI song finder: a creative brief in, a shortlist out')
      await ui.click(page.getByRole('link', { name: /find a song/i }), 1500)
      const box = page.locator('textarea, input[type="text"]').first()
      await ui.click(box, 200)
      await page.keyboard.type('Hopeful, sunny track for a travel brand. Lyrics about the open road.', { delay: 32 })
      await sleep(300)
      await page.keyboard.press('Enter')
      await page.getByText('Golden Hour Drive').last().waitFor({ timeout: 15000 }).catch(() => {})
      await sleep(900)
      await ui.scroll(420, 25)
      await sleep(1800)
    })
  },

  async trakaboo() {
    await session('trakaboo', { width: 390, height: 844 }, async (ui) => {
      const { page } = ui
      await page.goto('http://localhost:3100/en')
      await page.getByRole('link', { name: 'Overview' }).waitFor()
      await ui.record()
      ui.mark('Real app, demo data: this month at a glance')
      await sleep(1500)
      await ui.scroll(700, 40)
      await ui.scroll(-700, 30)
      ui.mark('Flip between months')
      await ui.click(page.getByRole('link', { name: 'Previous month' }), 1800)
      ui.mark('Every transaction, auto-categorised')
      await ui.click(page.getByRole('link', { name: 'Transactions' }), 1800)
      await ui.scroll(600, 35)
      ui.mark('Quick manual entry')
      await ui.click(page.getByRole('link', { name: 'Add expense' }), 1500)
      const inputs = page.locator('input:not([type=hidden])')
      if (await inputs.count()) {
        await ui.type(inputs.first(), '42', 300)
        if ((await inputs.count()) > 1) await ui.type(inputs.nth(1), 'Coffee Lab', 600)
      }
      await sleep(800)
      await ui.click(page.getByRole('link', { name: 'Overview' }), 1500)
      ui.mark('Hebrew + English with a full RTL flip')
      await ui.click(page.getByRole('radio', { name: 'עברית' }), 2200)
      await ui.click(page.getByRole('radio', { name: 'English' }), 1500)
    })
  },

  async joblog() {
    await session('joblog', { width: 1280, height: 800 }, async (ui) => {
      const { page } = ui
      await page.goto('http://localhost:5180/design/demos/job-log/index.html')
      await page.locator('.row').first().waitFor()
      await sleep(600)
      await ui.record()
      ui.mark('A Claude routine fills this log every morning at 08:00')
      await sleep(1800)
      ui.mark('Jobs it found and qualified, ready to apply')
      await ui.click(page.locator('.chip', { hasText: 'Ready to apply' }), 1400)
      ui.mark('Each one: match score, notes, tailored CV + cover letter')
      await ui.click(page.locator('.row-head', { hasText: 'Orbit Games' }), 2200)
      await ui.click(page.locator('.chip', { hasText: 'All' }), 1200)
      await ui.click(page.locator('.row-head', { hasText: 'Pixelwave Studios' }), 2200)
      ui.mark('Track every application through to the offer')
      await ui.select(page.locator('#sortSelect'), 'score', 1500)
      ui.mark('Search across companies, tracks and notes')
      await ui.type(page.locator('#searchInput'), 'unity', 1800)
    })
  },
}

const which = process.argv.slice(2)
for (const name of which.length ? which : Object.keys(flows)) await flows[name]()
