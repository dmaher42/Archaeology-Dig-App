from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "assets" / "expedition"
SCALE = 3


LOESS = (191, 145, 77, 255)
LOESS_LIGHT = (224, 194, 132, 255)
LOESS_DARK = (112, 74, 38, 255)
EARTH = (153, 103, 55, 255)
INK = (38, 31, 24, 255)
BRONZE = (126, 92, 45, 255)
BRONZE_LIGHT = (208, 159, 74, 255)
JADE = (66, 132, 112, 255)
JADE_LIGHT = (124, 201, 169, 255)
LAMP = (244, 190, 91, 255)
SILK = (226, 205, 158, 255)


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save_png(image: Image.Image, path: Path) -> None:
    ensure_dir(path.parent)
    image.save(path, "PNG", optimize=True)


def write_json(path: Path, data: dict) -> None:
    ensure_dir(path.parent)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def rgba(size: tuple[int, int], fill=(0, 0, 0, 0), aa: bool = True) -> Image.Image:
    factor = SCALE if aa else 1
    return Image.new("RGBA", (size[0] * factor, size[1] * factor), fill)


def finish(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    if image.size != size:
        image = image.resize(size, Image.Resampling.LANCZOS)
    return image.filter(ImageFilter.UnsharpMask(radius=0.55, percent=65, threshold=3))


def box(values: tuple[float, float, float, float]) -> tuple[int, int, int, int]:
    return tuple(int(round(v * SCALE)) for v in values)


def pts(values: list[tuple[float, float]]) -> list[tuple[int, int]]:
    return [(int(round(x * SCALE)), int(round(y * SCALE))) for x, y in values]


def rect(draw: ImageDraw.ImageDraw, values, fill, outline=None, width=1, radius=0) -> None:
    if radius:
        draw.rounded_rectangle(box(values), radius=int(radius * SCALE), fill=fill, outline=outline, width=max(1, int(width * SCALE)))
    else:
        draw.rectangle(box(values), fill=fill, outline=outline, width=max(1, int(width * SCALE)))


def ellipse(draw: ImageDraw.ImageDraw, values, fill=None, outline=None, width=1) -> None:
    draw.ellipse(box(values), fill=fill, outline=outline, width=max(1, int(width * SCALE)))


def line(draw: ImageDraw.ImageDraw, values, fill, width=1) -> None:
    draw.line(pts(values), fill=fill, width=max(1, int(width * SCALE)))


def polygon(draw: ImageDraw.ImageDraw, values, fill, outline=None) -> None:
    draw.polygon(pts(values), fill=fill)
    if outline:
        draw.line(pts(values + [values[0]]), fill=outline, width=max(1, int(2 * SCALE)))


def add_grain(image: Image.Image, alpha: int = 14, seed: int = 1) -> Image.Image:
    rng = random.Random(seed)
    base = image.convert("RGBA")
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")
    step = max(2, base.width // 600)
    for y in range(0, base.height, step):
        for x in range(0, base.width, step):
            value = rng.randint(-alpha, alpha)
            if value >= 0:
                color = (255, 244, 210, value)
            else:
                color = (42, 28, 16, -value)
            draw.rectangle([x, y, x + step - 1, y + step - 1], fill=color)
    overlay = overlay.filter(ImageFilter.GaussianBlur(0.35))
    overlay_alpha = ImageChops.multiply(overlay.getchannel("A"), base.getchannel("A"))
    overlay.putalpha(overlay_alpha)
    return Image.alpha_composite(base, overlay)


def vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    image = Image.new("RGBA", size, (0, 0, 0, 255))
    draw = ImageDraw.Draw(image)
    for y in range(size[1]):
        t = y / max(1, size[1] - 1)
        color = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3)) + (255,)
        draw.line([(0, y), (size[0], y)], fill=color)
    return image


def soft_glow(size: tuple[int, int], shapes: list[tuple[str, tuple[int, int, int, int], tuple[int, int, int, int]]], blur: int) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer, "RGBA")
    for kind, bounds, fill in shapes:
        if kind == "ellipse":
            draw.ellipse(bounds, fill=fill)
        elif kind == "rect":
            draw.rectangle(bounds, fill=fill)
        elif kind == "polygon":
            draw.polygon(bounds, fill=fill)
    return layer.filter(ImageFilter.GaussianBlur(blur))


