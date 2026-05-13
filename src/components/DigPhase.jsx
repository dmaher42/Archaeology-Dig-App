import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { 
  Pickaxe, Clock, Radar, Trophy, RefreshCw, HelpCircle, Lightbulb, Users,
  CheckCircle2, FileText, Tent, Activity, AlertTriangle, Wind, CloudRain, Moon, Mountain
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getArtifactTheme, 
  getArtifactEraLabel, 
  getCategoryTitle,
  createDigTiles,
  resolveAssetPath
} from '../utils/gameLogic';
import { getIcon } from './Icons';
import { getAtlasRegionStyle, useFullInvestigationAssets } from './full-investigation/fullInvestigationAssets';

const ARCHAEOLOGY_CARD_BACK_PATH = 'assets/ui/archaeology-card-back.png';

const INITIAL_EMERGENCY_STATE = {
  phase: 'cooldown',
  event: null,
  threatZone: null,
  secondsRemaining: 0,
  cooldownRemaining: 0,
  message: '',
  impactKey: null,
  cycleId: 0,
};

const DIG_EMERGENCY_EVENTS = [
  {
    id: 'nightfall',
    label: 'Approaching Night',
    Icon: Moon,
    match: /night|dark/i,
    zone: 'all',
    warning: 'Nightfall closing in. Exposed finds may lose recovery context.',
    active: 'Nightfall pressure reduces recovery quality for exposed finds.',
    resolved: 'Nightfall reduced recovery quality.',
    exploreAffected: 1,
    challengeAffected: 2,
    pressure: 1,
    disturbance: 1,
  },
  {
    id: 'sandstorm',
    label: 'Sandstorm',
    Icon: Wind,
    match: /storm|sand|dust/i,
    zone: 'center',
    warning: 'Sandstorm approaching. The centre trench is at risk.',
    active: 'Sand is covering exposed evidence in the centre trench.',
    resolved: 'Sandstorm disturbed exposed finds.',
    exploreAffected: 1,
    challengeAffected: 2,
    pressure: 1,
    disturbance: 1,
  },
  {
    id: 'flash-flood',
    label: 'Flash Flood',
    Icon: CloudRain,
    match: /flood|river|water/i,
    zone: 'bottom',
    warning: 'Flash flood warning. Lower trench finds are threatened.',
    active: 'Water is damaging exposed finds in the lower trench.',
    resolved: 'Flash flood damaged lower-trench evidence.',
    exploreAffected: 1,
    challengeAffected: 2,
    pressure: 2,
    disturbance: 2,
  },
  {
    id: 'falling-debris',
    label: 'Falling Debris',
    Icon: Mountain,
    match: /collapse|debris|falling|ruin/i,
    zone: 'row',
    warning: 'Falling debris warning. One trench row is unstable.',
    active: 'Debris is shaking loose over an exposed trench row.',
    resolved: 'Falling debris damaged exposed evidence.',
    exploreAffected: 1,
    challengeAffected: 1,
    pressure: 2,
    disturbance: 1,
  },
];

const getEventTheme = (currentEvent) => `${currentEvent?.title || ''} ${currentEvent?.description || ''}`;

const pickEmergencyEvent = (currentEvent, cycleIndex) => {
  const theme = getEventTheme(currentEvent);
  const themed = DIG_EMERGENCY_EVENTS.find(event => event.match.test(theme));
  if (themed && cycleIndex % 2 === 0) return themed;
  return DIG_EMERGENCY_EVENTS[cycleIndex % DIG_EMERGENCY_EVENTS.length];
};

const getThreatZone = (event, cycleIndex, boardRows) => {
  if (event.zone === 'bottom') {
    return { id: `${event.id}-bottom`, type: 'row', row: Math.max(0, boardRows - 1), label: 'lower trench' };
  }
  if (event.zone === 'center') {
    return { id: `${event.id}-center`, type: 'center', label: 'centre trench' };
  }
  if (event.zone === 'all') {
    return { id: `${event.id}-all`, type: 'all', label: 'whole site' };
  }
  const row = Math.max(0, cycleIndex % boardRows);
  return { id: `${event.id}-row-${row}`, type: 'row', row, label: `trench row ${row + 1}` };
};

const isTileInThreatZone = (index, zone, columns, rows) => {
  if (!zone) return false;
  const row = Math.floor(index / columns);
  const col = index % columns;
  if (zone.type === 'all') return true;
  if (zone.type === 'row') return row === zone.row;
  if (zone.type === 'center') {
    const centerRows = rows <= 2 ? [0, rows - 1] : [Math.floor((rows - 1) / 2)];
    return centerRows.includes(row) && col >= 2 && col <= Math.max(2, columns - 3);
  }
  return false;
};

