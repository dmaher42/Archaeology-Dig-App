import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Backpack,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Gauge,
  Map as MapIcon,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES, SCENARIOS } from '../data';
import { BUREAU_CASES, getCategoryTitle } from '../utils/gameLogic';

const MAP_WIDTH = 800;
const MAP_HEIGHT = 560;
const PLAYER_SIZE = 22;
const EVIDENCE_REQUIRED = 3;
const TARGET_CIVILISATION = 'Ancient Egypt';

const ZONES = [
  { id: 'riverbank', name: 'Riverbank', x: 0, y: 0, w: 260, h: 220, color: 'rgba(96, 165, 250, 0.16)' },
  { id: 'burial', name: 'Burial Area', x: 260, y: 0, w: 260, h: 220, color: 'rgba(168, 85, 247, 0.13)' },
  { id: 'archive', name: 'Archive Corner', x: 520, y: 0, w: 280, h: 220, color: 'rgba(232, 158, 93, 0.14)' },
  { id: 'market', name: 'Market Area', x: 0, y: 220, w: 320, h: 190, color: 'rgba(245, 158, 11, 0.13)' },
  { id: 'wall', name: 'Ruined Wall', x: 320, y: 220, w: 260, h: 190, color: 'rgba(20, 184, 166, 0.12)' },
  { id: 'gate', name: 'Exit Gate', x: 580, y: 220, w: 220, h: 340, color: 'rgba(74, 222, 128, 0.1)' },
];

const WALLS = [
  { x: 322, y: 238, w: 178, h: 34, label: 'low ruined wall' },
  { x: 98, y: 366, w: 210, h: 28, label: 'broken market stall' },
  { x: 602, y: 360, w: 118, h: 28, label: 'fallen archive shelf' },
  { x: 618, y: 120, w: 32, h: 98, label: 'scorpion path obstacle' },
];

const HAZARDS = [
  {
    id: 'sandstorm',
    name: 'sandstorm',
    x: 84,
    y: 96,
    w: 120,
    h: 70,
    color: 'rgba(232, 158, 93, 0.35)',
    penalty: { time: -15 },
    message: 'Sandstorm: time drops by 15 seconds.',
  },
  {
    id: 'falling-rocks',
    name: 'falling rocks',
    x: 388,
    y: 292,
    w: 110,
    h: 78,
    color: 'rgba(148, 163, 184, 0.32)',
    penalty: { investigation: -8 },
    message: 'Falling rocks: investigation points drop by 8.',
  },
  {
    id: 'unstable-floor',
    name: 'unstable floor',
    x: 196,
    y: 454,
    w: 118,
    h: 70,
    color: 'rgba(239, 68, 68, 0.25)',
    penalty: { stamina: -18 },
    message: 'Unstable floor: stamina drops by 18.',
  },
];

const CLAIM_OPTIONS = ['Ancient Egypt', 'Ancient Greece', 'Ancient Rome', 'Ancient China', 'Maya', 'Inca'];
const INITIAL_RESOURCES = { investigation: 100, stamina: 100, time: 600 };

const rectsOverlap = (a, b) => (
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y
);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getPlayerRect = (player) => ({
  x: player.x,
  y: player.y,
  w: PLAYER_SIZE,
  h: PLAYER_SIZE,
});

const getZoneName = (player) => {
  const centre = { x: player.x + PLAYER_SIZE / 2, y: player.y + PLAYER_SIZE / 2 };
  return ZONES.find(zone => (
    centre.x >= zone.x && centre.x <= zone.x + zone.w &&
    centre.y >= zone.y && centre.y <= zone.y + zone.h
  ))?.name || 'Open Trench';
};