def draw_ram_layers(draw: ImageDraw.ImageDraw, x0: float, y0: float, x1: float, y1: float, seed: int) -> None:
    rng = random.Random(seed)
    y = y0 + 10
    while y < y1 - 8:
        jitter = rng.uniform(-3, 3)
        line(draw, [(x0 + 6, y + jitter), (x1 - 6, y + rng.uniform(-3, 3))], (92, 59, 31, 80), 2)
        y += rng.uniform(22, 34)
    for _ in range(34):
        x = rng.uniform(x0 + 8, x1 - 8)
        y = rng.uniform(y0 + 8, y1 - 8)
        r = rng.uniform(1, 4)
        ellipse(draw, (x - r, y - r, x + r, y + r), (235, 204, 139, rng.randint(22, 52)))


def make_far_valley() -> Image.Image:
    size = (2048, 520)
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image, "RGBA")
    rng = random.Random(11)
    for layer, alpha in enumerate([52, 72, 95]):
        y_base = 150 + layer * 48
        points = [(-80, size[1])]
        for x in range(-80, size[0] + 160, 170):
            points.append((x, y_base + math.sin(x * 0.008 + layer) * 28 + rng.randint(-12, 12)))
        points.append((size[0] + 80, size[1]))
        draw.polygon(points, fill=(131, 113, 78, alpha))
    river = [(0, 336), (260, 310), (570, 338), (860, 304), (1220, 332), (1540, 300), (2048, 326),
             (2048, 392), (1530, 362), (1210, 396), (870, 360), (560, 392), (250, 360), (0, 388)]
    draw.polygon(river, fill=(134, 164, 151, 118))
    for y in range(250, 500, 34):
        draw.line([(0, y), (2048, y + math.sin(y) * 10)], fill=(216, 184, 112, 55), width=2)
    for x in range(-70, 2050, 130):
        draw.line([(x, 265), (x + 220, 506)], fill=(92, 70, 45, 36), width=2)
    return add_grain(image, 8, 12)


def make_path_strip() -> Image.Image:
    size = (512, 140)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    polygon(draw, [(0, 48), (70, 42), (155, 50), (255, 44), (350, 50), (442, 43), (512, 48), (512, 140), (0, 140)], (175, 126, 67, 245))
    rect(draw, (0, 78, 512, 140), (129, 86, 45, 235))
    for x in range(-40, 550, 86):
        line(draw, [(x, 68), (x + 130, 62)], (91, 60, 35, 70), 3)
        line(draw, [(x + 12, 100), (x + 118, 92)], (229, 196, 126, 55), 2)
    rng = random.Random(22)
    for _ in range(90):
        x = rng.randint(0, 511)
        y = rng.randint(48, 132)
        r = rng.randint(1, 3)
        ellipse(draw, (x - r, y - r, x + r, y + r), rng.choice([(88, 59, 38, 95), (224, 196, 124, 80), (77, 91, 55, 70)]))
    for x in range(18, 512, 74):
        line(draw, [(x, 48), (x - 5, 28)], (96, 116, 63, 130), 2)
        line(draw, [(x + 3, 49), (x + 10, 30)], (123, 136, 70, 118), 2)
    return finish(image, size)


