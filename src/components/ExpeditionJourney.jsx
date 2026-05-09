import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Backpack,
  ChevronLeft,
  Flag,
  Gauge,
  Gem,
  Map,
  ShieldAlert,
  Sparkles,
  Swords,
} from 'lucide-react';

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_Y,
  INVULNERABLE_DURATION,
  JUMP_SPEED,
  MOVE_SPEED,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
  WORLD_WIDTH,
  GRAVITY,
  ATTACK_DURATION,
  ATTACK_COOLDOWN,
} from './expedition-journey/journeyConstants';

import {
  CHECKPOINTS,
  ENEMIES,
  HAZARDS,
  HIDDEN_ROOMS,
  JOURNEY_TOOLS,
  LORE_TABLETS,
  MINI_BOSSES,
  OBJECTIVE_MARKERS,
  PLATFORMS,
  RELIC_SHARDS,
  ROUTE_GATES,
  SECTIONS,
  SECTION_ATMOSPHERES,
  STORY_PROPS,
  TOOL_LAYOUT,
  UPGRADES,
  BOSS_INTROS,
  GATE,
  ENVIRONMENT_EVENTS,
  SECTION_OBJECTIVES,
} from './expedition-journey/journeyLevelData';

import {
  clamp,
  getSectionForX,
  makeInitialState,
  rectsOverlap,
} from './expedition-journey/journeyUtils';

