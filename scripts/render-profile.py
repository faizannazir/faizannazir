"""Render the original README artwork. Requires Pillow 13.0.0; no remote assets."""
from pathlib import Path
import math
from functools import cache
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / 'assets'
FONT_DIR = Path('/System/Library/Fonts/Supplemental')

@cache
def font(size, bold=False):
    # Set PROFILE_FONT_DIR for a non-macOS font directory with DejaVu Sans.
    import os
    folder = Path(os.environ.get('PROFILE_FONT_DIR', FONT_DIR))
    candidates = ['Arial Bold.ttf', 'DejaVuSans-Bold.ttf'] if bold else ['Arial.ttf', 'DejaVuSans.ttf']
    for name in candidates:
        if (folder / name).exists():
            return ImageFont.truetype(str(folder / name), size)
    return ImageFont.load_default(size=size)

BG, INK, MUTED, CYAN, COPPER = '#091421', '#f3f1eb', '#acbdc9', '#85e0e0', '#ffb77b'

def base(height):
    im = Image.new('RGB', (1040, height), BG)
    d = ImageDraw.Draw(im)
    for x in range(12, 1040, 24):
        for y in range(12, height, 24):
            d.point((x, y), fill='#243849')
    return im, d

def banner(t):
    im, d = base(320)
    d.text((42, 29), 'FAIZAN NAZIR', font=font(18, True), fill=CYAN)
    d.text((40, 73), 'Software meets hardware.', font=font(52, True), fill=INK)
    d.text((43, 151), '.NET / React / Next.js / Embedded Systems / Local AI', font=font(22), fill=MUTED)
    d.text((43, 263), 'FROM AN API RESPONSE TO A GPIO PIN.', font=font(14), fill=COPPER)
    d.rounded_rectangle((778, 202, 992, 293), 7, fill='#142a3a', outline='#4f697e', width=2)
    for x in range(790, 990, 19):
        d.line((x, 194, x, 202), fill=MUTED, width=5)
        d.line((x, 293, x, 303), fill=MUTED, width=5)
    d.text((885, 244), 'FN / ESP32', font=font(23, True), fill=CYAN, anchor='mm')
    d.line([(43, 223), (610, 223), (650, 248), (778, 248)], fill='#385362', width=2)
    px = 43 + 715 * t
    py = 223 if px < 610 else 223 + min(25, (px - 610) * 25 / 40)
    d.ellipse((px-4, py-4, px+4, py+4), fill=CYAN)
    return im

TECH = [('C#', '#b7a9ff'), ('.NET', '#c4b7ff'), ('React', '#85e0e0'), ('Next.js', '#e0e4ea'), ('TS', '#8bbdff'),
        ('C++', '#b1c7f1'), ('ESP32', '#ffb77b'), ('SQL', '#f3d58b'), ('Flutter', '#87d3f7'),
        ('Py', '#e7d488'), ('Git', '#f49d89'), ('Kotlin', '#d8acf0'), ('Arduino', '#8cd6c3'), ('MCP', '#d0c7f7'), ('AI', '#f3d3a1'), ('Codex', '#c6e2da'), ('Claude', '#eab59b'), ('Cursor', '#c2cbd9')]

def stack(t):
    im, d = base(430)
    d.text((30, 22), 'A hands-on stack.', font=font(24, True), fill=INK)
    d.text((1010, 32), 'Grab. Throw. Kick. Play on my portfolio.', font=font(15), fill=MUTED, anchor='rm')
    for i, (label, color) in enumerate(TECH):
        col, row = i % 7, i // 7
        x = 85 + col * 145 + 9 * math.sin(t * 2 * math.pi + i)
        y = 125 + row * 116 - 20 * abs(math.sin(t * 2 * math.pi + i * .7))
        r = 40
        d.ellipse((x-r+4, y-r+8, x+r+4, y+r+8), fill='#050e16')
        d.ellipse((x-r, y-r, x+r, y+r), fill=color, outline='#d8e4eb', width=1)
        d.arc((x-r+5, y-r+5, x+r-5, y+r-5), 210, 290, fill='#edf6f7', width=2)
        d.text((x, y), label, font=font(17 if len(label)>5 else 20), fill=BG, anchor='mm')
    return im

OUT.mkdir(exist_ok=True)
for name, render in [('banner', banner), ('tech-balls', stack)]:
    frames = [render(i / 48) for i in range(48)]
    frames[0].save(OUT / f'{name}.png', optimize=True)
    frames[0].save(OUT / f'{name}.gif', save_all=True, append_images=frames[1:], duration=80, loop=0, optimize=True)
    print(name, (OUT / f'{name}.gif').stat().st_size, 'bytes')
