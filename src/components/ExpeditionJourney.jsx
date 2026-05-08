import { useCallback, useEffect, useRef, useState } from 'react';
import { Backpack, ChevronLeft, Flag, Gauge, ShieldAlert } from 'lucide-react';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 420;
const WORLD_WIDTH = 1850;
const GROUND_Y = 360;
const PLAYER_WIDTH = 28;
const PLAYER_HEIGHT = 42;
const GRAVITY = 1850;
const MOVE_SPEED = 260;
const JUMP_SPEED = 620;

const INITIAL_JOURNEY_NOTICE = 'Reach the dig site entrance with as much field kit as you can.';

const JOURNEY_TOOLS = [
  { id: 'brush', name: 'Brush', emoji: '🖌️' },
  { id: 'trowel', name: 'Trowel', emoji: '⛏️' },
  { id: 'notebook', name: 'Notebook', emoji: '📓' },
  { id: 'camera', name: 'Camera', emoji: '📷' },
  { id: 'measuring-tape', name: 'Measuring Tape', emoji: '📏' },
  { id: 'field-guide-page', name: 'Field Guide Page', emoji: '📄' },
];

const TOOL_LAYOUT = [
  { id: 'brush', x: 185, y: 314 },
  { id: 'trowel', x: 410, y: 245 },
  { id: 'notebook', x: 690, y: 314 },
  { id: 'camera', x: 980, y: 230 },
  { id: 'measuring-tape', x: 1260, y: 314 },
  { id: 'field-guide-page', x: 1515, y: 258 },
];

const PLATFORMS = [
  { x: 0, y: GROUND_Y, width: WORLD_WIDTH, height: 60, label: 'desert track' },
  { x: 340, y: 290, width: 180, height: 18, label: 'stone ledge' },
  { x: 880, y: 275, width: 210, height: 18, label: 'old wall blocks' },
  { x: 1420, y: 305, width: 185, height: 18, label: 'survey ridge' },
];

const HAZARDS = [
  { id: 'scorpion', name: 'scorpion', emoji: '🦂', x: 555, y: 329, width: 42, height: 31, penalty: { stamina: 10 }, message: 'Careful: site obstacle. Stamina reduced.' },
  { id: 'falling-rocks', name: 'falling rocks', emoji: '🪨', x: 1115, y: 318, width: 58, height: 42, penalty: { stamina: 12 }, message: 'Falling rocks delayed the journey. Stamina reduced.' },
  { id: 'sandstorm', name: 'sandstorm patch', emoji: '🌪️', x: 1315, y: 315, width: 96, height: 45, penalty: { time: 12 }, message: 'Sandstorm patch slowed the team. Time reduced.' },
];

const GUARDIANS = [
  {
    id: 'sand-wraith',
    name: 'Sand Wraith',
    emoji: '👤',
    patrolMin: 760,
    patrolMax: 1050,
    y: 318,
    width: 34,
    height: 42,
    speed: 92,
    penalty: { stamina: 14, time: 6 },
    message: 'A Sand Wraith swept past the team. Stamina and time reduced.',
  },
];

const GATE = { x: 1760, y: 282, width: 56, height: 78 };

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const rectsOverlap = (a, b) => (
  a.x < b.x + b.width
  && a.x + a.width > b.x
  && a.y < b.y + b.height
  && a.y + a.height > b.y
);

const makeInitialState = () => ({
  player: {
    x: 44,
    y: GROUND_Y - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    onGround: true,
  },
  fieldKit: [],
  collectedToolIds: new Set(),
  guardians: GUARDIANS.map((guardian) => ({
    ...guardian,
    x: guardian.patrolMin,
    direction: 1,
  })),
  resources: {
    stamina: 100,
    time: 180,
  },
  notice: INITIAL_JOURNEY_NOTICE,
  hazardCooldown: 0,
  guardianCooldown: 0,
  timeAccumulator: 0,
  failed: false,
  failureReason: '',
  completed: false,
});

