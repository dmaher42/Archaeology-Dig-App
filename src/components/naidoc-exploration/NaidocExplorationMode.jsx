import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  NAIDOC_EXPLORATION_AREAS,
  NAIDOC_EXPLORATION_MARKERS,
  NAIDOC_EXPLORATION_QUIZ,
  NAIDOC_EXPLORATION_STORAGE_KEY,
  NAIDOC_EXPLORATION_TITLE,
  getNaidocAreaForX,
  getNaidocExplorationProgress,
} from './naidocExplorationData';
import { NAIDOC_EXPLORATION_ASSETS } from './naidocExplorationAssets';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const WORLD_WIDTH = 6900;
const GROUND_Y = 555;
const PLAYER_WIDTH = 42;
const PLAYER_HEIGHT = 74;
const MOVE_SPEED = 360;
const JUMP_SPEED = 660;
const GRAVITY = 1850;
const INTERACTION_RADIUS = 92;
const FINAL_GATE_X = 6020;

const createNaidocAssetState = () => ({
  background: null,
  player: null,
  markers: null,
  props: null,
  loaded: false,
});

const createInitialPlayer = () => ({
  x: 90,
  y: GROUND_Y - PLAYER_HEIGHT,
  vx: 0,
  vy: 0,
  direction: 1,
  onGround: true,
});

const loadSavedProgress = () => {
  if (typeof window === 'undefined') {
    return { collectedMarkerIds: [], reflection: '', quizAnswers: {} };
  }

  try {
    const saved = JSON.parse(window.localStorage.getItem(NAIDOC_EXPLORATION_STORAGE_KEY) || '{}');
    return {
      collectedMarkerIds: Array.isArray(saved.collectedMarkerIds) ? saved.collectedMarkerIds : [],
      reflection: typeof saved.reflection === 'string' ? saved.reflection : '',
      quizAnswers: saved.quizAnswers && typeof saved.quizAnswers === 'object' ? saved.quizAnswers : {},
    };
  } catch (error) {
    console.warn('NAIDOC exploration save could not be loaded', error);
    return { collectedMarkerIds: [], reflection: '', quizAnswers: {} };
  }
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const drawTextBlock = (ctx, text, x, y, maxWidth, lineHeight) => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line) ctx.fillText(line, x, currentY);
};

const getAssetUrl = (src) => `${import.meta.env.BASE_URL}${src}`;

const drawPropFrame = (ctx, image, frameIndex, x, y, size) => {
  if (!image?.complete) return false;
  const props = NAIDOC_EXPLORATION_ASSETS.props;
  ctx.drawImage(
    image,
    frameIndex * props.frameWidth,
    0,
    props.frameWidth,
    props.frameHeight,
    x - size / 2,
    y - size,
    size,
    size,
  );
  return true;
};

