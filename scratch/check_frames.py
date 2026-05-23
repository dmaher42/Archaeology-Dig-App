import sys
from PIL import Image

paths = [
    r"C:\Users\dmahe\.gemini\antigravity\brain\27585ee2-bf13-4207-b1a4-885369e2ac0a\asha_v4_idle_sword_1779485390124.png",
    r"C:\Users\dmahe\.gemini\antigravity\brain\27585ee2-bf13-4207-b1a4-885369e2ac0a\asha_v4_run_sword_1779485421810.png",
    r"C:\Users\dmahe\.gemini\antigravity\brain\27585ee2-bf13-4207-b1a4-885369e2ac0a\asha_v4_jump_sword_1779485441851.png",
    r"C:\Users\dmahe\.gemini\antigravity\brain\27585ee2-bf13-4207-b1a4-885369e2ac0a\asha_v4_attack_sword_1779485456896.png"
]

for p in paths:
    img = Image.open(p)
    w, h = img.size
    aspect = round(w / h)
    print(f"{p.split('\\')[-1]}: {w}x{h} -> {aspect} frames")
