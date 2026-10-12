"""Generates design/portfolio-board.svg — drag it into Figma (imports as editable layers).

Run: python3 design/build_board.py <pins_dir>
Pins (your Pinterest saves) are embedded for reference only; the SVG is git-ignored.
"""
import base64
import html
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
PINS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'pins')
CUT = os.path.join(HERE, 'cut-sm')
GAMES = os.path.join(HERE, '..', 'public', 'games')
PHOTOS = os.path.join(HERE, 'photos')
CHAR = os.path.join(HERE, 'character', 'sm')

# ── Tokens (v2: desktop scrapbook) ──────────────────────────────
PAPER = '#F4EFE6'
PAPER_2 = '#EAE3D7'
INK = '#121212'
INK_SOFT = '#5C5651'
HOT = '#FF4FA3'
FUR = '#F6A9CB'
BLUSH = '#FBDCEA'
LILAC = '#D9CCFF'
KEY = '#9DCB5A'
KEY_DARK = '#7BA83C'
SKY = '#BFE3FF'
COBALT = '#2B3FF5'
IMSG = '#3D8BFF'
WHITE = '#FFFFFF'

DISPLAY = 'Inter Tight'
SERIF = 'Instrument Serif'
HAND = 'Caveat'
PIXEL = 'Silkscreen'
BODY = 'Inter'
MONO = 'IBM Plex Mono'

out: list[str] = []


def esc(s):
  return html.escape(str(s), quote=True)


def b64(path):
  ext = 'png' if path.endswith('.png') else 'jpeg'
  with open(path, 'rb') as f:
    return f'data:image/{ext};base64,' + base64.b64encode(f.read()).decode()


def rect(x, y, w, h, fill, r=0, stroke=None, sw=0, opacity=1, extra=''):
  s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
  out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"{s} opacity="{opacity}" {extra}/>')


def text(x, y, s, size=24, fam=BODY, weight=400, fill=INK, anchor='start', italic=False, ls=0, opacity=1, rot=0):
  st = ' font-style="italic"' if italic else ''
  tr = f' transform="rotate({rot} {x} {y})"' if rot else ''
  out.append(
    f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" font-weight="{weight}"{st} '
    f'letter-spacing="{ls}" fill="{fill}" text-anchor="{anchor}" opacity="{opacity}"{tr}>{esc(s)}</text>'
  )


def lines(x, y, rows, size=22, lh=1.45, **kw):
  for i, r in enumerate(rows):
    text(x, y + i * size * lh, r, size=size, **kw)


def img(path, x, y, w, h, rot=0, clip=None):
  tr = f' transform="rotate({rot} {x + w / 2} {y + h / 2})"' if rot else ''
  cp = f' clip-path="url(#{clip})"' if clip else ''
  out.append(f'<image href="{b64(path)}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice"{tr}{cp}/>')


def group(name):
  out.append(f'<g id="{esc(name)}">')


def end():
  out.append('</g>')


