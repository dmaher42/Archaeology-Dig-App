from __future__ import annotations

import math
import random
import wave
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "assets" / "expedition" / "sfx" / "generated"
SAMPLE_RATE = 44_100
SEED = 710_2026


def envelope(t: float, duration: float, attack: float = 0.015, release_power: float = 2.0) -> float:
    if duration <= 0:
        return 0
    attack_level = min(1.0, t / max(attack, 0.001))
    release = max(0.0, 1.0 - (t / duration)) ** release_power
    return attack_level * release


def noise(rng: random.Random) -> float:
    return rng.uniform(-1.0, 1.0)


def low_noise(rng: random.Random, last: float, amount: float = 0.86) -> tuple[float, float]:
    value = (last * amount) + (noise(rng) * (1.0 - amount))
    return value, value


def tone(freq: float, t: float, wave_type: str = "sine") -> float:
    phase = 2.0 * math.pi * freq * t
    if wave_type == "triangle":
        return (2.0 / math.pi) * math.asin(math.sin(phase))
    if wave_type == "square":
        return 1.0 if math.sin(phase) >= 0 else -1.0
    if wave_type == "saw":
        return 2.0 * ((freq * t) % 1.0) - 1.0
    return math.sin(phase)


def soft_clip(value: float, drive: float = 1.7) -> float:
    return math.tanh(value * drive) / math.tanh(drive)


def cinematic_sub_stack(t: float, duration: float, base_freq: float, movement: float = 1.0) -> float:
    drift = math.sin(t * 0.73 * movement) * 2.4 + math.sin(t * 1.91 * movement) * 1.35
    pitch = max(18.0, base_freq + drift)
    layer_a = tone(pitch, t) * 0.42
    layer_b = tone(pitch * 0.505, t + 0.003) * 0.34
    layer_c = tone(pitch * 1.015, t + 0.011, "triangle") * 0.18
    return (layer_a + layer_b + layer_c) * envelope(t, duration, 0.38, 1.16)


def air_mass_texture(t: float, duration: float, rng: random.Random, low: float, gain: float = 1.0) -> float:
    breathing = low * envelope(t, duration, 0.5, 1.45) * 0.22
    high_dust = noise(rng) * envelope(t, duration, 0.9, 2.2) * 0.035
    room_sway = tone(118 + math.sin(t * 2.7) * 36, t, "triangle") * envelope(t, duration, 0.75, 1.8) * 0.025
    return (breathing + high_dust + room_sway) * gain


def stone_stress_crackle(t: float, duration: float, rng: random.Random, offsets: tuple[float, ...] = ()) -> float:
    crackle = noise(rng) * envelope(t, duration, 0.08, 2.8) * 0.018
    for offset in offsets:
        local = max(0.0, t - offset)
        crackle += noise(rng) * envelope(local, 0.11, 0.001, 5.4) * 0.075
        crackle += tone(420 + (offset * 180) + math.sin(local * 70) * 72, local, "triangle") * envelope(local, 0.16, 0.002, 4.2) * 0.025
    return crackle


def ancient_signal_chime(t: float, duration: float) -> float:
    shimmer = 0.0
    for offset, freq, gain in (
        (0.025, 520, 0.072),
        (0.135, 780, 0.058),
        (0.315, 1040, 0.046),
        (0.57, 1380, 0.032),
    ):
        local = max(0.0, t - offset)
        bend = math.sin(local * 9.5) * 28 + math.sin(local * 3.2) * 18
        shimmer += tone(freq + bend, local, "triangle") * envelope(local, 1.18, 0.004, 2.7) * gain
    reverse_wake = tone(360 + (min(t / max(duration, 0.1), 1.0) * 230), t, "triangle") * envelope(t, duration, 1.05, 1.9) * 0.026
    return shimmer + reverse_wake


