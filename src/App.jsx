import { lazy, Suspense, useState, useEffect, useMemo, useReducer } from 'react';
import './index.css';

// Components
import { ActivityMenu } from './components/Menu';
import { TrainingPhase } from './components/TrainingPhase';
import { SortPhase } from './components/SortPhase';
import { LabPhase } from './components/LabPhase';
import { MuseumPhase } from './components/MuseumPhase';
import { ReportPhase } from './components/ReportPhase';
import { DevTools } from './components/DevTools';

const DigPhase = lazy(() => import('./components/DigPhase').then((module) => ({
  default: module.DigPhase,
})));

const BureauMode = lazy(() => import('./components/BureauMode').then((module) => ({
  default: module.BureauMode,
})));

const ExpeditionMode = lazy(() => import('./components/ExpeditionMode').then((module) => ({
  default: module.ExpeditionMode,
})));

// Utilities & Data
import { 
  AUTOSAVE_KEY,
  TRAINING_STAGES,
  createNewGameSession,
  createNewBureauSession,
  rebuildSavedSession,
  createSavePayload,
} from './utils/gameLogic';

// --- Advanced Audio Synthesis ---
let audioCtx = null;
let expeditionMusic = null;
let expeditionMusicKey = null;
let expeditionMusicFade = null;
let expeditionSfxUnlocked = false;
const expeditionSfxLastPlayedAt = new Map();

const EXPEDITION_AUDIO_TRACKS = {
  music: {
    desert: 'assets/expedition/audio/valley-of-the-stone-kings.mp3',
    temple: 'assets/expedition/audio/egypt-temple-ambience.mp3',
    catacombs: 'assets/expedition/audio/egypt-catacombs-ambience.mp3',
    escape: 'assets/expedition/audio/egypt-escape-tension.mp3',
    baseCamp: 'assets/expedition/audio/egypt-base-camp.mp3',
    boss: 'assets/expedition/audio/egypt-boss-ambience.mp3',
    fallback: 'assets/expedition/audio/first-light-over-stone.mp3',
  },
  stingers: {
    evidenceDiscovery: 'assets/expedition/audio/evidence-discovery-stinger.mp3',
    gateUnlock: 'assets/expedition/audio/gate-unlock-stinger.mp3',
  },
  sfx: {
    footstepSand: {
      randomize: true,
      cooldownMs: 420,
      clips: [
        { path: 'assets/expedition/sfx/land-soft.ogg', volume: 0.12, playbackRate: 1.22 },
        { path: 'assets/expedition/sfx/satchel-leather.ogg', volume: 0.1, playbackRate: 1.08 },
        { path: 'assets/expedition/sfx/land-soft.ogg', volume: 0.1, playbackRate: 0.92 },
      ],
    },
    jump: { path: 'assets/expedition/sfx/land-soft.ogg', volume: 0.3, playbackRate: 1.28 },
    land: { path: 'assets/expedition/sfx/land-soft.ogg', volume: 0.4 },
    pickupTool: [
      { path: 'assets/expedition/sfx/satchel-leather.ogg', volume: 0.4 },
      { path: 'assets/expedition/sfx/satchel-buckle.ogg', volume: 0.3, delay: 55 },
      { path: 'assets/expedition/sfx/metal-click.ogg', volume: 0.34, delay: 95, playbackRate: 1.08 },
    ],
    pickupShard: {
      cooldownMs: 120,
      clips: [
        { path: 'assets/expedition/sfx/relic-shard.ogg', volume: 0.28, playbackRate: 0.96 },
        { path: 'assets/expedition/sfx/metal-click.ogg', volume: 0.16, delay: 70, playbackRate: 1.18 },
        { path: 'assets/expedition/sfx/relic-shard.ogg', volume: 0.14, delay: 125, playbackRate: 1.28 },
      ],
    },
    pickupUpgrade: { path: 'assets/expedition/sfx/metal-click.ogg', volume: 0.42, playbackRate: 0.92 },
    gateUnlock: { path: 'assets/expedition/sfx/stone-gate-open.ogg', volume: 0.52 },
    gateBlocked: { path: 'assets/expedition/sfx/stone-gate-blocked.ogg', volume: 0.44 },
    attackSwing: {
      cooldownMs: 260,
      clips: [
        { path: 'assets/expedition/sfx/satchel-leather.ogg', volume: 0.18, playbackRate: 1.24 },
      ],
    },
    enemyHit: { path: 'assets/expedition/sfx/enemy-hit.ogg', volume: 0.42 },
    playerHit: { path: 'assets/expedition/sfx/player-hit.ogg', volume: 0.42 },
    bossWarning: { path: 'assets/expedition/sfx/boss-warning.ogg', volume: 0.38 },
  },
};

