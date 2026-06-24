from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "assets" / "expedition"
GENERATED_FORUM_SOURCE = Path(
    r"C:\Users\dmahe\.codex\generated_images\019ef63e-afff-74a3-bd21-7a6c95adad09\ig_0033a5f8fdebed4c016a3af2f8fbcc81919e97a9443180c899.png"
)
VIA_SACRA_NO_TEMPLE_SOURCE = (
    PUBLIC
    / "backgrounds"
    / "rome-via-sacra"
    / "rome-via-sacra-source-no-temple-2026-06-24.png"
)

CANVAS_W = 1536
CANVAS_H = 630
STAMP = "2026-06-24"


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save_png(image: Image.Image, path: Path) -> None:
    ensure_dir(path.parent)
    image.save(path, "PNG", optimize=True)


def write_json(path: Path, data: dict) -> None:
    ensure_dir(path.parent)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def scale_canvas(size: tuple[int, int], factor: int = 3) -> tuple[int, int]:
    return (size[0] * factor, size[1] * factor)


def aa_image(size: tuple[int, int], mode: str = "RGBA", factor: int = 3) -> Image.Image:
    return Image.new(mode, scale_canvas(size, factor), (0, 0, 0, 0))


def downsample(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return image.resize(size, Image.Resampling.LANCZOS)


def color_lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient_rect(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    image = Image.new("RGB", size, top)
    draw = ImageDraw.Draw(image)
    for y in range(size[1]):
        t = y / max(1, size[1] - 1)
        draw.line([(0, y), (size[0], y)], fill=color_lerp(top, bottom, t))
    return image


def add_noise(image: Image.Image, alpha: int = 18, seed: int = 9) -> Image.Image:
    rng = random.Random(seed)
    noise = Image.new("RGBA", image.size, (0, 0, 0, 0))
    pixels = noise.load()
    for y in range(0, image.height, 2):
        for x in range(0, image.width, 2):
            v = rng.randint(-alpha, alpha)
            c = 255 if v >= 0 else 0
            a = abs(v)
            pixels[x, y] = (c, c, c, a)
    return Image.alpha_composite(image.convert("RGBA"), noise.filter(ImageFilter.GaussianBlur(0.35)))


def fit_crop(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    src_ratio = image.width / image.height
    dst_ratio = size[0] / size[1]
    if src_ratio > dst_ratio:
        new_h = image.height
        new_w = int(new_h * dst_ratio)
        left = (image.width - new_w) // 2
        box = (left, 0, left + new_w, new_h)
    else:
        new_w = image.width
        new_h = int(new_w / dst_ratio)
        top = max(0, (image.height - new_h) // 2)
        box = (0, top, new_w, top + new_h)
    return image.crop(box).resize(size, Image.Resampling.LANCZOS)


def load_forum_source() -> Image.Image:
    if GENERATED_FORUM_SOURCE.exists():
        return fit_crop(Image.open(GENERATED_FORUM_SOURCE).convert("RGB"), (CANVAS_W, CANVAS_H))
    fallback = gradient_rect((CANVAS_W, CANVAS_H), (198, 182, 150), (126, 101, 72))
    draw = ImageDraw.Draw(fallback)
    for x in range(150, CANVAS_W, 220):
        draw.rectangle([x, 190, x + 38, 510], fill=(182, 169, 143))
        draw.rectangle([x - 12, 170, x + 50, 195], fill=(132, 113, 84))
    draw.polygon([(0, 530), (CANVAS_W, 470), (CANVAS_W, CANVAS_H), (0, CANVAS_H)], fill=(130, 110, 85))
    return add_noise(fallback.convert("RGBA"), 10)


def load_via_sacra_source() -> Image.Image:
    if VIA_SACRA_NO_TEMPLE_SOURCE.exists():
        return fit_crop(Image.open(VIA_SACRA_NO_TEMPLE_SOURCE).convert("RGB"), (CANVAS_W, CANVAS_H))
    fallback = gradient_rect((CANVAS_W, CANVAS_H), (204, 188, 154), (132, 105, 75)).convert("RGBA")
    draw = ImageDraw.Draw(fallback, "RGBA")
    draw.rectangle([0, 90, 540, 502], fill=(160, 104, 70, 205), outline=(92, 62, 47, 180), width=4)
    draw.rectangle([60, 352, 390, 468], fill=(121, 82, 59, 235), outline=(69, 49, 39, 180), width=3)
    draw.rectangle([80, 310, 360, 362], fill=(111, 83, 58, 235), outline=(65, 51, 38, 160), width=3)
    draw.rectangle([624, 225, 950, 478], fill=(177, 131, 86, 160), outline=(95, 70, 51, 130), width=3)
    for x in range(1080, 1430, 92):
        draw.rectangle([x, 236, x + 34, 492], fill=(179, 164, 132, 170), outline=(87, 74, 56, 160), width=3)
        draw.rectangle([x - 14, 218, x + 48, 242], fill=(126, 105, 76, 190))
    draw_arches(draw, 366, 5, 760, 148, 170, (148, 121, 84, 120), (77, 63, 46, 150))
    draw.polygon([(0, 526), (CANVAS_W, 482), (CANVAS_W, CANVAS_H), (0, CANVAS_H)], fill=(153, 132, 101, 220))
    for x in range(-80, CANVAS_W, 118):
        draw.line([(x, 530), (x + 214, CANVAS_H)], fill=(62, 50, 37, 62), width=3)
    for y in range(522, CANVAS_H, 34):
        draw.line([(0, y), (CANVAS_W, y - 46)], fill=(236, 214, 169, 54), width=2)
    return add_noise(fallback, 10, 25)


def draw_arches(draw: ImageDraw.ImageDraw, base_y: int, count: int, start_x: int, width: int, height: int,
                color: tuple[int, int, int, int], outline: tuple[int, int, int, int]) -> None:
    for i in range(count):
        x = start_x + i * width
        draw.rectangle([x, base_y - height // 2, x + width // 8, base_y], fill=color, outline=outline)
        draw.rectangle([x + width * 7 // 8, base_y - height // 2, x + width, base_y], fill=color, outline=outline)
        draw.arc([x, base_y - height, x + width, base_y], 180, 360, fill=outline, width=max(3, width // 24))
        draw.arc([x + width // 8, base_y - height + width // 12, x + width * 7 // 8, base_y], 180, 360, fill=color, width=max(8, width // 12))


def make_transparent_layer(size: tuple[int, int] = (CANVAS_W, CANVAS_H)) -> Image.Image:
    return Image.new("RGBA", size, (0, 0, 0, 0))


def layer_haze(size: tuple[int, int], color: tuple[int, int, int, int], bands: int, seed: int) -> Image.Image:
    rng = random.Random(seed)
    layer = make_transparent_layer(size)
    draw = ImageDraw.Draw(layer, "RGBA")
    for _ in range(bands):
        y = rng.randint(int(size[1] * 0.28), size[1] - 20)
        h = rng.randint(22, 78)
        x = rng.randint(-140, size[0] - 100)
        draw.ellipse([x, y, x + rng.randint(260, 620), y + h], fill=color)
    return layer.filter(ImageFilter.GaussianBlur(18))


def make_via_sacra_layers() -> dict[str, Image.Image]:
    base = load_via_sacra_source().convert("RGBA")
    sky = ImageEnhance.Color(base).enhance(0.9)
    sky = ImageEnhance.Brightness(sky).enhance(1.03)
    sky = add_noise(sky, 5, 22)

    arches = make_transparent_layer()
    draw = ImageDraw.Draw(arches, "RGBA")
    for x in range(-110, CANVAS_W, 245):
        draw.arc([x, 210, x + 210, 456], 190, 350, fill=(78, 62, 42, 48), width=7)
        draw.line([(x + 34, 324), (x + 26, 482)], fill=(143, 123, 90, 38), width=14)
        draw.line([(x + 178, 316), (x + 184, 482)], fill=(143, 123, 90, 38), width=14)
    arches = arches.filter(ImageFilter.GaussianBlur(0.75))

    hills = make_transparent_layer()
    draw = ImageDraw.Draw(hills, "RGBA")
    draw.polygon([(0, 452), (255, 332), (560, 372), (846, 292), (1190, 358), (CANVAS_W, 314),
                  (CANVAS_W, CANVAS_H), (0, CANVAS_H)], fill=(111, 90, 63, 42))
    draw.polygon([(0, 506), (356, 420), (735, 446), (1010, 388), (CANVAS_W, 426),
                  (CANVAS_W, CANVAS_H), (0, CANVAS_H)], fill=(134, 103, 69, 50))
    hills = hills.filter(ImageFilter.GaussianBlur(0.7))

    road = make_transparent_layer()
    draw = ImageDraw.Draw(road, "RGBA")
    draw.polygon([(0, 526), (CANVAS_W, 486), (CANVAS_W, CANVAS_H), (0, CANVAS_H)], fill=(151, 132, 101, 112))
    for x in range(-80, CANVAS_W, 116):
        draw.line([(x, 528), (x + 214, CANVAS_H)], fill=(63, 50, 36, 44), width=3)
    for y in range(516, CANVAS_H, 34):
        draw.line([(0, y), (CANVAS_W, y - 48)], fill=(236, 213, 166, 40), width=2)
    road = road.filter(ImageFilter.GaussianBlur(0.2))

    dust = layer_haze((CANVAS_W, CANVAS_H), (226, 207, 166, 46), 14, 32)
    return {
        "viaSacraSky": sky,
        "farAqueductArches": arches,
        "distantHillSide": hills,
        "midgroundRoadRuins": road,
        "foregroundDust": dust,
    }


def make_forum_layers() -> dict[str, Image.Image]:
    base = load_forum_source().convert("RGBA")
    sky = ImageEnhance.Color(base).enhance(0.82)
    sky = ImageEnhance.Brightness(sky).enhance(1.04)

    far = make_transparent_layer()
    draw = ImageDraw.Draw(far, "RGBA")
    for x in range(130, CANVAS_W, 250):
        draw.arc([x, 206, x + 185, 455], 190, 350, fill=(93, 74, 52, 64), width=5)
        draw.line([(x + 28, 330), (x + 24, 444)], fill=(143, 126, 96, 44), width=10)
        draw.line([(x + 156, 322), (x + 160, 444)], fill=(143, 126, 96, 44), width=10)
    far = far.filter(ImageFilter.GaussianBlur(1.1))

    ruins = make_transparent_layer()
    draw = ImageDraw.Draw(ruins, "RGBA")
    for x, y, r in [(352, 476, 58), (724, 464, 66), (1188, 470, 60)]:
        draw.ellipse([x, y, x + r * 2, y + r * 0.68], fill=(117, 99, 71, 58), outline=(81, 66, 46, 68), width=3)
        draw.arc([x + 8, y + 7, x + r * 2 - 8, y + r * 0.68 - 4], 185, 356, fill=(222, 201, 156, 42), width=3)
    for x in [218, 610, 1016, 1370]:
        draw.line([(x, 438), (x + 120, 410)], fill=(213, 194, 153, 44), width=10)
        draw.line([(x + 8, 442), (x + 128, 414)], fill=(79, 65, 48, 42), width=3)

    floor = make_transparent_layer()
    draw = ImageDraw.Draw(floor, "RGBA")
    draw.polygon([(0, 515), (CANVAS_W, 478), (CANVAS_W, CANVAS_H), (0, CANVAS_H)], fill=(151, 134, 106, 105))
    for y in range(520, CANVAS_H, 34):
        draw.line([(0, y), (CANVAS_W, y - 36)], fill=(231, 210, 170, 54), width=2)
    for x in range(0, CANVAS_W, 148):
        draw.line([(x, 493), (x + 120, CANVAS_H)], fill=(77, 65, 50, 56), width=2)

    dust = layer_haze((CANVAS_W, CANVAS_H), (231, 211, 171, 54), 18, 46)
    return {
        "forumSky": sky,
        "farTempleColonnades": far,
        "distantForumRuins": ruins,
        "midgroundForumFloor": floor,
        "foregroundColumnDust": dust,
    }


def make_thermae_layers() -> dict[str, Image.Image]:
    deep = gradient_rect((CANVAS_W, CANVAS_H), (13, 24, 26), (42, 48, 42)).convert("RGBA")
    deep = add_noise(deep, 10, 53)

    pillars = make_transparent_layer()
    draw = ImageDraw.Draw(pillars, "RGBA")
    for x in range(-30, CANVAS_W, 130):
        draw.rectangle([x, 210, x + 38, 590], fill=(65, 78, 73, 180), outline=(18, 26, 24, 160))
        draw.rectangle([x - 16, 192, x + 54, 218], fill=(88, 96, 85, 145))
    pillars = pillars.filter(ImageFilter.GaussianBlur(0.8))

    vaults = make_transparent_layer()
    draw = ImageDraw.Draw(vaults, "RGBA")
    draw_arches(draw, 410, 7, -20, 255, 300, (62, 74, 71, 150), (24, 33, 32, 185))
    vaults = vaults.filter(ImageFilter.GaussianBlur(0.45))

    channels = make_transparent_layer()
    draw = ImageDraw.Draw(channels, "RGBA")
    draw.polygon([(0, 535), (CANVAS_W, 492), (CANVAS_W, CANVAS_H), (0, CANVAS_H)], fill=(82, 76, 66, 240))
    for x in range(110, CANVAS_W, 310):
        draw.rounded_rectangle([x, 522, x + 160, 610], radius=14, fill=(19, 44, 45, 205), outline=(131, 144, 122, 110), width=3)
        draw.line([(x + 15, 568), (x + 145, 548)], fill=(164, 221, 216, 90), width=5)

    mist = layer_haze((CANVAS_W, CANVAS_H), (174, 223, 211, 80), 24, 71)
    return {
        "thermaeDeepAtmosphere": deep,
        "farHypocaustPillars": pillars,
        "distantBarrelVaults": vaults,
        "midgroundSteamChannels": channels,
        "foregroundSteamMist": mist,
    }


def make_basilica_layers() -> dict[str, Image.Image]:
    light = gradient_rect((CANVAS_W, CANVAS_H), (86, 70, 55), (185, 169, 135)).convert("RGBA")
    light = add_noise(light, 9, 82)

    apse = make_transparent_layer()
    draw = ImageDraw.Draw(apse, "RGBA")
    draw.ellipse([560, 105, 1000, 520], fill=(112, 88, 65, 170), outline=(211, 186, 126, 110), width=10)
    draw.rectangle([615, 275, 945, 530], fill=(87, 70, 54, 190), outline=(207, 188, 138, 90), width=5)
    for r in range(0, 120, 18):
        draw.arc([610 + r, 135 + r, 950 - r, 475 - r], 190, 350, fill=(218, 191, 114, 76), width=3)

    columns = make_transparent_layer()
    draw = ImageDraw.Draw(columns, "RGBA")
    for x in [90, 250, 415, 1120, 1285, 1450]:
        draw.rectangle([x, 170, x + 48, 590], fill=(169, 151, 122, 210), outline=(82, 68, 50, 130), width=4)
        for stripe in range(x + 7, x + 45, 11):
            draw.line([(stripe, 184), (stripe - 5, 585)], fill=(221, 205, 172, 65), width=2)
        draw.rectangle([x - 20, 150, x + 68, 178], fill=(117, 96, 68, 220))
    columns = columns.filter(ImageFilter.GaussianBlur(0.15))

    floor = make_transparent_layer()
    draw = ImageDraw.Draw(floor, "RGBA")
    draw.polygon([(0, 525), (CANVAS_W, 492), (CANVAS_W, CANVAS_H), (0, CANVAS_H)], fill=(146, 133, 115, 235))
    for x in range(-40, CANVAS_W, 120):
        draw.line([(x, 500), (x + 210, CANVAS_H)], fill=(238, 226, 197, 45), width=2)
    for y in range(522, CANVAS_H, 34):
        draw.line([(0, y), (CANVAS_W, y - 18)], fill=(70, 58, 45, 42), width=2)

    shadow = make_transparent_layer()
    draw = ImageDraw.Draw(shadow, "RGBA")
    for x in [0, 118, 1230, 1395]:
        draw.rectangle([x, 0, x + 110, CANVAS_H], fill=(15, 11, 8, 82))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    return {
        "basilicaSky": light,
        "farApseWall": apse,
        "distantNaveColumns": columns,
        "midgroundMarbleFloor": floor,
        "foregroundColumnShadow": shadow,
    }


def make_vault_layers() -> dict[str, Image.Image]:
    dark = gradient_rect((CANVAS_W, CANVAS_H), (6, 9, 8), (31, 38, 30)).convert("RGBA")
    dark = add_noise(dark, 12, 94)

    walls = make_transparent_layer()
    draw = ImageDraw.Draw(walls, "RGBA")
    draw.rectangle([0, 150, CANVAS_W, 540], fill=(44, 49, 41, 185))
    for y in range(190, 500, 38):
        draw.line([(0, y), (CANVAS_W, y + math.sin(y) * 8)], fill=(118, 124, 103, 55), width=2)
    for x in range(50, CANVAS_W, 110):
        for y in range(210, 470, 70):
            draw.rectangle([x, y, x + 42, y + 8], fill=(146, 133, 91, 54))

    arches = make_transparent_layer()
    draw = ImageDraw.Draw(arches, "RGBA")
    for x in [130, 530, 940, 1310]:
        draw.rounded_rectangle([x, 220, x + 170, 535], radius=70, fill=(16, 19, 17, 215), outline=(92, 79, 55, 160), width=7)
        draw.line([(x + 22, 380), (x + 148, 380)], fill=(106, 84, 49, 120), width=5)

    floor = make_transparent_layer()
    draw = ImageDraw.Draw(floor, "RGBA")
    draw.polygon([(0, 528), (CANVAS_W, 498), (CANVAS_W, CANVAS_H), (0, CANVAS_H)], fill=(57, 61, 52, 242))
    for x in range(0, CANVAS_W, 160):
        draw.line([(x, 504), (x + 100, CANVAS_H)], fill=(161, 145, 101, 42), width=2)
    draw.ellipse([560, 520, 920, 595], fill=(6, 8, 7, 140))

    ash = layer_haze((CANVAS_W, CANVAS_H), (180, 178, 150, 50), 16, 101)
    return {
        "vaultDarkAtmosphere": dark,
        "farInscribedWalls": walls,
        "distantSealedArchways": arches,
        "midgroundVaultFloor": floor,
        "foregroundAshDrift": ash,
    }


def compose_layers(layers: dict[str, Image.Image]) -> Image.Image:
    out = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 255))
    for layer in layers.values():
        out = Image.alpha_composite(out, layer.convert("RGBA"))
    return out


def write_background_pack(
    folder: str,
    manifest_name: str,
    layers: dict[str, Image.Image],
    source_note: str | None = None,
) -> None:
    target = PUBLIC / "backgrounds" / folder
    ensure_dir(target)
    main_name = f"{folder}-main-{STAMP}.png"
    save_png(compose_layers(layers).convert("RGB"), target / main_name)
    regions = {}
    for key, image in layers.items():
        suffix = "".join(["-" + c.lower() if c.isupper() else c for c in key]).lstrip("-")
        filename = f"{folder}-{suffix}-{STAMP}.png"
        save_png(image, target / filename)
        regions[key] = {"x": 0, "y": 0, "w": CANVAS_W, "h": CANVAS_H, "image": filename}
    write_json(target / manifest_name, {
        "image": main_name,
        "source": source_note or "Rome Section One production parallax pack generated from built-in AI Forum art plus project-local painted depth layers.",
        "size": {"w": CANVAS_W, "h": CANVAS_H},
        "coordinateNote": "Each region is a full-screen PNG layer. Prop and mist layers use real alpha; background composites are rectangular PNGs.",
        "regions": regions,
    })


def draw_stone_texture(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], seed: int) -> None:
    rng = random.Random(seed)
    x0, y0, x1, y1 = box
    for _ in range(45):
        x = rng.randint(x0, x1)
        y = rng.randint(y0, y1)
        r = rng.randint(1, 4)
        c = rng.randint(115, 190)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(c, c - 12, c - 30, rng.randint(20, 55)))


def transparent_prop(size: tuple[int, int]) -> tuple[Image.Image, ImageDraw.ImageDraw, int]:
    factor = 3
    image = aa_image(size, "RGBA", factor)
    return image, ImageDraw.Draw(image, "RGBA"), factor


def finish_prop(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return downsample(image, size).filter(ImageFilter.UnsharpMask(radius=0.6, percent=70, threshold=3))


def make_column_cluster(size=(360, 420)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    for idx, x in enumerate([55, 142, 238]):
        top = 70 + idx * 18
        height = 285 - idx * 28
        draw.rectangle([s(x), s(top), s(x + 46), s(top + height)], fill=(185, 171, 141, 235), outline=(89, 77, 58, 210), width=s(3))
        for gx in range(x + 7, x + 43, 10):
            draw.line([s(gx), s(top + 12), s(gx - 6), s(top + height - 8)], fill=(230, 214, 178, 95), width=s(2))
        draw.rectangle([s(x - 18), s(top - 22), s(x + 64), s(top + 3)], fill=(126, 103, 73, 240), outline=(72, 60, 45, 200), width=s(2))
        draw.rectangle([s(x - 25), s(top + height - 2), s(x + 72), s(top + height + 28)], fill=(128, 107, 79, 245), outline=(72, 60, 45, 210), width=s(2))
    draw.polygon([s(22), s(380), s(330), s(350), s(348), s(410), s(16), s(418)], fill=(105, 88, 66, 240), outline=(62, 51, 39, 190))
    draw_stone_texture(draw, (s(25), s(65), s(335), s(414)), 14)
    return finish_prop(img, size)


def make_ground_strip(size=(1024, 160)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    draw.rounded_rectangle([s(8), s(22), s(1016), s(132)], radius=s(12), fill=(132, 110, 80, 250), outline=(71, 58, 43, 210), width=s(4))
    for x in range(28, 1010, 104):
        draw.line([s(x), s(26), s(x + 56), s(128)], fill=(229, 211, 174, 58), width=s(3))
    for y in [48, 82, 118]:
        draw.line([s(12), s(y), s(1014), s(y - 8)], fill=(72, 60, 48, 62), width=s(2))
    draw_stone_texture(draw, (s(12), s(24), s(1010), s(130)), 19)
    return finish_prop(img, size)


def tint_prop(image: Image.Image, color: tuple[int, int, int], strength: float = 0.35, brightness: float = 1.0) -> Image.Image:
    rgba = image.convert("RGBA")
    tint = Image.new("RGBA", rgba.size, color + (0,))
    tint.putalpha(rgba.getchannel("A").point(lambda value: int(value * strength)))
    out = Image.alpha_composite(rgba, tint)
    return ImageEnhance.Brightness(out).enhance(brightness)


def make_stone_ledge(size=(360, 96)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    draw.rounded_rectangle([s(8), s(16), s(352), s(72)], radius=s(7), fill=(154, 134, 100, 248), outline=(74, 61, 45, 210), width=s(3))
    draw.rectangle([s(24), s(66), s(330), s(86)], fill=(95, 76, 55, 210))
    for x in range(30, 342, 62):
        draw.line([s(x), s(18), s(x + 34), s(72)], fill=(237, 218, 176, 55), width=s(2))
    draw_stone_texture(draw, (s(10), s(18), s(350), s(84)), 20)
    return finish_prop(img, size)


def make_fallen_column_segment(size=(420, 120)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    draw.rounded_rectangle([s(28), s(34), s(392), s(86)], radius=s(24), fill=(178, 164, 134, 245), outline=(81, 70, 52, 210), width=s(4))
    for x in range(52, 372, 42):
        draw.line([s(x), s(38), s(x + 20), s(82)], fill=(231, 213, 176, 68), width=s(3))
    draw.rectangle([s(14), s(70), s(405), s(105)], fill=(94, 77, 55, 150))
    draw_stone_texture(draw, (s(18), s(28), s(404), s(104)), 24)
    return finish_prop(img, size)


def make_entablature_slab(size=(520, 128)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    draw.rounded_rectangle([s(18), s(24), s(502), s(92)], radius=s(8), fill=(150, 130, 94, 248), outline=(70, 58, 40, 210), width=s(4))
    draw.rectangle([s(34), s(38), s(486), s(54)], fill=(205, 181, 125, 95))
    draw.rectangle([s(46), s(80), s(470), s(106)], fill=(88, 70, 47, 145))
    for x in range(64, 462, 70):
        draw.rectangle([s(x), s(44), s(x + 36), s(82)], fill=(118, 98, 68, 150), outline=(59, 48, 34, 120), width=s(2))
    draw_stone_texture(draw, (s(20), s(24), s(500), s(106)), 31)
    return finish_prop(img, size)


def make_pressure_plate(size=(240, 96)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    draw.rounded_rectangle([s(18), s(28), s(222), s(72)], radius=s(8), fill=(126, 104, 75, 245), outline=(61, 49, 34, 220), width=s(3))
    draw.rounded_rectangle([s(48), s(38), s(192), s(64)], radius=s(5), fill=(178, 153, 100, 190), outline=(85, 65, 36, 150), width=s(2))
    draw.line([s(120), s(32), s(120), s(70)], fill=(58, 45, 31, 100), width=s(2))
    draw_stone_texture(draw, (s(18), s(28), s(222), s(72)), 37)
    return finish_prop(img, size)


def make_collapsing_column(size=(160, 360)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    draw.rectangle([s(58), s(34), s(105), s(310)], fill=(173, 158, 129, 242), outline=(77, 66, 49, 210), width=s(4))
    for y in range(54, 300, 34):
        draw.line([s(62), s(y), s(103), s(y + 12)], fill=(232, 216, 180, 75), width=s(2))
    draw.rectangle([s(38), s(18), s(126), s(48)], fill=(121, 99, 68, 240), outline=(63, 51, 36, 200), width=s(3))
    draw.rectangle([s(30), s(306), s(134), s(342)], fill=(106, 86, 61, 240), outline=(55, 44, 30, 200), width=s(3))
    draw_stone_texture(draw, (s(28), s(18), s(136), s(342)), 41)
    return finish_prop(img, size)


def make_steam_burst(size=(220, 260)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    for i, (x, y, w, h, a) in enumerate([
        (70, 112, 70, 132, 82),
        (36, 74, 92, 154, 60),
        (104, 58, 88, 170, 68),
        (76, 24, 54, 184, 44),
    ]):
        draw.ellipse([s(x), s(y), s(x + w), s(y + h)], fill=(190, 222, 216, a))
    draw.rectangle([s(34), s(218), s(188), s(242)], fill=(80, 72, 61, 190), outline=(130, 120, 94, 120), width=s(2))
    return downsample(img.filter(ImageFilter.GaussianBlur(s(1))), size)


def make_falling_block(size=(220, 180)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    draw.rounded_rectangle([s(34), s(34), s(186), s(140)], radius=s(10), fill=(135, 115, 84, 248), outline=(58, 47, 33, 220), width=s(4))
    draw.line([s(52), s(62), s(162), s(48)], fill=(224, 202, 156, 78), width=s(3))
    draw.line([s(70), s(104), s(174), s(126)], fill=(53, 42, 30, 80), width=s(3))
    draw_stone_texture(draw, (s(34), s(34), s(186), s(140)), 45)
    return finish_prop(img, size)


def make_dark_pit(size=(260, 120)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    draw.ellipse([s(24), s(24), s(236), s(96)], fill=(5, 8, 10, 230), outline=(91, 75, 49, 150), width=s(4))
    draw.ellipse([s(64), s(38), s(198), s(82)], fill=(1, 2, 4, 245))
    draw.line([s(46), s(36), s(220), s(62)], fill=(177, 150, 90, 45), width=s(3))
    return finish_prop(img, size)


def make_arch_door(size=(340, 460), locked=False) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    draw.rounded_rectangle([s(48), s(60), s(292), s(430)], radius=s(116), fill=(130, 111, 84, 246), outline=(64, 52, 38, 230), width=s(7))
    draw.rounded_rectangle([s(82), s(96), s(258), s(428)], radius=s(88), fill=(36, 31, 25, 225), outline=(196, 169, 111, 140), width=s(5))
    draw.rectangle([s(50), s(360), s(290), s(430)], fill=(114, 93, 64, 245), outline=(63, 50, 35, 220), width=s(4))
    for x in [112, 170, 228]:
        draw.line([s(x), s(118), s(x - 8), s(424)], fill=(145, 116, 73, 112), width=s(4))
    if locked:
        draw.rectangle([s(96), s(230), s(246), s(260)], fill=(89, 62, 35, 235), outline=(228, 180, 76, 160), width=s(3))
        draw.ellipse([s(150), s(182), s(194), s(236)], outline=(227, 180, 76, 205), width=s(7))
        draw.rectangle([s(142), s(230), s(204), s(292)], fill=(173, 125, 49, 235), outline=(80, 55, 30, 190), width=s(3))
    draw_stone_texture(draw, (s(48), s(60), s(292), s(430)), 28 if locked else 27)
    return finish_prop(img, size)


def make_timeline_arch(size=(520, 330)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    draw.rounded_rectangle([s(30), s(42), s(490), s(312)], radius=s(34), fill=(107, 88, 63, 238), outline=(58, 47, 34, 210), width=s(5))
    for i in range(5):
        x = 70 + i * 86
        draw.rounded_rectangle([s(x), s(92), s(x + 56), s(238)], radius=s(13), fill=(176, 152, 106, 240), outline=(70, 57, 40, 195), width=s(3))
        draw.ellipse([s(x + 12), s(118), s(x + 44), s(150)], fill=(214, 185, 93, 160), outline=(91, 65, 32, 170), width=s(2))
        for y in [172, 193, 214]:
            draw.line([s(x + 12), s(y), s(x + 44), s(y - 4)], fill=(79, 61, 39, 105), width=s(2))
    draw.line([s(70), s(270), s(450), s(270)], fill=(232, 180, 69, 170), width=s(6))
    draw_stone_texture(draw, (s(30), s(42), s(490), s(312)), 33)
    return finish_prop(img, size)


def make_artifact_prop(kind: str, size=(220, 220)) -> Image.Image:
    img, draw, f = transparent_prop(size)
    def s(v): return int(v * f)
    if kind == "tablet":
        draw.rounded_rectangle([s(42), s(28), s(178), s(190)], radius=s(18), fill=(160, 133, 91, 248), outline=(67, 51, 34, 210), width=s(4))
        for y in [72, 102, 132, 162]:
            draw.line([s(70), s(y), s(154), s(y - 8)], fill=(60, 45, 30, 120), width=s(3))
    elif kind == "coin":
        draw.ellipse([s(38), s(38), s(182), s(182)], fill=(205, 150, 50, 248), outline=(87, 57, 23, 230), width=s(7))
        draw.ellipse([s(70), s(62), s(148), s(150)], outline=(237, 190, 79, 160), width=s(5))
        draw.arc([s(78), s(68), s(144), s(158)], 80, 280, fill=(86, 52, 21, 160), width=s(4))
    elif kind == "scroll":
        draw.rounded_rectangle([s(42), s(58), s(178), s(158)], radius=s(22), fill=(221, 198, 147, 246), outline=(93, 65, 38, 205), width=s(4))
        draw.ellipse([s(32), s(54), s(72), s(164)], fill=(198, 163, 100, 245), outline=(87, 58, 32, 205), width=s(3))
        draw.ellipse([s(148), s(54), s(188), s(164)], fill=(198, 163, 100, 245), outline=(87, 58, 32, 205), width=s(3))
        for y in [84, 110, 136]:
            draw.line([s(78), s(y), s(146), s(y - 3)], fill=(91, 63, 35, 80), width=s(2))
    elif kind == "statue":
        draw.rectangle([s(74), s(70), s(146), s(172)], fill=(181, 174, 156, 248), outline=(72, 68, 58, 200), width=s(4))
        draw.ellipse([s(78), s(28), s(142), s(92)], fill=(194, 187, 169, 248), outline=(72, 68, 58, 190), width=s(3))
        draw.polygon([s(82), s(104), s(146), s(88), s(154), s(132), s(92), s(150)], fill=(137, 128, 110, 230), outline=(68, 61, 50, 170))
        draw.rectangle([s(50), s(172), s(170), s(194)], fill=(108, 97, 80, 245))
    elif kind == "standard":
        draw.rectangle([s(104), s(30), s(116), s(192)], fill=(94, 62, 37, 245))
        draw.polygon([s(116), s(48), s(188), s(76), s(116), s(104)], fill=(154, 28, 25, 238), outline=(75, 18, 16, 210))
        draw.ellipse([s(70), s(22), s(148), s(78)], fill=(207, 156, 48, 240), outline=(82, 53, 20, 200), width=s(4))
        draw.line([s(84), s(50), s(134), s(50)], fill=(252, 219, 118, 130), width=s(3))
    elif kind == "chest":
        draw.rounded_rectangle([s(36), s(82), s(184), s(174)], radius=s(15), fill=(107, 67, 34, 248), outline=(49, 31, 18, 220), width=s(4))
        draw.rectangle([s(38), s(118), s(182), s(136)], fill=(160, 112, 48, 230))
        draw.rectangle([s(96), s(116), s(124), s(152)], fill=(197, 149, 54, 235), outline=(78, 48, 18, 210), width=s(2))
    else:
        draw.ellipse([s(44), s(44), s(176), s(176)], fill=(165, 139, 98, 245), outline=(76, 57, 35, 200), width=s(4))
    draw_stone_texture(draw, (s(26), s(22), s(194), s(198)), 44 + len(kind))
    return finish_prop(img, size)


def write_environment_props() -> None:
    target = PUBLIC / "environment" / "rome-section-one"
    props = {
        f"rome-forum-ground-strip-{STAMP}.png": make_ground_strip(),
        f"rome-stone-ledge-{STAMP}.png": make_stone_ledge(),
        f"rome-column-cluster-{STAMP}.png": make_column_cluster(),
        f"rome-archive-doorway-{STAMP}.png": make_arch_door(locked=False),
        f"rome-locked-vault-gate-{STAMP}.png": make_arch_door(locked=True),
        f"rome-timeline-arch-{STAMP}.png": make_timeline_arch(),
        f"rome-law-tablet-prop-{STAMP}.png": make_artifact_prop("tablet"),
        f"rome-augustus-coin-prop-{STAMP}.png": make_artifact_prop("coin"),
        f"rome-scroll-bundle-prop-{STAMP}.png": make_artifact_prop("scroll"),
        f"rome-caesar-statue-prop-{STAMP}.png": make_artifact_prop("statue"),
        f"rome-military-standard-prop-{STAMP}.png": make_artifact_prop("standard"),
        f"rome-treasure-chest-prop-{STAMP}.png": make_artifact_prop("chest"),
    }
    for name, image in props.items():
        save_png(image, target / name)


def write_environment_atlas() -> None:
    target = PUBLIC / "environment" / "rome-section-one"
    atlas_name = "rome-section-one-environment-pack.png"
    manifest_name = "rome-section-one-environment-pack.json"
    entries: dict[str, Image.Image] = {
        "romanRoadGround": make_ground_strip(),
        "forumPavingGround": tint_prop(make_ground_strip(), (118, 96, 66), 0.18, 0.96),
        "thermaePassageFloor": tint_prop(make_ground_strip(), (42, 68, 70), 0.42, 0.72),
        "basilicaMarbleFloor": tint_prop(make_ground_strip(), (218, 207, 178), 0.30, 1.08),
        "vaultStoneFloor": tint_prop(make_ground_strip(), (30, 58, 42), 0.46, 0.64),
        "romanStoneLedge": make_stone_ledge(),
        "romanColumnBlock": make_column_cluster((280, 320)),
        "romanFallenColumn": make_fallen_column_segment(),
        "romanEntablature": make_entablature_slab(),
        "romanPressurePlate": make_pressure_plate(),
        "romanCollapsingColumn": make_collapsing_column(),
        "romanSteamBurst": make_steam_burst(),
        "romanFallingBlock": make_falling_block(),
        "romanDarkPit": make_dark_pit(),
        "romanSealedGate": make_arch_door((340, 460), locked=True),
        "romanBronzeSeal": make_artifact_prop("coin", (180, 180)),
        "routeDoor": make_arch_door((340, 460), locked=False),
    }
    atlas = Image.new("RGBA", (2048, 2048), (0, 0, 0, 0))
    regions: dict[str, dict[str, int]] = {}
    x = 24
    y = 24
    row_h = 0
    for key, image in entries.items():
        image = image.convert("RGBA")
        if x + image.width + 24 > atlas.width:
            x = 24
            y += row_h + 34
            row_h = 0
        atlas.alpha_composite(image, (x, y))
        regions[key] = {"x": x, "y": y, "w": image.width, "h": image.height}
        x += image.width + 28
        row_h = max(row_h, image.height)
    save_png(atlas, target / atlas_name)
    write_json(target / manifest_name, {
        "image": atlas_name,
        "source": "Rome Section One transparent runtime atlas generated from the same production PNG prop functions as the playable Rome scene.",
        "size": {"w": atlas.width, "h": atlas.height},
        "notes": "Transparent atlas for Rome Journey gameplay surfaces: roads, marble floors, ledges, traps, archive doors, sealed gates and route-door visuals.",
        "regions": regions,
    })


def draw_ellipse_glow(base: Image.Image, box: tuple[int, int, int, int], color: tuple[int, int, int, int], blur: int = 8) -> None:
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow, "RGBA")
    draw.ellipse(box, fill=color)
    base.alpha_composite(glow.filter(ImageFilter.GaussianBlur(blur)))


def sprite_cell(size=(256, 256)) -> Image.Image:
    return Image.new("RGBA", size, (0, 0, 0, 0))


def draw_humanoid(draw: ImageDraw.ImageDraw, center_x: int, ground_y: int, pose: str, palette: dict, scale: float = 1.0,
                 shield: bool = True, plume: bool = True) -> None:
    sx = scale
    def p(x, y): return (int(center_x + x * sx), int(ground_y + y * sx))
    alpha = palette.get("alpha", 235)
    armor = palette["armor"] + (alpha,)
    dark = palette["dark"] + (alpha,)
    cloth = palette["cloth"] + (alpha,)
    gold = palette["gold"] + (alpha,)
    limb = palette["limb"] + (alpha,)
    lean = {"walk1": -4, "walk2": 0, "walk3": 4, "windup": -9, "attack": 11, "hit": -13, "defeated": 0}.get(pose, 0)
    crouch = 18 if pose == "defeated" else 0
    if pose == "defeated":
        draw.line([p(-48, -12), p(42, -8)], fill=dark, width=int(14 * sx))
        draw.line([p(-28, -18), p(64, -19)], fill=armor, width=int(17 * sx))
        draw.ellipse([center_x - int(54 * sx), ground_y - int(48 * sx), center_x - int(16 * sx), ground_y - int(12 * sx)], fill=armor, outline=dark, width=int(3 * sx))
        return
    draw.line([p(-18 + lean, -12 + crouch), p(-25, -60)], fill=limb, width=int(9 * sx))
    draw.line([p(16 + lean, -12 + crouch), p(28, -58)], fill=limb, width=int(9 * sx))
    draw.rounded_rectangle([p(-22 + lean, -118 + crouch), p(22 + lean, -54 + crouch)], radius=int(12 * sx), fill=armor, outline=dark, width=int(3 * sx))
    draw.polygon([p(-26 + lean, -112 + crouch), p(27 + lean, -112 + crouch), p(18 + lean, -82 + crouch), p(-18 + lean, -82 + crouch)], fill=cloth)
    head_box = [center_x + int((-18 + lean) * sx), ground_y + int((-158 + crouch) * sx),
                center_x + int((18 + lean) * sx), ground_y + int((-122 + crouch) * sx)]
    draw.ellipse(head_box, fill=palette["skin"] + (alpha,), outline=dark, width=int(3 * sx))
    draw.rectangle([p(-23 + lean, -151 + crouch), p(23 + lean, -132 + crouch)], fill=armor, outline=dark, width=int(2 * sx))
    if plume:
        draw.line([p(-8 + lean, -158 + crouch), p(8 + lean, -190 + crouch)], fill=cloth, width=int(8 * sx))
    arm_y = -104 + crouch
    if pose == "windup":
        draw.line([p(20 + lean, arm_y), p(62 + lean, -150 + crouch)], fill=limb, width=int(8 * sx))
        draw.line([p(58 + lean, -154 + crouch), p(90 + lean, -194 + crouch)], fill=gold, width=int(5 * sx))
    elif pose == "attack":
        draw.line([p(20 + lean, arm_y), p(84 + lean, -90 + crouch)], fill=limb, width=int(8 * sx))
        draw.line([p(72 + lean, -96 + crouch), p(125 + lean, -70 + crouch)], fill=gold, width=int(5 * sx))
    elif pose == "hit":
        draw.line([p(20 + lean, arm_y), p(48 + lean, -134 + crouch)], fill=limb, width=int(8 * sx))
    else:
        draw.line([p(20 + lean, arm_y), p(52 + lean, -76 + crouch)], fill=limb, width=int(8 * sx))
        draw.line([p(48 + lean, -82 + crouch), p(70 + lean, -42 + crouch)], fill=gold, width=int(5 * sx))
    draw.line([p(-22 + lean, -106 + crouch), p(-56 + lean, -80 + crouch)], fill=limb, width=int(8 * sx))
    if shield:
        shield_box = [center_x + int((-78 + lean) * sx), ground_y + int((-128 + crouch) * sx),
                      center_x + int((-30 + lean) * sx), ground_y + int((-64 + crouch) * sx)]
        draw.ellipse(shield_box, fill=palette["shield"] + (alpha,), outline=dark, width=int(4 * sx))
        draw.ellipse([shield_box[0] + int(13*sx), shield_box[1] + int(16*sx), shield_box[2] - int(13*sx), shield_box[3] - int(16*sx)], outline=gold, width=int(3 * sx))


def make_enemy_atlas(pack_id: str, keys: list[str]) -> tuple[Image.Image, dict]:
    cols = 4
    cell = 256
    rows = math.ceil(len(keys) / cols)
    atlas = Image.new("RGBA", (cols * cell, rows * cell), (0, 0, 0, 0))
    regions = {}
    for idx, key in enumerate(keys):
        x = (idx % cols) * cell
        y = (idx // cols) * cell
        cell_img = sprite_cell((cell, cell))
        draw = ImageDraw.Draw(cell_img, "RGBA")
        pose = key.replace(pack_id, "").lower()
        pose = pose.replace("idle", "idle").replace("walk", "walk").replace("windup", "windup").replace("attack", "attack").replace("hit", "hit").replace("defeated", "defeated")
        if "Walk1" in key:
            pose = "walk1"
        elif "Walk2" in key:
            pose = "walk2"
        elif "Walk3" in key:
            pose = "walk3"
        elif "Windup" in key:
            pose = "windup"
        elif "Attack" in key:
            pose = "attack"
        elif "Hit" in key:
            pose = "hit"
        elif "Defeated" in key:
            pose = "defeated"
        else:
            pose = "idle"
        if pack_id == "legionShade":
            draw_ellipse_glow(cell_img, (58, 40, 206, 236), (67, 86, 94, 60), 15)
            palette = {"armor": (118, 124, 121), "dark": (35, 39, 40), "cloth": (133, 32, 28), "gold": (207, 151, 48), "limb": (84, 87, 82), "skin": (128, 118, 102), "shield": (112, 31, 25), "alpha": 220}
            draw_humanoid(draw, 128, 226, pose, palette, 0.92, True, True)
        elif pack_id == "gladiatorRevenant":
            draw_ellipse_glow(cell_img, (44, 30, 218, 238), (122, 55, 44, 66), 16)
            palette = {"armor": (151, 111, 72), "dark": (41, 27, 20), "cloth": (88, 20, 22), "gold": (222, 164, 60), "limb": (109, 79, 58), "skin": (119, 93, 75), "shield": (89, 54, 36), "alpha": 230}
            draw_humanoid(draw, 128, 226, pose, palette, 1.02, False, True)
        elif pack_id == "forumRat":
            dx = {"walk1": -6, "walk2": 2, "walk3": 8, "attack": 18, "hit": -10}.get(pose, 0)
            draw_ellipse_glow(cell_img, (56, 130, 210, 234), (88, 62, 42, 70), 11)
            if pose == "defeated":
                draw.ellipse([72, 172, 184, 214], fill=(72, 54, 42, 230), outline=(29, 22, 18, 210), width=4)
                draw.line([172, 190, 222, 210], fill=(58, 42, 32, 210), width=7)
            else:
                draw.ellipse([66 + dx, 142, 184 + dx, 202], fill=(92, 67, 48, 242), outline=(31, 22, 17, 220), width=4)
                draw.ellipse([150 + dx, 122, 204 + dx, 172], fill=(103, 75, 53, 242), outline=(31, 22, 17, 210), width=4)
                draw.ellipse([164 + dx, 130, 176 + dx, 142], fill=(237, 185, 77, 230))
                draw.line([70 + dx, 174, 30 + dx, 142], fill=(68, 45, 31, 220), width=8)
        elif pack_id == "vestibuleWisp":
            color = (122, 204, 211, 105)
            draw_ellipse_glow(cell_img, (50, 30, 210, 220), color, 19)
            swirl = Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
            sd = ImageDraw.Draw(swirl, "RGBA")
            for r in range(0, 70, 13):
                sd.arc([84 - r // 2, 76 - r, 174 + r // 2, 196 + r], 110, 390, fill=(181, 242, 235, 155 - r), width=6)
            if pose == "attack":
                sd.polygon([(150, 126), (226, 142), (154, 164)], fill=(192, 250, 244, 130))
            if pose == "defeated":
                swirl = swirl.rotate(90, resample=Image.Resampling.BICUBIC)
            cell_img.alpha_composite(swirl)
        elif pack_id == "marbleGolem":
            draw_ellipse_glow(cell_img, (36, 24, 220, 242), (190, 184, 156, 58), 14)
            offset = {"walk1": -5, "walk2": 0, "walk3": 6, "attack": 13, "windup": -8, "hit": -12}.get(pose, 0)
            if pose == "defeated":
                for bx, by, bw, bh in [(70, 174, 78, 30), (125, 153, 62, 38), (54, 202, 144, 24)]:
                    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=8, fill=(154, 149, 130, 235), outline=(66, 63, 54, 210), width=3)
            else:
                draw.rounded_rectangle([80 + offset, 78, 174 + offset, 174], radius=17, fill=(170, 164, 141, 242), outline=(62, 58, 48, 220), width=5)
                draw.rectangle([96 + offset, 40, 158 + offset, 92], fill=(188, 183, 159, 242), outline=(62, 58, 48, 220), width=5)
                draw.line([80 + offset, 118, 42 + offset, 166], fill=(151, 145, 125, 238), width=19)
                arm_end = 226 if pose == "attack" else 184
                draw.line([172 + offset, 118, arm_end + offset, 164], fill=(151, 145, 125, 238), width=20)
                draw.line([105 + offset, 174, 92 + offset, 228], fill=(132, 127, 110, 240), width=18)
                draw.line([150 + offset, 174, 166 + offset, 228], fill=(132, 127, 110, 240), width=18)
                draw.rectangle([111 + offset, 58, 124 + offset, 67], fill=(95, 129, 122, 205))
                draw.rectangle([139 + offset, 58, 152 + offset, 67], fill=(95, 129, 122, 205))
        atlas.alpha_composite(cell_img, (x, y))
        regions[key] = {"x": x, "y": y, "w": cell, "h": cell}
    return atlas, regions


def write_enemy_packs() -> None:
    target = PUBLIC / "enemies" / "rome"
    configs = {
        "legionShade": ("rome-legion-shade-sprites", ["legionShadeIdle", "legionShadeWalk1", "legionShadeWalk2", "legionShadeWalk3", "legionShadeWindup", "legionShadeAttack", "legionShadeHit", "legionShadeDefeated"]),
        "gladiatorRevenant": ("rome-gladiator-revenant-sprites", ["gladiatorRevenantIdle", "gladiatorRevenantWalk1", "gladiatorRevenantWalk2", "gladiatorRevenantWalk3", "gladiatorRevenantWindup", "gladiatorRevenantAttack", "gladiatorRevenantHit", "gladiatorRevenantDefeated"]),
        "forumRat": ("rome-forum-rat-sprites", ["forumRatIdle", "forumRatWalk1", "forumRatWalk2", "forumRatWalk3", "forumRatWindup", "forumRatAttack", "forumRatHit", "forumRatDefeated"]),
        "vestibuleWisp": ("rome-vestibule-wisp-sprites", ["vestibuleWispIdle", "vestibuleWispWalk1", "vestibuleWispWalk2", "vestibuleWispWalk3", "vestibuleWispWindup", "vestibuleWispAttack", "vestibuleWispHit", "vestibuleWispDefeated"]),
        "marbleGolem": ("rome-marble-golem-sprites", ["marbleGolemIdle", "marbleGolemWalk1", "marbleGolemWalk2", "marbleGolemWalk3", "marbleGolemWindup", "marbleGolemAttack", "marbleGolemHit", "marbleGolemDefeated"]),
    }
    for pack_id, (basename, keys) in configs.items():
        atlas, regions = make_enemy_atlas(pack_id, keys)
        image_name = f"{basename}.png"
        save_png(atlas, target / image_name)
        write_json(target / f"{basename}.json", {
            "image": image_name,
            "source": "Rome Section One transparent enemy sprite atlas, generated as stylized production game art with alpha.",
            "size": {"w": atlas.width, "h": atlas.height},
            "regions": regions,
        })


def load_enemy_source(json_name: str) -> tuple[Image.Image, dict]:
    json_path = PUBLIC / "enemies" / json_name
    data = json.loads(json_path.read_text(encoding="utf-8"))
    image = Image.open(json_path.parent / data["image"]).convert("RGBA")
    return image, data


def crop_region(image: Image.Image, region: dict) -> Image.Image:
    return image.crop((
        int(region["x"]),
        int(region["y"]),
        int(region["x"] + region["w"]),
        int(region["y"] + region["h"]),
    ))


def trim_alpha(image: Image.Image) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    return image.crop(bbox) if bbox else image


def tint_sprite(sprite: Image.Image, color: tuple[int, int, int], strength: float = 0.16) -> Image.Image:
    alpha = sprite.getchannel("A")
    overlay = Image.new("RGBA", sprite.size, color + (0,))
    overlay.putalpha(alpha.point(lambda a: int(max(0, a - 160) * strength)))
    return Image.alpha_composite(sprite, overlay)


def paste_source_sprite_to_cell(
    source: Image.Image,
    cell_size: int,
    max_height: int,
    max_width: int,
    tint: tuple[int, int, int] | None = None,
    tint_strength: float = 0.16,
    glow: tuple[int, int, int, int] | None = None,
    bottom_pad: int = 12,
) -> Image.Image:
    sprite = trim_alpha(source)
    ratio = min(max_width / max(1, sprite.width), max_height / max(1, sprite.height))
    next_size = (max(1, int(sprite.width * ratio)), max(1, int(sprite.height * ratio)))
    sprite = sprite.resize(next_size, Image.Resampling.LANCZOS)
    if tint:
        sprite = tint_sprite(sprite, tint, tint_strength)
    cell = Image.new("RGBA", (cell_size, cell_size), (0, 0, 0, 0))
    x = (cell_size - sprite.width) // 2
    y = cell_size - bottom_pad - sprite.height
    if glow:
        glow_layer = Image.new("RGBA", cell.size, (0, 0, 0, 0))
        glow_alpha = sprite.getchannel("A").filter(ImageFilter.GaussianBlur(15))
        glow_color = Image.new("RGBA", sprite.size, glow)
        glow_color.putalpha(glow_alpha.point(lambda a: min(180, int(a * glow[3] / 255))))
        glow_layer.alpha_composite(glow_color, (x, y))
        cell.alpha_composite(glow_layer)
    cell.alpha_composite(sprite, (x, y))
    return cell


def add_legion_overlay(cell: Image.Image, pose: str, scale: float = 1.0) -> None:
    draw = ImageDraw.Draw(cell, "RGBA")
    cx = cell.width // 2
    shield_x = int(cx - 69 * scale)
    shield_y = int(cell.height - 158 * scale)
    if pose != "defeated":
        draw.ellipse(
            [shield_x - 24, shield_y - 36, shield_x + 24, shield_y + 36],
            fill=(116, 28, 26, 190),
            outline=(42, 20, 17, 210),
            width=max(2, int(3 * scale)),
        )
        draw.ellipse(
            [shield_x - 12, shield_y - 24, shield_x + 12, shield_y + 24],
            outline=(222, 166, 51, 190),
            width=max(2, int(3 * scale)),
        )
        draw.polygon(
            [(cx - 8, cell.height - int(224 * scale)), (cx + 12, cell.height - int(256 * scale)), (cx + 22, cell.height - int(214 * scale))],
            fill=(154, 28, 25, 190),
        )


def add_gladiator_overlay(cell: Image.Image, pose: str, scale: float = 1.0) -> None:
    if pose == "defeated":
        return
    draw = ImageDraw.Draw(cell, "RGBA")
    cx = cell.width // 2
    draw.arc(
        [cx - int(54 * scale), cell.height - int(252 * scale), cx + int(54 * scale), cell.height - int(168 * scale)],
        200,
        340,
        fill=(181, 38, 31, 150),
        width=max(4, int(7 * scale)),
    )
    draw.line(
        [(cx + int(26 * scale), cell.height - int(132 * scale)), (cx + int(92 * scale), cell.height - int(112 * scale))],
        fill=(221, 171, 72, 150),
        width=max(3, int(5 * scale)),
    )


def make_rat_cell(pose: str, cell_size: int = 256) -> Image.Image:
    big = Image.new("RGBA", (cell_size * 3, cell_size * 3), (0, 0, 0, 0))
    draw = ImageDraw.Draw(big, "RGBA")
    f = 3
    dx = {"walk1": -8, "walk2": 0, "walk3": 8, "attack": 24, "hit": -14}.get(pose, 0) * f
    if pose == "defeated":
        draw.ellipse([70*f, 175*f, 190*f, 218*f], fill=(66, 49, 38, 238), outline=(24, 18, 15, 220), width=4*f)
        draw.line([172*f, 195*f, 228*f, 216*f], fill=(52, 37, 29, 220), width=7*f)
    else:
        draw_ellipse_glow(big, (54*f, 124*f, 218*f, 234*f), (100, 73, 50, 70), 14*f)
        draw.ellipse([64*f + dx, 146*f, 188*f + dx, 204*f], fill=(92, 67, 49, 245), outline=(27, 19, 15, 225), width=4*f)
        draw.ellipse([150*f + dx, 122*f, 208*f + dx, 174*f], fill=(112, 83, 59, 245), outline=(27, 19, 15, 220), width=4*f)
        draw.polygon([(164*f + dx, 124*f), (177*f + dx, 96*f), (188*f + dx, 128*f)], fill=(122, 84, 60, 235), outline=(28, 20, 15, 180))
        draw.polygon([(194*f + dx, 130*f), (218*f + dx, 108*f), (207*f + dx, 144*f)], fill=(122, 84, 60, 235), outline=(28, 20, 15, 180))
        draw.ellipse([170*f + dx, 136*f, 182*f + dx, 148*f], fill=(226, 179, 76, 230))
        draw.ellipse([194*f + dx, 142*f, 201*f + dx, 149*f], fill=(28, 18, 14, 230))
        draw.line([70*f + dx, 178*f, 24*f + dx, 142*f], fill=(66, 45, 32, 230), width=7*f)
        for lx in [86, 116, 146, 174]:
            foot = -8 if (lx + dx) % 2 else 8
            draw.line([lx*f + dx, 195*f, (lx+foot)*f + dx, 222*f], fill=(44, 31, 24, 210), width=4*f)
    return big.resize((cell_size, cell_size), Image.Resampling.LANCZOS)


def write_enemy_packs_from_sources() -> None:
    target = PUBLIC / "enemies" / "rome"
    looter_img, looter_data = load_enemy_source("looter-sprites.json")
    captain_img, captain_data = load_enemy_source("looter-captain-sprites-premium-2026-06-02.json")
    wisp_img, wisp_data = load_enemy_source("sand-wisp-sprites.json")
    golem_img, golem_data = load_enemy_source("stone-guardian-enemy-sprites-premium-2026-06-02.json")
    source_configs = {
        "legionShade": {
            "basename": "rome-legion-shade-sprites",
            "source": (looter_img, looter_data, "looter"),
            "keys": ["legionShadeIdle", "legionShadeWalk1", "legionShadeWalk2", "legionShadeWalk3", "legionShadeWindup", "legionShadeAttack", "legionShadeHit", "legionShadeDefeated"],
            "tint": (102, 118, 122),
            "glow": None,
            "overlay": None,
            "height": 238,
        },
        "gladiatorRevenant": {
            "basename": "rome-gladiator-revenant-sprites",
            "source": (captain_img, captain_data, "looterCaptain"),
            "keys": ["gladiatorRevenantIdle", "gladiatorRevenantWalk1", "gladiatorRevenantWalk2", "gladiatorRevenantWalk3", "gladiatorRevenantWindup", "gladiatorRevenantAttack", "gladiatorRevenantHit", "gladiatorRevenantDefeated"],
            "tint": (116, 38, 30),
            "glow": None,
            "overlay": add_gladiator_overlay,
            "height": 244,
        },
        "vestibuleWisp": {
            "basename": "rome-vestibule-wisp-sprites",
            "source": (wisp_img, wisp_data, "sandWisp"),
            "keys": ["vestibuleWispIdle", "vestibuleWispWalk1", "vestibuleWispWalk2", "vestibuleWispWalk3", "vestibuleWispWindup", "vestibuleWispAttack", "vestibuleWispHit", "vestibuleWispDefeated"],
            "tint": (135, 218, 216),
            "glow": (125, 224, 218, 108),
            "overlay": None,
            "height": 220,
        },
        "marbleGolem": {
            "basename": "rome-marble-golem-sprites",
            "source": (golem_img, golem_data, "stoneGuardianEnemy"),
            "keys": ["marbleGolemIdle", "marbleGolemWalk1", "marbleGolemWalk2", "marbleGolemWalk3", "marbleGolemWindup", "marbleGolemAttack", "marbleGolemHit", "marbleGolemDefeated"],
            "tint": (196, 190, 166),
            "glow": None,
            "overlay": None,
            "height": 248,
        },
    }
    suffixes = ["Idle", "Walk1", "Walk2", "Walk3", "Windup", "Attack", "Hit", "Defeated"]
    for pack_id, config in source_configs.items():
        cols = 4
        cell = 256
        atlas = Image.new("RGBA", (cols * cell, 2 * cell), (0, 0, 0, 0))
        regions = {}
        src_img, src_data, src_prefix = config["source"]
        for idx, suffix in enumerate(suffixes):
            target_key = config["keys"][idx]
            src_key = f"{src_prefix}{suffix}"
            region = src_data["regions"][src_key]
            sprite = crop_region(src_img, region)
            cell_img = paste_source_sprite_to_cell(
                sprite,
                cell,
                config["height"],
                238,
                config["tint"],
                0.13,
                config["glow"],
                bottom_pad=10,
            )
            if config["overlay"]:
                pose = suffix[0].lower() + suffix[1:]
                config["overlay"](cell_img, pose, 1.0)
            x = (idx % cols) * cell
            y = (idx // cols) * cell
            atlas.alpha_composite(cell_img, (x, y))
            regions[target_key] = {"x": x, "y": y, "w": cell, "h": cell}
        image_name = f"{config['basename']}.png"
        save_png(atlas, target / image_name)
        write_json(target / f"{config['basename']}.json", {
            "image": image_name,
            "source": "Rome Section One enemy atlas derived from existing production Journey enemy art and retuned as Roman variants.",
            "size": {"w": atlas.width, "h": atlas.height},
            "regions": regions,
        })

    rat_keys = ["forumRatIdle", "forumRatWalk1", "forumRatWalk2", "forumRatWalk3", "forumRatWindup", "forumRatAttack", "forumRatHit", "forumRatDefeated"]
    rat_poses = ["idle", "walk1", "walk2", "walk3", "windup", "attack", "hit", "defeated"]
    rat_atlas = Image.new("RGBA", (1024, 512), (0, 0, 0, 0))
    rat_regions = {}
    for idx, key in enumerate(rat_keys):
        x = (idx % 4) * 256
        y = (idx // 4) * 256
        rat_atlas.alpha_composite(make_rat_cell(rat_poses[idx]), (x, y))
        rat_regions[key] = {"x": x, "y": y, "w": 256, "h": 256}
    save_png(rat_atlas, target / "rome-forum-rat-sprites.png")
    write_json(target / "rome-forum-rat-sprites.json", {
        "image": "rome-forum-rat-sprites.png",
        "source": "Rome Section One transparent forum rat atlas generated as finished small enemy sprite art with alpha.",
        "size": {"w": rat_atlas.width, "h": rat_atlas.height},
        "regions": rat_regions,
    })


def boss_pose_from_key(key: str) -> str:
    if "Death" in key or key.endswith("Defeated"):
        return "defeated"
    if "Stagger" in key or key.endswith("Hit") or "CounterWindow" in key:
        return "hit"
    if "ShieldBash" in key:
        return "attack"
    if "Charge" in key:
        return "attack"
    if "Windup" in key or key.endswith("Shielded"):
        return "windup"
    if "Walk" in key:
        n = int(key[-1]) if key[-1].isdigit() else 1
        return f"walk{((n - 1) % 3) + 1}"
    return "idle"


def write_boss_pack() -> None:
    keys = [
        "legateRevenantIdle", "legateRevenantIntro", "legateRevenantWindup", "legateRevenantCharge",
        "legateRevenantShieldBash", "legateRevenantShielded", "legateRevenantCounterWindow",
        "legateRevenantHit", "legateRevenantDefeated",
        *[f"legateRevenantWalk{i}" for i in range(1, 7)],
        *[f"legateRevenantCharge{i}" for i in range(1, 7)],
        *[f"legateRevenantWindup{i}" for i in range(1, 6)],
        *[f"legateRevenantShieldBash{i}" for i in range(1, 8)],
        *[f"legateRevenantStagger{i}" for i in range(1, 6)],
        *[f"legateRevenantDeath{i}" for i in range(1, 9)],
    ]
    cols = 8
    cell = 320
    rows = math.ceil(len(keys) / cols)
    atlas = Image.new("RGBA", (cols * cell, rows * cell), (0, 0, 0, 0))
    regions = {}
    palette = {"armor": (115, 117, 111), "dark": (26, 27, 25), "cloth": (116, 25, 24), "gold": (213, 160, 53), "limb": (77, 77, 70), "skin": (115, 105, 91), "shield": (93, 24, 23), "alpha": 238}
    for idx, key in enumerate(keys):
        x = (idx % cols) * cell
        y = (idx // cols) * cell
        cell_img = Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
        draw_ellipse_glow(cell_img, (48, 20, 272, 304), (112, 123, 100, 72), 18)
        draw = ImageDraw.Draw(cell_img, "RGBA")
        pose = boss_pose_from_key(key)
        draw_humanoid(draw, 160, 292, pose, palette, 1.18, True, True)
        if "Shield" in key:
            draw.ellipse([60, 130, 154, 246], outline=(230, 182, 75, 190), width=8)
            draw.arc([48, 92, 266, 294], 200, 345, fill=(230, 182, 75, 130), width=5)
        if "Intro" in key:
            draw.arc([80, 238, 250, 314], 190, 350, fill=(206, 173, 99, 130), width=4)
        atlas.alpha_composite(cell_img, (x, y))
        regions[key] = {"x": x, "y": y, "w": cell, "h": cell}
    target = PUBLIC / "bosses" / "rome"
    save_png(atlas, target / "rome-legate-revenant-sprites.png")
    write_json(target / "rome-legate-revenant-sprites.json", {
        "image": "rome-legate-revenant-sprites.png",
        "source": "Rome Section One transparent Legate Revenant boss atlas, generated as stylized production game art with alpha.",
        "size": {"w": atlas.width, "h": atlas.height},
        "regions": regions,
    })


def write_boss_pack_from_source() -> None:
    keys = [
        "legateRevenantIdle", "legateRevenantIntro", "legateRevenantWindup", "legateRevenantCharge",
        "legateRevenantShieldBash", "legateRevenantShielded", "legateRevenantCounterWindow",
        "legateRevenantHit", "legateRevenantDefeated",
        *[f"legateRevenantWalk{i}" for i in range(1, 7)],
        *[f"legateRevenantCharge{i}" for i in range(1, 7)],
        *[f"legateRevenantWindup{i}" for i in range(1, 6)],
        *[f"legateRevenantShieldBash{i}" for i in range(1, 8)],
        *[f"legateRevenantStagger{i}" for i in range(1, 6)],
        *[f"legateRevenantDeath{i}" for i in range(1, 9)],
    ]
    captain_img, captain_data = load_enemy_source("looter-captain-sprites-premium-2026-06-02.json")
    cell = 384
    cols = 8
    rows = math.ceil(len(keys) / cols)
    atlas = Image.new("RGBA", (cols * cell, rows * cell), (0, 0, 0, 0))
    regions = {}
    suffix_by_pose = {
        "idle": "Idle",
        "walk1": "Walk1",
        "walk2": "Walk2",
        "walk3": "Walk3",
        "windup": "Windup",
        "attack": "Attack",
        "hit": "Hit",
        "defeated": "Defeated",
    }
    for idx, key in enumerate(keys):
        pose = boss_pose_from_key(key)
        suffix = suffix_by_pose.get(pose, "Idle")
        if pose.startswith("walk"):
            suffix = suffix_by_pose[pose]
        source_key = f"looterCaptain{suffix}"
        sprite = crop_region(captain_img, captain_data["regions"][source_key])
        cell_img = paste_source_sprite_to_cell(
            sprite,
            cell,
            356,
            352,
            tint=(92, 103, 96),
            tint_strength=0.16,
            glow=None,
            bottom_pad=12,
        )
        draw = ImageDraw.Draw(cell_img, "RGBA")
        cx = cell // 2
        if "Shield" in key or "CounterWindow" in key:
            draw.ellipse([cx - 112, cell - 250, cx - 24, cell - 105], outline=(224, 169, 61, 205), width=9)
            draw.ellipse([cx - 90, cell - 224, cx - 46, cell - 132], outline=(131, 31, 27, 190), width=8)
        if "Intro" in key:
            draw.arc([cx - 122, cell - 112, cx + 122, cell - 8], 190, 350, fill=(214, 172, 92, 150), width=5)
        if "Death" in key or key.endswith("Defeated"):
            draw.arc([cx - 150, cell - 200, cx + 145, cell - 12], 194, 348, fill=(183, 170, 117, 90), width=5)
        x = (idx % cols) * cell
        y = (idx // cols) * cell
        atlas.alpha_composite(cell_img, (x, y))
        regions[key] = {"x": x, "y": y, "w": cell, "h": cell}
    target = PUBLIC / "bosses" / "rome"
    save_png(atlas, target / "rome-legate-revenant-sprites.png")
    write_json(target / "rome-legate-revenant-sprites.json", {
        "image": "rome-legate-revenant-sprites.png",
        "source": "Rome Section One Legate Revenant boss atlas derived from existing production Journey enemy art and retuned as a spectral Roman commander.",
        "size": {"w": atlas.width, "h": atlas.height},
        "regions": regions,
    })


def draw_collectible_icon(draw: ImageDraw.ImageDraw, x: int, y: int, key: str) -> None:
    box = (x, y, x + 108, y + 108)
    if "Coin" in key or "coin" in key:
        draw.ellipse(box, fill=(204, 146, 42, 250), outline=(76, 50, 19, 220), width=4)
        draw.arc((x + 30, y + 24, x + 78, y + 86), 82, 280, fill=(90, 54, 21, 170), width=4)
    elif "Tablet" in key or "tablet" in key:
        draw.rounded_rectangle((x + 16, y + 8, x + 92, y + 100), radius=10, fill=(162, 132, 87, 250), outline=(65, 49, 31, 220), width=4)
        for yy in [34, 52, 70, 88]:
            draw.line((x + 32, y + yy, x + 76, y + yy - 3), fill=(53, 40, 26, 125), width=2)
    elif "Statue" in key or "statue" in key:
        draw.ellipse((x + 30, y + 8, x + 78, y + 56), fill=(190, 184, 164, 250), outline=(72, 68, 58, 210), width=3)
        draw.rectangle((x + 34, y + 52, x + 74, y + 92), fill=(171, 164, 144, 250), outline=(72, 68, 58, 190), width=3)
        draw.rectangle((x + 20, y + 92, x + 88, y + 104), fill=(106, 96, 80, 245))
    elif "Standard" in key or "standard" in key:
        draw.rectangle((x + 50, y + 10, x + 58, y + 104), fill=(91, 57, 31, 250))
        draw.polygon([(x + 58, y + 24), (x + 98, y + 42), (x + 58, y + 62)], fill=(151, 31, 27, 245), outline=(77, 19, 17, 220))
        draw.ellipse((x + 28, y + 8, x + 78, y + 44), fill=(210, 157, 49, 245), outline=(79, 51, 20, 210), width=3)
    elif "Scroll" in key or "scroll" in key:
        draw.rounded_rectangle((x + 18, y + 34, x + 90, y + 76), radius=12, fill=(222, 198, 146, 250), outline=(91, 65, 38, 210), width=3)
        draw.ellipse((x + 12, y + 30, x + 36, y + 82), fill=(196, 158, 91, 245), outline=(88, 58, 32, 210), width=2)
        draw.ellipse((x + 72, y + 30, x + 96, y + 82), fill=(196, 158, 91, 245), outline=(88, 58, 32, 210), width=2)
    elif "Map" in key or "map" in key:
        draw.polygon([(x + 14, y + 32), (x + 92, y + 14), (x + 96, y + 80), (x + 26, y + 98)], fill=(191, 174, 126, 248), outline=(74, 54, 30, 210))
        draw.line((x + 38, y + 34, x + 42, y + 90), fill=(94, 64, 35, 120), width=2)
        draw.line((x + 64, y + 24, x + 70, y + 84), fill=(94, 64, 35, 120), width=2)
    elif "Sandal" in key or "sandal" in key:
        draw.ellipse((x + 28, y + 14, x + 76, y + 104), fill=(125, 72, 39, 248), outline=(54, 32, 20, 215), width=3)
        for yy in [42, 58, 74]:
            draw.line((x + 34, y + yy, x + 74, y + yy - 12), fill=(221, 166, 80, 170), width=4)
    elif "Brace" in key or "brace" in key:
        draw.arc((x + 20, y + 16, x + 90, y + 98), 38, 322, fill=(192, 128, 46, 250), width=18)
        draw.arc((x + 34, y + 30, x + 76, y + 84), 38, 322, fill=(75, 48, 24, 190), width=4)
    elif "Shield" in key or "shield" in key:
        draw.rounded_rectangle((x + 22, y + 12, x + 86, y + 96), radius=22, fill=(123, 29, 27, 248), outline=(60, 18, 17, 220), width=4)
        draw.ellipse((x + 42, y + 40, x + 66, y + 66), fill=(208, 155, 50, 245), outline=(82, 52, 20, 220), width=3)
    elif "Ring" in key or "ring" in key:
        draw.ellipse((x + 24, y + 24, x + 84, y + 84), outline=(213, 166, 62, 250), width=14)
        draw.polygon([(x + 48, y + 12), (x + 64, y + 12), (x + 72, y + 30), (x + 40, y + 30)], fill=(139, 30, 38, 245), outline=(73, 19, 25, 210))
    else:
        draw.ellipse(box, fill=(150, 124, 84, 245), outline=(73, 54, 31, 210), width=4)


def write_collectible_atlas() -> None:
    target = PUBLIC / "collectibles"
    atlas_path = target / "journey-collectibles-pack.json"
    data = json.loads(atlas_path.read_text(encoding="utf-8"))
    original = Image.open(target / data["image"]).convert("RGBA")
    next_image = Image.new("RGBA", (2048, 2048), (0, 0, 0, 0))
    next_image.alpha_composite(original, (0, 0))
    draw = ImageDraw.Draw(next_image, "RGBA")
    keys = [
        "romeSenateTablet", "romeLawTablet", "romeCaesarStatue", "romeAugustusCoin",
        "romeMilitaryStandard", "romeEmpireMap", "romeSplitEmpireTablet", "romeWaxTablet",
        "romeRomanCoin", "romeScrollBundle", "romeSandal", "romeGladiatorBrace",
        "romeLegionShield", "romeSenatorialRing", "romeArchiveKey", "romeTimelineSeal",
    ]
    for index, key in enumerate(keys):
        col = index % 8
        row = index // 8
        cell_x = col * 128
        cell_y = 1536 + row * 128
        draw_collectible_icon(draw, cell_x + 10, cell_y + 10, key)
        data["regions"][key] = {"x": cell_x + 10, "y": cell_y + 10, "w": 108, "h": 108}
    next_name = f"journey-collectibles-pack-rome-section-one-{STAMP}.png"
    save_png(next_image, target / next_name)
    data["image"] = next_name
    source_note = " Rome Section One evidence and upgrade icons appended June 2026."
    if source_note.strip() not in data.get("source", ""):
        data["source"] = data.get("source", "") + source_note
    data["size"] = {"w": 2048, "h": 2048}
    coordinate_note = " Rome icon regions occupy the transparent lower band of the expanded atlas."
    if coordinate_note.strip() not in data.get("coordinateNote", ""):
        data["coordinateNote"] = data.get("coordinateNote", "") + coordinate_note
    write_json(atlas_path, data)


def write_player_variant_and_weapon() -> None:
    target = PUBLIC / "player"
    source_json = json.loads((target / "asha-reference-warrior-dodge-preview-spritesheet.json").read_text(encoding="utf-8"))
    source_img = Image.open(target / source_json["image"]).convert("RGBA")
    overlay = Image.new("RGBA", source_img.size, (122, 37, 31, 0))
    mask = Image.new("L", source_img.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    for y in range(0, source_img.height, 560):
        for x in range(0, source_img.width, 390):
            mask_draw.polygon([(x + 135, y + 160), (x + 245, y + 160), (x + 285, y + 500), (x + 105, y + 500)], fill=26)
    mask = ImageChops.multiply(mask, source_img.getchannel("A"))
    overlay.putalpha(mask)
    rome_img = Image.alpha_composite(source_img, overlay)
    rome_img = ImageEnhance.Color(rome_img).enhance(1.04)
    rome_image_name = "asha-rome-variant-spritesheet.png"
    save_png(rome_img, target / rome_image_name)
    source_json["image"] = rome_image_name
    source_json["characterId"] = "asha-rome"
    source_json["source"] = "Rome-named Asha atlas derived from the production warrior motion sheet with subtle Roman red-gold costume grading."
    write_json(target / "asha-rome-variant-spritesheet.json", source_json)

    weapon = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    draw = ImageDraw.Draw(weapon, "RGBA")
    regions = {
        "gladiusIdle": {"x": 48, "y": 0, "w": 110, "h": 256},
        "gladiusWindup": {"x": 298, "y": 0, "w": 148, "h": 230},
        "gladiusSwing": {"x": 0, "y": 286, "w": 294, "h": 226},
        "gladiusReady": {"x": 316, "y": 272, "w": 196, "h": 240},
    }
    def sword(cx, cy, angle, length, width):
        blade = Image.new("RGBA", (180, 260), (0, 0, 0, 0))
        bd = ImageDraw.Draw(blade, "RGBA")
        bd.polygon([(90, 8), (90 - width, 178), (90, 224), (90 + width, 178)], fill=(213, 218, 210, 250), outline=(68, 75, 74, 220))
        bd.line([(90, 18), (90, 205)], fill=(255, 255, 245, 150), width=2)
        bd.rectangle([58, 208, 122, 221], fill=(190, 139, 43, 250), outline=(73, 49, 20, 220), width=3)
        bd.rectangle([82, 218, 98, 252], fill=(89, 49, 29, 250), outline=(48, 28, 18, 220), width=2)
        rotated = blade.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
        weapon.alpha_composite(rotated, (int(cx - rotated.width / 2), int(cy - rotated.height / 2)))
    sword(103, 130, -4, 210, 17)
    sword(372, 115, -46, 210, 17)
    sword(145, 398, 74, 240, 18)
    sword(412, 390, 16, 212, 17)
    save_png(weapon, target / "gladius-weapon-pack.png")
    write_json(target / "gladius-weapon-pack.json", {
        "image": "gladius-weapon-pack.png",
        "source": "Rome Section One transparent gladius weapon atlas.",
        "size": {"w": 512, "h": 512},
        "regions": regions,
    })


def trim_alpha(image: Image.Image, padding: int = 10) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha_box = rgba.getchannel("A").getbbox()
    if not alpha_box:
        return rgba
    left, top, right, bottom = alpha_box
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(rgba.width, right + padding)
    bottom = min(rgba.height, bottom + padding)
    return rgba.crop((left, top, right, bottom))


def crop_atlas_region(image_path: Path, manifest_path: Path, region_key: str) -> Image.Image:
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    atlas = Image.open(image_path).convert("RGBA")
    region = data["regions"][region_key]
    return atlas.crop((region["x"], region["y"], region["x"] + region["w"], region["y"] + region["h"]))


def fit_cutout(source: Image.Image, size: tuple[int, int], height_ratio: float = 0.92, bottom_pad: int = 18) -> Image.Image:
    trimmed = trim_alpha(source, 8)
    target = Image.new("RGBA", size, (0, 0, 0, 0))
    max_h = int(size[1] * height_ratio)
    max_w = int(size[0] * 0.96)
    scale = min(max_w / max(1, trimmed.width), max_h / max(1, trimmed.height))
    next_size = (max(1, int(trimmed.width * scale)), max(1, int(trimmed.height * scale)))
    resized = trimmed.resize(next_size, Image.Resampling.LANCZOS)
    target.alpha_composite(resized, ((size[0] - resized.width) // 2, size[1] - resized.height - bottom_pad))
    return target


def add_spectral_glow(cutout: Image.Image, color: tuple[int, int, int, int]) -> Image.Image:
    alpha = cutout.getchannel("A")
    glow = Image.new("RGBA", cutout.size, color)
    glow.putalpha(alpha.filter(ImageFilter.GaussianBlur(15)))
    halo = Image.new("RGBA", cutout.size, color)
    halo.putalpha(alpha.filter(ImageFilter.GaussianBlur(38)).point(lambda value: int(value * 0.55)))
    return Image.alpha_composite(Image.alpha_composite(halo, glow), cutout)


def make_rome_vault_sigil(size: tuple[int, int] = (720, 720)) -> Image.Image:
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image, "RGBA")
    cx = size[0] // 2
    cy = size[1] // 2
    for radius, alpha, width in [(310, 76, 8), (252, 145, 7), (194, 96, 5), (126, 128, 4)]:
        draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=(226, 176, 72, alpha), width=width)
    for i in range(24):
        angle = (math.tau * i) / 24
        inner = 220 + (i % 2) * 20
        outer = 306
        x1 = cx + math.cos(angle) * inner
        y1 = cy + math.sin(angle) * inner
        x2 = cx + math.cos(angle) * outer
        y2 = cy + math.sin(angle) * outer
        draw.line([x1, y1, x2, y2], fill=(232, 193, 100, 118), width=4 if i % 3 == 0 else 2)
    for i in range(5):
        angle = -math.pi / 2 + (math.tau * i) / 5
        x = cx + math.cos(angle) * 145
        y = cy + math.sin(angle) * 145
        draw.rounded_rectangle([x - 36, y - 48, x + 36, y + 48], radius=10, fill=(122, 92, 48, 130), outline=(239, 195, 92, 150), width=4)
        for row in range(3):
            draw.line([x - 18, y - 18 + row * 18, x + 18, y - 22 + row * 18], fill=(32, 24, 15, 90), width=2)
    draw.polygon([(cx, cy - 82), (cx + 74, cy + 46), (cx - 74, cy + 46)], outline=(238, 199, 92, 185), fill=(15, 12, 9, 56))
    draw.ellipse([cx - 28, cy - 28, cx + 28, cy + 28], fill=(244, 218, 137, 190), outline=(72, 48, 20, 150), width=4)
    glow = Image.new("RGBA", size, (96, 208, 218, 0))
    glow_alpha = image.getchannel("A").filter(ImageFilter.GaussianBlur(18)).point(lambda value: int(value * 0.42))
    glow.putalpha(glow_alpha)
    return Image.alpha_composite(glow, image)


def write_cutscene_assets() -> None:
    player_target = PUBLIC / "player"
    boss_target = PUBLIC / "bosses" / "rome"
    environment_target = PUBLIC / "environment" / "rome-section-one"

    asha_frame = crop_atlas_region(
        player_target / "asha-rome-variant-spritesheet.png",
        player_target / "asha-rome-variant-spritesheet.json",
        "idle_07",
    )
    asha_cutout = fit_cutout(asha_frame, (540, 780), height_ratio=0.96, bottom_pad=10)
    save_png(asha_cutout, player_target / f"asha-rome-cutscene-{STAMP}.png")

    legate_frame = crop_atlas_region(
        boss_target / "rome-legate-revenant-sprites.png",
        boss_target / "rome-legate-revenant-sprites.json",
        "legateRevenantIdle",
    )
    legate_cutout = fit_cutout(legate_frame, (680, 800), height_ratio=0.96, bottom_pad=8)
    legate_cutout = add_spectral_glow(legate_cutout, (100, 214, 225, 96))
    save_png(legate_cutout, boss_target / f"rome-legate-revenant-cutscene-{STAMP}.png")

    save_png(make_rome_vault_sigil(), environment_target / f"rome-vault-sigil-cutscene-{STAMP}.png")


def main() -> None:
    write_background_pack(
        "rome-via-sacra",
        "rome-via-sacra-parallax-pack.json",
        make_via_sacra_layers(),
        "Rome Section One Via Sacra parallax pack generated from the no-temple Roman street source plus project-local painted depth layers.",
    )
    write_background_pack("rome-forum-ruins", "rome-forum-ruins-parallax-pack.json", make_forum_layers())
    write_background_pack("rome-subterranean-thermae", "rome-thermae-parallax-pack.json", make_thermae_layers())
    write_background_pack("rome-basilica-interior", "rome-basilica-parallax-pack.json", make_basilica_layers())
    write_background_pack("rome-sealed-vault", "rome-vault-parallax-pack.json", make_vault_layers())
    write_environment_props()
    write_environment_atlas()
    write_enemy_packs()
    write_enemy_packs_from_sources()
    write_boss_pack()
    write_boss_pack_from_source()
    write_collectible_atlas()
    write_player_variant_and_weapon()
    write_cutscene_assets()
    print("Generated Rome Section One PNG assets and manifests.")


if __name__ == "__main__":
    main()