def make_watchtower() -> Image.Image:
    size = (512, 768)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    rect(draw, (173, 294, 339, 716), (157, 103, 52, 245), (78, 50, 27, 230), 3, 8)
    draw_ram_layers(draw, 173, 294, 339, 716, 31)
    rect(draw, (121, 238, 391, 302), (95, 59, 30, 245), (46, 32, 20, 230), 3, 8)
    for x in [142, 192, 242, 292, 342]:
        rect(draw, (x, 214, x + 24, 302), (91, 57, 30, 238), (43, 28, 18, 220), 2)
    polygon(draw, [(102, 214), (256, 138), (410, 214), (380, 244), (132, 244)], (79, 44, 28, 250), (37, 24, 16, 240))
    polygon(draw, [(136, 176), (256, 116), (376, 176), (360, 196), (152, 196)], (119, 64, 33, 245), (52, 32, 20, 220))
    rect(draw, (217, 405, 295, 710), (70, 43, 25, 210), (41, 27, 18, 210), 2)
    for y in range(344, 688, 70):
        rect(draw, (184, y, 328, y + 14), (94, 58, 31, 230), (47, 30, 19, 180), 1)
    ellipse(draw, (358, 286, 390, 334), (231, 163, 61, 185), (90, 58, 26, 220), 2)
    line(draw, [(374, 244), (374, 286)], (41, 26, 15, 190), 2)
    rect(draw, (142, 710, 370, 742), (114, 75, 40, 235), (58, 39, 24, 220), 3, 4)
    return finish(add_grain(image, 8, 32), size)