const EXPEDITION_STINGER_DURATIONS = {
  evidenceDiscovery: 3200,
  gateUnlock: 4600,
};

const getAudioSrc = (path) => `${import.meta.env.BASE_URL}${path}`;

const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

const getExpeditionMusic = () => {
  if (!expeditionMusic) {
    expeditionMusic = new Audio();
    expeditionMusic.loop = true;
    expeditionMusic.volume = 0;
    expeditionMusic.preload = 'auto';
  }
  return expeditionMusic;
};

const fadeExpeditionMusicTo = (targetVolume, duration = 550) => {
  const music = getExpeditionMusic();
  if (expeditionMusicFade) window.clearInterval(expeditionMusicFade);
  const startVolume = music.volume;
  const startedAt = performance.now();
  expeditionMusicFade = window.setInterval(() => {
    const progress = Math.min(1, (performance.now() - startedAt) / duration);
    music.volume = startVolume + ((targetVolume - startVolume) * progress);
    if (progress >= 1) {
      window.clearInterval(expeditionMusicFade);
      expeditionMusicFade = null;
    }
  }, 30);
};

const playExpeditionMusic = (trackKey = 'desert') => {
  const nextKey = EXPEDITION_AUDIO_TRACKS.music[trackKey] ? trackKey : 'fallback';
  const music = getExpeditionMusic();
  if (expeditionMusicKey !== nextKey) {
    expeditionMusicKey = nextKey;
    music.src = getAudioSrc(EXPEDITION_AUDIO_TRACKS.music[nextKey]);
    music.currentTime = 0;
  }
  music.play().then(() => {
    fadeExpeditionMusicTo(0.34);
  }).catch((error) => {
    console.warn('Expedition music could not start', error);
  });
};

const stopExpeditionMusic = () => {
  if (!expeditionMusic) return;
  if (expeditionMusicFade) {
    window.clearInterval(expeditionMusicFade);
    expeditionMusicFade = null;
  }
  expeditionMusic.pause();
  expeditionMusic.currentTime = 0;
  expeditionMusic.volume = 0;
  expeditionMusicKey = null;
};

const playExpeditionStinger = (stingerKey) => {
  const path = EXPEDITION_AUDIO_TRACKS.stingers[stingerKey];
  if (!path) return;
  const stinger = new Audio(getAudioSrc(path));
  stinger.volume = 0.42;
  stinger.loop = false;
  stinger.play().catch((error) => {
    console.warn('Expedition stinger could not start', error);
  });
  window.setTimeout(() => {
    stinger.pause();
    stinger.currentTime = 0;
  }, EXPEDITION_STINGER_DURATIONS[stingerKey] || 3500);
};

const unlockExpeditionSfx = () => {
  initAudio();
  if (expeditionSfxUnlocked) return;
  const primer = new Audio(getAudioSrc('assets/expedition/sfx/metal-click.ogg'));
  primer.volume = 0.02;
  primer.play().then(() => {
    primer.pause();
    primer.currentTime = 0;
    expeditionSfxUnlocked = true;
  }).catch((error) => {
    console.warn('Expedition SFX unlock could not start', error);
  });
};

