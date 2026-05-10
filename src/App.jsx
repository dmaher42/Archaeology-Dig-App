import { useState, useEffect, useMemo, useReducer } from 'react';
import { 
  Archive, Pickaxe, Save, Upload 
} from 'lucide-react';
import './index.css';

// Components
import { ActivityMenu } from './components/Menu';
import { TrainingPhase } from './components/TrainingPhase';
import { DigPhase } from './components/DigPhase';
import { SortPhase } from './components/SortPhase';
import { LabPhase } from './components/LabPhase';
import { MuseumPhase } from './components/MuseumPhase';
import { ReportPhase } from './components/ReportPhase';
import { BureauMode } from './components/BureauMode';
import { ExpeditionMode } from './components/ExpeditionMode';
import { DevTools } from './components/DevTools';

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
const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
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

const audioControls = { initAudio, playFlip, playMatch, playError, playWin, playTone };

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
  const [trainingPlacements, setTrainingPlacements] = useState(initialGame.trainingPlacements || Array(TRAINING_STAGES.length).fill(null));
  const [bureauState, setBureauState] = useState(initialBureauGame);
  const [saveMessage, setSaveMessage] = useState('');
  const [showDevTools, setShowDevTools] = useState(false);
  const isBureauPhase = phase.startsWith('bureau');
  const isExpeditionPhase = phase === 'expedition';
  const canUseProgressFiles = phase !== 'menu' && !isExpeditionPhase;

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
            curatedItems, plaques, finalExhibitionStatement, trainingPlacements
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
    finalConclusion, finalExhibitionStatement, hypotheses, itemsLocation,
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
    setBureauState(next);
    setPhase(next.phase);
  };

  const handleStartExpedition = () => {
    setPhase('expedition');
  };

  const handleSaveProgressFile = () => {
    if (!canUseProgressFiles) {
      setSaveMessage(isExpeditionPhase ? 'Expedition is a short mode and does not use save files.' : 'Choose an activity before saving.');
      return;
    }
    const isBureau = phase.startsWith('bureau');
    const payload = isBureau 
      ? createSavePayload({ mode: 'bureau', phase, bureauState })
      : createSavePayload({
          mode: 'archaeology', phase, currentScenario, currentEvent, activeArtifacts,
          excavatedIds, itemsLocation, hypotheses, siteName, finalConclusion,
          curatedItems, plaques, finalExhibitionStatement, trainingPlacements
        });
    
    const stamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
    const filename = isBureau ? `bureau-${stamp}.json` : `dig-${currentScenario.id}-${stamp}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setSaveMessage(`Saved as ${filename}`);
  };

  const handleLoadProgressFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const session = rebuildSavedSession(JSON.parse(text));
      applySavedSession(session);
      setSaveMessage(`Loaded ${file.name}`);
    } catch {
      setSaveMessage('Invalid save file.');
    }
    event.target.value = '';
  };

  return (
    <div className="app-wrapper">
      <header className="main-header hide-on-print">
        <div className="header-left">
          <div className="header-icon-container">
            {isBureauPhase ? <Archive size={28} className="header-main-icon" /> : <Pickaxe size={28} className="header-main-icon" />}
          </div>
          <div className="header-titles">
            <h1>{isBureauPhase ? 'The Antiquities Bureau' : (isExpeditionPhase || phase === 'menu') ? 'Lost Site Expedition' : 'Archaeology Challenge'}</h1>
            <p>{isBureauPhase ? 'Ancient Civilisation Clues' : isExpeditionPhase ? 'Collect evidence, avoid site hazards, and make a claim.' : phase === 'menu' ? 'Archaeology Challenge' : 'What can evidence tell us about the ancient past?'}</p>
          </div>
        </div>
        <div className="header-right">
          {phase === 'menu' ? (
            <div className="save-controls save-controls--menu-note" role="note">
              Save and load files unlock after a mission starts.
            </div>
          ) : (
            <div className="save-controls">
              <button className="save-control-btn" onClick={handleSaveProgressFile} disabled={!canUseProgressFiles}>
                <Save size={16} /> Save Progress
              </button>
              <label className={`save-control-btn ${!canUseProgressFiles ? 'is-disabled' : ''}`} aria-disabled={!canUseProgressFiles}>
                <Upload size={16} /> Load Progress
                <input type="file" accept=".json" onChange={handleLoadProgressFile} disabled={!canUseProgressFiles} hidden />
              </label>
            </div>
          )}
          {phase !== 'menu' && phase !== 'training' && !isBureauPhase && !isExpeditionPhase && (
            <nav className="phase-navigation" role="tablist">
              {['Dig', 'Sort', 'Lab', 'Museum', 'Report'].map((p, i) => (
                <button 
                  key={p} 
                  className={`phase-nav-item ${phase.toLowerCase() === p.toLowerCase() ? 'active' : ''}`}
                  onClick={() => setPhase(p.toLowerCase())}
                  role="tab"
                  aria-selected={phase.toLowerCase() === p.toLowerCase()}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
                >
                  <span className="phase-num">{i + 1}</span> {p}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {saveMessage && <div className="save-message" role="status">{saveMessage}</div>}

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
          <DigPhase 
            activeArtifacts={activeArtifacts} 
            excavatedIds={excavatedIds} 
            setExcavatedIds={setExcavatedIds} 
            onComplete={(recoveredArtifacts) => {
              setActiveArtifacts(recoveredArtifacts);
              setItemsLocation(recoveredArtifacts.reduce((acc, a) => ({ ...acc, [a.id]: 'inventory' }), {}));
              setPhase('sort');
            }} 
            currentEvent={currentEvent} 
            onBackToMenu={() => setPhase('menu')}
            audioControls={audioControls}
          />
        )}

        {phase === 'sort' && (
          <SortPhase 
            activeArtifacts={activeArtifacts} 
            itemsLocation={itemsLocation} 
            setItemsLocation={setItemsLocation} 
            onComplete={() => setPhase('lab')} 
            onBackToMenu={() => setPhase('menu')} 
            currentScenario={currentScenario}
          />
        )}

        {phase === 'lab' && (
          <LabPhase 
            activeArtifacts={activeArtifacts} 
            itemsLocation={itemsLocation} 
            hypotheses={hypotheses} 
            setHypotheses={setHypotheses} 
            currentScenario={currentScenario} 
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
            onBackToMenu={() => setPhase('menu')} 
          />
        )}

        {phase === 'expedition' && (
          <ExpeditionMode 
            onBackToMenu={() => setPhase('menu')} 
            audioControls={audioControls}
          />
        )}

        {phase.startsWith('bureau') && (
          <BureauMode 
            bureauState={bureauState} 
            setBureauState={setBureauState} 
            onBackToMenu={() => setPhase('menu')} 
            audioControls={audioControls}
          />
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
          currentScenario={currentScenario}
          activeArtifacts={activeArtifacts}
          currentEvent={currentEvent}
        />
      )}
    </div>
  );
}
