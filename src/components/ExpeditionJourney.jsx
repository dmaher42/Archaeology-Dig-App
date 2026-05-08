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
  { id: 'brush', name: 'Brush' },
  { id: 'trowel', name: 'Trowel' },
  { id: 'notebook', name: 'Notebook' },
  { id: 'camera', name: 'Camera' },
  { id: 'measuring-tape', name: 'Measuring Tape' },
  { id: 'field-guide-page', name: 'Field Guide Page' },
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
  { id: 'scorpion', name: 'scorpion', x: 555, y: 329, width: 42, height: 31, penalty: { stamina: 10 }, message: 'Careful: site obstacle. Stamina reduced.' },
  { id: 'falling-rocks', name: 'falling rocks', x: 1115, y: 318, width: 58, height: 42, penalty: { stamina: 12 }, message: 'Falling rocks delayed the journey. Stamina reduced.' },
  { id: 'sandstorm', name: 'sandstorm patch', x: 1315, y: 315, width: 96, height: 45, penalty: { time: 12 }, message: 'Sandstorm patch slowed the team. Time reduced.' },
];

const GUARDIANS = [
  {
    id: 'sand-wraith',
    name: 'Sand Wraith',
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
  completed: false,
});

function ExpeditionJourney({ mission, onBackToMenu, onComplete, onSnapshotChange, audioControls }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const stateRef = useRef(makeInitialState());
  const lastFrameRef = useRef(0);
  const animationRef = useRef(0);
  const [hud, setHud] = useState(() => ({
    fieldKit: [],
    resources: { stamina: 100, time: 180 },
    notice: INITIAL_JOURNEY_NOTICE,
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
      notice: current.notice,
    };
  }, []);

  const syncHud = useCallback(() => {
    const current = stateRef.current;
    setHud({
      fieldKit: [...current.fieldKit],
      resources: { ...current.resources },
      notice: current.notice,
    });
    onSnapshotChange?.(makeSnapshot());
  }, [makeSnapshot, onSnapshotChange]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const current = stateRef.current;
    const player = current.player;
    const cameraX = clamp(player.x - 260, 0, WORLD_WIDTH - CANVAS_WIDTH);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGradient.addColorStop(0, '#f7e4b8');
    skyGradient.addColorStop(1, '#e8c77d');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = 'rgba(104, 75, 39, 0.16)';
    for (let hill = -100; hill < WORLD_WIDTH; hill += 240) {
      ctx.beginPath();
      ctx.ellipse(hill - cameraX, 355, 165, 38, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    PLATFORMS.forEach((platform) => {
      ctx.fillStyle = platform.y === GROUND_Y ? '#86613b' : '#6c5540';
      ctx.fillRect(platform.x - cameraX, platform.y, platform.width, platform.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(platform.x - cameraX, platform.y, platform.width, 4);
    });

    HAZARDS.forEach((hazard) => {
      const x = hazard.x - cameraX;
      if (hazard.id === 'sandstorm') {
        ctx.fillStyle = 'rgba(185, 132, 51, 0.5)';
        ctx.fillRect(x, hazard.y, hazard.width, hazard.height);
        ctx.strokeStyle = '#7c4d1f';
        ctx.setLineDash([6, 5]);
        ctx.strokeRect(x, hazard.y, hazard.width, hazard.height);
        ctx.setLineDash([]);
      } else if (hazard.id === 'falling-rocks') {
        ctx.fillStyle = '#60493a';
        ctx.beginPath();
        ctx.moveTo(x + 8, hazard.y + hazard.height);
        ctx.lineTo(x + 26, hazard.y + 4);
        ctx.lineTo(x + 50, hazard.y + hazard.height);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#432f2a';
        ctx.fillRect(x + 5, hazard.y + 10, hazard.width - 10, hazard.height - 12);
        ctx.fillStyle = '#221713';
        ctx.fillRect(x, hazard.y + 16, 10, 5);
        ctx.fillRect(x + hazard.width - 10, hazard.y + 16, 10, 5);
      }
      ctx.fillStyle = '#2f251d';
      ctx.font = '12px Arial';
      ctx.fillText(hazard.name, x - 2, hazard.y - 6);
    });

    current.guardians.forEach((guardian) => {
      const x = guardian.x - cameraX;
      const shimmer = (Math.sin(Date.now() / 180) + 1) / 2;
      ctx.save();
      ctx.globalAlpha = 0.68 + shimmer * 0.22;
      ctx.fillStyle = '#6b4f8f';
      ctx.beginPath();
      ctx.ellipse(x + guardian.width / 2, guardian.y + 20, 18, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d8c7ff';
      ctx.beginPath();
      ctx.arc(x + 12, guardian.y + 14, 3, 0, Math.PI * 2);
      ctx.arc(x + 23, guardian.y + 14, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(72, 48, 105, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(guardian.patrolMin - cameraX, guardian.y + guardian.height + 6, guardian.patrolMax - guardian.patrolMin, 8);
      ctx.setLineDash([]);
      ctx.restore();
      ctx.fillStyle = '#2f251d';
      ctx.font = '12px Arial';
      ctx.fillText(guardian.name, x - 14, guardian.y - 8);
    });

    TOOL_LAYOUT.forEach((toolPosition) => {
      if (current.collectedToolIds.has(toolPosition.id)) return;
      const tool = JOURNEY_TOOLS.find((item) => item.id === toolPosition.id);
      const x = toolPosition.x - cameraX;
      ctx.fillStyle = '#fff3c9';
      ctx.strokeStyle = '#6d4c2c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, toolPosition.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#3b2b1f';
      ctx.font = '11px Arial';
      ctx.fillText(tool.name, x - 26, toolPosition.y - 20);
    });

    ctx.fillStyle = '#365f4c';
    ctx.fillRect(GATE.x - cameraX, GATE.y, GATE.width, GATE.height);
    ctx.fillStyle = '#f6d77b';
    ctx.fillRect(GATE.x - cameraX + 8, GATE.y + 10, GATE.width - 16, 12);
    ctx.fillStyle = '#2e231b';
    ctx.font = '13px Arial';
    ctx.fillText('Dig Site', GATE.x - cameraX - 5, GATE.y - 10);

    ctx.fillStyle = '#234f48';
    ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);
    ctx.fillStyle = '#f1d0a0';
    ctx.fillRect(player.x - cameraX + 7, player.y - 12, 14, 14);
    ctx.fillStyle = '#2b211a';
    ctx.fillRect(player.x - cameraX + 4, player.y - 17, 20, 6);
    ctx.fillStyle = '#f8edcf';
    ctx.fillRect(player.x - cameraX + 4, player.y + 10, 20, 9);

    ctx.fillStyle = 'rgba(48, 35, 24, 0.78)';
    ctx.fillRect(16, 16, 290, 44);
    ctx.fillStyle = '#fff4d4';
    ctx.font = '14px Arial';
    ctx.fillText(`Field kit: ${current.fieldKit.length}/${JOURNEY_TOOLS.length}`, 30, 43);
  }, []);

  const update = useCallback((dt) => {
    const current = stateRef.current;
    if (current.completed) return;

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
      }
    });

    current.timeAccumulator += dt;
    if (current.timeAccumulator >= 1) {
      current.resources.time = Math.max(0, current.resources.time - Math.floor(current.timeAccumulator));
      current.timeAccumulator %= 1;
    }

    if (rectsOverlap(player, GATE)) {
      current.completed = true;
      current.notice = 'Dig site entrance reached. Report to Base Camp.';
      audioControls?.playSuccess?.();
      syncHud();
      onComplete?.([...current.fieldKit]);
    }
  }, [audioControls, onComplete, syncHud]);

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
  }, [step]);

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
    </section>
  );
}

ExpeditionJourney.tools = JOURNEY_TOOLS;

export default ExpeditionJourney;