const buildExpeditionEvidence = () => {
  const egypt = SCENARIOS.find(scenario => scenario.civilization === TARGET_CIVILISATION);
  const byId = new Map((egypt?.evidence || []).map(item => [item.id, item]));
  const picks = [
    { id: 'eg_13', x: 690, y: 94, zone: 'Archive Corner' },
    { id: 'eg_1', x: 398, y: 112, zone: 'Burial Area' },
    { id: 'eg_11', x: 128, y: 142, zone: 'Riverbank' },
    { id: 'eg_8', x: 462, y: 338, zone: 'Ruined Wall' },
    { id: 'eg_10', x: 140, y: 330, zone: 'Market Area' },
  ];

  return picks.map((pick, index) => {
    const source = byId.get(pick.id);
    return {
      ...pick,
      key: pick.id,
      name: source?.name || `Evidence ${index + 1}`,
      type: source?.type || 'objects',
      category: getCategoryTitle(source?.type),
      clue: source?.clue || 'A clue from the site.',
      rationale: source?.rationale || 'This evidence helps explain the site.',
      supports: TARGET_CIVILISATION,
      collected: false,
    };
  });
};

export function ExpeditionMode({ onBackToMenu, audioControls = {} }) {
  const canvasRef = useRef(null);
  const keysRef = useRef({});
  const playerRef = useRef({ x: 42, y: 498 });
  const collectedRef = useRef([]);
  const tokensRef = useRef(buildExpeditionEvidence());
  const resourcesRef = useRef(INITIAL_RESOURCES);
  const hazardCooldownRef = useRef({});
  const lockedRef = useRef(false);
  const tickAccumulatorRef = useRef(0);
  const [collectedEvidence, setCollectedEvidence] = useState([]);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [currentZone, setCurrentZone] = useState('Market Area');
  const [notice, setNotice] = useState('Collect 3 evidence tokens, then reach the Exit Gate.');
  const [claimOpen, setClaimOpen] = useState(false);
  const [selectedCivilisation, setSelectedCivilisation] = useState('');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState('');
  const [claimResult, setClaimResult] = useState(null);

  const trainingCivilisations = useMemo(() => (
    BUREAU_CASES
      .filter(item => item.round === 'training')
      .map(item => item.civilisation)
      .filter(civilisation => CLAIM_OPTIONS.includes(civilisation))
  ), []);

  const categoryById = useMemo(() => new Map(CATEGORIES.map(category => [category.id, category])), []);
  const exitUnlocked = collectedEvidence.length >= EVIDENCE_REQUIRED;

  const syncResources = useCallback((patch) => {
    resourcesRef.current = {
      investigation: clamp(resourcesRef.current.investigation + (patch.investigation || 0), 0, 100),
      stamina: clamp(resourcesRef.current.stamina + (patch.stamina || 0), 0, 100),
      time: clamp(resourcesRef.current.time + (patch.time || 0), 0, 600),
    };
    setResources({ ...resourcesRef.current });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    ctx.fillStyle = '#ead8b8';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    ctx.strokeStyle = 'rgba(74, 54, 32, 0.12)';
    for (let x = 0; x <= MAP_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, MAP_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= MAP_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(MAP_WIDTH, y);
      ctx.stroke();
    }

    ZONES.forEach((zone) => {
      ctx.fillStyle = zone.color;
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      ctx.strokeStyle = 'rgba(74, 54, 32, 0.18)';
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
      ctx.fillStyle = '#4a3620';
      ctx.font = '700 14px Outfit, sans-serif';
      ctx.fillText(zone.name, zone.x + 14, zone.y + 24);
    });

    const gateOpen = collectedRef.current.length >= EVIDENCE_REQUIRED;
    ctx.fillStyle = gateOpen ? 'rgba(45, 90, 39, 0.45)' : 'rgba(74, 54, 32, 0.25)';
    ctx.fillRect(724, 258, 54, 108);
    ctx.strokeStyle = gateOpen ? '#2d5a27' : '#8b6a48';
    ctx.lineWidth = 3;
    ctx.strokeRect(724, 258, 54, 108);
    ctx.fillStyle = gateOpen ? '#163b18' : '#4a3620';
    ctx.font = '800 13px Outfit, sans-serif';
    ctx.fillText(gateOpen ? 'EXIT' : 'LOCKED', gateOpen ? 735 : 728, 316);
    ctx.lineWidth = 1;

    HAZARDS.forEach((hazard) => {
      ctx.fillStyle = hazard.color;
      ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.55)';
      ctx.setLineDash([6, 5]);
      ctx.strokeRect(hazard.x, hazard.y, hazard.w, hazard.h);
      ctx.setLineDash([]);
      ctx.fillStyle = '#5b2b16';
      ctx.font = '700 12px Outfit, sans-serif';
      ctx.fillText(hazard.name, hazard.x + 8, hazard.y + 22);
    });

    ctx.fillStyle = '#5c4b37';
    WALLS.forEach((wall) => {
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = 'rgba(26, 21, 16, 0.4)';
      ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
    });

    tokensRef.current.forEach((token) => {
      if (token.collected) return;
      const category = categoryById.get(token.type);
      ctx.fillStyle = category?.color || '#e89e5d';
      ctx.beginPath();
      ctx.arc(token.x, token.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff7dc';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.fillStyle = '#2c241a';
      ctx.font = '900 12px Outfit, sans-serif';
      ctx.fillText('?', token.x - 3, token.y + 4);
    });

    const player = playerRef.current;
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(player.x + PLAYER_SIZE / 2, player.y + PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fdf6e3';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = '#fdf6e3';
    ctx.font = '900 11px Outfit, sans-serif';
    ctx.fillText('J', player.x + 8, player.y + 15);
  }, [categoryById]);

  const update = useCallback((dt = 1 / 60) => {
    if (lockedRef.current) {
      draw();
      return;
    }

    Object.keys(hazardCooldownRef.current).forEach((key) => {
      hazardCooldownRef.current[key] = Math.max(0, hazardCooldownRef.current[key] - dt);
    });

    tickAccumulatorRef.current += dt;
    if (tickAccumulatorRef.current >= 1) {
      tickAccumulatorRef.current = 0;
      syncResources({ time: -1 });
    }

    const keys = keysRef.current;
    const staminaFactor = resourcesRef.current.stamina <= 25 ? 0.72 : 1;
    const speed = 172 * staminaFactor * dt;
    let dx = 0;
    let dy = 0;

    if (keys.ArrowUp || keys.KeyW) dy -= speed;
    if (keys.ArrowDown || keys.KeyS) dy += speed;
    if (keys.ArrowLeft || keys.KeyA) dx -= speed;
    if (keys.ArrowRight || keys.KeyD) dx += speed;

    if (dx && dy) {
      dx *= 0.72;
      dy *= 0.72;
    }

    const current = playerRef.current;
    const next = {
      x: clamp(current.x + dx, 0, MAP_WIDTH - PLAYER_SIZE),
      y: clamp(current.y + dy, 0, MAP_HEIGHT - PLAYER_SIZE),
    };
    const nextRect = getPlayerRect(next);
    const hitWall = WALLS.some(wall => rectsOverlap(nextRect, wall));
    if (!hitWall) {
      playerRef.current = next;
    }

    const zoneName = getZoneName(playerRef.current);
    setCurrentZone(previous => previous === zoneName ? previous : zoneName);

    const playerRect = getPlayerRect(playerRef.current);
    HAZARDS.forEach((hazard) => {
      if (rectsOverlap(playerRect, hazard) && !hazardCooldownRef.current[hazard.id]) {
        hazardCooldownRef.current[hazard.id] = 2.5;
        syncResources(hazard.penalty);
        setNotice(hazard.message);
        audioControls.playError?.();
      }
    });

    tokensRef.current.forEach((token) => {
      if (token.collected) return;
      const dxToken = playerRef.current.x + PLAYER_SIZE / 2 - token.x;
      const dyToken = playerRef.current.y + PLAYER_SIZE / 2 - token.y;
      if (Math.hypot(dxToken, dyToken) <= 27) {
        token.collected = true;
        collectedRef.current = [...collectedRef.current, token];
        setCollectedEvidence(collectedRef.current);
        setNotice(`${token.name} added to your evidence satchel.`);
        audioControls.playMatch?.();
      }
    });

    const gateRect = { x: 724, y: 258, w: 54, h: 108 };
    if (rectsOverlap(playerRect, gateRect)) {
      if (collectedRef.current.length >= EVIDENCE_REQUIRED) {
        lockedRef.current = true;
        setClaimOpen(true);
        setNotice('Exit Gate reached. Make your final claim.');
      } else {
        setNotice(`The Exit Gate needs ${EVIDENCE_REQUIRED - collectedRef.current.length} more evidence token${EVIDENCE_REQUIRED - collectedRef.current.length === 1 ? '' : 's'}.`);
      }
    }

    draw();
  }, [audioControls, draw, syncResources]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) {
        event.preventDefault();
        keysRef.current[event.code] = true;
      }
    };
    const handleKeyUp = (event) => {
      keysRef.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let frameId = 0;
    let lastTime = performance.now();
    const loop = (time) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000 || 1 / 60);
      lastTime = time;
      update(dt);
      frameId = requestAnimationFrame(loop);
    };

    draw();
    frameId = requestAnimationFrame(loop);
    window.advanceTime = (ms = 16) => {
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let i = 0; i < steps; i += 1) update(1 / 60);
      draw();
    };
    window.render_game_to_text = () => JSON.stringify({
      mode: 'Lost Site Expedition',
      coordinateSystem: 'origin top-left, x right, y down',
      player: { ...playerRef.current, size: PLAYER_SIZE, zone: getZoneName(playerRef.current) },
      resources: resourcesRef.current,
      collectedEvidence: collectedRef.current.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        supports: item.supports,
      })),
      remainingEvidence: tokensRef.current.filter(item => !item.collected).map(item => ({
        id: item.id,
        x: item.x,
        y: item.y,
        category: item.category,
      })),
      hazards: HAZARDS.map(item => ({ id: item.id, name: item.name, x: item.x, y: item.y, w: item.w, h: item.h })),
      exitUnlocked: collectedRef.current.length >= EVIDENCE_REQUIRED,
      claimOpen: lockedRef.current,
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameId);
      delete window.advanceTime;
      delete window.render_game_to_text;
    };
  }, [draw, update]);

  const resetExpedition = () => {
    playerRef.current = { x: 42, y: 498 };
    tokensRef.current = buildExpeditionEvidence();
    collectedRef.current = [];
    resourcesRef.current = INITIAL_RESOURCES;
    hazardCooldownRef.current = {};
    lockedRef.current = false;
    tickAccumulatorRef.current = 0;
    keysRef.current = {};
    setCollectedEvidence([]);
    setResources(INITIAL_RESOURCES);
    setCurrentZone('Market Area');
    setNotice('Collect 3 evidence tokens, then reach the Exit Gate.');
    setClaimOpen(false);
    setSelectedCivilisation('');
    setSelectedEvidenceId('');
    setClaimResult(null);
    draw();
  };

  const submitClaim = () => {
    const chosenEvidence = collectedEvidence.find(item => item.id === selectedEvidenceId);
    if (!selectedCivilisation || !chosenEvidence) {
      setClaimResult({
        correct: false,
        sentence: 'Choose a civilisation and one piece of collected evidence.',
        feedback: 'A strong historical claim needs both parts: what you think, and the evidence that supports it.',
      });
      return;
    }

    const civilisationCorrect = selectedCivilisation === TARGET_CIVILISATION;
    const evidenceCorrect = chosenEvidence.supports === TARGET_CIVILISATION;
    const sentence = `I think this site belongs to ${selectedCivilisation} because ${chosenEvidence.name}.`;

    setClaimResult({
      correct: civilisationCorrect && evidenceCorrect,
      sentence,
      feedback: civilisationCorrect && evidenceCorrect
        ? `${chosenEvidence.name} supports ${TARGET_CIVILISATION}: ${chosenEvidence.rationale}`
        : `${chosenEvidence.name} does not support ${selectedCivilisation}. Its clue points to ${chosenEvidence.supports} because ${chosenEvidence.clue}`,
    });

    if (civilisationCorrect && evidenceCorrect) {
      audioControls.playWin?.();
    } else {
      audioControls.playError?.();
    }
  };

  return (
    <section className="phase-container bureau-phase expedition-phase">
      <div className="expedition-shell">
        <header className="expedition-topbar">
          <button type="button" className="bureau-hint-btn" onClick={onBackToMenu}>
            <ChevronLeft size={18} /> Back to Menu
          </button>
          <div className="expedition-title">
            <div className="training-kicker">10-15 mins | Solo Adventure</div>
            <h2>Lost Site Expedition</h2>
          </div>
          <div className={`expedition-gate-badge ${exitUnlocked ? 'unlocked' : ''}`}>
            <Sparkles size={16} /> {exitUnlocked ? 'Exit Gate Unlocked' : `${EVIDENCE_REQUIRED - collectedEvidence.length} evidence needed`}
          </div>
        </header>

        <div className="expedition-layout">
          <div className="expedition-map-card">
            <div className="expedition-map-status">
              <span><MapIcon size={16} /> {currentZone}</span>
              <span>{notice}</span>
            </div>
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              aria-label="Top-down expedition map"
              className="expedition-canvas"
            />
          </div>

          <aside className="expedition-side-panel">
            <section className="expedition-panel">
              <h3><Gauge size={17} /> Field Resources</h3>
              <div className="resource-list">
                <div><strong>{resources.investigation}</strong><span>Investigation points</span></div>
                <div><strong>{resources.stamina}</strong><span>Stamina</span></div>
                <div><strong>{Math.floor(resources.time / 60)}:{String(resources.time % 60).padStart(2, '0')}</strong><span>Time</span></div>
              </div>
            </section>

            <section className="expedition-panel">
              <h3><Backpack size={17} /> Evidence Inventory</h3>
              <div className="expedition-evidence-list">
                {collectedEvidence.length === 0 && <p className="expedition-empty">No evidence collected yet.</p>}
                {collectedEvidence.map(item => (
                  <article key={item.id} className="expedition-evidence-item">
                    <strong>{item.name}</strong>
                    <span>{item.category} | {item.zone}</span>
                    <p>{item.clue}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="expedition-panel">
              <h3><ShieldAlert size={17} /> Site Hazards</h3>
              <ul className="expedition-hazard-list">
                <li>sandstorm: lowers time</li>
                <li>falling rocks: lowers investigation points</li>
                <li>unstable floor: lowers stamina</li>
                <li>scorpion path: obstacle only</li>
              </ul>
            </section>

            <section className="expedition-panel">
              <h3><Clock size={17} /> Controls</h3>
              <p className="expedition-control-copy">Move with WASD or the arrow keys. Collect glowing evidence tokens and enter the Exit Gate after 3 finds.</p>
            </section>
          </aside>
        </div>
      </div>

      {claimOpen && (
        <div className="bureau-briefing-overlay">
          <div className="bureau-briefing-modal expedition-claim-modal">
            <div className="training-kicker">Final Expedition Claim</div>
            <h2>Identify the Lost Site</h2>
            <p>Choose the civilisation and the collected evidence that best supports your claim.</p>

            <label className="expedition-claim-field">
              <span>Civilisation</span>
              <select value={selectedCivilisation} onChange={(event) => setSelectedCivilisation(event.target.value)}>
                <option value="">Choose a civilisation</option>
                {trainingCivilisations.map(civilisation => (
                  <option key={civilisation} value={civilisation}>{civilisation}</option>
                ))}
              </select>
            </label>

            <label className="expedition-claim-field">
              <span>Best supporting evidence</span>
              <select value={selectedEvidenceId} onChange={(event) => setSelectedEvidenceId(event.target.value)}>
                <option value="">Choose collected evidence</option>
                {collectedEvidence.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>

            {claimResult && (
              <div className={`expedition-claim-feedback ${claimResult.correct ? 'correct' : 'incorrect'}`}>
                {claimResult.correct ? <CheckCircle2 size={22} /> : <AlertTriangle size={22} />}
                <div>
                  <strong>{claimResult.sentence}</strong>
                  <p>{claimResult.feedback}</p>
                </div>
              </div>
            )}

            <div className="bureau-briefing-actions">
              <button type="button" className="btn primary-btn" onClick={submitClaim}>
                Submit Claim
              </button>
              {claimResult?.correct ? (
                <button type="button" className="btn" onClick={resetExpedition}>
                  Play Again
                </button>
              ) : (
                <button type="button" className="btn" onClick={() => {
                  playerRef.current = { x: 676, y: 304 };
                  lockedRef.current = false;
                  setClaimOpen(false);
                }}>
                  Return to Site
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
