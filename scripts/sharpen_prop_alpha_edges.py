"""Sharpen the soft alpha edges of a cut-out prop PNG.

Some AI-generated props come with very wide feathered silhouettes and/or a
semi-transparent body (alpha 190-240), which reads as a blurry outline and a
washed-out prop in the scene. This remaps the alpha channel with a smoothstep
curve: alpha at or below LO becomes fully transparent, at or above HI becomes
fully opaque, and the narrow range in between keeps a smooth anti-aliased
transition. Colour channels are untouched.

Usage:
    python scripts/sharpen_prop_alpha_edges.py [--lo N] [--hi N] <image.png> [more.png ...]

Defaults: --lo 72 --hi 176. Overwrites the input file(s); git is the backup.
"""

import sys

from PIL import Image

LO = 72
HI = 176


def smoothstep(edge0, edge1, value):
    t = (value - edge0) / (edge1 - edge0)
    t = 0.0 if t < 0.0 else 1.0 if t > 1.0 else t
    return t * t * (3.0 - 2.0 * t)


def sharpen_alpha(path, lo=LO, hi=HI):
    im = Image.open(path).convert("RGBA")
    lut = [int(round(255 * smoothstep(lo, hi, a))) for a in range(256)]
    r, g, b, a = im.split()
    a = a.point(lut)
    Image.merge("RGBA", (r, g, b, a)).save(path)
    changed = sum(1 for v in range(256) if lut[v] != v)
    print(f"{path}: alpha remapped (lo={lo}, hi={hi}, {changed}/256 LUT entries changed)")


if __name__ == "__main__":
    args = sys.argv[1:]
    lo, hi = LO, HI
    if "--lo" in args:
        i = args.index("--lo")
        lo = int(args[i + 1])
        del args[i : i + 2]
    if "--hi" in args:
        i = args.index("--hi")
        hi = int(args[i + 1])
        del args[i : i + 2]
    if not args:
        sys.exit(__doc__)
    for p in args:
        sharpen_alpha(p, lo, hi)