def shadow_rect(x, y, w, h, fill, r=24):
  """Soft object shadow instead of v1's flat ink offset."""
  out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" filter="url(#soft)"/>')


def chip(x, y, label, fill=INK, color=WHITE, size=14, fam=PIXEL, pad=14):
  w = len(label) * size * 0.72 + pad * 2
  rect(x, y, w, size + 18, fill, r=(size + 18) / 2)
  text(x + pad, y + size + 5, label, size=size, fam=fam, fill=color)
  return w


def bubble(x, y, label, fill=IMSG, color=WHITE, size=22):
  w = len(label) * size * 0.56 + 36
  rect(x, y, w, size + 26, fill, r=(size + 26) / 2)
  text(x + 18, y + size + 6, label, size=size, fam=BODY, weight=500, fill=color)


def scribble_arrow(x1, y1, x2, y2, bend=60, color=INK):
  mx, my = (x1 + x2) / 2 + bend, (y1 + y2) / 2 - bend
  out.append(f'<path d="M{x1} {y1} Q{mx} {my} {x2} {y2}" fill="none" stroke="{color}" stroke-width="3" stroke-linecap="round"/>')
  out.append(f'<path d="M{x2 - 14} {y2 - 10} L{x2} {y2} L{x2 - 4} {y2 - 18}" fill="none" stroke="{color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')


def keycap(x, y, w, label, base=KEY, top='#B3DD74', h=78, color=INK, size=18):
  rect(x, y + 8, w, h, base, r=16)
  rect(x + 6, y, w - 12, h - 12, top, r=12)
  rect(x + 14, y + 6, w - 28, 6, WHITE, r=3, opacity=0.35)
  text(x + w / 2, y + h / 2 + 2, label, size=size, fam=BODY, weight=600, fill=color, anchor='middle')


def folder(x, y, w, h, fill, label, sub, papers):
  # papers peeking out
  for i, (pt, rot) in enumerate(papers):
    px = x + 30 + i * (w - 80) / max(1, len(papers))
    rect(px, y - 70 + i * 10, w * 0.55, 150, WHITE, r=6, extra=f'transform="rotate({rot} {px} {y})" filter="url(#soft)"')
    text(px + 16, y - 36 + i * 10, pt, size=15, fam=BODY, weight=600, rot=rot)
  # back tab + body
  out.append(f'<path d="M{x} {y + 24} q0 -24 24 -24 h{w * 0.3} q14 0 22 14 l10 16 h{w * 0.7 - 56} q24 0 24 24 v{h - 30} q0 24 -24 24 h{-(w - 48)} q-24 0 -24 -24 z" fill="{fill}" filter="url(#soft)"/>')
  rect(x, y + 50, w, h - 26, fill, r=24, opacity=0.92)
  text(x + 28, y + h - 30, label, size=38, fam=DISPLAY, weight=800, ls=-1)
  text(x + 28, y + h + 4, sub, size=20, fam=SERIF, italic=True, fill=INK_SOFT)


def frame(x, y, w, h, name, bg=PAPER):
  out.append(f'<g id="{esc(name)}"><rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}"/>')
  text(x, y - 24, name, size=22, fam=PIXEL, fill=INK_SOFT)


def hud(x, y, w, lvl, dark=False):
  c = WHITE if dark else INK
  text(x + 48, y + 52, 'INBAL.EXE', size=16, fam=PIXEL, fill=c)
  rect(x + w / 2 - 220, y + 40, 440, 8, c, r=4, opacity=0.15)
  rect(x + w / 2 - 220, y + 40, 440 * lvl / 6, 8, HOT, r=4)
  text(x + w - 48, y + 52, f'LVL {lvl} / 5', size=16, fam=PIXEL, fill=c, anchor='end')


# ════════════════════════════════════════════════════════════════
W = 3240
X0 = 120
y = 0

# ── Cover ──
group('00 Cover')
text(X0, 220, 'INBAL.EXE', size=180, fam=DISPLAY, weight=900, ls=-8)
text(X0 + 6, 300, 'design direction v2: a desktop scrapbook, not a sticker app', size=54, fam=SERIF, italic=True, fill=INK_SOFT)
shadow_rect(2060, 90, 1060, 300, WHITE, r=28)
text(2100, 150, 'WHY V2', size=16, fam=PIXEL, fill=HOT)
lines(2100, 196, [
  'v1 reused Trakaboo’s sticker language: ink outlines,',
  'flat offset shadows, pixel-font headings, pink on pink.',
  'Your board is different: tactile 3D objects, cut-out photos,',
  'scribbles, folders & desktop windows, big editorial type.',
], size=24, fill=INK)
end()

# ── Principles ──
y = 480
group('01 Principles')
text(X0, y, '01 — PRINCIPLES', size=20, fam=PIXEL, fill=INK_SOFT)
P = [
  ('Objects, not outlines', 'Fur, chrome, glass and keycaps carry the playfulness. No black borders on everything.', FUR),
  ('Air + big type', 'Cream space and huge black grotesque. Pink is the accent, not the wallpaper.', PAPER_2),
  ('Scrapbook layer', 'Real cut-out photos, handwritten notes, receipts, tape, chat bubbles.', BLUSH),
  ('Desktop metaphors', 'Folders, a Paint window, a pink CRT. The CV is something you open.', LILAC),
  ('Game is the structure', 'START, levels, XP and a boss stay. Pixel type only for tiny HUD details.', '#DCEFC3'),
]
for i, (t, d, c) in enumerate(P):
  px = X0 + i * 600
  rect(px, y + 40, 560, 300, c, r=28)
  text(px + 32, y + 104, f'0{i + 1}', size=18, fam=PIXEL, fill=INK_SOFT)
  text(px + 32, y + 160, t, size=40, fam=DISPLAY, weight=800, ls=-1)
  words, row, rows = d.split(), '', []
  for wd in words:
    if len(row + ' ' + wd) > 34:
      rows.append(row)
      row = wd
    else:
      row = (row + ' ' + wd).strip()
  rows.append(row)
  lines(px + 32, y + 210, rows, size=22, fill=INK_SOFT)
end()

# ── Moodboard ──
y = 920
group('02 Moodboard')
text(X0, y, '02 — MOODBOARD (FROM YOUR PINTEREST “השראה”)', size=20, fam=PIXEL, fill=INK_SOFT)
SIZES = {
  '01': (390, 520), '02': (520, 341), '03': (416, 520), '04': (416, 520), '05': (416, 520), '06': (520, 292),
  '07': (416, 520), '08': (414, 520), '09': (520, 520), '10': (297, 520), '11': (520, 520), '12': (292, 520),
  '13': (520, 292), '14': (390, 520), '15': (292, 520), '16': (520, 520), '17': (520, 298), '18': (416, 520),
  '19': (314, 520), '20': (520, 297),
}
GROUPS = [
  ('Tactile 3D objects', ['07', '14', '09', '16', '11', '03', '10']),
  ('Scrapbook & cut-outs', ['04', '18', '15', '05']),
  ('Desktop & OS', ['01', '08', '12', '13']),
  ('Game moments', ['02', '19']),
  ('Editorial type', ['17', '06', '20']),
]
colw, tile = 600, 270
col_bottom = 0
for gi, (gname, ids) in enumerate(GROUPS):
  gx = X0 + gi * colw
  text(gx, y + 60, gname, size=34, fam=SERIF, italic=True)
  cy = [y + 90, y + 90]
  for pid in ids:
    c = 0 if cy[0] <= cy[1] else 1
    pw, ph = SIZES[pid]
    th = tile * ph / pw
    path = os.path.join(PINS, f'{pid}.jpg')
    if os.path.exists(path):
      rect(gx + c * (tile + 16), cy[c], tile, th, WHITE, r=14)
      out.append(f'<clipPath id="pin{pid}"><rect x="{gx + c * (tile + 16)}" y="{cy[c]}" width="{tile}" height="{th}" rx="14"/></clipPath>')
      img(path, gx + c * (tile + 16), cy[c], tile, th, clip=f'pin{pid}')
    cy[c] += th + 16
  col_bottom = max(col_bottom, *cy)
end()

# ── System: palette, type, 3D props ──
y = col_bottom + 140
group('03 System')
text(X0, y, '03 — PALETTE', size=20, fam=PIXEL, fill=INK_SOFT)
SW = [('Paper', PAPER, INK), ('Paper 2', PAPER_2, INK), ('Ink', INK, WHITE), ('Hot pink', HOT, WHITE), ('Fur', FUR, INK),
      ('Blush', BLUSH, INK), ('Lilac', LILAC, INK), ('Keycap', KEY, INK), ('Sky', SKY, INK), ('Cobalt pop', COBALT, WHITE)]
for i, (n, c, tc) in enumerate(SW):
  sx = X0 + i * 300
  rect(sx, y + 40, 280, 200, c, r=24, stroke='#00000014' if c in (PAPER, WHITE) else None, sw=2)
  text(sx + 24, y + 200, n, size=24, fam=DISPLAY, weight=700, fill=tc)
  text(sx + 24, y + 226, c, size=16, fam=MONO, fill=tc, opacity=0.7)

ty = y + 340
text(X0, ty, '04 — TYPE', size=20, fam=PIXEL, fill=INK_SOFT)
text(X0, ty + 170, 'Big & tight', size=150, fam=DISPLAY, weight=900, ls=-6)
text(X0 + 4, ty + 214, 'Inter Tight Black — display, -4% tracking', size=18, fam=MONO, fill=INK_SOFT)
text(X0 + 1060, ty + 150, 'tucked inside', size=120, fam=SERIF, italic=True, fill=HOT)
text(X0 + 1064, ty + 214, 'Instrument Serif Italic — accent words', size=18, fam=MONO, fill=INK_SOFT)
text(X0 + 1980, ty + 140, 'psst… press start', size=82, fam=HAND, weight=600, rot=-3)
text(X0 + 1984, ty + 214, 'Caveat — scribbles & notes', size=18, fam=MONO, fill=INK_SOFT)
text(X0 + 2620, ty + 130, 'LVL 01', size=40, fam=PIXEL, fill=INK)
text(X0 + 2624, ty + 214, 'Silkscreen — HUD only', size=18, fam=MONO, fill=INK_SOFT)

ay = ty + 320
text(X0, ay, '05 — 3D PROPS (GENERATED, BACKGROUND REMOVED)', size=20, fam=PIXEL, fill=INK_SOFT)
PROPS = ['fur-cursor', 'chrome-star', 'glass-start', 'pink-computer', 'disco-folder', 'fur-gamepad']
for i, p in enumerate(PROPS):
  px = X0 + i * 500
  rect(px, ay + 40, 460, 400, WHITE, r=28)
  img(os.path.join(CUT, f'{p}.png'), px + 30, ay + 60, 400, 330 if p == 'glass-start' else 360)
  text(px + 28, ay + 420, p, size=18, fam=MONO, fill=INK_SOFT)
end()

cy0 = ay + 560
text(X0, cy0, '06 — PLAYER CHARACTER (3D TOY STYLE, A2)', size=20, fam=PIXEL, fill=INK_SOFT)
POSES = [('idle', 'START idle · breathing loop', 700, 1254), ('wave', 'LVL 1 · says hi', 700, 1254), ('run', 'scroll · runs between levels', 700, 869), ('play', 'LVL 4 · playing games', 700, 1254)]
BGS = [BLUSH, LILAC, '#DCEFC3', SKY]
for i, (n, cap, pw, ph) in enumerate(POSES):
  px = X0 + i * 750
  rect(px, cy0 + 40, 710, 640, BGS[i], r=32)
  ih = 560 if n != 'run' else 470
  iw = ih * pw / ph
  img(os.path.join(CHAR, f'pose-{n}.png'), px + (710 - iw) / 2, cy0 + 40 + 600 - ih, iw, ih)
  text(px + 32, cy0 + 90, n.upper(), size=18, fam=PIXEL)
  text(px + 32, cy0 + 660, cap, size=28, fam=SERIF, italic=True, fill=INK_SOFT)

# ── Mockups ──
MW, MH, GAP = 1440, 900, 120
my = cy0 + 860
text(X0, my - 60, '07 — LEVEL MOCKUPS (1440 × 900)', size=20, fam=PIXEL, fill=INK_SOFT)


def at(i):
  return X0 + (i % 2) * (MW + GAP), my + (i // 2) * (MH + GAP + 40)


# 1. START
fx, fy = at(0)
frame(fx, fy, MW, MH, 'START — Press start')
hud(fx, fy, MW, 0)
text(fx + 80, fy + 350, 'Inbal', size=250, fam=DISPLAY, weight=900, ls=-12)
text(fx + 80, fy + 570, 'Nitzani', size=250, fam=DISPLAY, weight=900, ls=-12)
# game character (waving)
img(os.path.join(CHAR, 'pose-wave.png'), fx + 930, fy + 150, 420, 752)
bubble(fx + 1190, fy + 150, 'hi! wanna play?')
bubble(fx + 1280, fy + 212, ':)')
img(os.path.join(CUT, 'chrome-star.png'), fx + 860, fy + 600, 180, 180, rot=-12)
text(fx + 84, fy + 660, 'Full-stack engineer by day,', size=34, fam=SERIF, italic=True, fill=INK_SOFT)
text(fx + 84, fy + 702, 'game developer by night.', size=34, fam=SERIF, italic=True, fill=INK_SOFT)
img(os.path.join(CUT, 'glass-start.png'), fx + 70, fy + 720, 260, 175)
img(os.path.join(CUT, 'fur-cursor.png'), fx + 270, fy + 730, 150, 150, rot=-30)
text(fx + 450, fy + 830, 'psst… press start', size=46, fam=HAND, weight=600, rot=-4)
scribble_arrow(fx + 440, fy + 800, fx + 400, fy + 790, bend=-20)
end()

# 2. LVL 1 — Meet the player
fx, fy = at(1)
frame(fx, fy, MW, MH, 'LVL 1 — Meet the player')
hud(fx, fy, MW, 1)
chip(fx + 80, fy + 110, 'LEVEL 01')
text(fx + 80, fy + 250, 'Meet the', size=120, fam=DISPLAY, weight=900, ls=-5)
text(fx + 640, fy + 250, 'player', size=130, fam=SERIF, italic=True, fill=HOT)
# polaroid
rect(fx + 90, fy + 320, 380, 470, WHITE, r=6, extra=f'transform="rotate(-4 {fx + 280} {fy + 555})" filter="url(#soft)"')
out.append(f'<g transform="rotate(-4 {fx + 280} {fy + 555})"><clipPath id="polaroid"><rect x="{fx + 115}" y="{fy + 345}" width="330" height="360"/></clipPath><rect x="{fx + 115}" y="{fy + 345}" width="330" height="360" fill="{BLUSH}"/><image href="{b64(os.path.join(PHOTOS, "portrait-cut-sm.png"))}" x="{fx + 95}" y="{fy + 365}" width="370" height="564" clip-path="url(#polaroid)" preserveAspectRatio="xMidYMin slice"/></g>')
text(fx + 180, fy + 760, 'me, probably debugging', size=28, fam=HAND, weight=600, rot=-4)
rect(fx + 230, fy + 300, 120, 36, '#F3E7A8', opacity=0.85, extra=f'transform="rotate(6 {fx + 290} {fy + 318})"')
# receipt
rx, ry = fx + 560, fy + 320
zig = ''.join(f' l-15 {12 if k % 2 == 0 else -12}' for k in range(26))
out.append(f'<path d="M{rx} {ry} h390 v470{zig} z" fill="{WHITE}" filter="url(#soft)"/>')
text(rx + 195, ry + 50, 'INBAL.EXE STORE', size=22, fam=MONO, weight=700, anchor='middle')
text(rx + 195, ry + 78, 'receipt #2026 · tel aviv', size=15, fam=MONO, fill=INK_SOFT, anchor='middle')
items = [('B.Sc Computer Science', '2023'), ('M.Des Game Design', 'WIP'), ('IDF Maglan, Head of Media', '15–17'),
         ('Platform engineer', 'Whalo'), ('Sole frontend eng.', 'NanoLock'), ('Curiosity', '∞')]
for k, (a, b) in enumerate(items):
  text(rx + 28, ry + 140 + k * 44, a, size=17, fam=MONO)
  text(rx + 362, ry + 140 + k * 44, b, size=17, fam=MONO, anchor='end')
out.append(f'<line x1="{rx + 28}" y1="{ry + 410}" x2="{rx + 362}" y2="{ry + 410}" stroke="{INK}" stroke-dasharray="6 6"/>')
text(rx + 28, ry + 446, 'TOTAL', size=20, fam=MONO, weight=700)
text(rx + 362, ry + 446, '1 engineer', size=20, fam=MONO, weight=700, anchor='end')
# bio + notes
lines(fx + 1010, fy + 380, ['I build distributed backends', 'on AWS & Kubernetes, the', 'React on top, and AI tooling', 'with the Claude Agent SDK.'], size=26, fill=INK)
text(fx + 1010, fy + 560, 'sole-owner energy!!', size=40, fam=HAND, weight=600, fill=HOT, rot=-3)
scribble_arrow(fx + 1150, fy + 590, fx + 960, fy + 680, bend=-40, color=HOT)
bubble(fx + 1030, fy + 690, 'based in tel aviv')
end()

# 3. LVL 2 — Skill tree (keycaps)
fx, fy = at(2)
frame(fx, fy, MW, MH, 'LVL 2 — Skill tree', bg=PAPER_2)
hud(fx, fy, MW, 2)
chip(fx + 80, fy + 110, 'LEVEL 02')
text(fx + 80, fy + 250, 'Skill', size=130, fam=DISPLAY, weight=900, ls=-5)
text(fx + 430, fy + 250, 'tree', size=140, fam=SERIF, italic=True, fill=HOT)
text(fx + 900, fy + 220, 'press a key to equip it ↓', size=42, fam=HAND, weight=600, rot=-3)
ROWS = [
  [('TypeScript', 170, KEY), ('Node.js', 140, KEY), ('React', 120, KEY), ('Java', 100, KEY), ('C#', 80, KEY), ('C++', 90, KEY), ('SQL', 90, KEY)],
  [('AWS Athena', 170, FUR), ('Neptune', 140, FUR), ('DynamoDB', 160, FUR), ('Lambda', 130, FUR), ('Kubernetes', 180, FUR), ('Redis', 110, FUR)],
  [('Unity', 120, LILAC), ('Game Design', 180, LILAC), ('Prototyping', 170, LILAC), ('Claude Agent SDK', 250, PAPER), ('Supabase', 150, PAPER)],
]
TOPS = {KEY: '#B3DD74', FUR: '#FBC3DB', LILAC: '#E7DEFF', PAPER: WHITE}
BASES = {KEY: KEY_DARK, FUR: '#E58BB4', LILAC: '#B9A6F2', PAPER: '#D9D0C2'}
for r_i, row in enumerate(ROWS):
  kx = fx + 80 + r_i * 40
  for lab, kw, c in row:
    keycap(kx, fy + 360 + r_i * 120, kw, lab, base=BASES[c], top=TOPS[c])
    kx += kw + 16
text(fx + 80, fy + 790, 'Real keycaps: top face + darker skirt + soft shadow. Pressed = sinks 6px, lighting shifts.', size=20, fam=MONO, fill=INK_SOFT)
end()

# 4. LVL 3 — Quest log (folders)
fx, fy = at(3)
frame(fx, fy, MW, MH, 'LVL 3 — Quest log')
hud(fx, fy, MW, 3)
chip(fx + 80, fy + 110, 'LEVEL 03')
text(fx + 80, fy + 250, 'Quests', size=130, fam=DISPLAY, weight=900, ls=-5)
text(fx + 590, fy + 250, 'tucked inside', size=110, fam=SERIF, italic=True, fill=HOT)
folder(fx + 80, fy + 470, 380, 260, FUR, 'Whalo', '2026 – now · active quest', [('Push at scale · 4M/day', -6), ('Rule-tree compiler', 4)])
folder(fx + 530, fy + 470, 380, 260, '#C9D9B6', 'Freelance', '2025 – 26 · music licensing', [('Song catalog + quotes', -3), ('Claude Skill search', 5)])
folder(fx + 980, fy + 470, 380, 260, LILAC, 'NanoLock', '2023 – 25 · OT/IoT security', [('Groups page', -5), ('Audit log tooling', 3)])
img(os.path.join(CHAR, 'pose-run.png'), fx + 1180, fy + 90, 210, 261)
text(fx + 80, fy + 840, 'Hover: papers slide up. Click: folder opens into a window with the loot list.', size=20, fam=MONO, fill=INK_SOFT)
end()

# 5. LVL 4 — Games (pink CRT)
fx, fy = at(4)
frame(fx, fy, MW, MH, 'LVL 4 — Games I made', bg=LILAC)
hud(fx, fy, MW, 4)
chip(fx + 80, fy + 110, 'LEVEL 04')
text(fx + 80, fy + 250, 'Games', size=130, fam=DISPLAY, weight=900, ls=-5)
text(fx + 80, fy + 330, 'I made', size=110, fam=SERIF, italic=True, fill=HOT)
img(os.path.join(CUT, 'pink-computer.png'), fx + 560, fy + 150, 720, 720)
out.append(f'<clipPath id="crt"><rect x="{fx + 742}" y="{fy + 262}" width="344" height="262" rx="24"/></clipPath>')
img(os.path.join(GAMES, 'yoru.png'), fx + 742, fy + 262, 344, 262, clip='crt')
for k, (g, on) in enumerate([('Yoru', True), ('Friday Night Rides', False), ('60 Knots', False)]):
  gy = fy + 440 + k * 76
  rect(fx + 80, gy, 380, 60, INK if on else WHITE, r=30)
  text(fx + 110, gy + 39, ('▶  ' if on else '    ') + g, size=22, fam=BODY, weight=600, fill=WHITE if on else INK)
text(fx + 90, fy + 720, 'playable right here!', size=44, fam=HAND, weight=600, rot=-4)
img(os.path.join(CHAR, 'pose-play.png'), fx + 1190, fy + 420, 250, 448)
end()

# 6. LVL 5 — Side quests (Paint window)
fx, fy = at(5)
frame(fx, fy, MW, MH, 'LVL 5 — Side quests')
hud(fx, fy, MW, 5)
chip(fx + 80, fy + 110, 'LEVEL 05')
text(fx + 80, fy + 250, 'Side', size=130, fam=DISPLAY, weight=900, ls=-5)
text(fx + 400, fy + 250, 'quests', size=130, fam=SERIF, italic=True, fill=HOT)
wx, wy = fx + 80, fy + 300
shadow_rect(wx, wy, 860, 540, WHITE, r=10)
rect(wx, wy, 860, 44, '#F3E7A8', r=10)
text(wx + 18, wy + 30, 'trakaboo.mp4 - Paint', size=20, fam=MONO)
for k, m in enumerate(['File', 'Edit', 'View', 'Image', 'Help']):
  text(wx + 18 + k * 80, wy + 76, m, size=18, fam=MONO)
for k in range(10):
  rect(wx + 18 + (k % 2) * 46, wy + 100 + (k // 2) * 46, 40, 40, PAPER if k != 4 else FUR, r=4, stroke='#0000001f', sw=1.5)
rect(wx + 130, wy + 100, 700, 360, BLUSH, r=4)
rect(wx + 380, wy + 130, 190, 310, WHITE, r=28, extra='filter="url(#soft)"')
text(wx + 400, wy + 180, 'Trakaboo 👀', size=20, fam=DISPLAY, weight=800, fill=HOT)
for k in range(4):
  rect(wx + 400, wy + 200 + k * 52, 150, 40, PAPER, r=10)
for k, c in enumerate([HOT, FUR, LILAC, KEY, SKY, COBALT, INK, WHITE, '#F3E7A8', BLUSH]):
  rect(wx + 130 + k * 36, wy + 480, 30, 30, c, r=4, stroke='#0000001f', sw=1.5)
for k, (t, s) in enumerate([('Yair Nitzani Music', 'catalog · quotes · AI search'), ('Trakaboo', 'expense tracker PWA'), ('Skills Router', 'events → Claude Skills')]):
  cy_ = fy + 330 + k * 170
  rect(fx + 990, cy_, 370, 140, WHITE if k else INK, r=24)
  text(fx + 1020, cy_ + 62, t, size=34, fam=SERIF, italic=True, fill=INK if k else WHITE)
  text(fx + 1020, cy_ + 100, s, size=18, fam=MONO, fill=INK_SOFT if k else '#FFFFFFAA')
end()

# 7. BOSS — Contact
fx, fy = at(6)
frame(fx, fy, MW, MH, 'BOSS — Contact', bg=INK)
hud(fx, fy, MW, 5, dark=True)
chip(fx + 80, fy + 110, 'FINAL BOSS', fill=HOT)
text(fx + 80, fy + 270, 'Let’s build', size=150, fam=DISPLAY, weight=900, ls=-6, fill=WHITE)
text(fx + 80, fy + 410, 'something.', size=150, fam=SERIF, italic=True, fill=FUR)
img(os.path.join(CUT, 'chrome-star.png'), fx + 1120, fy + 90, 260, 260, rot=14)
text(fx + 80, fy + 500, 'THE HIRING PIPELINE  HP 100/100', size=16, fam=PIXEL, fill=WHITE)
rect(fx + 80, fy + 516, 640, 14, '#FFFFFF22', r=7)
rect(fx + 80, fy + 516, 640, 14, KEY, r=7)
for k, (m, d) in enumerate([('Download save file', '40'), ('Send email', '30'), ('Call', '20'), ('LinkedIn', '20'), ('GitHub', '15'), ('itch.io', '15')]):
  bx, by = fx + 80 + (k % 3) * 420, fy + 590 + (k // 3) * 110
  rect(bx, by, 390, 84, HOT if k == 0 else '#FFFFFF14', r=42, stroke='#FFFFFF33', sw=1.5)
  text(bx + 32, by + 52, m, size=26, fam=DISPLAY, weight=700, fill=WHITE)
  text(bx + 358, by + 52, f'{d} DMG', size=14, fam=PIXEL, fill=WHITE, anchor='end', opacity=0.8)
text(fx + 1360, fy + 860, 'glass pills · chrome · no ink borders', size=20, fam=MONO, fill='#FFFFFF88', anchor='end')
end()

# 8. Notes frame
fx, fy = at(7)
frame(fx, fy, MW, MH, 'Motion & interaction notes', bg=WHITE)
NOTES = [
  ('Cursor', 'The fur cursor replaces the system pointer on desktop; it squishes on click.'),
  ('START', 'The glass pill wobbles like jelly on hover; pressing it zooms the camera into LVL 1.'),
  ('Scroll', 'Each level header slides in on a long ease; props float on parallax at different depths.'),
  ('Receipt', 'Prints line by line (typewriter) as it enters the screen.'),
  ('Keycaps', 'Press sinks 6px with a soft shadow change; equipped keys stay down.'),
  ('Folders', 'Papers peek up on hover; click opens a desktop window with the loot.'),
  ('CRT', 'Channel-switch flicker between games; PLAY opens the itch.io build in the screen.'),
  ('Paint', 'The trailer draws itself in, like someone painting live in MS Paint.'),
  ('Boss', 'Every contact move deals damage; at 0 HP the star bursts into confetti.'),
]
for k, (t, d) in enumerate(NOTES):
  ny = fy + 110 + k * 84
  text(fx + 80, ny, t, size=30, fam=SERIF, italic=True, fill=HOT)
  text(fx + 300, ny, d, size=22, fam=BODY, fill=INK)
end()

H = at(7)[1] + MH + 160

svg = (
  f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
  '<defs><filter id="sticker" x="-15%" y="-5%" width="130%" height="110%"><feMorphology in="SourceAlpha" operator="dilate" radius="7" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="w"/><feDropShadow in="w" dx="0" dy="14" stdDeviation="16" flood-color="#3A2A20" flood-opacity="0.18" result="ws"/><feMerge><feMergeNode in="ws"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="soft" x="-20%" y="-20%" width="140%" height="160%">'
  '<feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#3A2A20" flood-opacity="0.14"/></filter></defs>'
  f'<rect width="{W}" height="{H}" fill="{PAPER}"/>' + '\n'.join(out) + '</svg>'
)
dest = os.path.join(HERE, 'portfolio-board.svg')
with open(dest, 'w') as f:
  f.write(svg)
print(dest, f'{len(svg) / 1e6:.1f} MB', f'{W}x{H}')