const playExpeditionSfx = (sfxKey, options = {}) => {
  initAudio();
  const config = EXPEDITION_AUDIO_TRACKS.sfx[sfxKey];
  if (!config) return;
  const cooldownMs = options.cooldownMs ?? config.cooldownMs ?? 0;
  if (cooldownMs > 0) {
    const now = performance.now();
    const lastPlayedAt = expeditionSfxLastPlayedAt.get(sfxKey) || 0;
    if (now - lastPlayedAt < cooldownMs) return;
    expeditionSfxLastPlayedAt.set(sfxKey, now);
  }
  const clips = Array.isArray(config)
    ? config
    : Array.isArray(config.clips)
      ? config.clips
      : [config];
  const selectedClips = config.randomize || sfxKey === 'footstepSand'
    ? [clips[Math.floor(Math.random() * clips.length)]]
    : clips;

  selectedClips.forEach((clip) => {
    const playClip = () => {
      const sound = new Audio(getAudioSrc(clip.path));
      sound.volume = Math.min(1, (clip.volume ?? 0.3) * (options.volume ?? 1));
      sound.playbackRate = (clip.playbackRate ?? 1) * (options.playbackRate ?? 1);
      sound.play().catch((error) => {
        console.warn('Expedition SFX could not start', error);
      });
    };

    if (clip.delay) {
      window.setTimeout(playClip, clip.delay);
    } else {
      playClip();
    }
  });
};

const playFlip = () => {
  if (!audioCtx) return;
  const bufferSize = audioCtx.sampleRate * 0.15; 
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.8;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  noiseSource.start();
};

const playMatch = () => {
  if (!audioCtx) return;
  const playBell = (freq, startTime, vol) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.6);
  };
  const now = audioCtx.currentTime;
  playBell(523.25, now, 0.2); 
  playBell(659.25, now + 0.1, 0.2); 
  playBell(783.99, now + 0.2, 0.3); 
};

const playError = () => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
};

const playWin = () => {
  if (!audioCtx) return;
  const playBell = (freq, startTime, duration) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };
  const now = audioCtx.currentTime;
  playBell(523.25, now, 0.8);
  playBell(659.25, now + 0.15, 0.8);
  playBell(783.99, now + 0.3, 0.8);
  playBell(1046.50, now + 0.45, 1.2);
};

const playTone = (freq, type = 'sine', duration = 0.5, vol = 0.2) => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

const baseAudioControls = { initAudio, playFlip, playMatch, playError, playWin, playTone, playExpeditionMusic, stopExpeditionMusic, playExpeditionStinger, playExpeditionSfx, unlockExpeditionSfx };

function ModeLoadingFallback({ label = 'Loading activity...' }) {
  return (
    <section className="phase-container mode-loading-phase">
      <div className="mode-loading-card glass-card">
        <div className="mode-loading-kicker">Preparing</div>
        <div className="mode-loading-title">{label}</div>
      </div>
    </section>
  );
}

function loadAutosave() {
  try {
    const raw = window.localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return { archaeology: null, bureau: null };
    const parsed = JSON.parse(raw);
    
    // Check if it's the new multi-mode format
    if (parsed.archaeology !== undefined || parsed.bureau !== undefined) {
      return {
        archaeology: parsed.archaeology ? rebuildSavedSession(parsed.archaeology) : null,
        bureau: parsed.bureau ? rebuildSavedSession(parsed.bureau) : null
      };
    }
    
    // Migration: if it's the old format, determine its mode and put it in the right slot
    const rebuilt = rebuildSavedSession(parsed);
    if (rebuilt.mode === 'bureau') {
      return { archaeology: null, bureau: rebuilt };
    } else {
      return { archaeology: rebuilt, bureau: null };
    }
  } catch (e) {
    console.warn('Failed to load autosave', e);
    return { archaeology: null, bureau: null };
  }
}