function TeacherStartScreen({ onBegin, onBackToMenu }) {
  return (
    <section className="phase-container naidoc-start-mode">
      <div className="naidoc-start-panel glass-card">
        <button type="button" className="naidoc-back-button" onClick={onBackToMenu}>
          <ArrowLeft size={16} /> Return to Menu
        </button>
        <div className="naidoc-start-copy">
          <h1>{NAIDOC_EXPLORATION_TITLE}</h1>
          <p>
            A calm Year 7 side-scrolling classroom exploration for NAIDOC Week 2026.
            Students walk, investigate learning markers, collect story tokens and finish with a short quiz.
          </p>
        </div>
        <div className="naidoc-teacher-grid">
          <section>
            <ShieldCheck size={24} />
            <h2>Teacher pacing</h2>
            <p>Designed for about 45-60 minutes with pausing, discussion and reflection.</p>
          </section>
          <section>
            <BookOpen size={24} />
            <h2>Respectful scope</h2>
            <p>Public classroom-safe content only. Local story and Country details are clearly marked as placeholders.</p>
          </section>
          <section>
            <HelpCircle size={24} />
            <h2>Controls</h2>
            <p>Move with A/D or arrow keys. Jump with Space/W/Up. Press E near glowing markers.</p>
          </section>
        </div>
        <button type="button" className="naidoc-start-button" onClick={onBegin}>
          Begin Exploration <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

function LearningCard({ marker, onClose }) {
  if (!marker) return null;

  return (
    <div className="naidoc-modal-backdrop" role="presentation">
      <article className="naidoc-learning-card" role="dialog" aria-modal="true" aria-labelledby="naidoc-learning-title">
        <div className="naidoc-learning-kicker">{marker.tokenLabel}</div>
        <h2 id="naidoc-learning-title">{marker.cardTitle}</h2>
        <p>{marker.cardText}</p>
        <div className="naidoc-discussion-prompt">
          <strong>Class discussion</strong>
          <span>{marker.classroomPrompt}</span>
        </div>
        <button type="button" className="naidoc-primary-action" onClick={onClose}>
          Add Knowledge Piece <CheckCircle2 size={16} />
        </button>
      </article>
    </div>
  );
}

function QuizPanel({ answers, reflection, onAnswer, onReflectionChange, onReset, onBackToMenu }) {
  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount === NAIDOC_EXPLORATION_QUIZ.length;
  const score = NAIDOC_EXPLORATION_QUIZ.reduce((total, question) => (
    answers[question.id] === question.correctIndex ? total + 1 : total
  ), 0);

  return (
    <aside className="naidoc-quiz-panel" aria-label="Final quiz">
      <div className="naidoc-quiz-heading">
        <Sparkles size={20} />
        <div>
          <h2>Final Reflection & Quiz</h2>
          <p>Quiz questions are based only on learning cards already shown in the game.</p>
        </div>
      </div>

      <div className="naidoc-quiz-list">
        {NAIDOC_EXPLORATION_QUIZ.map((question, index) => (
          <fieldset key={question.id} className="naidoc-quiz-question">
            <legend>{index + 1}. {question.question}</legend>
            {question.options.map((option, optionIndex) => {
              const selected = answers[question.id] === optionIndex;
              const answered = question.id in answers;
              const correct = question.correctIndex === optionIndex;
              return (
                <button
                  key={option}
                  type="button"
                  className={[
                    selected ? 'is-selected' : '',
                    answered && correct ? 'is-correct' : '',
                    selected && !correct ? 'is-incorrect' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => onAnswer(question.id, optionIndex)}
                >
                  {option}
                </button>
              );
            })}
          </fieldset>
        ))}
      </div>

      <label className="naidoc-reflection-field">
        <span>What is one thing you learned about culture, Country, or NAIDOC?</span>
        <textarea
          value={reflection}
          onChange={(event) => onReflectionChange(event.target.value)}
          rows={3}
          placeholder="Write one respectful reflection..."
        />
      </label>

      <div className="naidoc-quiz-footer">
        <strong>{complete ? `Score: ${score} / ${NAIDOC_EXPLORATION_QUIZ.length}` : `${answeredCount} / ${NAIDOC_EXPLORATION_QUIZ.length} answered`}</strong>
        <div>
          <button type="button" className="naidoc-secondary-action" onClick={onReset}>
            <RotateCcw size={15} /> Reset
          </button>
          <button type="button" className="naidoc-primary-action" onClick={onBackToMenu}>
            Exit to Menu
          </button>
        </div>
      </div>
    </aside>
  );
}

export function NaidocExplorationMode({ onBackToMenu }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const keysRef = useRef({});
  const playerRef = useRef(createInitialPlayer());
  const cameraRef = useRef(0);
  const nearbyMarkerRef = useRef(null);
  const assetsRef = useRef(createNaidocAssetState());
  const [savedProgress] = useState(loadSavedProgress);

  const [started, setStarted] = useState(false);
  const [collectedMarkerIds, setCollectedMarkerIds] = useState(() => new Set(savedProgress.collectedMarkerIds));
  const [nearbyMarker, setNearbyMarker] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);
  const [currentAreaId, setCurrentAreaId] = useState('welcome');
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState(savedProgress.quizAnswers);
  const [reflection, setReflection] = useState(savedProgress.reflection);

  const progress = useMemo(() => getNaidocExplorationProgress(collectedMarkerIds), [collectedMarkerIds]);
  const currentArea = NAIDOC_EXPLORATION_AREAS.find((area) => area.id === currentAreaId) || NAIDOC_EXPLORATION_AREAS[0];

  useEffect(() => {
    const assets = createNaidocAssetState();
    let loadedCount = 0;
    let cancelled = false;
    const entries = Object.entries(NAIDOC_EXPLORATION_ASSETS);

    entries.forEach(([key, asset]) => {
      const image = new Image();
      image.onload = () => {
        loadedCount += 1;
        if (!cancelled && loadedCount === entries.length) {
          assets.loaded = true;
        }
      };
      image.onerror = () => {
        loadedCount += 1;
      };
      image.src = getAssetUrl(asset.src);
      assets[key] = image;
    });

    assetsRef.current = assets;
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = {
      collectedMarkerIds: [...collectedMarkerIds],
      quizAnswers,
      reflection,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(NAIDOC_EXPLORATION_STORAGE_KEY, JSON.stringify(payload));
  }, [collectedMarkerIds, quizAnswers, reflection]);

  const collectMarker = useCallback((marker) => {
    setCollectedMarkerIds((ids) => {
      const next = new Set(ids);
      next.add(marker.id);
      return next;
    });
  }, []);

  const interactWithNearbyMarker = useCallback(() => {
    const marker = nearbyMarkerRef.current;
    if (!marker) return;
    if (marker.areaId === 'final' && progress.finalUnlocked) {
      setQuizOpen(true);
    }
    setActiveMarker(marker);
    collectMarker(marker);
  }, [collectMarker, progress.finalUnlocked]);

  const resetProgress = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(NAIDOC_EXPLORATION_STORAGE_KEY);
    }
    keysRef.current = {};
    playerRef.current = createInitialPlayer();
    cameraRef.current = 0;
    nearbyMarkerRef.current = null;
    setCollectedMarkerIds(new Set());
    setNearbyMarker(null);
    setActiveMarker(null);
    setCurrentAreaId('welcome');
    setQuizOpen(false);
    setQuizAnswers({});
    setReflection('');
  }, []);

  const drawWorld = useCallback((ctx, pulseTime) => {
    const player = playerRef.current;
    const cameraX = cameraRef.current;
    const area = getNaidocAreaForX(player.x + PLAYER_WIDTH / 2);
    const assets = assetsRef.current;
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, area.sky);
    gradient.addColorStop(0.72, '#f4e6c8');
    gradient.addColorStop(1, area.ground);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (assets.background?.complete) {
      const bg = NAIDOC_EXPLORATION_ASSETS.background;
      const sx = clamp((cameraX / (WORLD_WIDTH - CANVAS_WIDTH)) * Math.max(0, bg.width - CANVAS_WIDTH), 0, Math.max(0, bg.width - CANVAS_WIDTH));
      ctx.globalAlpha = 0.96;
      ctx.drawImage(
        assets.background,
        sx,
        0,
        Math.min(CANVAS_WIDTH, bg.width),
        bg.height,
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
      );
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(244, 230, 200, 0.18)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    NAIDOC_EXPLORATION_AREAS.forEach((worldArea) => {
      const startX = worldArea.start - cameraX;
      const width = worldArea.end - worldArea.start;
      if (startX > CANVAS_WIDTH || startX + width < 0) return;

      ctx.fillStyle = worldArea.ground;
      ctx.globalAlpha = 0.18;
      ctx.fillRect(startX, GROUND_Y - 74, width, 130);
      ctx.globalAlpha = 1;

      ctx.fillStyle = 'rgba(23, 37, 34, 0.72)';
      ctx.font = '700 28px Outfit, sans-serif';
      ctx.fillText(worldArea.shortTitle, startX + 34, 98);
      ctx.font = '600 16px Outfit, sans-serif';
      ctx.fillText(worldArea.teacherPace, startX + 36, 126);
    });

    for (let i = 0; i < 22; i += 1) {
      const worldX = i * 330 + 80;
      const x = worldX - cameraX * 0.42;
      const y = 210 + Math.sin(i * 1.7) * 36;
      if (x < -160 || x > CANVAS_WIDTH + 160) continue;
      ctx.fillStyle = i % 2 ? 'rgba(255, 255, 255, 0.22)' : 'rgba(37, 99, 88, 0.16)';
      drawRoundedRect(ctx, x, y, 180, 26, 14);
      ctx.fill();
    }

    ctx.fillStyle = area.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.26)';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 5);

    const finalGateScreenX = FINAL_GATE_X - cameraX;
    if (!progress.finalUnlocked && finalGateScreenX > -80 && finalGateScreenX < CANVAS_WIDTH + 80) {
      if (!drawPropFrame(ctx, assets.props, 3, finalGateScreenX + 20, GROUND_Y + 10, 126)) {
        ctx.fillStyle = 'rgba(64, 51, 37, 0.8)';
        drawRoundedRect(ctx, finalGateScreenX - 18, GROUND_Y - 156, 70, 156, 8);
        ctx.fill();
      }
      ctx.fillStyle = '#f4d27a';
      ctx.font = '800 18px Outfit, sans-serif';
      ctx.fillText('Locked', finalGateScreenX - 12, GROUND_Y - 92);
    }

    [
      { x: 1450, frame: 0, size: 116 },
      { x: 2760, frame: 1, size: 126 },
      { x: 5180, frame: 2, size: 120 },
      { x: 6330, frame: 3, size: 120 },
    ].forEach((prop) => {
      const x = prop.x - cameraX;
      if (x > -140 && x < CANVAS_WIDTH + 140) {
        drawPropFrame(ctx, assets.props, prop.frame, x, GROUND_Y + 8, prop.size);
      }
    });

    NAIDOC_EXPLORATION_MARKERS.forEach((marker) => {
      const x = marker.x - cameraX;
      if (x < -80 || x > CANVAS_WIDTH + 80) return;

      const collected = collectedMarkerIds.has(marker.id);
      const pulse = Math.sin(pulseTime * 4 + marker.x * 0.01) * 0.5 + 0.5;
      const glowRadius = 22 + pulse * 12;
      const markerGradient = ctx.createRadialGradient(x, GROUND_Y - 64, 4, x, GROUND_Y - 64, glowRadius);
      markerGradient.addColorStop(0, collected ? 'rgba(42, 157, 143, 0.9)' : 'rgba(250, 204, 21, 0.95)');
      markerGradient.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = markerGradient;
      ctx.beginPath();
      ctx.arc(x, GROUND_Y - 64, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      if (assets.markers?.complete) {
        const markers = NAIDOC_EXPLORATION_ASSETS.markers;
        const stateIndex = collected ? 1 : 0;
        ctx.drawImage(
          assets.markers,
          stateIndex * markers.frameWidth,
          0,
          markers.frameWidth,
          markers.frameHeight,
          x - 36,
          GROUND_Y - 121,
          72,
          72,
        );
      } else {
        ctx.fillStyle = collected ? '#2a9d8f' : '#9a3412';
        drawRoundedRect(ctx, x - 22, GROUND_Y - 104, 44, 70, 8);
        ctx.fill();
        ctx.fillStyle = '#fff7db';
        ctx.font = '800 20px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(collected ? '✓' : '?', x, GROUND_Y - 62);
        ctx.textAlign = 'left';
      }
      ctx.fillStyle = 'rgba(23, 37, 34, 0.82)';
      ctx.font = '700 15px Outfit, sans-serif';
      ctx.fillText(marker.label, x - 48, GROUND_Y - 114);
    });

    const playerX = player.x - cameraX;
    ctx.fillStyle = 'rgba(28, 25, 23, 0.18)';
    ctx.beginPath();
    ctx.ellipse(playerX + PLAYER_WIDTH / 2, GROUND_Y + 7, 34, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (assets.player?.complete) {
      const playerAsset = NAIDOC_EXPLORATION_ASSETS.player;
      const moving = Math.abs(player.vx) > 1;
      const frameIndex = moving ? Math.floor(pulseTime * 8) % playerAsset.frameCount : 0;
      ctx.save();
      if (player.direction < 0) {
        ctx.translate(playerX + PLAYER_WIDTH / 2, 0);
        ctx.scale(-1, 1);
        ctx.translate(-(playerX + PLAYER_WIDTH / 2), 0);
      }
      ctx.drawImage(
        assets.player,
        frameIndex * playerAsset.frameWidth,
        0,
        playerAsset.frameWidth,
        playerAsset.frameHeight,
        playerX - 26,
        player.y - 48,
        96,
        192,
      );
      ctx.restore();
    } else {
      ctx.fillStyle = '#1f6f67';
      drawRoundedRect(ctx, playerX, player.y, PLAYER_WIDTH, PLAYER_HEIGHT, 12);
      ctx.fill();
      ctx.fillStyle = '#f3c99a';
      ctx.beginPath();
      ctx.arc(playerX + PLAYER_WIDTH / 2, player.y - 12, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#143d38';
      ctx.fillRect(playerX + (player.direction > 0 ? 25 : 10), player.y - 15, 5, 5);
    }

    if (nearbyMarkerRef.current) {
      ctx.fillStyle = 'rgba(255, 247, 219, 0.94)';
      drawRoundedRect(ctx, CANVAS_WIDTH / 2 - 160, 36, 320, 44, 8);
      ctx.fill();
      ctx.fillStyle = '#2f2418';
      ctx.font = '800 18px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Press E to investigate', CANVAS_WIDTH / 2, 64);
      ctx.textAlign = 'left';
    }

    if (!progress.finalUnlocked) {
      ctx.fillStyle = 'rgba(23, 37, 34, 0.74)';
      drawRoundedRect(ctx, CANVAS_WIDTH - 364, 30, 320, 64, 8);
      ctx.fill();
      ctx.fillStyle = '#fff7db';
      ctx.font = '700 15px Outfit, sans-serif';
      drawTextBlock(
        ctx,
        `Final area unlocks after ${progress.requiredTotal - progress.requiredCollected} more required investigations.`,
        CANVAS_WIDTH - 344,
        56,
        280,
        20,
      );
    }
  }, [collectedMarkerIds, progress.finalUnlocked, progress.requiredCollected, progress.requiredTotal]);

  useEffect(() => {
    if (!started || activeMarker || quizOpen) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return undefined;

    let lastTime = performance.now();
    const tick = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.033);
      lastTime = time;
      const player = playerRef.current;
      const keys = keysRef.current;
      const left = keys.ArrowLeft || keys.KeyA;
      const right = keys.ArrowRight || keys.KeyD;
      const jump = keys.Space || keys.ArrowUp || keys.KeyW;

      player.vx = 0;
      if (left) {
        player.vx = -MOVE_SPEED;
        player.direction = -1;
      }
      if (right) {
        player.vx = MOVE_SPEED;
        player.direction = 1;
      }
      if (jump && player.onGround) {
        player.vy = -JUMP_SPEED;
        player.onGround = false;
      }

      player.vy += GRAVITY * dt;
      player.x = clamp(player.x + player.vx * dt, 0, WORLD_WIDTH - PLAYER_WIDTH);
      player.y += player.vy * dt;

      if (player.x + PLAYER_WIDTH >= FINAL_GATE_X && !progress.finalUnlocked) {
        player.x = FINAL_GATE_X - PLAYER_WIDTH;
        player.vx = 0;
      }

      if (player.y + PLAYER_HEIGHT >= GROUND_Y) {
        player.y = GROUND_Y - PLAYER_HEIGHT;
        player.vy = 0;
        player.onGround = true;
      }

      const nextCamera = clamp(player.x - CANVAS_WIDTH * 0.42, 0, WORLD_WIDTH - CANVAS_WIDTH);
      cameraRef.current += (nextCamera - cameraRef.current) * 0.12;

      const playerCenter = player.x + PLAYER_WIDTH / 2;
      const nextNearby = NAIDOC_EXPLORATION_MARKERS.find((marker) => (
        Math.abs(marker.x - playerCenter) <= INTERACTION_RADIUS
        && (marker.areaId !== 'final' || progress.finalUnlocked)
      )) || null;

      if (nearbyMarkerRef.current?.id !== nextNearby?.id) {
        nearbyMarkerRef.current = nextNearby;
        setNearbyMarker(nextNearby);
      }

      const nextAreaId = getNaidocAreaForX(playerCenter).id;
      setCurrentAreaId((previousAreaId) => (previousAreaId === nextAreaId ? previousAreaId : nextAreaId));

      drawWorld(ctx, time / 1000);
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationRef.current);
  }, [activeMarker, drawWorld, progress.finalUnlocked, quizOpen, started]);

  useEffect(() => {
    if (!started) return undefined;

    const handleKeyDown = (event) => {
      if (event.target instanceof HTMLTextAreaElement) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === 'Escape') {
        setActiveMarker(null);
        setQuizOpen(false);
        return;
      }
      if (event.code === 'KeyE') {
        interactWithNearbyMarker();
        return;
      }
      keysRef.current[event.code] = true;
    };
    const handleKeyUp = (event) => {
      keysRef.current[event.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [interactWithNearbyMarker, started]);

  const handleAnswer = (questionId, optionIndex) => {
    setQuizAnswers((answers) => ({
      ...answers,
      [questionId]: optionIndex,
    }));
  };

  const handleBeginExploration = () => {
    if (typeof window !== 'undefined') {
      const resetScroll = () => {
        window.scrollTo({ top: 0, left: 0 });
        document.querySelector('.app-wrapper')?.scrollTo({ top: 0, left: 0 });
        document.querySelector('.main-content')?.scrollTo({ top: 0, left: 0 });
      };
      resetScroll();
      window.requestAnimationFrame(resetScroll);
    }
    setStarted(true);
  };

  if (!started) {
    return <TeacherStartScreen onBegin={handleBeginExploration} onBackToMenu={onBackToMenu} />;
  }

  return (
    <section className="phase-container naidoc-exploration-mode">
      <header className="naidoc-game-header">
        <button type="button" className="naidoc-back-button" onClick={onBackToMenu}>
          <ArrowLeft size={16} /> Menu
        </button>
        <div>
          <h1>{NAIDOC_EXPLORATION_TITLE}</h1>
          <p>{currentArea.title}</p>
        </div>
        <div className="naidoc-progress-panel" aria-live="polite">
          <strong>{progress.requiredCollected}/{progress.requiredTotal}</strong>
          <span>required knowledge pieces</span>
        </div>
      </header>

      <main className="naidoc-game-layout">
        <div className="naidoc-canvas-shell">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="naidoc-game-canvas"
            aria-label="Side-scrolling NAIDOC classroom exploration game"
          />
          <div className="naidoc-control-strip">
            <span>A/D or Arrow Keys: move</span>
            <span>Space/W/Up: jump</span>
            <span>E: investigate</span>
          </div>
        </div>

        <aside className="naidoc-side-panel">
          <h2>Teacher Path</h2>
          <ol>
            {NAIDOC_EXPLORATION_AREAS.map((area) => (
              <li key={area.id} className={area.id === currentAreaId ? 'is-current' : ''}>
                <strong>{area.shortTitle}</strong>
                <span>{area.teacherPace}</span>
              </li>
            ))}
          </ol>
          <div className="naidoc-next-marker">
            <strong>{nearbyMarker ? nearbyMarker.label : 'Explore to the next glow'}</strong>
            <span>{nearbyMarker ? 'Press E to open the learning card.' : 'Required markers unlock the final quiz.'}</span>
          </div>
          <button type="button" className="naidoc-secondary-action" onClick={resetProgress}>
            <RotateCcw size={15} /> Reset Class Progress
          </button>
        </aside>
      </main>

      <LearningCard marker={activeMarker} onClose={() => setActiveMarker(null)} />

      {quizOpen && (
        <div className="naidoc-modal-backdrop" role="presentation">
          <QuizPanel
            answers={quizAnswers}
            reflection={reflection}
            onAnswer={handleAnswer}
            onReflectionChange={setReflection}
            onReset={resetProgress}
            onBackToMenu={onBackToMenu}
          />
        </div>
      )}
    </section>
  );
}