export function DigPhase({ activeArtifacts, excavatedIds, setExcavatedIds, onComplete, currentEvent, onBackToMenu, audioControls = {} }) {
  const { playFlip, playMatch, playError, initAudio, playTone } = audioControls;
  const [tiles, setTiles] = useState(() => createDigTiles(activeArtifacts, excavatedIds));
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', isError: false, tone: 'neutral' });
  const [fieldNote, setFieldNote] = useState(null);
  const [showDebrief, setShowDebrief] = useState(false);
  const [timerMode, setTimerMode] = useState('normal');
  const [selectedDigMode, setSelectedDigMode] = useState('normal');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(1);
  const [playerCount, setPlayerCount] = useState(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerScores, setPlayerScores] = useState([0, 0]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(currentEvent.time); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [showStormWarning, setShowStormWarning] = useState(true);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const [attempts, setAttempts] = useState(0);
  const [isSurveying, setIsSurveying] = useState(false);
  const [challengeDuration, setChallengeDuration] = useState(180);
  const [disturbanceLevel, setDisturbanceLevel] = useState(0);
  const [artifactPressure, setArtifactPressure] = useState({});
  const [radarUses, setRadarUses] = useState(0);
  const [emergencyState, setEmergencyState] = useState(INITIAL_EMERGENCY_STATE);
  const [emergencyImpactCount, setEmergencyImpactCount] = useState(0);
  const [emergencyAffectedEvidenceIds, setEmergencyAffectedEvidenceIds] = useState([]);
  const [emergencyLog, setEmergencyLog] = useState([]);
  const radarTimeoutRef = useRef(null);
  const appliedEmergencyImpactsRef = useRef(new Set());
  const boardContainerRef = useRef(null);
  const [boardFit, setBoardFit] = useState({ width: 0, height: 0 });
  const [premiumCardBackReady, setPremiumCardBackReady] = useState(false);
  const fullInvestigationAssets = useFullInvestigationAssets();
  const archaeologyCardBackUrl = resolveAssetPath(ARCHAEOLOGY_CARD_BACK_PATH);
  const boardColumns = 8;
  const boardRows = Math.max(1, Math.ceil(tiles.length / boardColumns));
  const emergencyIcon = emergencyState.event?.Icon || AlertTriangle;
  const EmergencyIcon = emergencyIcon;

  const EventIcon = currentEvent?.icon ?? HelpCircle;
  const recoveredArtifacts = activeArtifacts.filter(artifact => excavatedIds.has(artifact.id));
  const isTwoPlayer = playerCount === 2;
  const playerTurnLabel = isTwoPlayer ? `Player ${currentPlayerIndex + 1}` : 'Explorer';
  const playerOneScore = playerScores[0] ?? 0;
  const playerTwoScore = playerScores[1] ?? 0;
  const scoreSummary = isTwoPlayer
    ? `P1 ${playerOneScore} - P2 ${playerTwoScore}`
    : `Score ${playerOneScore}`;
  const getWinnerText = () => {
    if (!isTwoPlayer) return `You recovered ${recoveredArtifacts.length} find${recoveredArtifacts.length === 1 ? '' : 's'}.`;
    if (playerOneScore === playerTwoScore) return `It's a tie at ${playerOneScore} to ${playerTwoScore}.`;
    return `Player ${playerOneScore > playerTwoScore ? 1 : 2} wins ${Math.max(playerOneScore, playerTwoScore)} to ${Math.min(playerOneScore, playerTwoScore)}.`;
  };

  useEffect(() => {
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (active) setPremiumCardBackReady(true);
    };
    image.onerror = () => {
      if (active) setPremiumCardBackReady(false);
    };
    image.src = archaeologyCardBackUrl;
    return () => {
      active = false;
    };
  }, [archaeologyCardBackUrl]);

  useEffect(() => {
    const isComplete = activeArtifacts.length > 0 && excavatedIds.size === activeArtifacts.length;
    if (!isPlaying || isTimeUp || isComplete) return;
    const interval = setInterval(() => {
      if (timerMode === 'challenge') {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPlaying(false);
            setIsTimeUp(true);
            return 0;
          }
          return prev - 1;
        });
        return;
      }
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeArtifacts.length, excavatedIds.size, isPlaying, isTimeUp, timerMode]);

  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: '', isError: false, tone: 'neutral' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback.message]);

  useEffect(() => {
    if (fieldNote) {
      const timer = setTimeout(() => {
        setFieldNote(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [fieldNote]);

  useLayoutEffect(() => {
    const element = boardContainerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;

    const updateBoardFit = () => {
      const styles = window.getComputedStyle(element);
      const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const verticalPadding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const width = element.clientWidth - horizontalPadding;
      const height = element.clientHeight - verticalPadding;
      if (!width || !height) return;

      const gapSize = window.matchMedia('(max-height: 820px), (max-width: 900px)').matches ? 4 : 5;
      const maxTileSize = window.matchMedia('(max-height: 820px) and (min-width: 901px)').matches ? 120 : 142;
      const tileSize = Math.max(1, Math.floor(Math.min(
        (width - (gapSize * (boardColumns - 1))) / boardColumns,
        (height - (gapSize * (boardRows - 1))) / boardRows,
        maxTileSize,
      )));
      const nextWidth = (tileSize * boardColumns) + (gapSize * (boardColumns - 1));
      const nextHeight = (tileSize * boardRows) + (gapSize * (boardRows - 1));

      setBoardFit(prev => (
        prev.width === nextWidth && prev.height === nextHeight && prev.gap === gapSize
          ? prev
          : { width: nextWidth, height: nextHeight, gap: gapSize }
      ));
    };

    updateBoardFit();
    const observer = new ResizeObserver(updateBoardFit);
    observer.observe(element);

    return () => observer.disconnect();
  }, [boardColumns, boardRows]);

  useEffect(() => () => {
    if (radarTimeoutRef.current) {
      clearTimeout(radarTimeoutRef.current);
      radarTimeoutRef.current = null;
    }
  }, []);

  const getThreatenedArtifactIds = useCallback((event, threatZone) => {
    const candidateIds = tiles
      .map((tile, index) => ({ tile, index }))
      .filter(({ tile, index }) => (
        tile?.artifactId
        && !tile.isMatched
        && !excavatedIds.has(tile.artifactId)
        && isTileInThreatZone(index, threatZone, boardColumns, boardRows)
      ))
      .map(({ tile }) => tile.artifactId);

    return Array.from(new Set(candidateIds)).slice(0, timerMode === 'challenge' ? event.challengeAffected : event.exploreAffected);
  }, [boardColumns, boardRows, excavatedIds, tiles, timerMode]);

  const applyEmergencyImpact = useCallback((state) => {
    if (!state.event || !state.threatZone) return;
    const affectedIds = getThreatenedArtifactIds(state.event, state.threatZone);
    setDisturbanceLevel(prev => prev + state.event.disturbance);

    if (affectedIds.length > 0) {
      setArtifactPressure(prev => {
        const next = { ...prev };
        affectedIds.forEach(id => {
          next[id] = (next[id] || 0) + state.event.pressure;
        });
        return next;
      });
      setEmergencyAffectedEvidenceIds(prev => Array.from(new Set([...prev, ...affectedIds])));
      setEmergencyImpactCount(prev => prev + affectedIds.length);
    }

    const impactMessage = affectedIds.length > 0
      ? `${state.event.label} affected ${affectedIds.length} unrecovered find${affectedIds.length === 1 ? '' : 's'} in the ${state.threatZone.label}.`
      : `${state.event.label} passed over the ${state.threatZone.label}. No unrecovered finds were exposed.`;

    setEmergencyLog(prev => [...prev, {
      id: state.event.id,
      label: state.event.label,
      zone: state.threatZone.label,
      affectedCount: affectedIds.length,
      affectedIds,
      message: impactMessage,
    }].slice(-6));
    setFeedback({ message: impactMessage, isError: affectedIds.length > 0, tone: affectedIds.length > 0 ? 'warning' : 'accent' });
  }, [getThreatenedArtifactIds]);

  useEffect(() => {
    const isComplete = activeArtifacts.length > 0 && excavatedIds.size === activeArtifacts.length;
    if (!isPlaying || isTimeUp || isComplete || showStormWarning || showDebrief) return undefined;

    const interval = setInterval(() => {
      setEmergencyState(prev => {
        if (prev.phase === 'warning') {
          if (prev.secondsRemaining > 1) {
            return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
          }
          return {
            ...prev,
            phase: 'active',
            secondsRemaining: timerMode === 'challenge' ? 2 : 3,
            message: prev.event?.active || '',
          };
        }

        if (prev.phase === 'active') {
          if (prev.secondsRemaining > 1) {
            return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
          }
          return {
            ...prev,
            phase: 'resolved',
            secondsRemaining: 3,
            message: prev.event?.resolved || '',
            impactKey: `${prev.cycleId}-${prev.event?.id || 'event'}`,
          };
        }

        if (prev.phase === 'resolved') {
          if (prev.secondsRemaining > 1) {
            return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
          }
          return {
            ...INITIAL_EMERGENCY_STATE,
            cooldownRemaining: timerMode === 'challenge' ? 13 : 24,
            cycleId: prev.cycleId + 1,
          };
        }

        const nextCooldown = Math.max(0, (prev.cooldownRemaining || 0) - 1);
        if (nextCooldown > 0) {
          return { ...prev, cooldownRemaining: nextCooldown };
        }

        const event = pickEmergencyEvent(currentEvent, prev.cycleId);
        const threatZone = getThreatZone(event, prev.cycleId, boardRows);
        return {
          phase: 'warning',
          event,
          threatZone,
          secondsRemaining: timerMode === 'challenge' ? 5 : 7,
          cooldownRemaining: 0,
          message: event.warning,
          impactKey: null,
          cycleId: prev.cycleId,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeArtifacts.length, boardRows, currentEvent, excavatedIds.size, isPlaying, isTimeUp, showDebrief, showStormWarning, timerMode]);

  useEffect(() => {
    if (emergencyState.phase !== 'resolved' || !emergencyState.impactKey) return;
    if (appliedEmergencyImpactsRef.current.has(emergencyState.impactKey)) return;
    appliedEmergencyImpactsRef.current.add(emergencyState.impactKey);
    applyEmergencyImpact(emergencyState);
  }, [applyEmergencyImpact, emergencyState]);

  const handleRadar = () => {
    const radarCost = timerMode === 'challenge' ? (challengeDuration === 300 ? 30 : challengeDuration === 180 ? 20 : 10) : 0;
    if ((timerMode === 'challenge' && timeLeft <= radarCost) || isLocked || !isPlaying) return;
    
    if (initAudio) initAudio();
    if (playTone) playTone(800, 'sine', 0.5, 0.1);
    setRadarUses(prev => prev + 1);
    setDisturbanceLevel(prev => prev + 1);
    setFeedback({ message: 'Radar activated. Survey help used; site disturbance increased slightly.', isError: false, tone: 'accent' });
    if (radarCost > 0) {
      setTimeLeft(prev => prev - radarCost);
    }
    setIsLocked(true);
    setIsSurveying(true);
    
    const duration = challengeDuration === 300 ? 5000 : challengeDuration === 180 ? 3000 : 1500;

    setTiles(prev => prev.map(t => t.isMatched ? t : { ...t, isFlipped: true }));
    if (radarTimeoutRef.current) {
      clearTimeout(radarTimeoutRef.current);
    }
    
    radarTimeoutRef.current = setTimeout(() => {
      setTiles(prev => prev.map(t => t.isMatched ? t : { ...t, isFlipped: false }));
      setIsLocked(false);
      setIsSurveying(false);
      setFlippedIndices([]);
      radarTimeoutRef.current = null;
    }, duration);
  };

  const recordRecoveryNote = (artifact) => {
    setFieldNote({
      name: artifact.name,
      eraLabel: getArtifactEraLabel(artifact),
      discoveryMethod: artifact.discoveryMethod,
      typeLabel: getCategoryTitle(artifact.type),
      isDisturbance: !!artifact.isRedHerring,
    });

    setTimeout(() => {
      setFieldNote(prev => {
        if (prev && prev.name === artifact.name) return null;
        return prev;
      });
    }, 5000);
  };

  const openDebrief = () => {
    setShowDebrief(true);
  };

  const handleTileClick = (index) => {
    if (isLocked || !isPlaying) return;
    if (tiles[index].isFlipped || tiles[index].isMatched) return;

    if (initAudio) initAudio();
    if (playFlip) playFlip();

    setTiles(prev => {
      const next = [...prev];
      next[index] = { ...next[index], isFlipped: true };
      return next;
    });

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setAttempts(prev => prev + 1);
      const [idx1, idx2] = newFlipped;
      const match = tiles[idx1].artifactId === tiles[index].artifactId;

      if (match) {
        setTimeout(() => {
          if (playMatch) playMatch();
          setTiles(prev => {
            const next = [...prev];
            next[idx1] = { ...next[idx1], isMatched: true, isFlipped: true };
            next[idx2] = { ...next[idx2], isMatched: true, isFlipped: true };
            return next;
          });
          
          setExcavatedIds(prev => {
            const next = new Set(prev);
            next.add(tiles[idx1].artifactId);
            return next;
          });
          if (isTwoPlayer) {
            const scoringPlayer = currentPlayerIndex;
            setPlayerScores(prev => {
              const next = [...prev];
              next[scoringPlayer] = (next[scoringPlayer] || 0) + 1;
              return next;
            });
            setFeedback({
              message: `Player ${scoringPlayer + 1} keeps the turn.`,
              isError: false,
              tone: 'accent',
            });
          }
          recordRecoveryNote(tiles[idx1].artifact);
          if (excavatedIds.size + 1 === activeArtifacts.length) {
            setIsPlaying(false);
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          }
          
          setFlippedIndices([]);
          setIsLocked(false);
        }, 600);
      } else {
        const missedArtifacts = [tiles[idx1]?.artifact, tiles[index]?.artifact].filter(Boolean);
        setArtifactPressure(prev => {
          const next = { ...prev };
          missedArtifacts.forEach(artifact => {
            next[artifact.id] = (next[artifact.id] || 0) + 1;
          });
          return next;
        });
        setDisturbanceLevel(prev => prev + 1);
        setTimeout(() => {
          if (playError) playError();
          if (isTwoPlayer) {
            const nextPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
            setCurrentPlayerIndex(nextPlayerIndex);
            setFeedback({
              message: `Turn passes to Player ${nextPlayerIndex + 1}.`,
              isError: false,
              tone: 'neutral',
            });
          } else {
            setFeedback({
              message: 'Careful. That mismatch disturbed the excavation context.',
              isError: false,
              tone: 'neutral',
            });
          }
          setTiles(prev => {
            const next = [...prev];
            next[idx1] = { ...next[idx1], isFlipped: false };
            next[idx2] = { ...next[idx2], isFlipped: false };
            return next;
          });
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timeDanger = timeLeft <= 15 && isPlaying;
  const perfectClear = activeArtifacts.length > 0 && excavatedIds.size === activeArtifacts.length;
  const displayTime = timerMode === 'challenge' ? timeLeft : elapsedTime;
  const timerLabel = timerMode === 'challenge' ? 'TIME LEFT' : 'TIME TAKEN';
  const timerModeLabel = timerMode === 'challenge' ? 'Challenge' : 'Explore';
  const challengeTimeLabel = challengeDuration === 300 ? '5 minutes' : challengeDuration === 180 ? '3 minutes' : '90 seconds';
  const excavationTrayStyle = getAtlasRegionStyle(fullInvestigationAssets, 'excavationTray');
  const premiumCardBackStyle = premiumCardBackReady
    ? { '--premium-card-back-image': `url("${archaeologyCardBackUrl}")` }
    : undefined;
  const minimumEvidenceTarget = Math.min(activeArtifacts.length, activeArtifacts.length >= 10 ? 10 : activeArtifacts.length);
  const pressureBand = disturbanceLevel >= 8 ? 'high' : disturbanceLevel >= 4 ? 'medium' : 'low';
  const pressureLabel = pressureBand === 'high' ? 'High disturbance' : pressureBand === 'medium' ? 'Care needed' : 'Careful dig';
  const emergencyAffectedSet = new Set(emergencyAffectedEvidenceIds);
  const getRecoveryCondition = (artifact, isRecovered) => {
    const pressure = artifactPressure[artifact.id] || 0;
    if (!isRecovered) return 'disturbed';
    if (artifact.isRedHerring) return 'disturbed';
    if (pressure >= 3 || disturbanceLevel >= 10) return 'damaged';
    if (pressure >= 1 || disturbanceLevel >= 5 || radarUses > 0) return 'good';
    return 'excellent';
  };
  const recoveryPackage = activeArtifacts.reduce((acc, artifact) => {
    const isRecovered = excavatedIds.has(artifact.id);
    const condition = getRecoveryCondition(artifact, isRecovered);
    acc.conditions[artifact.id] = {
      condition,
      recoveredBy: isRecovered ? 'student' : 'field-team',
      pressure: artifactPressure[artifact.id] || 0,
      emergencyAffected: emergencyAffectedSet.has(artifact.id),
      note: emergencyAffectedSet.has(artifact.id)
        ? 'Recovery context was affected by an environmental emergency.'
        : isRecovered
          ? condition === 'excellent'
            ? 'Recovered with strong context.'
            : condition === 'good'
              ? 'Recovered with usable field context.'
              : condition === 'damaged'
                ? 'Recovered after added excavation pressure.'
                : 'Logged as site disturbance.'
          : 'Transferred by the field team after the dig window closed.',
    };
    acc.counts[condition] += 1;
    return acc;
  }, {
    artifacts: activeArtifacts,
    conditions: {},
    counts: { excellent: 0, good: 0, damaged: 0, disturbed: 0 },
  });
  const cleanRecoveryCount = recoveryPackage.counts.excellent + recoveryPackage.counts.good;
  const recoverySummary = {
    cleanRecoveryCount,
    damagedRecoveryCount: recoveryPackage.counts.damaged,
    disturbedRecoveryCount: recoveryPackage.counts.disturbed,
    recoveredEvidenceCount: recoveredArtifacts.length,
    guaranteedEvidenceCount: recoveryPackage.artifacts.length,
    minimumEvidenceTarget,
    digMinimumEvidenceMet: recoveryPackage.artifacts.length >= minimumEvidenceTarget,
    attempts,
    radarUses,
    disturbanceLevel,
    emergenciesFaced: emergencyLog.length,
    emergencyImpactCount,
    emergencyAffectedEvidenceIds,
    timeMode: timerMode,
    elapsedTime,
    timeLeft,
  };

  useEffect(() => {
    const renderDigToText = () => JSON.stringify({
      mode: 'full-investigation',
      phase: 'dig',
      timerMode,
      isPlaying,
      activeEmergencyEvent: emergencyState.event?.label || null,
      emergencyWarningActive: emergencyState.phase === 'warning',
      emergencyThreatZone: emergencyState.threatZone?.label || null,
      emergencyCooldown: emergencyState.cooldownRemaining || 0,
      emergencyPhase: emergencyState.phase,
      emergencyMessage: emergencyState.message,
      emergencyImpactCount,
      emergencyAffectedEvidenceIds,
      evidenceConditions: recoveryPackage.conditions,
      recoveredEvidenceCount: recoveredArtifacts.length,
      guaranteedEvidenceCount: recoveryPackage.artifacts.length,
      minimumEvidenceGuaranteeActive: true,
      digMinimumEvidenceMet: recoverySummary.digMinimumEvidenceMet,
      siteDisturbanceLevel: disturbanceLevel,
      attempts,
      radarUses,
      timeLeft,
      elapsedTime,
    });
    window.render_game_to_text = renderDigToText;
    return () => {
      if (window.render_game_to_text === renderDigToText) {
        delete window.render_game_to_text;
      }
    };
  }, [
    attempts, disturbanceLevel, elapsedTime, emergencyAffectedEvidenceIds, emergencyImpactCount,
    emergencyState, isPlaying, radarUses, recoveredArtifacts.length, recoveryPackage.artifacts.length,
    recoveryPackage.conditions, recoverySummary.digMinimumEvidenceMet, timeLeft, timerMode
  ]);

  return (
    <div className="phase-container dig-phase">
      {showStormWarning && (
        <div className="modal-overlay dig-setup-overlay">
          <div className="modal-content warning-modal dig-setup-modal" style={{borderColor: currentEvent.dangerColor, boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 40px ${currentEvent.dangerColor}30`}}>
            <div style={{ color: currentEvent.dangerColor, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <EventIcon size={64} style={{ animation: 'pulse 2s infinite', filter: `drop-shadow(0 0 15px ${currentEvent.dangerColor}60)` }} />
            </div>
            <h2 className="modal-title" style={{color: currentEvent.dangerColor}}>{currentEvent.title}</h2>
            <p className="modal-subtitle">{currentEvent.description}</p>
            <div className="dig-mode-picker">
              <div className="dig-mode-group">
                <p className="dig-step-label">Select Crew Size</p>
                <div className="dig-mode-grid">
                  <button
                    type="button"
                    className={`btn dig-mode-card ${selectedPlayerCount === 1 ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPlayerCount(1)}
                  >
                    <strong>Solo Operation</strong>
                    <span>Single explorer focus</span>
                  </button>
                  <button
                    type="button"
                    className={`btn dig-mode-card ${selectedPlayerCount === 2 ? 'is-selected' : ''}`}
                    onClick={() => setSelectedPlayerCount(2)}
                  >
                    <strong>Team Expedition</strong>
                    <span>Two explorers, shared grid</span>
                  </button>
                </div>
              </div>

              <div className="dig-mode-group">
                <p className="dig-step-label">Excavation Strategy</p>
                <div className="dig-mode-grid">
                  <button
                    type="button"
                    className={`btn dig-mode-card ${selectedDigMode === 'normal' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedDigMode('normal')}
                  >
                    <strong>Methodical Search</strong>
                    <span>No time pressure, thorough study</span>
                  </button>
                  <button
                    type="button"
                    className={`btn dig-mode-card ${selectedDigMode === 'challenge' ? 'is-selected' : ''}`}
                    onClick={() => setSelectedDigMode('challenge')}
                  >
                    <strong>Emergency Rescue</strong>
                    <span>Rapid recovery before time expires</span>
                  </button>
                </div>
              </div>

              {selectedDigMode === 'challenge' && (
                <div className="dig-mode-group" style={{animation: 'fadeIn 0.3s ease'}}>
                  <p className="dig-step-label">Time Authorization</p>
                  <div className="dig-time-grid">
                    <button className={`btn dig-time-pill ${challengeDuration === 300 ? 'is-selected' : ''}`} onClick={() => setChallengeDuration(300)}>5m Authorization</button>
                    <button className={`btn dig-time-pill ${challengeDuration === 180 ? 'is-selected' : ''}`} onClick={() => setChallengeDuration(180)}>3m Authorization</button>
                    <button className={`btn dig-time-pill ${challengeDuration === 90 ? 'is-selected' : ''}`} onClick={() => setChallengeDuration(90)}>90s Authorization</button>
                  </div>
                </div>
              )}
            </div>
            <div className="dig-mode-actions">
              <button className="btn secondary-btn" onClick={onBackToMenu}>
                Back to menu
              </button>
              <button className="btn primary-btn large-btn" onClick={() => {
                if (initAudio) initAudio();
                setPlayerCount(selectedPlayerCount);
                setCurrentPlayerIndex(0);
                setPlayerScores([0, 0]);
                setTimerMode(selectedDigMode);
                setElapsedTime(0);
                setTimeLeft(challengeDuration);
                setIsTimeUp(false);
                setShowDebrief(false);
                setDisturbanceLevel(0);
                setArtifactPressure({});
                setRadarUses(0);
                setEmergencyState({ ...INITIAL_EMERGENCY_STATE, cooldownRemaining: selectedDigMode === 'challenge' ? 8 : 14 });
                setEmergencyImpactCount(0);
                setEmergencyAffectedEvidenceIds([]);
                setEmergencyLog([]);
                appliedEmergencyImpactsRef.current = new Set();
                setFeedback({ message: '', isError: false, tone: 'neutral' });
                setShowStormWarning(false);
                setIsPlaying(true);
              }}>
                {selectedDigMode === 'challenge' ? `Start challenge (${challengeTimeLabel})` : 'Start explore'}
                <Pickaxe size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isTimeUp && !showDebrief && (
        <div className="modal-overlay">
          <div className="modal-content glass-card warning-modal" style={{borderColor: '#ef4444'}}>
            <EventIcon size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
            <h2 className="modal-title" style={{color: '#ef4444'}}>Time is up</h2>
            <p style={{fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--sand-100)'}}>
              The site had to be cleared. {isTwoPlayer
                ? getWinnerText()
                : `You recovered ${excavatedIds.size} find${excavatedIds.size === 1 ? '' : 's'} for study.`}
            </p>
            <button className="btn primary-btn" onClick={openDebrief}>Move finds to Sorting Tent <Tent size={20} /></button>
          </div>
        </div>
      )}

      {perfectClear && !showDebrief && (
      <div className="modal-overlay">
          <div className="modal-content glass-card warning-modal">
            <CheckCircle2 size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
            <h2 className="modal-title" style={{color: 'var(--success)'}}>Site cleared</h2>
            <p style={{fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--sand-100)'}}>
              {isTwoPlayer
                ? `Every find was recovered. ${getWinnerText()}`
                : timerMode === 'challenge'
                  ? `Every find was recovered with ${formatTime(timeLeft)} remaining.`
                  : `Every find was recovered in ${formatTime(displayTime)}.`}
            </p>
            <button className="btn primary-btn" onClick={openDebrief}>Move finds to Sorting Tent <Tent size={20} /></button>
          </div>
        </div>
      )}

      {showDebrief && (
        <div className="modal-overlay">
          <div className="modal-content glass-card debrief-modal">
            <FileText size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
            <h2 className="modal-title" style={{color: 'var(--accent)'}}>Field notebook</h2>
            <div className="field-note-summary">
              <div className="field-note-stat"><strong>{cleanRecoveryCount}</strong><span>Clean recoveries</span></div>
              <div className="field-note-stat"><strong>{recoveryPackage.counts.damaged}</strong><span>Damaged</span></div>
              <div className="field-note-stat"><strong>{recoveryPackage.counts.disturbed}</strong><span>Disturbed</span></div>
            </div>
            <div className="dig-debrief-note">
              Your team recovered enough evidence to continue. Some finds were disturbed and may be less reliable in later analysis.
            </div>
            <div className="dig-debrief-mini">
              <span>Student recovered: <strong>{recoveredArtifacts.length}</strong></span>
              <span>Transferred forward: <strong>{recoveryPackage.artifacts.length}</strong></span>
              <span>Minimum needed: <strong>{minimumEvidenceTarget}</strong></span>
              <span>Attempts: <strong>{attempts}</strong></span>
              <span>Radar uses: <strong>{radarUses}</strong></span>
              <span>Disturbance: <strong>{disturbanceLevel}</strong></span>
              <span>Emergencies: <strong>{emergencyLog.length}</strong></span>
              <span>Finds affected: <strong>{emergencyImpactCount}</strong></span>
            </div>
            {emergencyLog.length > 0 && (
              <div className="dig-emergency-debrief">
                {emergencyLog.slice(-3).map((entry, index) => (
                  <span key={`${entry.id}-${entry.zone}-${index}`}>{entry.message}</span>
                ))}
              </div>
            )}
            <p style={{ margin: '0 0 1rem 0', color: 'var(--sand-200)' }}>
              {timerMode === 'challenge'
                ? `Challenge time recorded: ${formatTime(displayTime)}.`
                : `Dig time recorded: ${formatTime(displayTime)}.`}
            </p>
            <button
              className="btn primary-btn"
              onClick={() => onComplete(recoveryPackage.artifacts, recoveryPackage.conditions, recoverySummary)}
            >
              Open Sorting Tent <Tent size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="dig-status-panel">
        <div className="status-info-row">
          <span className="status-phase-label">Phase 1: Emergency excavation</span>
          <span className="status-sep">|</span>
          <span className="status-warning-text" style={{color: currentEvent.dangerColor}}>
             {currentEvent.title}
          </span>
          <span className="status-sep">|</span>
          <span className="status-phase-label">{timerModeLabel}</span>
          {isTwoPlayer && (
            <>
              <span className="status-sep">|</span>
              <span className="status-phase-label">2 players</span>
            </>
          )}
        </div>
        
        <div className={`timer-horizontal ${timeDanger ? 'danger' : ''}`}>
           <Clock size={20} />
           <span className="timer-value">{formatTime(displayTime)}</span>
           <span className="timer-label">{timerLabel}</span>
        </div>

        {isTwoPlayer && (
          <div className="dig-player-row" aria-label="Player scores">
            <div className={`dig-player-chip ${currentPlayerIndex === 0 ? 'active' : ''}`}>
              <strong>Player 1</strong>
              <span>: {playerOneScore}</span>
            </div>
            <div className={`dig-player-chip ${currentPlayerIndex === 1 ? 'active' : ''}`}>
              <strong>Player 2</strong>
              <span>: {playerTwoScore}</span>
            </div>
            <div className="dig-player-turn">{playerTurnLabel} to play</div>
          </div>
        )}

        {timerMode === 'challenge' && (
          <button 
            className="radar-btn-compact" 
            onClick={handleRadar}
            disabled={timeLeft <= (challengeDuration === 300 ? 30 : challengeDuration === 180 ? 20 : 10) || isLocked || !isPlaying}
          >
            <Radar size={16} /> Use radar (-{challengeDuration === 300 ? 30 : challengeDuration === 180 ? 20 : 10}s)
          </button>
        )}
        <div className={`dig-pressure-chip pressure-${pressureBand}`} aria-label={`Site disturbance ${disturbanceLevel}`}>
          <Activity size={15} />
          <span>{pressureLabel}</span>
          <strong>{disturbanceLevel}</strong>
        </div>
      </div>

      <div className="dig-game-panel">
        <div className="instruction-row">
          <Lightbulb size={16} className="instruction-icon" />
          <span>Match pairs to recover finds before time runs out.</span>
        </div>

        {emergencyState.event && emergencyState.phase !== 'cooldown' && (
          <div className={`dig-emergency-banner emergency-${emergencyState.phase}`} role="status" aria-live="polite">
            <EmergencyIcon size={18} />
            <div className="dig-emergency-copy">
              <strong>{emergencyState.event.label}</strong>
              <span>{emergencyState.message}</span>
            </div>
            <span className="dig-emergency-zone">
              {emergencyState.threatZone?.label}
              {emergencyState.phase !== 'resolved' && ` in ${emergencyState.secondsRemaining}s`}
            </span>
          </div>
        )}
        
        <div
          className={`game-board-container ${excavationTrayStyle ? 'fi-asset-region fi-excavation-tray' : ''}`}
          ref={boardContainerRef}
          style={{ position: 'relative', ...(excavationTrayStyle || {}) }}
        >
          {isSurveying && (
            <div className="surveying-overlay">
               <div className="surveying-content">
                  <div className="surveying-scanner"></div>
                  <div className="surveying-text">SURVEYING AREA...</div>
               </div>
            </div>
          )}
          <div
            className="memory-grid"
            style={boardFit.width && boardFit.height ? {
              width: `${boardFit.width}px`,
              height: `${boardFit.height}px`,
              gap: `${boardFit.gap}px`,
              gridTemplateColumns: `repeat(${boardColumns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${boardRows}, minmax(0, 1fr))`,
            } : undefined}
          >
            {tiles.map((tile, index) => {
              const isRevealed = tile.isFlipped || tile.isMatched;
              const tileTheme = getArtifactTheme(tile.artifact);
              const isThreatened = emergencyState.event
                && emergencyState.phase !== 'cooldown'
                && emergencyState.phase !== 'resolved'
                && isTileInThreatZone(index, emergencyState.threatZone, boardColumns, boardRows)
                && !tile.isMatched;
              return (
                <div 
                  key={tile.uniqueId} 
                  className={`memory-tile ${isRevealed ? 'revealed' : ''} ${tile.isMatched ? 'matched' : ''} ${isThreatened ? `emergency-threat emergency-threat-${emergencyState.phase}` : ''}`}
                  onClick={() => handleTileClick(index)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    event.preventDefault();
                    handleTileClick(index);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={isRevealed ? tile.artifact.name : 'Unrevealed evidence card'}
                >
                  <div className="tile-inner">
                    <div
                      className={`tile-front card-back-design ${premiumCardBackReady ? 'has-premium-card-back' : ''}`}
                      style={premiumCardBackStyle}
                    >
                      <div className="card-back-pattern"></div>
                      <Pickaxe size={24} className="card-back-icon" />
                    </div>
                    <div
                      className={`tile-back artifact-texture artifact-texture--${tile.artifact.type} ${tile.artifact.isRedHerring ? 'artifact-texture--disturbance' : ''}`}
                      style={{ '--artifact-accent': tileTheme.accent, '--artifact-accent-soft': tileTheme.accentSoft }}
                    >
                      <div className="artifact-icon" style={{ color: 'var(--artifact-accent)' }} aria-hidden="true">
                        {getIcon(tile.artifact.type, 30, { strokeWidth: 2.15 })}
                      </div>
                      <div className="artifact-label">{tile.artifact.name}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="dig-footer-panel-compact">
        <div className="footer-stats-group">
          <div className="footer-stat-item">
             <Trophy size={16} />
             <span>Recovered: <strong>{excavatedIds.size} / {activeArtifacts.length}</strong></span>
          </div>
          <div className="footer-stat-item">
             <RefreshCw size={16} />
             <span>Attempts: <strong>{attempts}</strong></span>
          </div>
          <div className="footer-stat-item">
             <Activity size={16} />
             <span>Disturbance: <strong>{disturbanceLevel}</strong></span>
          </div>
          {isTwoPlayer && (
            <div className="footer-stat-item">
              <Users size={16} />
              <span>Score: <strong>{scoreSummary}</strong></span>
            </div>
          )}
        </div>
        
        <button className="help-btn-compact" onClick={() => setFeedback({message: "Match two identical finds to recover them. Some finds are ancient evidence; others are modern disturbance.", isError: false, tone: 'neutral'})}>
           <HelpCircle size={18} /> Field guide
        </button>
        <button className="dig-menu-btn-compact" type="button" onClick={onBackToMenu}>
          Back to menu
        </button>
      </div>      {feedback.message && (
        <div className={`sort-feedback ${feedback.tone === 'accent' ? 'accent' : feedback.isError ? 'error' : 'neutral'}`} style={{position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', zIndex: 100}}>
          <span className="sort-feedback-icon" aria-hidden="true">•</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {fieldNote && (
        <div className="field-note-card field-note-card--dig">
          <div className="field-note-heading">Field note</div>
          <div className="field-note-name">{fieldNote.name}</div>
          <div className="field-note-mini">
            <span><strong>Discovery:</strong> {fieldNote.discoveryMethod}</span>
            <span><strong>Type:</strong> {fieldNote.typeLabel}</span>
            <span><strong>Context:</strong> {fieldNote.eraLabel}</span>
          </div>
          <div className="field-note-foot">
            {fieldNote.isDisturbance ? 'Modern disturbance logged.' : 'Ancient evidence saved.'}
          </div>
        </div>
      )}
    </div>
  );
}



