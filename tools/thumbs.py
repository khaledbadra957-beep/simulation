"""Make the thumbnails the site uses (DESIGN.md §2, §7).
   thumbs/<lab>-card.jpg      one picture per lab for the homepage card (640x400)
   thumbs/<lab>-<screen>.jpg  one per screen of a stage-layout lab, for the bottom bar and home screen (320x200)
Run from the repo folder with a local server on :8765:  python3 -m http.server 8765 & python3 tools/thumbs.py [lab ...]
Needs playwright + chromium. Fonts load from Google Fonts (or a local copy, see FONT_ROUTE)."""
import asyncio, sys, os, glob, io
from playwright.async_api import async_playwright
from PIL import Image
BASE = 'http://localhost:8765/'
OUT = 'thumbs'
ROUTE = os.environ.get('FONT_ROUTE')  # optional: path to a module with an async route(r) for offline fonts

def cover(png, w, h):
    im = Image.open(io.BytesIO(png)).convert('RGB')
    r = max(w / im.width, h / im.height)
    im = im.resize((max(w, round(im.width * r)), max(h, round(im.height * r))), Image.LANCZOS)
    x = (im.width - w) // 2; y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

# a good moment to photograph, per lab (runs in the page before the picture is taken)
PREP = {
  'esterification-lab': "document.querySelector('[data-tab=eq]').click()",
  'five-types-of-chemical-reactions': "document.querySelector('[data-tab=pat]').click()",
  'pulse-at-a-boundary': "(()=>{const s=document.getElementById('scrub');document.getElementById('play').click();s.value=330;s.dispatchEvent(new Event('input'))})()",
}
BIGGEST = """(() => {
  document.querySelectorAll('.lg-home,.lg-nav,.lg-btn,.intro,.start,.overlay').forEach(e => e.style.display = 'none');
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 120 && r.height > 80 && s.visibility !== 'hidden' && s.display !== 'none'; };
  let best = null, area = 0;
  document.querySelectorAll('.scene, canvas, svg, .stage, .bench-art, .apparatus').forEach(e => { if (!vis(e)) return; const r = e.getBoundingClientRect(); const a = r.width * r.height; if (a > area) { area = a; best = r; } });
  return best ? { x: best.left, y: best.top + scrollY, w: best.width, h: best.height } : null;
})()"""

async def main(only):
    labs = sorted(f[:-5] for f in os.listdir('.') if f.endswith('.html') and f != 'index.html')
    if only: labs = [l for l in labs if l in only]
    os.makedirs(OUT, exist_ok=True)
    route = None
    if ROUTE:
        sys.path.insert(0, os.path.dirname(ROUTE)); route = __import__(os.path.basename(ROUTE)[:-3]).route
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROME', None) or None, args=['--no-sandbox'])
        for lab in labs:
            src = open(lab + '.html', encoding='utf-8').read()
            stage = 'class="stage-ui"' in src
            ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, color_scheme='light')
            pg = await ctx.new_page()
            if route: await pg.route('**/*', route)
            await pg.goto(BASE + lab + ('.html#lab' if stage else '.html#intro')); await pg.wait_for_timeout(2600)
            if stage:
                screens = await pg.evaluate("(window.LAB && LAB.screens || []).map(s => s.id)")
                for sid in screens:
                    await pg.evaluate(f"location.hash = '{sid}'"); await pg.wait_for_timeout(1400)
                    if lab in PREP: await pg.evaluate(PREP[lab]); await pg.wait_for_timeout(300)
                    el = await pg.query_selector(f'.screen:not([hidden]) .scene') or await pg.query_selector('.screen:not([hidden]) .solo-in')
                    png = await el.screenshot()
                    cover(png, 320, 200).save(f'{OUT}/{lab}-{sid}.jpg', quality=82, optimize=True)
                await pg.evaluate("location.hash = 'lab'"); await pg.wait_for_timeout(1400)
                if lab in PREP: await pg.evaluate(PREP[lab]); await pg.wait_for_timeout(300)
                el = await pg.query_selector('.screen:not([hidden]) .scene')
                png = await el.screenshot()
            else:
                if lab in PREP: await pg.evaluate(PREP[lab]); await pg.wait_for_timeout(1500)
                box = await pg.evaluate(BIGGEST)
                if box: png = await pg.screenshot(clip={'x': box['x'], 'y': box['y'], 'width': box['w'], 'height': box['h']}, full_page=True)
                else: png = await pg.screenshot()
            cover(png, 640, 400).save(f'{OUT}/{lab}-card.jpg', quality=80, optimize=True)
            print('ok', lab, '(stage)' if stage else '')
            await ctx.close()
        await b.close()

asyncio.run(main(sys.argv[1:]))