export default function App() {
  console.log('App: initializing savedGames');
  const [savedGames, setSavedGames] = useReducer((state, action) => {
    if (action.type === 'UPDATE') {
      return { ...state, [action.mode]: action.payload };
    }
    if (action.type === 'SET_ALL') {
      return action.payload;
    }
    return state;
  }, { archaeology: null, bureau: null }, loadAutosave);

  console.log('App: creating initialGame');
  const initialGame = useMemo(() => createNewGameSession('archaeology', 'menu'), []);
  const initialBureauGame = useMemo(() => createNewBureauSession('bureauBriefing'), []);

  // State Management
  const [phase, setPhase] = useState(initialGame.phase);
  const [currentScenario, setCurrentScenario] = useState(initialGame.currentScenario || null);
  const [activeArtifacts, setActiveArtifacts] = useState(initialGame.activeArtifacts || []);
  const [excavatedIds, setExcavatedIds] = useState(initialGame.excavatedIds || new Set());
  const [itemsLocation, setItemsLocation] = useState(initialGame.itemsLocation || {});
  const [hypotheses, setHypotheses] = useState(initialGame.hypotheses || {});
  const [siteName, setSiteName] = useState(initialGame.siteName || "Unknown Dig Site");
  const [finalConclusion, setFinalConclusion] = useState(initialGame.finalConclusion || null);
  const [currentEvent, setCurrentEvent] = useState(initialGame.currentEvent || null);
  const [curatedItems, setCuratedItems] = useState(initialGame.curatedItems || []);
  const [plaques, setPlaques] = useState(initialGame.plaques || {});
  const [finalExhibitionStatement, setFinalExhibitionStatement] = useState(initialGame.finalExhibitionStatement || '');
  const [evidenceConditions, setEvidenceConditions] = useState(initialGame.evidenceConditions || {});
  const [digRecoverySummary, setDigRecoverySummary] = useState(initialGame.digRecoverySummary || null);
  const [trainingPlacements, setTrainingPlacements] = useState(initialGame.trainingPlacements || Array(TRAINING_STAGES.length).fill(null));
  const [bureauState, setBureauState] = useState(initialBureauGame);
  const [showDevTools, setShowDevTools] = useState(false);
  const [isSiteSelectionActive, setIsSiteSelectionActive] = useState(false);
  const [expeditionMusicEnabled, setExpeditionMusicEnabled] = useState(false);
  const isMenuLanding = phase === 'menu' && !isSiteSelectionActive;
  const audioControls = useMemo(() => ({
    ...baseAudioControls,
    playExpeditionMusic: (trackKey) => {
      if (!expeditionMusicEnabled) {
        baseAudioControls.stopExpeditionMusic?.();
        return;
      }
      baseAudioControls.playExpeditionMusic?.(trackKey);
    },
  }), [expeditionMusicEnabled]);

  // Autosave Logic
  useEffect(() => {
    if (phase === 'menu' || phase === 'expedition') return;
    try {
      const isBureau = phase.startsWith('bureau');
      const payload = isBureau
        ? createSavePayload({ mode: 'bureau', phase, bureauState })
        : createSavePayload({
            mode: 'archaeology', phase, currentScenario, currentEvent, activeArtifacts,
            excavatedIds, itemsLocation, hypotheses, siteName, finalConclusion,
            curatedItems, plaques, finalExhibitionStatement, trainingPlacements,
            evidenceConditions, digRecoverySummary
          });
      
      const currentFullSave = JSON.parse(window.localStorage.getItem(AUTOSAVE_KEY) || '{"archaeology": null, "bureau": null}');
      const modeKey = isBureau ? 'bureau' : 'archaeology';
      
      // If the save format is old, we need to restructure it first
      const normalizedSave = (currentFullSave.archaeology !== undefined || currentFullSave.bureau !== undefined)
        ? currentFullSave
        : (currentFullSave.mode === 'bureau' ? { archaeology: null, bureau: currentFullSave } : { archaeology: currentFullSave, bureau: null });

      const updatedSave = { ...normalizedSave, [modeKey]: payload };
      window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(updatedSave));
      
      setSavedGames({ type: 'UPDATE', mode: modeKey, payload: rebuildSavedSession(payload) });
    } catch (error) {
      console.warn('Autosave failed', error);
    }
  }, [
    activeArtifacts, currentEvent, currentScenario, curatedItems, excavatedIds,
    digRecoverySummary, evidenceConditions, finalConclusion, finalExhibitionStatement, hypotheses, itemsLocation,
    bureauState, phase, plaques, siteName, trainingPlacements
  ]);

  // DevTools Hotkey
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'D') {
        e.preventDefault();
        setShowDevTools(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persistence Actions
  const applySavedSession = (session) => {
    if (!session) return;
    setIsSiteSelectionActive(false);
    setPhase(session.phase);
    if (session.mode === 'bureau') {
      setBureauState(session.bureauState);
    } else {
      setCurrentScenario(session.currentScenario);
      setCurrentEvent(session.currentEvent);
      setActiveArtifacts(session.activeArtifacts);
      setExcavatedIds(session.excavatedIds);
      setItemsLocation(session.itemsLocation);
      setHypotheses(session.hypotheses);
      setSiteName(session.siteName);
      setFinalConclusion(session.finalConclusion);
      setCuratedItems(session.curatedItems);
      setPlaques(session.plaques);
      setFinalExhibitionStatement(session.finalExhibitionStatement);
      setEvidenceConditions(session.evidenceConditions || {});
      setDigRecoverySummary(session.digRecoverySummary || null);
      setTrainingPlacements(session.trainingPlacements);
    }
  };

  const handleRetry = () => {
    const next = createNewGameSession('archaeology', 'dig');
    applySavedSession(next);
  };

  const handleStartInvestigation = (scenarioId = null) => {
    const next = createNewGameSession('archaeology', 'dig', scenarioId);
    applySavedSession(next);
  };

  const handleStartTraining = () => {
    const next = createNewGameSession('archaeology', 'training');
    applySavedSession(next);
  };

  const handleStartBureau = () => {
    const next = createNewBureauSession('bureauBriefing');
    setIsSiteSelectionActive(false);
    setBureauState(next);
    setPhase(next.phase);
  };

  const handleStartExpedition = () => {
    baseAudioControls.unlockExpeditionSfx?.();
    setIsSiteSelectionActive(false);
    setPhase('expedition');
  };

  const handleExpeditionMusicToggle = () => {
    baseAudioControls.unlockExpeditionSfx?.();
    setExpeditionMusicEnabled((enabled) => {
      if (enabled) baseAudioControls.stopExpeditionMusic?.();
      return !enabled;
    });
  };

  const handleExpeditionSoundTest = () => {
    baseAudioControls.unlockExpeditionSfx?.();
    baseAudioControls.playExpeditionSfx?.('pickupTool', { volume: 1.35 });
  };

  const handleBackToMenu = () => {
    audioControls.stopExpeditionMusic?.();
    setPhase('menu');
  };

  return (
    <div className={`app-wrapper app-wrapper--${phase} app-wrapper--no-global-header ${showDevTools ? 'app-wrapper--dev-tools' : ''} ${isMenuLanding ? 'app-wrapper--menu-header' : ''} ${isSiteSelectionActive ? 'app-wrapper--site-selection' : ''}`}>
      <main className="main-content">


        {phase === 'menu' && (
          <ActivityMenu
            onStartInvestigation={handleStartInvestigation}
            onStartTraining={handleStartTraining}
            onStartBureau={handleStartBureau}
            onStartExpedition={handleStartExpedition}
            savedGames={savedGames}
            onResumeInvestigation={() => applySavedSession(savedGames.archaeology)}
            onResumeBureau={() => applySavedSession(savedGames.bureau)}
            onSiteSelectionChange={setIsSiteSelectionActive}
            expeditionMusicEnabled={expeditionMusicEnabled}
            onExpeditionMusicToggle={handleExpeditionMusicToggle}
            onExpeditionSoundTest={handleExpeditionSoundTest}
          />
        )}

        {phase === 'training' && (
          <TrainingPhase 
            trainingPlacements={trainingPlacements} 
            setTrainingPlacements={setTrainingPlacements} 
            onBackToMenu={() => setPhase('menu')} 
          />
        )}

        {phase === 'dig' && currentEvent && (
          <Suspense fallback={<ModeLoadingFallback label="Loading dig site..." />}>
            <DigPhase
              activeArtifacts={activeArtifacts}
              excavatedIds={excavatedIds}
              setExcavatedIds={setExcavatedIds}
              onComplete={(recoveredArtifacts, recoveryConditions = {}, recoverySummary = null) => {
                setActiveArtifacts(recoveredArtifacts);
                setEvidenceConditions(recoveryConditions);
                setDigRecoverySummary(recoverySummary);
                setItemsLocation(recoveredArtifacts.reduce((acc, a) => ({ ...acc, [a.id]: 'inventory' }), {}));
                setPhase('sort');
              }}
              currentEvent={currentEvent}
              onBackToMenu={() => setPhase('menu')}
              audioControls={audioControls}
            />
          </Suspense>
        )}

        {phase === 'sort' && (
          <SortPhase 
            activeArtifacts={activeArtifacts} 
            itemsLocation={itemsLocation} 
            setItemsLocation={setItemsLocation} 
            onComplete={() => setPhase('lab')} 
            onBackToMenu={() => setPhase('menu')} 
            currentScenario={currentScenario}
            evidenceConditions={evidenceConditions}
          />
        )}

        {phase === 'lab' && (
          <LabPhase 
            activeArtifacts={activeArtifacts} 
            itemsLocation={itemsLocation} 
            hypotheses={hypotheses} 
            setHypotheses={setHypotheses} 
            currentScenario={currentScenario} 
            evidenceConditions={evidenceConditions}
            onComplete={(name, civId) => {
              setSiteName(name);
              setFinalConclusion(civId);
              setPhase('museum');
            }} 
            onBackToMenu={() => setPhase('menu')} 
          />
        )}

        {phase === 'museum' && (
          <MuseumPhase 
            activeArtifacts={activeArtifacts} 
            hypotheses={hypotheses} 
            curatedItems={curatedItems} 
            setCuratedItems={setCuratedItems} 
            plaques={plaques} 
            setPlaques={setPlaques} 
            finalExhibitionStatement={finalExhibitionStatement} 
            setFinalExhibitionStatement={setFinalExhibitionStatement} 
            evidenceConditions={evidenceConditions}
            onComplete={() => setPhase('report')} 
            onBackToMenu={() => setPhase('menu')} 
          />
        )}

        {phase === 'report' && currentScenario && currentEvent && (
          <ReportPhase 
            activeArtifacts={activeArtifacts} 
            itemsLocation={itemsLocation} 
            hypotheses={hypotheses} 
            siteName={siteName} 
            currentScenario={currentScenario} 
            onBack={() => setPhase('lab')} 
            onRetry={handleRetry} 
            currentEvent={currentEvent} 
            curatedItems={curatedItems} 
            plaques={plaques} 
            finalExhibitionStatement={finalExhibitionStatement} 
            evidenceConditions={evidenceConditions}
            digRecoverySummary={digRecoverySummary}
            onBackToMenu={() => setPhase('menu')} 
          />
        )}

        {phase === 'expedition' && (
          <Suspense fallback={<ModeLoadingFallback label="Loading expedition..." />}>
            <ExpeditionMode
              onBackToMenu={handleBackToMenu}
              audioControls={audioControls}
            />
          </Suspense>
        )}

        {phase.startsWith('bureau') && (
          <Suspense fallback={<ModeLoadingFallback label="Loading bureau case..." />}>
            <BureauMode
              bureauState={bureauState}
              setBureauState={setBureauState}
              onBackToMenu={() => setPhase('menu')}
              audioControls={audioControls}
            />
          </Suspense>
        )}
      </main>

      {showDevTools && (
        <DevTools 
          currentPhase={phase} setPhase={setPhase} setBureauState={setBureauState}
          setExcavatedIds={setExcavatedIds} setActiveArtifacts={setActiveArtifacts}
          setItemsLocation={setItemsLocation} setHypotheses={setHypotheses}
          setCurrentScenario={setCurrentScenario} setCurrentEvent={setCurrentEvent}
          setSiteName={setSiteName} setFinalConclusion={setFinalConclusion}
          setCuratedItems={setCuratedItems} setPlaques={setPlaques}
          setEvidenceConditions={setEvidenceConditions} setDigRecoverySummary={setDigRecoverySummary}
          currentScenario={currentScenario}
          activeArtifacts={activeArtifacts}
          currentEvent={currentEvent}
        />
      )}
    </div>
  );
}