function ExpeditionJourney({ mission, onBackToMenu, onComplete, onSnapshotChange, audioControls }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const stateRef = useRef(makeInitialState());
  const lastFrameRef = useRef(0);
  const animationRef = useRef(0);
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [hud, setHud] = useState(() => ({
    fieldKit: [],
    resources: { stamina: 100, time: 180 },
    notice: INITIAL_JOURNEY_NOTICE,
    failed: false,
    failureReason: '',
  }));

  const makeSnapshot = useCallback(() => {
    const current = stateRef.current;
    const player = current.player;
    return {
      stage: 'journey',
      player: { x: Math.round(player.x), y: Math.round(player.y) },
      resources: { ...current.resources },
      fieldKit: [...current.fieldKit],
      remainingTools: JOURNEY_TOOLS
        .filter((tool) => !current.collectedToolIds.has(tool.id))
        .map((tool) => tool.name),
      hazards: HAZARDS.map((hazard) => hazard.name),
      guardians: current.guardians.map((guardian) => ({
        id: guardian.id,
        name: guardian.name,
        x: Math.round(guardian.x),
        y: guardian.y,
        patrolMin: guardian.patrolMin,
        patrolMax: guardian.patrolMax,
      })),
      endGateReached: current.completed,
      briefingOpen,
      failed: current.failed,
      failureReason: current.failureReason,
      notice: current.notice,
    };
  }, [briefingOpen]);

  const syncHud = useCallback(() => {
    const current = stateRef.current;
    setHud({
      fieldKit: [...current.fieldKit],
      resources: { ...current.resources },
      notice: current.notice,
      failed: current.failed,
      failureReason: current.failureReason,
    });
    onSnapshotChange?.(makeSnapshot());
  }, [makeSnapshot, onSnapshotChange]);

  const restartJourney = useCallback(() => {
    stateRef.current = makeInitialState();
    keysRef.current = {};
    setBriefingOpen(true);
    syncHud();
  }, [syncHud]);

  const triggerJourneyRescue = useCallback((reason) => {
    const current = stateRef.current;
    if (current.failed || current.completed) return;
    current.failed = true;
    current.failureReason = reason;
    current.notice = reason;
    keysRef.current = {};
    audioControls?.playError?.();
    syncHud();
  }, [audioControls, syncHud]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const current = stateRef.current;
    const player = current.player;
    const cameraX = clamp(player.x - 260, 0, WORLD_WIDTH - CANVAS_WIDTH);
    const now = Date.now();

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Warm desert sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, '#f2dca5');
    skyGradient.addColorStop(1, '#e3b976');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Distant dunes
    ctx.fillStyle = 'rgba(186, 126, 68, 0.2)';
    for (let hill = -100; hill < WORLD_WIDTH; hill += 240) {
      ctx.beginPath();
      ctx.ellipse(hill - cameraX, 355, 180, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Platforms
    PLATFORMS.forEach((platform) => {
      ctx.fillStyle = platform.y === GROUND_Y ? '#b5865a' : '#94653e';
      ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(platform.x - cameraX, platform.y, platform.width, 6);
      ctx.strokeStyle = 'rgba(50, 30, 10, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(platform.x - cameraX, platform.y, platform.width, platform.height);
    });

    // Hazards
    const pulse = (Math.sin(now / 200) + 1) / 2;
    HAZARDS.forEach((hazard) => {
      const x = hazard.x - cameraX;
      
      // Hazard visual zone
      ctx.fillStyle = 'rgba(200, 80, 50, 0.2)';
      ctx.fillRect(x, hazard.y, hazard.width, hazard.height);
      
      ctx.strokeStyle = `rgba(200, 50, 20, ${0.4 + pulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -now / 30;
      ctx.strokeRect(x, hazard.y, hazard.width, hazard.height);
      ctx.setLineDash([]);
      
      // Emoji
      ctx.font = '32px Outfit, sans-serif';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Shadow for emoji
      ctx.fillText(hazard.emoji, x + hazard.width / 2 - 16, hazard.y + hazard.height / 2 + 12);
      
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const textWidth = ctx.measureText(hazard.name).width;
      ctx.fillRect(x + hazard.width / 2 - textWidth / 2 - 4, hazard.y - 20, textWidth + 8, 18);
      ctx.fillStyle = '#5b2b16';
      ctx.font = '700 11px Outfit, sans-serif';
      ctx.fillText(hazard.name, x + hazard.width / 2 - textWidth / 2, hazard.y - 7);
    });

    // Guardians
    current.guardians.forEach((guardian) => {
      const x = guardian.x - cameraX;
      const floatY = Math.sin(now / 150) * 4;
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(x + guardian.width / 2, guardian.y + guardian.height, 15, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Emoji
      ctx.font = '40px Outfit, sans-serif';
      ctx.fillText(guardian.emoji, x - 4, guardian.y + 36 + floatY);

      // Patrol path
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(guardian.patrolMin - cameraX, guardian.y + guardian.height + 6, guardian.patrolMax - guardian.patrolMin, 4);
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '700 11px Outfit, sans-serif';
      const textWidth = ctx.measureText(guardian.name).width;
      ctx.fillRect(x + guardian.width / 2 - textWidth / 2 - 4, guardian.y - 24, textWidth + 8, 18);
      ctx.fillStyle = '#2f251d';
      ctx.fillText(guardian.name, x + guardian.width / 2 - textWidth / 2, guardian.y - 11);
    });

    // Tools
    TOOL_LAYOUT.forEach((toolPosition, index) => {
      if (current.collectedToolIds.has(toolPosition.id)) return;
      const tool = JOURNEY_TOOLS.find((item) => item.id === toolPosition.id);
      const x = toolPosition.x - cameraX;
      const floatY = Math.sin((now / 200) + index) * 4;

      ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
      ctx.shadowBlur = 12;
      
      // Glowing orb
      ctx.fillStyle = 'rgba(255, 243, 201, 0.9)';
      ctx.beginPath();
      ctx.arc(x, toolPosition.y + floatY, 18, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Emoji
      ctx.font = '18px Outfit, sans-serif';
      ctx.fillText(tool.emoji, x - 9, toolPosition.y + floatY + 6);

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '700 11px Outfit, sans-serif';
      const textWidth = ctx.measureText(tool.name).width;
      ctx.fillRect(x - textWidth / 2 - 4, toolPosition.y - 34 + floatY, textWidth + 8, 18);
      ctx.fillStyle = '#3b2b1f';
      ctx.fillText(tool.name, x - textWidth / 2, toolPosition.y - 21 + floatY);
    });

    // Gate
    const gateX = GATE.x - cameraX;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#3a5a40';
    ctx.fillRect(gateX, GATE.y, GATE.width, GATE.height);
    ctx.strokeStyle = '#2d4532';
    ctx.lineWidth = 4;
    ctx.strokeRect(gateX, GATE.y, GATE.width, GATE.height);
    ctx.shadowColor = 'transparent';

    ctx.font = '40px Outfit, sans-serif';
    ctx.fillText('⛺', gateX + 8, GATE.y + 45);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '700 12px Outfit, sans-serif';
    const gateTextWidth = ctx.measureText('Base Camp').width;
    ctx.fillRect(gateX + GATE.width / 2 - gateTextWidth / 2 - 4, GATE.y - 20, gateTextWidth + 8, 18);
    ctx.fillStyle = '#1b2b1e';
    ctx.fillText('Base Camp', gateX + GATE.width / 2 - gateTextWidth / 2, GATE.y - 7);

    // Player
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    
    // Player background token
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(player.x - cameraX + player.width / 2, player.y + player.height / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetY = 0;
    ctx.font = '20px Outfit, sans-serif';
    ctx.fillText('🕵️', player.x - cameraX + 4, player.y + 28);

    // HUD Info
    ctx.fillStyle = 'rgba(48, 35, 24, 0.85)';
    ctx.fillRect(16, 16, 260, 40);
    ctx.strokeStyle = '#b5865a';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, 260, 40);
    ctx.fillStyle = '#fff4d4';
    ctx.font = '700 14px Outfit, sans-serif';
    ctx.fillText(`🎒 Field kit: ${current.fieldKit.length}/${JOURNEY_TOOLS.length}`, 30, 42);
  }, []);

  const update = useCallback((dt) => {
    const current = stateRef.current;
    if (briefingOpen || current.completed || current.failed) return;

    const player = current.player;
    const keys = keysRef.current;
    const left = keys.ArrowLeft || keys.KeyA;
    const right = keys.ArrowRight || keys.KeyD;
    const jump = keys.ArrowUp || keys.KeyW || keys.Space;

    player.vx = 0;
    if (left) player.vx -= MOVE_SPEED;
    if (right) player.vx += MOVE_SPEED;
    if (jump && player.onGround) {
      player.vy = -JUMP_SPEED;
      player.onGround = false;
      audioControls?.playPlace?.();
    }

    const previousBottom = player.y + player.height;
    player.x = clamp(player.x + player.vx * dt, 0, WORLD_WIDTH - player.width);
    player.vy += GRAVITY * dt;
    player.y += player.vy * dt;
    player.onGround = false;

    PLATFORMS.forEach((platform) => {
      const platformRect = {
        x: platform.x,
        y: platform.y,
        width: platform.width,
        height: platform.height,
      };
      const playerRect = {
        x: player.x,
        y: player.y,
        width: player.width,
        height: player.height,
      };
      if (
        rectsOverlap(playerRect, platformRect)
        && previousBottom <= platform.y + 8
        && player.vy >= 0
      ) {
        player.y = platform.y - player.height;
        player.vy = 0;
        player.onGround = true;
      }
    });

    if (player.y > CANVAS_HEIGHT + 120) {
      player.x = 44;
      player.y = GROUND_Y - PLAYER_HEIGHT;
      player.vx = 0;
      player.vy = 0;
      player.onGround = true;
      current.resources.stamina = Math.max(0, current.resources.stamina - 8);
      current.notice = 'You slipped off the route and returned to the track. Stamina reduced.';
      audioControls?.playError?.();
      if (current.resources.stamina <= 0) {
        triggerJourneyRescue('Field rescue needed: stamina reached zero. Restart the journey and avoid hazards.');
      }
    }

    TOOL_LAYOUT.forEach((toolPosition) => {
      if (current.collectedToolIds.has(toolPosition.id)) return;
      const toolRect = {
        x: toolPosition.x - 14,
        y: toolPosition.y - 14,
        width: 28,
        height: 28,
      };
      if (rectsOverlap(player, toolRect)) {
        current.collectedToolIds.add(toolPosition.id);
        current.fieldKit.push(toolPosition.id);
        const tool = JOURNEY_TOOLS.find((item) => item.id === toolPosition.id);
        current.notice = `${tool.name} added to the field kit.`;
        audioControls?.playMatch?.();
      }
    });

    current.hazardCooldown = Math.max(0, current.hazardCooldown - dt);
    current.guardianCooldown = Math.max(0, current.guardianCooldown - dt);
    if (current.hazardCooldown <= 0) {
      const hitHazard = HAZARDS.find((hazard) => rectsOverlap(player, hazard));
      if (hitHazard) {
        if (hitHazard.penalty.stamina) {
          current.resources.stamina = Math.max(0, current.resources.stamina - hitHazard.penalty.stamina);
        }
        if (hitHazard.penalty.time) {
          current.resources.time = Math.max(0, current.resources.time - hitHazard.penalty.time);
        }
        current.notice = hitHazard.message;
        current.hazardCooldown = 1.35;
        audioControls?.playError?.();
        if (current.resources.stamina <= 0 || current.resources.time <= 0) {
          triggerJourneyRescue(`Field rescue needed after ${hitHazard.name}. Restart the journey and plan a safer route.`);
        }
      }
    }

    current.guardians.forEach((guardian) => {
      guardian.x += guardian.direction * guardian.speed * dt;
      if (guardian.x <= guardian.patrolMin) {
        guardian.x = guardian.patrolMin;
        guardian.direction = 1;
      } else if (guardian.x >= guardian.patrolMax) {
        guardian.x = guardian.patrolMax;
        guardian.direction = -1;
      }

      const guardianRect = {
        x: guardian.x,
        y: guardian.y,
        width: guardian.width,
        height: guardian.height,
      };

      if (current.guardianCooldown <= 0 && rectsOverlap(player, guardianRect)) {
        current.resources.stamina = Math.max(0, current.resources.stamina - guardian.penalty.stamina);
        current.resources.time = Math.max(0, current.resources.time - guardian.penalty.time);
        const playerCentre = player.x + player.width / 2;
        const guardianCentre = guardian.x + guardian.width / 2;
        const pushDirection = playerCentre < guardianCentre ? -1 : 1;
        player.x = clamp(player.x + pushDirection * 76, 0, WORLD_WIDTH - player.width);
        player.vx = 0;
        current.notice = guardian.message;
        current.guardianCooldown = 1.6;
        audioControls?.playError?.();
        if (current.resources.stamina <= 0 || current.resources.time <= 0) {
          triggerJourneyRescue(`Field rescue needed after the ${guardian.name}. Restart the journey and avoid its patrol.`);
        }
      }
    });

    current.timeAccumulator += dt;
    if (current.timeAccumulator >= 1) {
      current.resources.time = Math.max(0, current.resources.time - Math.floor(current.timeAccumulator));
      current.timeAccumulator %= 1;
      if (current.resources.time <= 0) {
        triggerJourneyRescue('Field rescue needed: time ran out before reaching Base Camp. Restart the journey.');
      }
    }

    if (rectsOverlap(player, GATE)) {
      current.completed = true;
      current.notice = 'Dig site entrance reached. Report to Base Camp.';
      audioControls?.playSuccess?.();
      syncHud();
      onComplete?.([...current.fieldKit]);
    }
  }, [audioControls, briefingOpen, onComplete, syncHud, triggerJourneyRescue]);

  const step = useCallback((ms) => {
    const dt = Math.min(ms / 1000, 0.05);
    update(dt);
    draw();
    syncHud();
  }, [draw, syncHud, update]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (briefingOpen) return;
      keysRef.current[event.code] = true;
    };
    const handleKeyUp = (event) => {
      keysRef.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.__advanceExpeditionJourney = (ms = 16) => step(ms);

    const frame = (timestamp) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      const elapsed = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;
      step(elapsed);
      animationRef.current = window.requestAnimationFrame(frame);
    };
    animationRef.current = window.requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.cancelAnimationFrame(animationRef.current);
      if (window.__advanceExpeditionJourney) {
        delete window.__advanceExpeditionJourney;
      }
    };
  }, [briefingOpen, step]);

  const collectedToolNames = hud.fieldKit
    .map((id) => JOURNEY_TOOLS.find((tool) => tool.id === id)?.name)
    .filter(Boolean);

  return (
    <section className="phase-container bureau-phase expedition-phase">
      <div className="expedition-shell expedition-journey-shell">
        <header className="expedition-topbar">
          <button type="button" className="bureau-hint-btn" onClick={onBackToMenu}>
            <ChevronLeft size={16} aria-hidden="true" />
            Back to Menu
          </button>
          <div className="expedition-title">
            <p className="phase-kicker">Lost Site Expedition</p>
            <h2>Journey to the Dig Site</h2>
            <p>
              Collect field equipment, avoid site hazards, and reach the dig site entrance.
            </p>
          </div>
          <div className="expedition-gate-badge">
            <Flag size={16} aria-hidden="true" />
            <span>Entrance Ahead</span>
            <small>Reach the end gate</small>
          </div>
        </header>

        <div className="expedition-journey-grid">
          <div className="expedition-journey-canvas-card">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              aria-label="Side-scroller journey to the dig site"
            />
            <div className="expedition-journey-notice" role="status">
              {hud.notice}
            </div>
          </div>

          <aside className="expedition-panel-stack">
            <section className="expedition-panel">
              <h3>
                <Flag size={18} aria-hidden="true" />
                Bureau Mission
              </h3>
              <strong>{mission?.title || 'Evidence Hunt'}</strong>
              <p>{mission?.instruction || 'Prepare for the excavation mission.'}</p>
            </section>

            <section className="expedition-panel">
              <h3>
                <Backpack size={18} aria-hidden="true" />
                Field Kit
              </h3>
              <p>{hud.fieldKit.length}/{JOURNEY_TOOLS.length} tools collected</p>
              <ul className="expedition-tool-list">
                {JOURNEY_TOOLS.map((tool) => (
                  <li key={tool.id} className={hud.fieldKit.includes(tool.id) ? 'is-collected' : ''}>
                    <span>{tool.name}</span>
                    <strong>{hud.fieldKit.includes(tool.id) ? 'Packed' : 'Missing'}</strong>
                  </li>
                ))}
              </ul>
            </section>

            <section className="expedition-panel">
              <h3>
                <Gauge size={18} aria-hidden="true" />
                Journey Resources
              </h3>
              <div className="expedition-resource">
                <span>Stamina</span>
                <strong>{hud.resources.stamina}</strong>
              </div>
              <div className="expedition-resource">
                <span>Time</span>
                <strong>{hud.resources.time}s</strong>
              </div>
            </section>

            <section className="expedition-panel">
              <h3>
                <ShieldAlert size={18} aria-hidden="true" />
                Hazards
              </h3>
              <ul className="expedition-hazard-list">
                {HAZARDS.map((hazard) => (
                  <li key={hazard.id}>{hazard.name}</li>
                ))}
                {GUARDIANS.map((guardian) => (
                  <li key={guardian.id}>{guardian.name}: avoid its patrol</li>
                ))}
              </ul>
            </section>

            <section className="expedition-panel">
              <h3>
                <Flag size={18} aria-hidden="true" />
                Controls
              </h3>
              <p>A/D or Arrow keys move. W, ArrowUp or Space jumps.</p>
              {collectedToolNames.length > 0 && (
                <p className="expedition-small-note">
                  Packed: {collectedToolNames.join(', ')}
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>

      {hud.failed && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-rescue-modal">
            <div className="training-kicker">Field Rescue</div>
            <h2>Restart Needed</h2>
            <p>{hud.failureReason}</p>
            <p>
              Hazards and monsters can drain your field resources. Try again, watch the patrols,
              and collect tools before entering the dig site.
            </p>
            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={restartJourney}>
                Restart Journey
              </button>
              <button type="button" className="btn" onClick={onBackToMenu}>
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {briefingOpen && (
        <div className="bureau-briefing-overlay expedition-briefing-overlay">
          <div className="bureau-briefing-modal expedition-mission-briefing-modal">
            <div className="expedition-briefing-stamp">Top Secret</div>
            <h2>{mission?.title || 'Evidence Hunt Mission'}</h2>
            <p>
              The Bureau has assigned an inquiry before you reach the excavation site.
              Collect field tools on the journey, then use evidence carefully at the dig.
            </p>
            <div className="expedition-mission-card expedition-briefing-mission">
              <strong>Mission Brief</strong>
              {mission?.inquiryQuestion && (
                <p><strong>Inquiry question:</strong> {mission.inquiryQuestion}</p>
              )}
              <p><strong>Evidence type:</strong> {mission?.targetCategoryTitle || 'Mission evidence'}</p>
              <p><strong>Needed:</strong> {mission?.requiredTargetCount || 3} correct evidence items</p>
              <p>{mission?.instruction || 'Prepare for the excavation mission.'}</p>
            </div>
            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn expedition-begin-btn" onClick={() => setBriefingOpen(false)}>
                Begin Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

ExpeditionJourney.tools = JOURNEY_TOOLS;

export default ExpeditionJourney;