def make_broken_wall() -> Image.Image:
    size = (768, 512)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    left = [(44, 168), (286, 126), (316, 432), (38, 432)]
    right = [(458, 132), (724, 168), (730, 432), (424, 432)]
    polygon(draw, left, (159, 105, 55, 245), (77, 50, 28, 220))
    polygon(draw, right, (167, 112, 60, 245), (77, 50, 28, 220))
    draw_ram_layers(draw, 46, 150, 312, 432, 41)
    draw_ram_layers(draw, 428, 146, 724, 432, 42)
    for beam_y in [214, 292, 366]:
        rect(draw, (224, beam_y, 528, beam_y + 18), (87, 54, 29, 230), (44, 29, 18, 190), 2, 2)
    rng = random.Random(43)
    for _ in range(45):
        cx = rng.randint(210, 556)
        cy = rng.randint(394, 464)
        w = rng.randint(18, 48)
        h = rng.randint(10, 26)
        polygon(draw, [(cx - w, cy), (cx, cy - h), (cx + w, cy + 4), (cx + w // 2, cy + h)], (128, 82, 45, 225), (68, 45, 27, 180))
    rect(draw, (112, 432, 656, 462), (111, 70, 38, 150), None, 1, 10)
    return finish(add_grain(image, 9, 44), size)


def make_imperial_gate(open_overlay: bool = False) -> Image.Image:
    size = (768, 900)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    if open_overlay:
        glow = soft_glow((size[0] * SCALE, size[1] * SCALE), [
            ("ellipse", box((220, 235, 548, 810)), (255, 194, 88, 150)),
            ("rect", box((300, 310, 468, 812)), (255, 216, 122, 150)),
        ], 32 * SCALE)
        image = Image.alpha_composite(image, glow)
        draw = ImageDraw.Draw(image, "RGBA")
        polygon(draw, [(246, 316), (340, 350), (336, 780), (230, 808)], (91, 48, 28, 215), (42, 28, 18, 200))
        polygon(draw, [(522, 316), (428, 350), (432, 780), (538, 808)], (91, 48, 28, 215), (42, 28, 18, 200))
        rect(draw, (302, 777, 466, 820), (235, 180, 96, 90), None, 1, 14)
        rect(draw, (188, 690, 575, 730), (155, 99, 42, 145), (75, 48, 24, 145), 3, 6)
        return finish(image, size)
    rect(draw, (91, 280, 214, 820), (153, 100, 54, 245), (72, 48, 28, 230), 4, 8)
    rect(draw, (554, 280, 677, 820), (153, 100, 54, 245), (72, 48, 28, 230), 4, 8)
    rect(draw, (198, 330, 570, 824), (117, 67, 38, 250), (43, 28, 18, 235), 5, 10)
    for x in [228, 292, 356, 420, 484]:
        line(draw, [(x, 346), (x, 806)], (57, 35, 23, 145), 4)
    for x in range(230, 540, 64):
        for y in range(410, 790, 74):
            ellipse(draw, (x, y, x + 16, y + 16), BRONZE_LIGHT, (78, 50, 24, 200), 1)
    rect(draw, (176, 515, 592, 560), (154, 106, 45, 245), (63, 40, 21, 220), 4, 5)
    rect(draw, (320, 558, 448, 634), (162, 112, 46, 245), (65, 43, 23, 220), 4, 8)
    for y in [248, 208]:
        polygon(draw, [(48, y + 52), (384, y - 38), (720, y + 52), (680, y + 84), (88, y + 84)], (83, 45, 28, 250), (40, 25, 16, 240))
    for bx in [118, 614]:
        rect(draw, (bx, 255, bx + 46, 530), (118, 31, 28, 220), (53, 22, 18, 190), 2)
    rect(draw, (148, 820, 620, 856), (123, 79, 41, 245), (65, 42, 25, 220), 4, 5)
    draw_ram_layers(draw, 92, 284, 214, 818, 51)
    draw_ram_layers(draw, 555, 284, 676, 818, 52)
    return finish(add_grain(image, 8, 53), size)


def make_archive_interior() -> Image.Image:
    size = (2048, 720)
    image = vertical_gradient(size, (30, 38, 32), (82, 62, 38))
    draw = ImageDraw.Draw(image, "RGBA")
    for y in range(135, 560, 54):
        draw.line([(0, y), (2048, y + math.sin(y * 0.04) * 14)], fill=(142, 103, 64, 72), width=3)
    for x in range(90, 1960, 270):
        draw.rectangle([x, 220, x + 170, 520], fill=(73, 46, 27, 175), outline=(138, 91, 44, 150), width=4)
        for y in [286, 362, 438]:
            draw.rectangle([x - 12, y, x + 182, y + 13], fill=(126, 78, 37, 190))
        for i in range(6):
            bx = x + 12 + i * 24
            slip_y = 240 + (i % 3) * 44
            draw.rounded_rectangle([bx, slip_y, bx + 18, slip_y + 45 + (i % 2) * 18], radius=3, fill=(174, 133, 73, 185))
    for x in [330, 960, 1580]:
        glow = soft_glow(size, [("ellipse", (x - 95, 175, x + 95, 345), (244, 184, 82, 76))], 34)
        image = Image.alpha_composite(image, glow)
        draw = ImageDraw.Draw(image, "RGBA")
        draw.ellipse([x - 18, 235, x + 18, 276], fill=(213, 143, 49, 220), outline=(65, 40, 22, 180), width=3)
        draw.line([x, 170, x, 235], fill=(70, 43, 24, 150), width=3)
    draw.polygon([(0, 565), (2048, 540), (2048, 720), (0, 720)], fill=(54, 43, 32, 245))
    for x in range(-50, 2100, 140):
        draw.line([(x, 552), (x + 112, 720)], fill=(128, 97, 58, 70), width=2)
    return add_grain(image.convert("RGBA"), 8, 61).convert("RGB")


def make_archive_props() -> Image.Image:
    size = (1024, 768)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    # hanging lamp
    line(draw, [(140, 70), (140, 154)], (54, 35, 21, 170), 3)
    ellipse(draw, (102, 154, 178, 230), (191, 126, 44, 235), (73, 45, 23, 220), 3)
    glow = soft_glow((size[0] * SCALE, size[1] * SCALE), [("ellipse", box((66, 128, 214, 278)), (244, 185, 90, 80))], 18 * SCALE)
    image = Image.alpha_composite(image, glow)
    draw = ImageDraw.Draw(image, "RGBA")
    # jars
    for x, y, w, h in [(320, 472, 86, 148), (410, 490, 70, 125), (502, 460, 94, 162)]:
        ellipse(draw, (x, y + h - 22, x + w, y + h + 10), (60, 39, 24, 80))
        rect(draw, (x + 12, y + 18, x + w - 12, y + h), (154, 103, 58, 240), (65, 43, 25, 220), 3, 24)
        ellipse(draw, (x + 20, y, x + w - 20, y + 36), (116, 75, 42, 240), (60, 39, 24, 200), 2)
    # shelf and slips
    rect(draw, (650, 170, 934, 248), (100, 61, 31, 235), (49, 31, 20, 220), 3, 8)
    rect(draw, (636, 246, 950, 272), (75, 46, 26, 245), (38, 25, 16, 220), 2, 4)
    for i in range(10):
        x = 672 + i * 21
        rect(draw, (x, 124 + (i % 2) * 7, x + 13, 210), (194, 143, 73, 230), (75, 49, 27, 130), 1, 3)
    # basket
    ellipse(draw, (122, 520, 272, 682), (132, 83, 42, 215), (62, 39, 23, 200), 3)
    for x in range(136, 260, 24):
        line(draw, [(x, 535), (x + 16, 668)], (229, 177, 88, 72), 2)
    # silk roll
    rect(draw, (664, 480, 908, 558), SILK, (91, 64, 38, 210), 3, 24)
    ellipse(draw, (630, 470, 700, 570), (186, 126, 62, 240), (75, 48, 28, 220), 3)
    ellipse(draw, (874, 470, 944, 570), (186, 126, 62, 240), (75, 48, 28, 220), 3)
    return finish(add_grain(image, 8, 63), size)


def draw_ding(draw: ImageDraw.ImageDraw, cx: float, cy: float, scale: float = 1.0) -> None:
    def t(x, y): return cx + x * scale, cy + y * scale
    polygon(draw, [t(-66, -18), t(66, -18), t(48, 50), t(-48, 50)], (104, 92, 61, 250), (45, 38, 27, 220))
    ellipse(draw, (cx - 76 * scale, cy - 42 * scale, cx + 76 * scale, cy + 0 * scale), (139, 113, 61, 250), (50, 40, 25, 230), 3)
    rect(draw, (cx - 54 * scale, cy - 34 * scale, cx + 54 * scale, cy - 12 * scale), (57, 77, 54, 120), None, 1, 8 * scale)
    for x in [-36, 0, 36]:
        ellipse(draw, (cx + (x - 10) * scale, cy + 4 * scale, cx + (x + 10) * scale, cy + 28 * scale), (54, 87, 61, 125), None, 1)
    for x in [-42, 0, 42]:
        line(draw, [t(x, 48), t(x - 8, 91)], (65, 53, 36, 235), 7 * scale)
    for x in [-74, 74]:
        ellipse(draw, (cx + (x - 18) * scale, cy - 52 * scale, cx + (x + 18) * scale, cy - 14 * scale), None, (72, 58, 35, 230), 6 * scale)


def make_bronze_vessel() -> Image.Image:
    size = (256, 256)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    draw_ding(draw, 128, 126, 0.9)
    return finish(add_grain(image, 7, 70), size)


def make_oracle_bone() -> Image.Image:
    size = (256, 192)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    polygon(draw, [(54, 76), (86, 32), (157, 22), (212, 54), (195, 128), (136, 160), (70, 142)], (218, 191, 142, 245), (94, 67, 43, 210))
    rng = random.Random(71)
    for _ in range(22):
        x = rng.randint(78, 190)
        y = rng.randint(50, 136)
        line(draw, [(x, y), (x + rng.randint(-18, 18), y + rng.randint(12, 30))], (91, 61, 37, 120), 1)
    for x in [102, 126, 154, 177]:
        line(draw, [(x, 64), (x + 8, 108)], (43, 31, 23, 115), 2)
        line(draw, [(x - 8, 86), (x + 10, 82)], (43, 31, 23, 95), 1)
    return finish(add_grain(image, 6, 72), size)


def make_bamboo_slips() -> Image.Image:
    size = (256, 256)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    for i in range(11):
        x = 72 + i * 11
        y0 = 50 + (i % 3) * 3
        rect(draw, (x, y0, x + 9, 202 - (i % 2) * 6), (190, 135, 66, 240), (78, 53, 30, 150), 1, 3)
        if i % 2 == 0:
            line(draw, [(x + 4, y0 + 28), (x + 5, y0 + 118)], (42, 35, 27, 90), 1)
    for y in [80, 174]:
        line(draw, [(58, y), (204, y + 6)], (67, 42, 24, 210), 4)
    ellipse(draw, (58, 190, 206, 218), (64, 41, 24, 65))
    return finish(add_grain(image, 6, 73), size)


def make_zhou_scroll() -> Image.Image:
    size = (256, 256)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    rect(draw, (56, 84, 200, 156), SILK, (92, 63, 36, 220), 2, 16)
    ellipse(draw, (38, 74, 76, 166), (164, 103, 53, 245), (76, 48, 28, 220), 2)
    ellipse(draw, (180, 74, 218, 166), (164, 103, 53, 245), (76, 48, 28, 220), 2)
    for x in [90, 112, 134, 156]:
        line(draw, [(x, 100), (x, 142)], (41, 34, 28, 85), 1)
    ellipse(draw, (118, 108, 142, 132), None, (51, 59, 45, 125), 2)
    return finish(add_grain(image, 5, 74), size)


def make_qin_coin() -> Image.Image:
    size = (192, 192)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    ellipse(draw, (34, 34, 158, 158), (139, 103, 49, 250), (57, 39, 22, 230), 4)
    rect(draw, (79, 79, 113, 113), (0, 0, 0, 0), (51, 35, 20, 220), 4, 2)
    ellipse(draw, (48, 48, 144, 144), None, (199, 148, 62, 95), 2)
    return finish(add_grain(image, 6, 75), size)


def make_qin_law_tablet() -> Image.Image:
    size = (256, 256)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    rect(draw, (64, 42, 174, 204), (139, 113, 78, 245), (61, 48, 35, 225), 3, 10)
    for y in range(76, 178, 21):
        line(draw, [(88, y), (152, y - 4)], (38, 31, 24, 105), 2)
    polygon(draw, [(146, 196), (180, 192), (168, 222)], (86, 67, 46, 220), (48, 37, 27, 180))
    # Include the coin beside the tablet so the in-game combined Qin evidence reads correctly.
    ellipse(draw, (154, 144, 222, 212), (139, 103, 49, 245), (57, 39, 22, 220), 3)
    rect(draw, (180, 170, 197, 187), (0, 0, 0, 0), (49, 35, 22, 200), 2, 1)
    return finish(add_grain(image, 6, 76), size)


def make_han_inventions() -> Image.Image:
    size = (320, 256)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    rect(draw, (132, 74, 222, 152), (164, 120, 58, 245), (60, 42, 24, 220), 3, 12)
    polygon(draw, [(177, 84), (202, 126), (162, 119)], (63, 48, 35, 245), (34, 28, 22, 200))
    rect(draw, (46, 116, 142, 174), (216, 198, 154, 240), (91, 68, 42, 185), 2, 8)
    for x in [58, 78, 98, 118]:
        line(draw, [(x, 128), (x + 60, 122)], (80, 61, 38, 55), 1)
    ellipse(draw, (214, 106, 292, 176), (213, 218, 202, 245), (76, 88, 82, 190), 3)
    ellipse(draw, (228, 115, 278, 154), (126, 176, 177, 95), None, 1)
    return finish(add_grain(image, 5, 77), size)


def make_archive_chest() -> Image.Image:
    size = (320, 256)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    rect(draw, (54, 96, 266, 202), (74, 29, 24, 250), (34, 20, 16, 230), 4, 12)
    rect(draw, (64, 70, 256, 124), (103, 38, 28, 250), (38, 22, 16, 230), 4, 18)
    for x in [74, 238]:
        rect(draw, (x, 78, x + 18, 196), BRONZE_LIGHT, (68, 45, 22, 220), 2, 4)
    rect(draw, (146, 124, 174, 164), BRONZE_LIGHT, (62, 42, 21, 220), 2, 4)
    for x in range(92, 224, 44):
        line(draw, [(x, 104), (x + 28, 92)], (174, 96, 57, 95), 2)
    return finish(add_grain(image, 6, 78), size)


def make_pedestal() -> Image.Image:
    size = (384, 320)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    glow = soft_glow((size[0] * SCALE, size[1] * SCALE), [("ellipse", box((70, 64, 314, 172)), (105, 211, 164, 90))], 16 * SCALE)
    image = Image.alpha_composite(image, glow)
    draw = ImageDraw.Draw(image, "RGBA")
    rect(draw, (56, 132, 328, 238), (126, 100, 68, 245), (52, 42, 32, 220), 4, 14)
    rect(draw, (36, 98, 348, 146), (156, 126, 82, 245), (58, 46, 32, 220), 4, 10)
    for i in range(4):
        x = 78 + i * 58
        rect(draw, (x, 106, x + 42, 134), (49, 74, 61, 215), (116, 220, 174, 140), 2, 6)
    for x in [104, 180, 256]:
        ellipse(draw, (x, 174, x + 42, 204), None, (71, 55, 38, 120), 2)
    rect(draw, (84, 238, 300, 268), (89, 69, 49, 235), (48, 38, 29, 200), 3, 5)
    return finish(add_grain(image, 6, 79), size)


def make_crossbow() -> Image.Image:
    size = (192, 192)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    rect(draw, (44, 90, 156, 108), (91, 55, 28, 245), (42, 27, 17, 210), 2, 4)
    line(draw, [(58, 76), (148, 122)], (184, 134, 55, 220), 7)
    line(draw, [(58, 122), (148, 76)], (184, 134, 55, 220), 7)
    line(draw, [(52, 76), (152, 76)], (43, 31, 24, 190), 2)
    line(draw, [(52, 122), (152, 122)], (43, 31, 24, 190), 2)
    line(draw, [(96, 99), (174, 99)], (198, 172, 112, 245), 4)
    polygon(draw, [(176, 99), (158, 90), (158, 108)], (201, 168, 93, 230), None)
    rect(draw, (26, 64, 55, 136), (143, 94, 49, 215), (64, 43, 25, 185), 2, 4)
    return finish(add_grain(image, 5, 80), size)


def make_debris() -> Image.Image:
    size = (192, 192)
    image = rgba(size)
    draw = ImageDraw.Draw(image, "RGBA")
    polygon(draw, [(54, 54), (130, 36), (162, 88), (128, 148), (58, 132), (34, 88)], (155, 103, 55, 245), (72, 48, 29, 220))
    line(draw, [(68, 82), (148, 70)], (74, 47, 26, 120), 3)
    line(draw, [(72, 112), (126, 144)], (92, 58, 31, 115), 3)
    rect(draw, (92, 66, 116, 150), (81, 50, 27, 210), (42, 28, 18, 170), 1, 3)
    for i in range(5):
        ellipse(draw, (22 + i * 17, 126 + i * 4, 50 + i * 17, 144 + i * 4), (188, 145, 84, 55))
    return finish(add_grain(image, 8, 81), size)


def make_icons() -> tuple[Image.Image, dict]:
    cell = 128
    keys = ["shang", "zhou", "qin", "han", "river"]
    atlas = Image.new("RGBA", (cell * len(keys), cell), (0, 0, 0, 0))
    regions = {}
    for i, key in enumerate(keys):
        tile = rgba((cell, cell))
        draw = ImageDraw.Draw(tile, "RGBA")
        ellipse(draw, (10, 10, 118, 118), (99, 67, 31, 220), (213, 166, 71, 230), 4)
        ellipse(draw, (20, 20, 108, 108), (35, 28, 22, 80), None, 1)
        if key == "shang":
            draw_ding(draw, 64, 68, 0.34)
        elif key == "zhou":
            rect(draw, (34, 54, 94, 78), SILK, (83, 55, 32, 210), 2, 8)
            ellipse(draw, (24, 48, 44, 84), (159, 94, 45, 240), (68, 43, 25, 200), 1)
            ellipse(draw, (84, 48, 104, 84), (159, 94, 45, 240), (68, 43, 25, 200), 1)
        elif key == "qin":
            ellipse(draw, (39, 39, 89, 89), (143, 101, 43, 250), (48, 34, 22, 220), 3)
            rect(draw, (58, 58, 70, 70), (0, 0, 0, 0), (38, 28, 20, 220), 2, 1)
        elif key == "han":
            rect(draw, (38, 46, 90, 86), (160, 116, 55, 245), (48, 35, 23, 210), 2, 8)
            polygon(draw, [(64, 50), (82, 74), (52, 70)], (58, 45, 32, 240), (31, 25, 20, 180))
        elif key == "river":
            polygon(draw, [(28, 76), (48, 42), (82, 32), (100, 66), (70, 100)], JADE, (34, 85, 76, 220))
            line(draw, [(42, 72), (82, 60), (94, 74)], (163, 230, 199, 130), 3)
        tile = finish(add_grain(tile, 4, 90 + i), (cell, cell))
        atlas.alpha_composite(tile, (i * cell, 0))
        regions[key] = {"x": i * cell, "y": 0, "w": cell, "h": cell}
    regions.update({
        "bronze": regions["shang"],
        "scroll": regions["zhou"],
        "coin": regions["qin"],
        "compass": regions["han"],
        "jade": regions["river"],
    })
    return atlas, {
        "image": "china-evidence-icons.png",
        "source": "Ancient China Section One evidence icon atlas generated from the section asset manifest.",
        "size": {"w": atlas.width, "h": atlas.height},
        "regions": regions,
    }


def make_marker() -> Image.Image:
    size = (128, 128)
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    px = image.load()
    cx, cy = 64, 64
    for y in range(size[1]):
        for x in range(size[0]):
            d = math.hypot(x - cx, y - cy) / 64
            if d <= 1:
                alpha = int(max(0, (1 - d) ** 1.75) * 170)
                px[x, y] = (144, 215, 162, alpha)
    image = image.filter(ImageFilter.GaussianBlur(2))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse([30, 30, 98, 98], outline=(238, 190, 87, 165), width=3)
    for i in range(8):
        a = i * math.tau / 8
        x = cx + math.cos(a) * 43
        y = cy + math.sin(a) * 43
        draw.arc([x - 8, y - 8, x + 8, y + 8], 20, 230, fill=(232, 191, 98, 110), width=2)
    return image


def write_all() -> list[Path]:
    outputs: list[Path] = []

    def out(rel: str, image: Image.Image) -> None:
        path = PUBLIC / rel
        save_png(image, path)
        outputs.append(path)

    out("backgrounds/china-river-valley/china-river-valley-far-valley.png", make_far_valley())
    out("environment/china-river-valley/china-frontier-path-strip.png", make_path_strip())
    out("environment/china-river-valley/china-watchtower.png", make_watchtower())
    out("environment/china-river-valley/china-broken-wall.png", make_broken_wall())
    out("environment/china-river-valley/china-imperial-gate-sealed.png", make_imperial_gate(False))
    out("environment/china-river-valley/china-imperial-gate-unlocked-overlay.png", make_imperial_gate(True))
    out("backgrounds/china-archive/china-archive-interior.png", make_archive_interior())
    out("environment/china-archive/china-archive-foreground-props.png", make_archive_props())

    out("artefacts/china/china-artefact-shang-bronze-vessel.png", make_bronze_vessel())
    out("artefacts/china/china-artefact-oracle-bone.png", make_oracle_bone())
    out("artefacts/china/china-artefact-bamboo-slips.png", make_bamboo_slips())
    out("artefacts/china/china-artefact-zhou-scroll.png", make_zhou_scroll())
    out("artefacts/china/china-artefact-qin-coin.png", make_qin_coin())
    out("artefacts/china/china-artefact-qin-law-tablet.png", make_qin_law_tablet())
    out("artefacts/china/china-artefact-han-inventions.png", make_han_inventions())
    out("artefacts/china/china-archive-chest.png", make_archive_chest())
    out("artefacts/china/china-puzzle-pedestal.png", make_pedestal())

    out("environment/china-river-valley/china-crossbow-trap.png", make_crossbow())
    out("environment/china-river-valley/china-falling-debris.png", make_debris())

    icons, icon_data = make_icons()
    out("ui/china/china-evidence-icons.png", icons)
    icon_json = PUBLIC / "ui" / "china" / "china-evidence-icons.json"
    write_json(icon_json, icon_data)
    outputs.append(icon_json)
    out("ui/china/china-interaction-marker.png", make_marker())

    return outputs


def main() -> None:
    outputs = write_all()
    print(f"Generated {len(outputs)} Ancient China Section One asset files.")
    for path in outputs:
        print(path.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()
