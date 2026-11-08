"""Generates the luxury black-and-gold DEMO artwork (SVG). Replace any file in public/assets with a real photo of the same name/purpose
(and update src/assets.js if the extension changes). Run: python scripts/make_placeholders.py"""
import math
from pathlib import Path

GOLD, IVORY, BLACK, RED = "#C5A572", "#F7F3ED", "#171717", "#8E2638"
ROOT = Path(__file__).resolve().parents[1] / "public" / "assets"


def strands(w, h, kind, seed):
    out = []
    n = 26
    for i in range(n):
        t = i / (n - 1)
        x0 = w * (0.18 + 0.64 * t)
        amp = {"straight": 6, "wave": 38, "deep": 62, "curly": 90, "bob": 30, "long": 45}[kind] * (0.6 + 0.8 * ((i * seed) % 7) / 7)
        freq = {"straight": 1.2, "wave": 2.2, "deep": 3.4, "curly": 6.0, "bob": 2.0, "long": 2.6}[kind]
        top, bottom = h * 0.12, h * (0.62 if kind == "bob" else 0.92)
        pts = []
        steps = 60
        for s in range(steps + 1):
            u = s / steps
            y = top + (bottom - top) * u
            x = x0 + amp * math.sin(u * freq * math.pi * 2 + i * 0.35) * (0.25 + u)
            pts.append(f"{x:.1f},{y:.1f}")
        op = 0.25 + 0.6 * ((i * 13) % 10) / 10
        sw = 0.8 + 1.4 * ((i * 7) % 5) / 5
        out.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{GOLD}" stroke-opacity="{op:.2f}" stroke-width="{sw:.1f}" stroke-linecap="round"/>')
    return "\n".join(out)


def svg(w, h, label, kind, seed=3, lips=False):
    lip = ""
    if lips:
        cx, cy = w / 2, h * 0.72
        lip = f'<path d="M{cx-34},{cy} Q{cx-12},{cy-16} {cx},{cy-6} Q{cx+12},{cy-16} {cx+34},{cy} Q{cx},{cy+24} {cx-34},{cy}Z" fill="{RED}" opacity="0.9"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{label} (demonstration artwork)">
<defs><radialGradient id="g" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#2a2622"/><stop offset="1" stop-color="{BLACK}"/></radialGradient></defs>
<rect width="{w}" height="{h}" fill="url(#g)"/>
<rect x="14" y="14" width="{w-28}" height="{h-28}" fill="none" stroke="{GOLD}" stroke-opacity="0.35"/>
{strands(w, h, kind, seed)}
{lip}
<text x="{w/2}" y="{h-34}" text-anchor="middle" font-family="Georgia,serif" font-size="{max(14, w//34)}" letter-spacing="4" fill="{IVORY}" opacity="0.85">{label.upper()}</text>
<text x="{w/2}" y="{h-16}" text-anchor="middle" font-family="Arial,sans-serif" font-size="{max(9, w//70)}" letter-spacing="3" fill="{GOLD}" opacity="0.7">DEMO IMAGE</text>
</svg>'''


JOBS = {
    "hero/hero-main": (1600, 800, "Hair by Neo Malapane", "long", 3, True),
    "hero/hero-mobile": (800, 1000, "Your crown", "long", 5, True),
    "products/brazilian-straight": (800, 800, "Brazilian Straight", "straight", 2, False),
    "products/body-wave": (800, 800, "Body Wave", "wave", 4, False),
    "products/deep-wave": (800, 800, "Deep Wave", "deep", 6, False),
    "products/curly": (800, 800, "Curly", "curly", 3, False),
    "products/lace-frontal": (800, 800, "Lace Frontal", "straight", 5, False),
    "products/extensions": (800, 800, "Extensions", "long", 2, False),
    "gallery/sleek-frontal": (800, 1000, "Sleek Frontal", "straight", 3, True),
    "gallery/straight": (800, 1000, "Straight", "straight", 6, False),
    "gallery/body-wave": (800, 1000, "Body Wave", "wave", 2, True),
    "gallery/curly": (800, 1000, "Curly", "curly", 5, False),
    "gallery/bob": (800, 1000, "Bob", "bob", 4, True),
    "gallery/long-flowing": (800, 1000, "Long & Flowing", "long", 6, False),
    "services/installation": (1000, 750, "Installations", "straight", 3, False),
    "services/styling": (1000, 750, "Styling", "wave", 5, False),
    "services/consultation": (1000, 750, "Consultation", "long", 2, False),
    "about/salon": (1000, 1250, "The Salon", "long", 4, False),
    "about/neo": (1000, 1250, "Neo Malapane", "wave", 3, True),
    "promotional/booking-banner": (1600, 600, "Book your appointment", "long", 5, True),
    "promotional/collection-banner": (1600, 600, "The Collection", "wave", 2, False),
}
for name, (w, h, label, kind, seed, lips) in JOBS.items():
    p = ROOT / f"{name}.svg"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(svg(w, h, label, kind, seed, lips), encoding="utf-8")
print(f"wrote {len(JOBS)} placeholder images")
