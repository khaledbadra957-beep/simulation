"""Link previews (Open Graph) for every page: the picture and text WhatsApp, Classera, Teams etc. show for a shared link.
   og/<page>.jpg   1200x630, made from the homepage card picture in thumbs/ (run tools/thumbs.py first for a new lab)
   In each page's <head>, the block between <!-- og --> and <!-- /og --> is (re)written: description, og:*, twitter:*.
   Only link-preview robots download these pictures; students opening a lab never do, so pages stay as light as before.
Run from the repo folder with a local server on :8765:  python3 -m http.server 8765 & python3 tools/og.py [page ...]
Needs playwright + chromium. FONT_ROUTE: optional module with an async route(r) for offline fonts (as in thumbs.py)."""
import asyncio, sys, os, re, json, html, base64
from playwright.async_api import async_playwright

SITE = 'https://khaledbadra957-beep.github.io/simulation/'
BASE = 'http://localhost:8765/'
OUT = 'og'
NAME = 'Mr Khaled · Science Simulations'
ROUTE = os.environ.get('FONT_ROUTE')

# pages without a description of their own (the others keep theirs)
DESC = {
  'resonance-on-a-string': 'Drive a string at any frequency and watch it swing wildly at its harmonics: count the loops, find the pattern f = n f1, and see why only some notes resonate.',
  'wave-speed-lab': "Shake a string, send pulses and play sounds, measure each wave with a ruler and stopwatch, and race two pulses to see what really sets a wave's speed.",
  'chemical-change-lab': 'Run nine experiments and spot the signs of a chemical change, weigh a reaction in an open and closed flask, watch atoms rearrange and balance equations.',
}
SUBJ = {'phys': 'Physics', 'chem': 'Chemistry'}

def labs():
    s = open('index.html', encoding='utf-8').read()
    L = json.loads(re.search(r'var LABS = (\[.*?\n\]);', s, re.S).group(1))
    info = {}
    for x in L:
        stem = x['f'][:-5]
        info[stem] = dict(t=x['t'], s=x['s'], g=x['g'], m=x.get('m'), cam=bool(x.get('co')), k=x.get('k', ''))
        if x.get('cam'):  # its camera version has no homepage line of its own
            c = x['cam'][:-5]
            info[c] = dict(info[stem], cam=True, t=None, k='')
    return info

def page_title(src):
    t = html.unescape(re.search(r'<title>([^<]*)</title>', src).group(1))
    return re.sub(r'^Hands-On Lab:\s*', '', t)

def page_desc(stem, src, inf):
    m = re.search(r'<meta name="description" content="([^"]*)"\s*/?>', src)
    if m: return html.unescape(m.group(1))
    if stem in DESC: return DESC[stem]
    return inf.get('k', '')

def grades(g):
    g = g.split()
    return ('Grade ' + g[0]) if len(g) == 1 else ('Grades ' + ', '.join(g[:-1]) + ' & ' + g[-1])

def data_uri(path):
    return 'data:image/jpeg;base64,' + base64.b64encode(open(path, 'rb').read()).decode()

CSS = """
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:#F4F5F7;color:#13232B;font:24px/1.35 'Atkinson Hyperlegible',sans-serif;position:relative}
.band{position:absolute;left:0;top:0;bottom:0;width:12px;background:var(--c)}
.txt{position:absolute;left:64px;top:64px;width:430px;bottom:56px;display:flex;flex-direction:column}
.chip{align-self:flex-start;font:600 21px 'IBM Plex Mono',monospace;color:#fff;background:var(--c);padding:7px 14px;border-radius:8px;letter-spacing:.2px}
.mod{font:500 20px 'IBM Plex Mono',monospace;color:#55666E;margin-top:14px}
h1{font:800 var(--fs)/1.02 'Bricolage Grotesque',sans-serif;letter-spacing:-1.5px;margin-top:26px}
.how{margin-top:18px;font-size:25px;color:#33454D}
.how b{color:var(--c)}
.brand{margin-top:auto;display:flex;align-items:center;gap:14px}
.mark{width:52px;height:52px;border-radius:12px;background:#13232B;color:#F4F5F7;display:flex;align-items:center;justify-content:center;font:600 19px 'IBM Plex Mono',monospace;border-bottom:4px solid #E2632B}
.brand b{display:block;font:800 23px/1.1 'Bricolage Grotesque',sans-serif}
.brand small{display:block;color:#55666E;font-size:19px}
.pic{position:absolute;right:52px;top:128px;width:600px;height:375px;border-radius:18px;overflow:hidden;box-shadow:0 2px 6px rgba(19,35,43,.12),0 18px 44px rgba(19,35,43,.18);background:#fff}
.pic img{display:block;width:100%;height:100%;object-fit:cover}
.grid{position:absolute;right:52px;top:66px;width:600px;display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid div{height:241px;border-radius:14px;overflow:hidden;box-shadow:0 2px 5px rgba(19,35,43,.12),0 12px 30px rgba(19,35,43,.16)}
.grid img{display:block;width:100%;height:100%;object-fit:cover}
"""