def threshold_shear_burst(t: float, duration: float, rng: random.Random, low: float) -> float:
    progress = min(t / max(duration, 0.1), 1.0)
    shear = tone(980 - progress * 620 + math.sin(t * 34) * 140, t, "saw") * envelope(t, 0.92, 0.012, 1.9) * 0.042
    torn_air = noise(rng) * envelope(t, duration, 0.05, 1.24) * (0.07 + progress * 0.03)
    pressure_snap = cinematic_sub_stack(max(0.0, t - 0.18), 1.55, 28, 1.65) * envelope(max(0.0, t - 0.18), 1.7, 0.003, 2.15) * 0.24
    downward_warp = tone(188 - progress * 122 + math.sin(t * 11) * 16, t, "triangle") * envelope(t, duration, 0.06, 1.65) * 0.058
    dust_pull = low * envelope(t, duration, 0.18, 1.42) * 0.11
    return shear + torn_air + pressure_snap + downward_warp + dust_pull


def guardian_overtone_chorus(t: float, duration: float) -> float:
    verdict = tone(44 + math.sin(t * 3.4) * 2.5, t, "saw") * envelope(t, duration, 0.11, 1.45) * 0.18
    harmonics = 0.0
    for freq, drift, gain in ((88, 4.4, 0.09), (132, 6.2, 0.052), (176, 7.6, 0.036), (264, 9.3, 0.021)):
        harmonics += tone(freq + math.sin(t * drift) * (freq * 0.035), t, "triangle") * gain
    pulse = 0.0
    for offset in (0.03, 0.34, 0.88):
        local = max(0.0, t - offset)
        pulse += tone(32 - min(local, 0.45) * 8, local) * envelope(local, 0.64, 0.002, 2.8) * 0.2
    return (verdict + harmonics * envelope(t, duration, 0.18, 2.0) + pulse)


def lost_site_pressure_release(t: float, duration: float, rng: random.Random, low: float) -> float:
    progress = min(t / max(duration, 0.1), 1.0)
    opening_vacuum = low * envelope(t, duration, 0.18, 1.08) * (0.16 + progress * 0.05)
    room_inhale = noise(rng) * envelope(t, duration, 0.8, 1.85) * 0.046
    pressure_tone = tone(96 + math.sin(t * 2.4) * 22 + progress * 34, t, "triangle") * envelope(t, duration, 0.72, 1.64) * 0.052
    far_gate = tone(34 + math.sin(t * 1.1) * 3, t) * envelope(max(0.0, t - 0.48), max(0.1, duration - 0.48), 0.28, 1.35) * 0.12
    grit = stone_stress_crackle(t, duration, rng, (0.92, 1.84, 3.22)) * 0.34
    return opening_vacuum + room_inhale + pressure_tone + far_gate + grit


def render(duration: float, fn) -> list[float]:
    rng = random.Random(SEED + int(duration * 1000))
    total = int(SAMPLE_RATE * duration)
    samples: list[float] = []
    last_low = 0.0
    for i in range(total):
        t = i / SAMPLE_RATE
        low, last_low = low_noise(rng, last_low)
        value = fn(t, duration, rng, low)
        samples.append(max(-0.98, min(0.98, value)))
    return samples