export default function ExpeditionJourney({ mission, onComplete, onBack, audioControls }) {
  const [gameState, setGameState] = useState(makeInitialState());
  const [briefingOpen, setBriefingOpen] = useState(true);
  const canvasRef = useRef(null);
  const stateRef = useRef(gameState);
  const keysRef = useRef({});
  const lastFrameRef = useRef(0);
  const animationRef = useRef(null);

  // Sync ref for the physics loop
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const syncHud = useCallback(() => {
    setGameState({ ...stateRef.current });
  }, []);

  const triggerJourneyRescue = useCallback((reason) => {
    const current = stateRef.current;
    current.failed = true;
    current.failureReason = reason;
    current.notice = reason;
    audioControls?.playError?.();
    syncHud();
  }, [audioControls, syncHud]);

  const respawnAtCheckpoint = useCallback(() => {
    const current = stateRef.current;
    const cp = current.activeCheckpoint;
    current.player.x = cp.x;
    current.player.y = cp.y - current.player.height;
    current.player.vx = 0;
    current.player.vy = 0;
    current.resources.stamina = Math.max(current.resources.stamina, 40);
    current.failed = false;
    current.notice = `Returned to ${cp.name}. Expedition continues.`;
    syncHud();
  }, [syncHud]);

  const getGateRequirements = useCallback((gate, current) => {
    const reqs = [];
    if (gate.requires.objective) {
      reqs.push({
        label: `Objective: ${gate.requires.objective}`,
        met: current.completedObjectiveIds.has(gate.requires.objective),
      });
    }
    if (gate.requires.miniBoss) {
      reqs.push({
        label: `Mini-boss: ${gate.requires.miniBoss}`,
        met: current.defeatedMiniBosses.has(gate.requires.miniBoss),
      });
    }
    if (gate.requires.shards) {
      reqs.push({
        label: `Relic Shards: ${current.collectedShardIds.size}/${gate.requires.shards}`,
        met: current.collectedShardIds.size >= gate.requires.shards,
      });
    }
    if (gate.requires.upgrades) {
      gate.requires.upgrades.forEach(uId => {
        reqs.push({
          label: `Upgrade: ${uId}`,
          met: current.collectedUpgrades.has(uId),
        });
      });
    }
    return reqs;
  }, []);

  const getObjectiveProgress = useCallback((sectionId, current) => {
    const config = SECTION_OBJECTIVES[sectionId];
    if (!config) return null;
    
    let count = 0;
    if (sectionId === 'desert-entry') {
      count = current.collectedObjectiveIds.has('map-tablet') ? 1 : 0;
    } else if (sectionId === 'ruined-temple') {
      count = ['switch-1', 'switch-2', 'switch-3'].filter(id => current.collectedObjectiveIds.has(id)).length;
    } else if (sectionId === 'catacombs') {
      count = ['glyph-1', 'glyph-2', 'glyph-3'].filter(id => current.collectedObjectiveIds.has(id)).length;
    } else if (sectionId === 'escape-sequence') {
      count = current.collectedObjectiveIds.has('escape-beacon') ? 1 : 0;
    } else if (sectionId === 'dig-site-entrance') {
      count = current.defeatedMiniBosses.has('ancient-construct') ? 1 : 0;
    }
    
    return { ...config, count };
  }, []);

  // --- Rendering Helpers ---
  const drawFieldNoteLabel = useCallback((ctx, x, y, text, color) => {
    ctx.save();
    ctx.font = '800 10px Outfit, sans-serif';
    const metrics = ctx.measureText(text.toUpperCase());
    const padding = 6;
    
    ctx.fillStyle = 'rgba(255, 252, 235, 0.95)';
    ctx.fillRect(x - metrics.width / 2 - padding, y - 10, metrics.width + padding * 2, 16);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x - metrics.width / 2 - padding, y - 10, metrics.width + padding * 2, 16);
    
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text.toUpperCase(), x, y + 2);
    ctx.restore();
  }, []);

  const drawPlayerCharacter = useCallback((ctx, x, y, w, h, direction, invuln, now) => {
    ctx.save();
    if (invuln > 0 && Math.floor(now / 100) % 2 === 0) ctx.globalAlpha = 0.3;
    
    const bob = Math.sin(now / 150) * 2;
    const legSwing = Math.sin(now / 100) * 8;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y + h, w/1.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Archaeologist Coat)
    ctx.fillStyle = '#2c3e50'; // Navy coat
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 5 + bob, 22, 25, 6);
    ctx.fill();

    // Satchel Strap
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + (direction > 0 ? 6 : 24), y + 8 + bob);
    ctx.lineTo(x + (direction > 0 ? 24 : 6), y + 25 + bob);
    ctx.stroke();

    // Hat (Wide brim)
    ctx.fillStyle = '#3f2b1d'; // Fedora brown
    ctx.fillRect(x + (direction > 0 ? -4 : 2), y + 2 + bob, 32, 3); // Brim
    ctx.beginPath();
    ctx.roundRect(x + (direction > 0 ? 4 : 8), y - 4 + bob, 18, 8, 3); // Top
    ctx.fill();

    // Satchel
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(x + (direction > 0 ? 20 : 0), y + 18 + bob, 10, 8, 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#2c3e50';
    if (Math.abs(stateRef.current.player.vx) > 0.1) {
      ctx.fillRect(x + 6 + (direction > 0 ? legSwing : -legSwing), y + 28, 6, 14);
      ctx.fillRect(x + 18 + (direction > 0 ? -legSwing : legSwing), y + 28, 6, 14);
    } else {
      ctx.fillRect(x + 7, y + 28, 6, 14);
      ctx.fillRect(x + 17, y + 28, 6, 14);
    }

    // Interaction Prompt
    if (stateRef.current.notice && stateRef.current.notice.includes('near')) {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('!', x + w/2, y - 15 + bob);
    }
    
    ctx.restore();
  }, []);

  const drawPlatform = useCallback((ctx, platform, cameraX, current) => {
    const x = platform.x - cameraX;
    if (x + platform.width < -50 || x > CANVAS_WIDTH + 50) return;

    if (platform.secret && !current.collectedUpgrades.has('ancient-compass')) {
      ctx.globalAlpha = 0.15;
    }

    const isGround = platform.y === GROUND_Y;
    
    // Platform Base
    ctx.fillStyle = platform.secret ? '#5c4d3c' : isGround ? '#8b6a47' : '#4a3720';
    ctx.fillRect(x, platform.y, platform.width, platform.height);
    
    // Depth Side
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x, platform.y + platform.height - 4, platform.width, 4);

    // Top Surface
    ctx.fillStyle = isGround ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x, platform.y, platform.width, 6);
    
    // Texture / Cracks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 40; i < platform.width; i += 80) {
      ctx.beginPath();
      ctx.moveTo(x + i, platform.y + 6);
      ctx.lineTo(x + i + 5, platform.y + platform.height - 4);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = 'rgba(37, 25, 14, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, platform.y, platform.width, platform.height);
    ctx.globalAlpha = 1;
  }, []);

  const drawStoryProp = useCallback((ctx, prop, cameraX, now) => {
    const x = prop.x - cameraX;
    if (x + 200 < 0 || x - 200 > CANVAS_WIDTH) return;

    ctx.save();
    if (prop.type === 'ruins' || prop.type === 'statue') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.font = 'bold 80px serif';
      ctx.fillText(prop.type === 'ruins' ? '🏛️' : '🗿', x, prop.y + 40);
    } else if (prop.type === 'lights') {
      const pulse = Math.sin(now / 400) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(254, 240, 138, ${0.4 * pulse})`;
      ctx.beginPath();
      ctx.arc(x, prop.y + 20, 120, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const drawParticles = useCallback((ctx, atmosphere, cameraX, now) => {
    ctx.save();
    ctx.fillStyle = atmosphere.particleColor;
    const count = atmosphere.particle === 'dust and debris' ? 45 : 34;
    for (let i = 0; i < count; i += 1) {
      const speedMult = atmosphere.particle === 'dust and debris' ? 2.5 : 1;
      const drift = (now / (35 / speedMult)) % 2000;
      const x = ((i * 137 + drift + cameraX * 0.1) % (CANVAS_WIDTH + 100)) - 50;
      const yBase = atmosphere.particle === 'glyph motes' ? 120 : atmosphere.particle === 'fireflies' ? 150 : 60;
      const yRange = atmosphere.particle === 'dust and debris' ? 300 : 200;
      const y = yBase + ((i * 71 + Math.sin(now / 500 + i) * 30) % yRange);
      
      if (atmosphere.particle === 'glyph motes') {
        ctx.globalAlpha = 0.35;
        ctx.font = 'bold 10px serif';
        ctx.fillText(['𓋹', '𓊽', '𓃻', '𓇳'][i % 4], x, y);
      } else {
        const size = atmosphere.particle === 'dust and debris' ? 2 + (i % 4) : 1.5 + (i % 2);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }, []);

  const drawCollectible = useCallback((ctx, x, y, cameraX, now, label, color, hidden = false, isShard = false) => {
    const screenX = x - cameraX;
    const floatY = Math.sin((now / 220) + x) * 8;
    ctx.save();
    ctx.globalAlpha = hidden ? 0.25 : 1;
    
    // Core glow (Dynamic)
    const pulse = Math.sin(now / 300) * 0.3 + 0.7;
    const innerGlow = ctx.createRadialGradient(screenX, y + floatY, 0, screenX, y + floatY, 25 * pulse);
    innerGlow.addColorStop(0, `${color}88`);
    innerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(screenX, y + floatY, 25 * pulse, 0, Math.PI * 2);
    ctx.fill();

    if (isShard) {
      // Crystalline shard look
      ctx.shadowColor = color;
      ctx.shadowBlur = 10 * pulse;
      
      const shardColor = ctx.createLinearGradient(screenX - 10, y + floatY - 10, screenX + 10, y + floatY + 10);
      shardColor.addColorStop(0, '#fff');
      shardColor.addColorStop(0.5, color);
      shardColor.addColorStop(1, '#000');
      
      ctx.fillStyle = shardColor;
      ctx.beginPath();
      ctx.moveTo(screenX, y + floatY - 15);
      ctx.lineTo(screenX + 10, y + floatY);
      ctx.lineTo(screenX, y + floatY + 15);
      ctx.lineTo(screenX - 10, y + floatY);
      ctx.closePath();
      ctx.fill();
      
      // Highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 12;
      
      // Premium Token
      const tokenGrad = ctx.createRadialGradient(screenX, y + floatY, 5, screenX, y + floatY, 20);
      tokenGrad.addColorStop(0, '#fffcf0');
      tokenGrad.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = tokenGrad;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(screenX - 18, y + floatY - 18, 36, 36, 8);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = '800 20px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(label, screenX, y + floatY + 7);
    }
    ctx.restore();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const current = stateRef.current;
    const player = current.player;
    const now = Date.now();
    const section = getSectionForX(player.x);
    const atmosphere = SECTION_ATMOSPHERES[section.id] || SECTION_ATMOSPHERES[SECTIONS[0].id];
    const focusX = current.bossIntroTimer > 0 && current.bossIntro?.focusX
      ? current.bossIntro.focusX * 0.72 + player.x * 0.28
      : player.x;
    const shake = current.cameraShakeTimer > 0
      ? Math.sin(now / 28) * current.cameraShakeStrength * 7
      : 0;
    const cameraX = clamp(focusX - 260 + shake, 0, WORLD_WIDTH - CANVAS_WIDTH);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, atmosphere.skyTop);
    skyGradient.addColorStop(1, atmosphere.skyBottom);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Parallax Hills
    ctx.fillStyle = section.id === 'catacombs' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(112, 73, 42, 0.16)';
    for (let hill = -160; hill < WORLD_WIDTH; hill += 240) {
      ctx.beginPath();
      ctx.ellipse(hill - cameraX * 0.34, 355, 180, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Parallax Ridges
    ctx.fillStyle = section.id === 'dig-site-entrance' ? 'rgba(34, 84, 61, 0.18)' : 'rgba(53, 40, 30, 0.14)';
    for (let ridge = -260; ridge < WORLD_WIDTH; ridge += 360) {
      ctx.beginPath();
      ctx.ellipse(ridge - cameraX * 0.18, 242, 220, 58, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Ground & Props ---
    STORY_PROPS.forEach((prop) => drawStoryProp(ctx, prop, cameraX, now));
    drawParticles(ctx, atmosphere, cameraX, now);

    // --- Environment Layers (Parallax) ---
    const renderParallaxLayer = (depth, color, heightMult) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT);
      for (let i = 0; i <= CANVAS_WIDTH; i += 40) {
        const worldX = i + cameraX * depth;
        const y = CANVAS_HEIGHT - 60 - heightMult * (20 + Math.sin(worldX * 0.002) * 30 + Math.cos(worldX * 0.005) * 15);
        ctx.lineTo(i, y);
      }
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fill();
    };
    renderParallaxLayer(0.08, `${atmosphere.skyBottom}66`, 1.3);
    renderParallaxLayer(0.18, `${atmosphere.skyBottom}99`, 0.9);
    renderParallaxLayer(0.28, `${atmosphere.skyBottom}cc`, 0.5);

    // --- Entities ---
    PLATFORMS.forEach((platform) => drawPlatform(ctx, platform, cameraX, current));
    
    HAZARDS.forEach((hazard) => {
      const hx = hazard.x - cameraX;
      if (hx + hazard.width < -50 || hx > CANVAS_WIDTH + 50) return;
      ctx.save();
      ctx.font = '34px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(hazard.emoji, hx + hazard.width / 2, hazard.y + hazard.height / 2 + 10);
      drawFieldNoteLabel(ctx, hx + hazard.width / 2, hazard.y - 12, hazard.name, '#7f1d1d');
      ctx.restore();
    });

    CHECKPOINTS.forEach((checkpoint) => {
      const cx = checkpoint.x - cameraX;
      if (cx < -80 || cx > CANVAS_WIDTH + 80) return;
      const active = current.activeCheckpoint.id === checkpoint.id;
      ctx.save();
      ctx.fillStyle = active ? '#166534' : '#451a03';
      ctx.fillRect(cx - 2, checkpoint.y, 4, 80);
      drawFieldNoteLabel(ctx, cx, checkpoint.y - 20, active ? 'CHECKPOINT (ACTIVE)' : checkpoint.name, active ? '#166534' : '#78350f');
      ctx.restore();
    });

    ROUTE_GATES.forEach((gate) => {
      if (current.openedRouteGateIds.has(gate.id)) return;
      const gx = gate.x - cameraX;
      if (gx + gate.width < -100 || gx > CANVAS_WIDTH + 100) return;
      const requirements = getGateRequirements(gate, current);
      const complete = requirements.every(r => r.met);
      ctx.save();
      ctx.fillStyle = complete ? 'rgba(34, 197, 94, 0.2)' : 'rgba(180, 83, 9, 0.2)';
      ctx.fillRect(gx, gate.y, gate.width, gate.height);
      ctx.strokeStyle = complete ? '#22c55e' : '#b45309';
      ctx.lineWidth = 4;
      ctx.strokeRect(gx, gate.y, gate.width, gate.height);
      drawFieldNoteLabel(ctx, gx + gate.width / 2, gate.y - 15, gate.name, complete ? '#166534' : '#78350f');
      ctx.restore();
    });

    current.enemies.forEach((enemy) => {
      if (enemy.defeated) return;
      const ex = enemy.x - cameraX;
      if (ex + enemy.width < -50 || ex > CANVAS_WIDTH + 50) return;
      
      ctx.save();
      const shakeX = enemy.hitFlash > 0 ? Math.sin(now / 20) * 5 : 0;
      
      // Enemy Aura
      const aura = ctx.createRadialGradient(ex + enemy.width/2, enemy.y + enemy.height/2, 5, ex + enemy.width/2, enemy.y + enemy.height/2, 30);
      aura.addColorStop(0, 'rgba(30, 41, 59, 0.2)');
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(ex + enemy.width/2, enemy.y + enemy.height/2, 30, 0, Math.PI * 2);
      ctx.fill();

      // Main Visual
      ctx.font = '42px Outfit';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.fillText(enemy.emoji, ex + enemy.width / 2 + shakeX, enemy.y + enemy.height / 2 + 14);
      
      // Health Bar (Small)
      if (enemy.health > 1) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(ex, enemy.y - 12, enemy.width, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ex, enemy.y - 12, (enemy.health / 2) * enemy.width, 4);
      }

      drawFieldNoteLabel(ctx, ex + enemy.width / 2, enemy.y - 20, enemy.name, '#1e293b');
      ctx.restore();
    });

    current.miniBosses.forEach((boss) => {
      if (boss.defeated) return;
      const bx = boss.x - cameraX;
      if (bx + boss.width < -100 || bx > CANVAS_WIDTH + 100) return;
      
      ctx.save();
      const pulse = Math.sin(now / 400) * 0.15 + 0.85;
      
      // Boss Aura
      const bossAura = ctx.createRadialGradient(bx + boss.width/2, boss.y + boss.height/2, 20, bx + boss.width/2, boss.y + boss.height/2, 80 * pulse);
      bossAura.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
      bossAura.addColorStop(1, 'transparent');
      ctx.fillStyle = bossAura;
      ctx.beginPath();
      ctx.arc(bx + boss.width/2, boss.y + boss.height/2, 80 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Boss Sprite
      ctx.font = `${70 * pulse}px Outfit`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#7c3aed';
      ctx.shadowBlur = 20 * pulse;
      ctx.fillText(boss.emoji || '👾', bx + boss.width / 2, boss.y + boss.height / 2 + 28);
      
      // Boss Health
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.roundRect(bx - 10, boss.y - 25, boss.width + 20, 8, 4);
      ctx.fill();
      ctx.fillStyle = '#7c3aed';
      ctx.roundRect(bx - 10, boss.y - 25, (boss.health / 3) * (boss.width + 20), 8, 4);
      ctx.fill();

      drawFieldNoteLabel(ctx, bx + boss.width/2, boss.y - 40, `GUARDIAN: ${boss.name}`, '#7c3aed');
      ctx.restore();
    });

    RELIC_SHARDS.forEach(shard => {
      if (current.collectedShardIds.has(shard.id)) return;
      const visible = !shard.hidden || current.collectedUpgrades.has('historian-vision');
      if (visible) drawCollectible(ctx, shard.x, shard.y, cameraX, now, '💎', '#b45309', shard.hidden, true);
    });

    UPGRADES.forEach(upgrade => {
      if (!current.collectedUpgrades.has(upgrade.id)) {
        drawCollectible(ctx, upgrade.x, upgrade.y, cameraX, now, upgrade.emoji, '#2563eb');
        drawFieldNoteLabel(ctx, upgrade.x - cameraX, upgrade.y - 30, upgrade.name, '#2563eb');
      }
    });

    TOOL_LAYOUT.forEach(toolPos => {
      if (!current.collectedToolIds.has(toolPos.id)) {
        const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
        drawCollectible(ctx, toolPos.x, toolPos.y, cameraX, now, tool.emoji, '#d4af37');
        drawFieldNoteLabel(ctx, toolPos.x - cameraX, toolPos.y - 30, tool.name, '#b45309');
      }
    });

    OBJECTIVE_MARKERS.forEach(marker => {
      if (current.collectedObjectiveIds.has(marker.id)) return;
      const mx = marker.x - cameraX;
      if (mx < -50 || mx > CANVAS_WIDTH + 50) return;
      const emoji = marker.type === 'switch' ? '⚙️' : marker.type === 'glyph' ? '📜' : marker.type === 'escape' ? '🏃' : '🚩';
      ctx.save();
      ctx.font = '32px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, mx + 15, marker.y + 15);
      drawFieldNoteLabel(ctx, mx + 15, marker.y - 15, marker.label, marker.color || '#b45309');
      ctx.restore();
    });

    const gateX = GATE.x - cameraX;
    if (gateX > -200 && gateX < CANVAS_WIDTH + 200) {
      ctx.save();
      ctx.fillStyle = '#31543d';
      ctx.fillRect(gateX, GATE.y, GATE.width, GATE.height);
      ctx.restore();
    }

    drawPlayerCharacter(ctx, player.x - cameraX, player.y, player.width, player.height, player.direction, player.invulnerable, now);

    // CINEMATIC CARDS
    const featureCard = current.bossIntro || current.sectionTransition || current.environmentEvent || current.cinematicEvent;
    if (featureCard) {
      ctx.fillStyle = 'rgba(47, 37, 29, 0.9)';
      ctx.fillRect(200, 80, 500, 80);
      ctx.fillStyle = '#fff4d4';
      ctx.font = '900 18px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(featureCard.name || featureCard.title, 450, 110);
      ctx.font = '800 12px Outfit';
      ctx.fillText(featureCard.message || '', 450, 135);
      ctx.textAlign = 'start';
    }
  }, [drawCollectible, drawParticles, drawPlatform, drawStoryProp, getGateRequirements, drawPlayerCharacter, drawFieldNoteLabel]);

  const queueAttack = useCallback(() => {
    const current = stateRef.current;
    if (briefingOpen || current.failed || current.completed) return;
    if (current.attackCooldown > 0 || current.attackTimer > 0) return;
    current.attackQueued = true;
  }, [briefingOpen]);

  const update = useCallback((dt) => {
    const current = stateRef.current;
    if (briefingOpen || current.completed || current.failed) return;

    const player = current.player;
    const keys = keysRef.current;
    const left = keys.ArrowLeft || keys.KeyA;
    const right = keys.ArrowRight || keys.KeyD;
    const jump = keys.ArrowUp || keys.KeyW || keys.Space;

    // Timers
    current.cinematicTimer = Math.max(0, current.cinematicTimer - dt);
    if (current.cinematicTimer <= 0 && current.cinematicEvent?.temporary) current.cinematicEvent = null;
    current.bossIntroTimer = Math.max(0, current.bossIntroTimer - dt);
    if (current.bossIntroTimer <= 0 && current.bossIntro) current.bossIntro = null;
    current.environmentEventTimer = Math.max(0, current.environmentEventTimer - dt);
    if (current.environmentEventTimer <= 0 && current.environmentEvent) current.environmentEvent = null;
    current.sectionTransitionTimer = Math.max(0, current.sectionTransitionTimer - dt);
    if (current.sectionTransitionTimer <= 0 && current.sectionTransition) current.sectionTransition = null;
    current.cameraShakeTimer = Math.max(0, current.cameraShakeTimer - dt);
    if (current.cameraShakeTimer <= 0) current.cameraShakeStrength = 0;
    current.invulnerable = Math.max(0, current.invulnerable - dt);
    current.hazardCooldown = Math.max(0, current.hazardCooldown - dt);
    current.enemyCooldown = Math.max(0, current.enemyCooldown - dt);
    current.attackCooldown = Math.max(0, current.attackCooldown - dt);
    current.attackTimer = Math.max(0, current.attackTimer - dt);
    current.routeGateCooldown = Math.max(0, current.routeGateCooldown - dt);

    // Movement
    player.vx = 0;
    if (left) { player.vx -= MOVE_SPEED; player.direction = -1; }
    if (right) { player.vx += MOVE_SPEED; player.direction = 1; }
    if (current.collectedUpgrades.has('reinforced-boots')) player.vx *= 1.05;

    if (jump && !keys.jumpHeld) {
      if (player.onGround) {
        player.vy = -JUMP_SPEED;
        player.onGround = false;
        player.airJumpsUsed = 0;
        audioControls?.playJump?.();
      } else if (current.collectedUpgrades.has('rope-launcher') && player.airJumpsUsed < 1) {
        player.vy = -JUMP_SPEED * 0.85;
        player.airJumpsUsed += 1;
        audioControls?.playJump?.();
      }
    }
    keys.jumpHeld = jump;

    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Bounds
    player.x = clamp(player.x, 0, WORLD_WIDTH - player.width);
    if (player.y > CANVAS_HEIGHT + 100) {
      triggerJourneyRescue('The team stumbled into a ravine. Field rescue required.');
    }

    // Platforms
    player.onGround = false;
    const available = PLATFORMS.filter(p => !p.requiresUpgrade || current.collectedUpgrades.has(p.requiresUpgrade));
    available.forEach(p => {
      if (player.vy >= 0 && rectsOverlap(player, p) && player.y + player.height - player.vy * dt <= p.y + 6) {
        player.y = p.y - player.height;
        player.vy = 0;
        player.onGround = true;
      }
    });

    // Sections
    const section = getSectionForX(player.x);
    if (section.id !== current.lastSectionId) {
      const atmosphere = SECTION_ATMOSPHERES[section.id];
      current.sectionTransition = { id: section.id, name: section.name, message: atmosphere.title };
      current.sectionTransitionTimer = 2.6;
      current.lastSectionId = section.id;
      current.notice = atmosphere.title;
      audioControls?.playLevelUp?.();
    }

    // Events
    ENVIRONMENT_EVENTS.forEach(ev => {
      if (!current.triggeredEnvironmentEventIds.has(ev.id) && Math.abs(player.x - ev.x) < 50) {
        current.triggeredEnvironmentEventIds.add(ev.id);
        current.environmentEvent = ev;
        current.environmentEventTimer = ev.duration;
        current.cameraShakeTimer = ev.duration * 0.4;
        current.cameraShakeStrength = ev.shake;
        current.notice = ev.message;
        audioControls?.playTransition?.();
      }
    });

    // Collectibles
    TOOL_LAYOUT.forEach(toolPos => {
      if (!current.collectedToolIds.has(toolPos.id) && rectsOverlap(player, { ...toolPos, width: 30, height: 30 })) {
        current.collectedToolIds.add(toolPos.id);
        const tool = JOURNEY_TOOLS.find(t => t.id === toolPos.id);
        current.fieldKit.push(tool);
        current.notice = `Field tool recovered: ${tool.name}. Report to Base Camp for registration.`;
        audioControls?.playMatch?.();
      }
    });

    RELIC_SHARDS.forEach(shard => {
      if (!current.collectedShardIds.has(shard.id) && rectsOverlap(player, { ...shard, width: 24, height: 24 })) {
        current.collectedShardIds.add(shard.id);
        current.relicShardCount += 1;
        audioControls?.playSuccess?.();
      }
    });

    UPGRADES.forEach(u => {
      if (!current.collectedUpgrades.has(u.id) && rectsOverlap(player, { ...u, width: 36, height: 36 })) {
        current.collectedUpgrades.add(u.id);
        current.notice = `Field Upgrade: ${u.name}. ${u.effect}`;
        audioControls?.playLevelUp?.();
      }
    });

    OBJECTIVE_MARKERS.forEach(m => {
      if (!current.collectedObjectiveIds.has(m.id) && rectsOverlap(player, { ...m, width: 30, height: 30 })) {
        current.collectedObjectiveIds.add(m.id);
        const progress = getObjectiveProgress(m.sectionId, current);
        if (progress.count >= progress.total) {
          current.completedObjectiveIds.add(m.sectionId);
          current.notice = `Objective Complete: ${progress.title}`;
        } else {
          current.notice = `Objective Progress: ${progress.count}/${progress.total} ${progress.itemLabel}.`;
        }
        audioControls?.playSuccess?.();
      }
    });

    // Hazards
    if (current.hazardCooldown <= 0) {
      HAZARDS.forEach(h => {
        if (rectsOverlap(player, h)) {
          if (h.penalty.stamina) current.resources.stamina = Math.max(0, current.resources.stamina - h.penalty.stamina);
          if (h.penalty.time) current.resources.time = Math.max(0, current.resources.time - h.penalty.time);
          current.hazardCooldown = 1.2;
          current.notice = h.message;
          audioControls?.playError?.();
          if (current.resources.stamina <= 0) triggerJourneyRescue('Team stamina exhausted. Rescue dispatched.');
        }
      });
    }

    // Attacks
    let attackRect = null;
    if (current.attackQueued) {
      current.attackQueued = false;
      current.attackTimer = ATTACK_DURATION;
      current.attackCooldown = ATTACK_COOLDOWN;
      current.attackHitIds.clear();
      audioControls?.playAction?.();
    }
    if (current.attackTimer > 0) {
      attackRect = {
        x: player.direction >= 0 ? player.x + player.width : player.x - 42,
        y: player.y + 7,
        width: 42,
        height: 28
      };
    }

    // Enemies
    current.enemies.forEach(e => {
      if (e.defeated) return;
      e.stunTimer = Math.max(0, e.stunTimer - dt);
      if (e.stunTimer <= 0) {
        e.x += e.direction * e.speed * dt;
        if (e.x <= e.patrolMin || e.x >= e.patrolMax) e.direction *= -1;
      }
      if (attackRect && !current.attackHitIds.has(e.id) && rectsOverlap(attackRect, e)) {
        current.attackHitIds.add(e.id);
        e.health -= 1;
        e.stunTimer = 0.8;
        if (e.health <= 0) {
          e.defeated = true;
          current.relicShardCount += e.shards;
          current.notice = `${e.name} defeated. +${e.shards} shards.`;
        }
      }
      if (player.invulnerable <= 0 && rectsOverlap(player, e)) {
        current.resources.stamina = Math.max(0, current.resources.stamina - e.damage);
        player.invulnerable = INVULNERABLE_DURATION;
        if (current.resources.stamina <= 0) triggerJourneyRescue(`${e.name} exhausted the team.`);
      }
    });

    // Bosses
    current.miniBosses.forEach(b => {
      if (b.defeated) return;
      if (!b.awakened && Math.abs(b.x - player.x) < 400) {
        b.awakened = true;
        current.bossIntro = { id: b.id, title: b.name, message: b.intro, focusX: b.x };
        current.bossIntroTimer = 3;
      }
      if (b.awakened) {
        b.x += b.direction * b.speed * dt;
        if (b.x <= b.patrolMin || b.x >= b.patrolMax) b.direction *= -1;
      }
      if (attackRect && !current.attackHitIds.has(b.id) && rectsOverlap(attackRect, b)) {
        current.attackHitIds.add(b.id);
        b.health -= 1;
        if (b.health <= 0) {
          b.defeated = true;
          current.defeatedMiniBosses.add(b.id);
          current.relicShardCount += b.shards;
          current.notice = `${b.name} defeated. Path secured.`;
        }
      }
    });

    // Gates
    ROUTE_GATES.forEach(g => {
      if (!current.openedRouteGateIds.has(g.id) && rectsOverlap(player, g)) {
        const reqs = getGateRequirements(g, current);
        if (reqs.every(r => r.met)) {
          current.openedRouteGateIds.add(g.id);
          current.notice = `${g.name} opened.`;
        } else {
          player.x = g.x - player.width - 5;
          current.notice = g.message;
        }
      }
    });

    // Final Goal
    if (rectsOverlap(player, GATE)) {
      current.completed = true;
      current.notice = 'Site Entrance reached. Report to Base Camp.';
      syncHud();
      onComplete?.([...current.fieldKit]);
    }

    // Time
    current.timeAccumulator += dt;
    if (current.timeAccumulator >= 1) {
      current.resources.time -= 1;
      current.timeAccumulator = 0;
      if (current.resources.time <= 0) triggerJourneyRescue('Time expired. Field team rescued.');
    }

  }, [briefingOpen, audioControls, triggerJourneyRescue, getObjectiveProgress, getGateRequirements, syncHud]);

  const step = useCallback((ms) => {
    const dt = Math.min(ms / 1000, 0.05);
    update(dt);
    draw();
    syncHud();
  }, [draw, syncHud, update]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (briefingOpen) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyJ', 'KeyK'].includes(e.code)) e.preventDefault();
      if (e.code === 'KeyJ' || e.code === 'KeyK') { queueAttack(); return; }
      keysRef.current[e.code] = true;
    };
    const handleKeyUp = (e) => keysRef.current[e.code] = false;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const frame = (t) => {
      if (!lastFrameRef.current) lastFrameRef.current = t;
      step(t - lastFrameRef.current);
      lastFrameRef.current = t;
      animationRef.current = requestAnimationFrame(frame);
    };
    animationRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, [briefingOpen, queueAttack, step]);

  return (
    <section className="expedition-journey-container" id="expedition-journey">
      <div className="expedition-journey-grid">
        <div className="expedition-sidebar">
          <div className="expedition-panel dossier-info">
            <h2 className="cinzel-header">Expedition Log</h2>
            <div className="expedition-stat-card">
              <div className="stat-label"><Gauge size={14} /> Stamina</div>
              <div className="expedition-stat-bar">
                <div className="expedition-stat-fill stamina-fill" style={{ width: `${gameState.resources.stamina}%` }} />
              </div>
            </div>
            <div className="expedition-stat-card">
              <div className="stat-label"><Sparkles size={14} /> Time</div>
              <div className="expedition-stat-bar">
                <div className="expedition-stat-fill time-fill" style={{ width: `${(gameState.resources.time / 900) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="expedition-panel inventory-panel">
            <h3 className="section-title"><Backpack size={16} /> Field Kit</h3>
            <ul className="expedition-tool-list">
              {JOURNEY_TOOLS.map(t => (
                <li key={t.id} className={gameState.collectedToolIds.has(t.id) ? 'is-collected' : ''}>
                  <span>{t.emoji} {t.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="expedition-panel objective-panel">
            <h3 className="section-title"><Map size={16} /> Status</h3>
            <div className="current-section-badge">
              {SECTIONS.find(s => s.id === gameState.currentSectionId)?.name || 'Surveying'}
            </div>
            <div className="objective-progress">
              <div>Shards: {gameState.collectedShardIds.size} / 12</div>
              <div>Upgrades: {gameState.collectedUpgrades.size} / 3</div>
            </div>
          </div>
        </div>

        <div className="expedition-main">
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="expedition-canvas" />
            
            <div className="journey-hud-overlay">
              <div className="hud-shards">
                <Gem size={18} className="text-amber-500" />
                <span>{gameState.relicShardCount}</span>
              </div>
              <div className="hud-stamina">
                <Gauge size={18} className="text-red-500" />
                <div className="hud-bar-bg">
                  <div className="hud-bar-fill stamina" style={{ width: `${gameState.resources.stamina}%` }} />
                </div>
              </div>
            </div>

            {gameState.notice && (
              <div className="expedition-journey-notice animate-fade-in">
                <Sparkles size={16} />
                <span>{gameState.notice}</span>
              </div>
            )}
            
            {gameState.failed && (
              <div className="expedition-failure-overlay">
                <div className="expedition-panel failure-card">
                  <ShieldAlert size={48} className="text-red-600 mb-4" />
                  <h3 className="cinzel-header">Field Rescue Required</h3>
                  <p>{gameState.failureReason}</p>
                  <button className="expedition-begin-btn" onClick={respawnAtCheckpoint}>
                    Restart from Checkpoint
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="controls-hint">
            <kbd>W/A/S/D</kbd> Move & Jump • <kbd>J/K</kbd> Use Tool
          </div>
        </div>
      </div>

      {briefingOpen && (
        <div className="expedition-briefing-overlay">
          <div className="expedition-briefing-card animate-slide-up">
            <div className="briefing-header">
              <Flag className="text-amber-600" size={32} />
              <h1 className="cinzel-header">Lost Site Expedition</h1>
            </div>
            <div className="briefing-content">
              <p className="instruction-text">Navigate the ruins, recover relics, and secure the entrance to the dig site.</p>
              <div className="mission-dossier">
                <div className="dossier-tag">ACTIVE MISSION</div>
                <h2 className="mission-title">{mission.title}</h2>
                <p className="mission-desc">{mission.instruction}</p>
              </div>
            </div>
            <button className="expedition-begin-btn" onClick={() => setBriefingOpen(false)}>
              Initialize Expedition
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

ExpeditionJourney.tools = JOURNEY_TOOLS;