BRAND = '<div class="brand"><span class="mark">MK</span><span><b>Mr Khaled</b><small>Science Simulations</small></span></div>'

def card_html(stem, inf, title):
    c = '#0A6A88' if inf['s'] == 'phys' else '#7A3F8F'
    fs = 70 if len(title) <= 14 else 60 if len(title) <= 22 else 52
    how = '<b>Camera lab</b> · do it with your own hand' if inf['cam'] else '<b>Interactive lab</b> · try it, measure it, solve it'
    mod = f'<div class="mod">{html.escape(inf["m"])}</div>' if inf.get('m') else ''
    return f"""<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"><style>{CSS}</style></head>
<body style="--c:{c};--fs:{fs}px"><div class="band"></div>
<div class="txt"><span class="chip">{grades(inf['g'])} · {SUBJ[inf['s']]}</span>{mod}<h1>{html.escape(title)}</h1><p class="how">{how}</p>{BRAND}</div>
<div class="pic"><img src="{data_uri(f'thumbs/{stem}-card.jpg')}"></div></body></html>"""

def home_html(picks):
    imgs = ''.join(f'<div><img src="{data_uri(f"thumbs/{p}-card.jpg")}"></div>' for p in picks)
    return f"""<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"><style>{CSS}</style></head>
<body style="--c:#0A6A88;--fs:68px"><div class="band" style="background:linear-gradient(#0A6A88 50%,#7A3F8F 50%)"></div>
<div class="txt"><span class="chip">Grades 7–12</span><h1>Science Simulations</h1><p class="how"><b>Physics</b> &amp; <b style="color:#7A3F8F">chemistry</b> labs you can try, measure and solve, including camera labs you do with your own hand.</p>{BRAND}</div>
<div class="grid">{imgs}</div></body></html>"""

def meta_block(stem, title, desc, alt):
    url = SITE + ('' if stem == 'index' else stem + '.html')
    e = lambda s: html.escape(s, quote=True)
    t = title if stem == 'index' else f'{title} · Mr Khaled'
    return ('<!-- og -->\n'
            f'<meta property="og:type" content="website">\n'
            f'<meta property="og:site_name" content="{e(NAME)}">\n'
            f'<meta property="og:title" content="{e(t)}">\n'
            f'<meta property="og:description" content="{e(desc)}">\n'
            f'<meta property="og:url" content="{url}">\n'
            f'<meta property="og:image" content="{SITE}{OUT}/{stem}.jpg">\n'
            f'<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            f'<meta property="og:image:alt" content="{e(alt)}">\n'
            f'<meta name="twitter:card" content="summary_large_image">\n'
            f'<link rel="icon" href="favicon.svg" type="image/svg+xml">\n'
            '<!-- /og -->')

def write_meta(path, stem, title, desc, alt):
    src = open(path, encoding='utf-8').read()
    src = re.sub(r'\n?<!-- og -->.*?<!-- /og -->', '', src, flags=re.S)
    if 'name="description"' not in src:
        src = re.sub(r'(<title>[^<]*</title>)', lambda m: m.group(1) + f'\n<meta name="description" content="{html.escape(desc, quote=True)}">', src, count=1)
    anchor = re.search(r'<meta name="description"[^>]*>', src)
    src = src[:anchor.end()] + '\n' + meta_block(stem, title, desc, alt) + src[anchor.end():]
    open(path, 'w', encoding='utf-8').write(src)

async def main(only):
    info = labs()
    pages = sorted(f[:-5] for f in os.listdir('.') if f.endswith('.html') and not f.startswith('_'))
    if only: pages = [p for p in pages if p in only]
    os.makedirs(OUT, exist_ok=True)
    route = None
    if ROUTE:
        sys.path.insert(0, os.path.dirname(ROUTE)); route = __import__(os.path.basename(ROUTE)[:-3]).route
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 1200, 'height': 630}, color_scheme='light')
        pg = await ctx.new_page()
        if route: await pg.route('**/*', route)
        for stem in pages:
            src = open(stem + '.html', encoding='utf-8').read()
            if stem == 'index':
                title, desc = 'Science Simulations · Mr Khaled', page_desc(stem, src, {})
                doc = home_html(['hands-on-titration', 'galvanic-cell-lab', 'wave-speed-lab', 'hands-on-circuits'])
                alt = 'Four of the science simulations by Mr Khaled'
            else:
                inf = info[stem]; title = page_title(src)
                desc = page_desc(stem, src, inf)
                doc = card_html(stem, inf, title)
                alt = f'{title}: a picture of the lab'
            await pg.set_content(doc, wait_until='load')
            await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(150)
            await pg.screenshot(path=f'{OUT}/{stem}.jpg', type='jpeg', quality=84)
            write_meta(stem + '.html', stem, title, desc, alt)
            print('ok', stem, os.path.getsize(f'{OUT}/{stem}.jpg') // 1024, 'KB')
        await b.close()

asyncio.run(main(sys.argv[1:]))