def write_wav(path: Path, samples: list[float]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for sample in samples:
            frames.extend(int(sample * 32767).to_bytes(2, "little", signed=True))
        wav.writeframes(frames)


def land_soft(t: float, duration: float, rng: random.Random, low: float) -> float:
    env = envelope(t, duration, 0.006, 3.0)
    thump = tone(86 - (44 * t / duration), t) * envelope(t, 0.18, 0.004, 3.2) * 0.42
    sand = low * env * 0.24
    return thump + sand


def satchel_leather(t: float, duration: float, rng: random.Random, low: float) -> float:
    rub = low * envelope(t, duration, 0.025, 1.7) * 0.28
    fold = tone(142 + (18 * math.sin(t * 38)), t, "triangle") * envelope(t, 0.2, 0.018, 2.4) * 0.08
    return rub + fold


def satchel_buckle(t: float, duration: float, rng: random.Random, low: float) -> float:
    click = tone(2600, t, "triangle") * envelope(t, 0.045, 0.002, 3.8) * 0.34
    body = tone(420 - (130 * t / duration), t, "square") * envelope(t, 0.09, 0.002, 3.0) * 0.1
    return click + body + (noise(rng) * envelope(t, 0.05, 0.001, 4.0) * 0.08)


def metal_click(t: float, duration: float, rng: random.Random, low: float) -> float:
    ping = tone(3150, t, "triangle") * envelope(t, 0.09, 0.0015, 4.6) * 0.32
    ring = tone(1720, t) * envelope(t, duration, 0.003, 3.2) * 0.13
    tap = noise(rng) * envelope(t, 0.025, 0.001, 5.0) * 0.1
    return ping + ring + tap


def relic_shard(t: float, duration: float, rng: random.Random, low: float) -> float:
    shimmer = (
        tone(880, t)
        + tone(1320, t + 0.002)
        + tone(1760, t + 0.004)
    ) * envelope(t, duration, 0.012, 2.5) * 0.11
    chime = tone(620, t, "triangle") * envelope(t, 0.26, 0.004, 2.9) * 0.16
    return shimmer + chime


def enemy_hit(t: float, duration: float, rng: random.Random, low: float) -> float:
    slap = noise(rng) * envelope(t, 0.12, 0.002, 3.2) * 0.28
    body = tone(170 - (80 * t / duration), t, "triangle") * envelope(t, 0.16, 0.004, 2.8) * 0.2
    grit = low * envelope(t, duration, 0.004, 2.6) * 0.18
    return slap + body + grit


def player_hit(t: float, duration: float, rng: random.Random, low: float) -> float:
    impact = tone(104 - (52 * t / duration), t) * envelope(t, 0.2, 0.004, 2.7) * 0.34
    cloth = low * envelope(t, duration, 0.006, 2.2) * 0.2
    sharp = noise(rng) * envelope(t, 0.055, 0.0015, 3.8) * 0.12
    return impact + cloth + sharp


def boss_warning(t: float, duration: float, rng: random.Random, low: float) -> float:
    pulse = tone(92 - (24 * t / duration), t) * envelope(t, duration, 0.03, 1.8) * 0.36
    harmonic = tone(184, t, "triangle") * envelope(t, duration, 0.04, 2.2) * 0.1
    grit = low * envelope(t, duration, 0.02, 2.0) * 0.18
    return pulse + harmonic + grit


def stone_gate_open(t: float, duration: float, rng: random.Random, low: float) -> float:
    scrape = low * envelope(t, duration, 0.05, 1.4) * 0.34
    rumble = tone(76 - (20 * t / duration), t) * envelope(t, duration, 0.025, 1.8) * 0.25
    unlock = tone(520, t, "triangle") * envelope(max(0.0, t - 0.18), 0.25, 0.003, 3.0) * 0.12
    return scrape + rumble + unlock


def stone_gate_blocked(t: float, duration: float, rng: random.Random, low: float) -> float:
    knock = tone(118 - (40 * t / duration), t, "square") * envelope(t, 0.18, 0.003, 3.0) * 0.3
    dust = low * envelope(t, duration, 0.006, 2.3) * 0.25
    return knock + dust


def bass_impact(t: float, duration: float, rng: random.Random, low: float) -> float:
    drop = tone(54 - (28 * t / duration), t) * envelope(t, duration, 0.006, 2.1) * 0.52
    air = low * envelope(t, duration, 0.008, 2.6) * 0.18
    return drop + air


def distant_rockfall(t: float, duration: float, rng: random.Random, low: float) -> float:
    thumps = 0.0
    for offset, gain, freq in [(0.04, 0.34, 72), (0.42, 0.24, 58), (0.93, 0.18, 66), (1.38, 0.12, 84)]:
        local = max(0.0, t - offset)
        thumps += tone(freq - (22 * min(local, 0.6)), local) * envelope(local, 0.55, 0.006, 2.9) * gain
    gravel = low * envelope(t, duration, 0.05, 1.7) * 0.26
    grit = noise(rng) * envelope(t, duration, 0.03, 2.4) * 0.05
    return thumps + gravel + grit


def temple_stone_groan(t: float, duration: float, rng: random.Random, low: float) -> float:
    bend = tone(92 + math.sin(t * 3.6) * 18, t, "triangle") * envelope(t, duration, 0.18, 1.25) * 0.18
    sub = tone(38 + math.sin(t * 2.1) * 5, t) * envelope(t, duration, 0.24, 1.1) * 0.34
    scrape = low * envelope(t, duration, 0.12, 1.35) * 0.24
    return bend + sub + scrape


def distant_ruin_collapse(t: float, duration: float, rng: random.Random, low: float) -> float:
    blast = bass_impact(t, duration, rng, low) * 0.72
    fall = distant_rockfall(max(0.0, t - 0.18), max(0.1, duration - 0.18), rng, low) * 0.86
    dust = low * envelope(t, duration, 0.28, 1.15) * 0.18
    return blast + fall + dust


def distant_monster_call(t: float, duration: float, rng: random.Random, low: float) -> float:
    growl_env = envelope(t, duration, 0.24, 1.7)
    throat = tone(78 + math.sin(t * 14) * 9, t, "saw") * growl_env * 0.13
    chest = tone(42 + math.sin(t * 7) * 4, t) * growl_env * 0.28
    breath = low * envelope(t, duration, 0.08, 1.9) * 0.24
    click = noise(rng) * envelope(max(0.0, t - 1.05), 0.16, 0.01, 3.2) * 0.06
    return throat + chest + breath + click


def major_cave_in(t: float, duration: float, rng: random.Random, low: float) -> float:
    first = distant_ruin_collapse(t, duration, rng, low) * 0.9
    second = distant_rockfall(max(0.0, t - 0.72), max(0.1, duration - 0.72), rng, low) * 0.72
    sub = tone(34 - (8 * min(t / duration, 1)), t) * envelope(t, duration, 0.03, 1.2) * 0.32
    return first + second + sub


def structure_ripping(t: float, duration: float, rng: random.Random, low: float) -> float:
    tear = low * envelope(t, duration, 0.08, 1.1) * 0.32
    stress = tone(150 + math.sin(t * 18) * 46, t, "saw") * envelope(t, duration, 0.16, 1.45) * 0.08
    cracks = 0.0
    for offset in (0.22, 0.74, 1.26):
        local = max(0.0, t - offset)
        cracks += noise(rng) * envelope(local, 0.12, 0.002, 4.0) * 0.12
    return tear + stress + cracks


def combat_danger_hit(t: float, duration: float, rng: random.Random, low: float) -> float:
    punch = tone(70 - (36 * t / duration), t) * envelope(t, 0.28, 0.003, 2.6) * 0.42
    shock = low * envelope(t, duration, 0.004, 2.4) * 0.18
    snap = noise(rng) * envelope(t, 0.045, 0.001, 4.2) * 0.1
    return punch + shock + snap


def asha_hurt_breath(t: float, duration: float, rng: random.Random, low: float) -> float:
    exhale = low * envelope(t, duration, 0.015, 2.0) * 0.12
    voiced = tone(210 - (86 * t / duration), t, "triangle") * envelope(t, 0.22, 0.012, 2.6) * 0.055
    air = noise(rng) * envelope(t, duration, 0.02, 2.8) * 0.035
    return exhale + voiced + air


def temple_door_boom(t: float, duration: float, rng: random.Random, low: float) -> float:
    impact = tone(62 - (26 * t / duration), t) * envelope(t, 0.55, 0.004, 2.2) * 0.46
    slab = low * envelope(t, duration, 0.025, 1.55) * 0.3
    ring = tone(270 - (72 * t / duration), t, "triangle") * envelope(t, duration, 0.018, 2.0) * 0.08
    return impact + slab + ring


def sandfall_stone_cascade(t: float, duration: float, rng: random.Random, low: float) -> float:
    sand = low * envelope(t, duration, 0.05, 1.35) * 0.34
    pebbles = noise(rng) * envelope(t, duration, 0.02, 2.1) * 0.09
    stones = 0.0
    for offset, gain in [(0.18, 0.15), (0.42, 0.12), (0.78, 0.1), (1.2, 0.08)]:
        local = max(0.0, t - offset)
        stones += tone(118 - 28 * min(local, 0.4), local, "triangle") * envelope(local, 0.22, 0.004, 3.0) * gain
    return sand + pebbles + stones


def catacomb_deep_breath(t: float, duration: float, rng: random.Random, low: float) -> float:
    inhale = low * envelope(t, duration, 0.22, 1.35) * 0.28
    chest = tone(48 + math.sin(t * 4) * 5, t) * envelope(t, duration, 0.3, 1.45) * 0.22
    whisper = noise(rng) * envelope(t, duration, 0.18, 2.0) * 0.035
    return inhale + chest + whisper


def catacomb_fog_whisper(t: float, duration: float, rng: random.Random, low: float) -> float:
    hiss = noise(rng) * envelope(t, duration, 0.18, 1.65) * 0.055
    drift = low * envelope(t, duration, 0.2, 1.25) * 0.18
    thin = tone(980 + math.sin(t * 5.5) * 160, t) * envelope(t, duration, 0.42, 1.8) * 0.012
    return hiss + drift + thin


def bridge_stone_crack(t: float, duration: float, rng: random.Random, low: float) -> float:
    crack = noise(rng) * envelope(t, 0.12, 0.001, 4.2) * 0.18
    body = tone(82 - 34 * min(t / duration, 1), t) * envelope(t, duration, 0.008, 2.4) * 0.32
    crumble = low * envelope(max(0.0, t - 0.16), max(0.1, duration - 0.16), 0.02, 1.7) * 0.2
    return crack + body + crumble


def unstable_excavation_tremor(t: float, duration: float, rng: random.Random, low: float) -> float:
    pulse = tone(44 + math.sin(t * 10) * 5, t) * envelope(t, duration, 0.04, 1.3) * 0.36
    dirt = low * envelope(t, duration, 0.05, 1.55) * 0.24
    grit = noise(rng) * envelope(t, duration, 0.04, 2.2) * 0.04
    return pulse + dirt + grit


def final_guardian_dread(t: float, duration: float, rng: random.Random, low: float) -> float:
    bell = tone(210 - 34 * min(t / duration, 1), t, "triangle") * envelope(t, duration, 0.08, 2.1) * 0.1
    sub = tone(36 + math.sin(t * 2.4) * 3, t) * envelope(t, duration, 0.2, 1.18) * 0.34
    throat = low * envelope(t, duration, 0.14, 1.4) * 0.22
    return bell + sub + throat


def void_bass_swell(t: float, duration: float, rng: random.Random, low: float) -> float:
    rise = min(1.0, t / max(duration * 0.72, 0.1))
    sub = cinematic_sub_stack(t, duration, 30 + rise * 3.5, 0.86) * 0.72
    undertow = air_mass_texture(t, duration, rng, low, 1.1)
    inverted_tail = tone(212 - rise * 36 + math.sin(t * 4.2) * 14, t, "saw") * envelope(t, duration, 1.1, 1.42) * 0.045
    shimmer = tone(610 + math.sin(t * 3.1) * 180, t, "triangle") * envelope(t, duration, 1.45, 1.9) * 0.018
    return soft_clip(sub + undertow + inverted_tail + shimmer, 2.15) * 0.86


def underworld_heart_drone(t: float, duration: float, rng: random.Random, low: float) -> float:
    beat = 0.0
    for offset in (0.08, 0.38, 1.48, 1.78, 2.88, 3.18, 4.18):
        local = max(0.0, t - offset)
        beat += cinematic_sub_stack(local, 0.72, 39 - 7 * min(local, 0.42), 1.25) * envelope(local, 0.68, 0.004, 2.45) * 0.45
    drone = cinematic_sub_stack(t, duration, 27, 0.52) * 0.42
    breath = air_mass_texture(t, duration, rng, low, 1.25)
    pressure = tone(96 + math.sin(t * 5.8) * 24, t, "saw") * envelope(t, duration, 0.62, 1.7) * 0.035
    return soft_clip(beat + drone + breath + pressure, 2.05) * 0.88


def reality_tear_rumble(t: float, duration: float, rng: random.Random, low: float) -> float:
    progress = min(t / max(duration, 0.1), 1.0)
    sub = cinematic_sub_stack(t, duration, 34 - progress * 5.5, 1.8) * 0.68
    rip = tone(58 - 24 * progress + math.sin(t * 13) * 8, t, "saw") * envelope(t, duration, 0.035, 1.18) * 0.2
    air = air_mass_texture(t, duration, rng, low, 0.9)
    crackle = stone_stress_crackle(t, duration, rng, (0.18, 0.48, 0.9, 1.33, 1.86, 2.42))
    harmonic = tone(880 + math.sin(t * 9.5) * 260, t, "triangle") * envelope(t, duration, 0.22, 2.35) * 0.018
    return soft_clip(sub + rip + air + crackle + harmonic, 2.35) * 0.9


def scarab_touch_whisper(t: float, duration: float, rng: random.Random, low: float) -> float:
    progress = min(t / max(duration, 0.1), 1.0)
    stone_skin = low * envelope(t, duration, 0.012, 2.1) * 0.2
    contact = tone(118 - 46 * progress, t, "triangle") * envelope(t, 0.34, 0.002, 3.1) * 0.24
    signal = ancient_signal_chime(t, duration)
    sub = cinematic_sub_stack(t, duration, 35 + math.sin(t * 1.2) * 1.5, 0.62) * 0.2
    air = air_mass_texture(t, duration, rng, low, 0.82)
    crackle = stone_stress_crackle(t, duration, rng, (0.1, 0.36, 0.88, 1.42)) * 0.72
    return soft_clip(stone_skin + contact + signal + sub + air + crackle, 2.2) * 0.78


def threshold_reality_tear(t: float, duration: float, rng: random.Random, low: float) -> float:
    progress = min(t / max(duration, 0.1), 1.0)
    sub = cinematic_sub_stack(t, duration, 36 - progress * 8.5, 2.2) * 0.68
    rip = tone(70 - 34 * progress + math.sin(t * 17) * 10, t, "saw") * envelope(t, duration, 0.035, 1.04) * 0.16
    shear = threshold_shear_burst(t, duration, rng, low)
    strained_air = air_mass_texture(t, duration, rng, low, 1.36)
    crackle = stone_stress_crackle(t, duration, rng, (0.1, 0.29, 0.56, 0.92, 1.46, 2.2, 3.06)) * 1.05
    falling_tail = cinematic_sub_stack(max(0.0, t - 1.18), 2.0, 28, 1.4) * envelope(max(0.0, t - 1.18), 2.08, 0.006, 2.05) * 0.3
    bright_shear = tone(760 + math.sin(t * 21) * 220, t, "triangle") * envelope(t, duration, 0.18, 2.2) * 0.024
    return soft_clip(sub + rip + shear + strained_air + crackle + falling_tail + bright_shear, 2.42) * 0.91


def anubis_presence_stinger(t: float, duration: float, rng: random.Random, low: float) -> float:
    local_hit = min(t, 0.95)
    impact = cinematic_sub_stack(local_hit, 0.95, 30 - 5.8 * local_hit, 1.7) * envelope(local_hit, 0.95, 0.003, 2.35) * 0.98
    chamber_breath = air_mass_texture(t, duration, rng, low, 1.12)
    chorus = guardian_overtone_chorus(t, duration)
    stone_warning = stone_stress_crackle(t, duration, rng, (0.28, 0.84, 1.48, 2.16)) * 0.8
    return soft_clip(impact + chamber_breath + chorus + stone_warning, 2.32) * 0.9


def lost_site_air_shift(t: float, duration: float, rng: random.Random, low: float) -> float:
    progress = min(t / max(duration, 0.1), 1.0)
    undertow = cinematic_sub_stack(t, duration, 27 + math.sin(t * 0.8) * 2.4, 0.48) * 0.32
    old_air = air_mass_texture(t, duration, rng, low, 1.44)
    pressure_release = lost_site_pressure_release(t, duration, rng, low)
    dust_shear = noise(rng) * envelope(t, duration, 1.0, 2.1) * 0.032
    high_drift = tone(310 + math.sin(t * 1.7) * 80 + progress * 120, t, "triangle") * envelope(t, duration, 1.35, 2.2) * 0.018
    return soft_clip(undertow + old_air + pressure_release + dust_shear + high_drift, 2.08) * 0.78


def main() -> None:
    specs = {
        "land-soft.wav": (0.36, land_soft),
        "satchel-leather.wav": (0.34, satchel_leather),
        "satchel-buckle.wav": (0.22, satchel_buckle),
        "metal-click.wav": (0.28, metal_click),
        "relic-shard.wav": (0.56, relic_shard),
        "enemy-hit.wav": (0.26, enemy_hit),
        "player-hit.wav": (0.34, player_hit),
        "boss-warning.wav": (0.72, boss_warning),
        "stone-gate-open.wav": (0.9, stone_gate_open),
        "stone-gate-blocked.wav": (0.42, stone_gate_blocked),
        "bass-impact.wav": (0.9, bass_impact),
        "distant-rockfall.wav": (2.4, distant_rockfall),
        "temple-stone-groan.wav": (2.8, temple_stone_groan),
        "distant-ruin-collapse.wav": (3.1, distant_ruin_collapse),
        "distant-monster-call.wav": (2.2, distant_monster_call),
        "major-cave-in.wav": (3.4, major_cave_in),
        "structure-ripping.wav": (2.2, structure_ripping),
        "combat-danger-hit.wav": (0.42, combat_danger_hit),
        "asha-hurt-breath.wav": (0.36, asha_hurt_breath),
        "temple-door-boom.wav": (1.35, temple_door_boom),
        "sandfall-stone-cascade.wav": (2.1, sandfall_stone_cascade),
        "catacomb-deep-breath.wav": (2.6, catacomb_deep_breath),
        "catacomb-fog-whisper.wav": (2.4, catacomb_fog_whisper),
        "bridge-stone-crack.wav": (1.4, bridge_stone_crack),
        "unstable-excavation-tremor.wav": (2.2, unstable_excavation_tremor),
        "final-guardian-dread.wav": (2.8, final_guardian_dread),
        "void-bass-swell.wav": (4.4, void_bass_swell),
        "underworld-heart-drone.wav": (4.8, underworld_heart_drone),
        "reality-tear-rumble.wav": (3.2, reality_tear_rumble),
        "scarab-touch-whisper.wav": (2.35, scarab_touch_whisper),
        "threshold-reality-tear.wav": (3.85, threshold_reality_tear),
        "anubis-presence-stinger.wav": (2.85, anubis_presence_stinger),
        "lost-site-air-shift.wav": (4.7, lost_site_air_shift),
    }
    for filename, (duration, fn) in specs.items():
      write_wav(OUT_DIR / filename, render(duration, fn))
    (OUT_DIR / "README.md").write_text(
        "# Generated Expedition SFX\n\n"
        "These short WAV effects are deterministic, code-generated assets for Lost Site Expedition.\n"
        "They are generated by `scripts/generate_expedition_sfx.py` and do not depend on third-party samples.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
