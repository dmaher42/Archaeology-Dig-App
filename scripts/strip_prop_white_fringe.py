"""Remove white/cream fringe from a cut-out prop PNG.

AI-generated props are often cut out from a white background, leaving a
washed-out ring where the art fades to white at the silhouette edge. This
fades those pixels out: any opaque pixel that is close to the transparent
edge, very light, and low-saturation gets its alpha reduced (and its colour
pulled slightly toward a sand tone so partially-kept pixels don't glow).

Usage:
    python scripts/strip_prop_white_fringe.py <image.png> [more.png ...]

Overwrites the input file(s); rely on git for the original.
"""

import sys
from collections import deque

from PIL import Image

# Effect only applies within this many pixels of a transparent pixel.
EDGE_BAND = 10
# Luminance ramp: no effect at/below LUM_LO, full effect at/above LUM_HI.
# The fringe is pale cream/tan, so it is keyed on lightness alone — dark
# outlines, poles and ropes at the edge are untouched.
LUM_LO = 160.0
LUM_HI = 215.0
# Colour that partially-faded pixels are pulled toward (mid sand tone).
SAND = (185, 160, 125)
# Universal 1px edge feather to anti-alias the hard binary cutout mask.
FEATHER_ALPHA = 0.6


def clamp01(v):
    return 0.0 if v < 0.0 else 1.0 if v > 1.0 else v


def strip_fringe(path):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()

    # Multi-source BFS: distance from each opaque pixel to nearest transparency.
    dist = [[EDGE_BAND + 1] * w for _ in range(h)]
    queue = deque()
    for y in range(h):
        for x in range(w):
            if px[x, y][3] == 0:
                dist[y][x] = 0
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        d = dist[y][x]
        if d >= EDGE_BAND:
            continue
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and dist[ny][nx] > d + 1:
                dist[ny][nx] = d + 1
                queue.append((nx, ny))

    changed = 0
    for y in range(h):
        for x in range(w):
            d = dist[y][x]
            r, g, b, a = px[x, y]
            if a == 0 or d > EDGE_BAND:
                continue
            lum = (r + g + b) / 3.0
            whiteness = clamp01((lum - LUM_LO) / (LUM_HI - LUM_LO))
            proximity = clamp01((EDGE_BAND + 1 - d) / EDGE_BAND) ** 0.7
            k = whiteness * proximity
            if k <= 0.0 and d > 1:
                continue
            new_a = int(round(a * (1.0 - k)))
            if d == 1:
                new_a = int(round(new_a * FEATHER_ALPHA))
            # Pull the surviving colour toward sand so the remaining ring
            # doesn't read as a pale glow.
            t = k * 0.6
            px[x, y] = (
                int(round(r + (SAND[0] - r) * t)),
                int(round(g + (SAND[1] - g) * t)),
                int(round(b + (SAND[2] - b) * t)),
                new_a,
            )
            changed += 1

    im.save(path)
    print(f"{path}: adjusted {changed} px")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for p in sys.argv[1:]:
        strip_fringe(p)
