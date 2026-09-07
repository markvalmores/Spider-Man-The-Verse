import React, { useState, useEffect, useRef, useCallback } from 'react';
import Tekken3DFightingArena from './Tekken3DFightingArena';
import TekkenFightHUD from './TekkenFightHUD';
import PracticeModeOverlay from './PracticeModeOverlay';
import {
  PlayerFighterState,
  FighterArchetype,
  ArenaStage,
  AttackType,
  MoveData,
  TekkenRank,
  TEKKEN_RANKS,
  MatchTimerSetting,
  MatchTeamMode,
} from './FightingTypes';
import {
  getRankedProfile,
  saveRankedProfile,
  getRankByTier,
  calculateMatchRP,
  RankedProfile,
} from './RankedProgressionSystem';
import { useAudio } from '../../hooks/useAudio';
import {
  Award,
  Flame,
  Sparkles,
  Trophy,
  RotateCcw,
  Home,
  Play,
  ChevronRight,
  Skull,
  Zap,
  Shield,
  Activity,
  MessageSquare,
  Crown,
  Users,
} from 'lucide-react';

interface TekkenBattleEngineProps {
  playerFighter: FighterArchetype;
  opponentFighter: FighterArchetype;
  stage: ArenaStage;
  gameMode: 'ranked' | 'arcade' | 'versus' | 'practice';
  arcadeStageNumber?: number;
  timerSetting?: MatchTimerSetting;
  teamMode?: MatchTeamMode;
  p1Partner?: FighterArchetype;
  p2Partner?: FighterArchetype;
  onMatchComplete: (victory: boolean, rpDelta: number, newProfile: RankedProfile) => void;
  onExitToHub: () => void;
  onAdvanceArcadeStage?: () => void;
}

// Boss dialogue scripts for Arcade story matches
const ARCADE_DIALOGUES: Record<
  string,
  { bossQuote: string; playerQuote: string; stageTitle: string }
> = {
  kingpin: {
    stageTitle: 'STAGE 1: THE UNDERGROUND KINGPIN',
    bossQuote: 'This city answers to Wilson Fisk, insect. You are out of your league!',
    playerQuote: 'I don’t remember putting a 400-pound enforcer in charge of NYC!',
  },
  kraven: {
    stageTitle: 'STAGE 2: THE APEX HUNT',
    bossQuote: 'At last, the legendary arachnid! Let your blood feed the eternal hunt!',
    playerQuote: 'Hope you packed sunblock, Kraven—this hunt ends with you in cuffs!',
  },
  doc_ock: {
    stageTitle: 'STAGE 3: OSCORP REACTOR CLASH',
    bossQuote: 'My titanium arms represent peak evolution! Yield or be torn apart!',
    playerQuote: 'Four extra arms and you still couldn’t fix your bad attitude, Otto!',
  },
  green_goblin: {
    stageTitle: 'STAGE 4: NIGHT OF THE GOBLIN',
    bossQuote: 'Hahaha! Let’s see if your little web-shooters can survive my pumpkin arsenal!',
    playerQuote: 'Goblin, your flying glider is even more obnoxious than your laugh!',
  },
  venom: {
    stageTitle: 'FINAL BOSS: LETHAL APEX PREDATOR',
    bossQuote: 'WE ARE VENOM! We will tear you limb from limb and devour your power!',
    playerQuote: 'We’re sending you and your symbiote back into containment, Eddie!',
  },
};

export default function TekkenBattleEngine({
  playerFighter,
  opponentFighter,
  stage,
  gameMode,
  arcadeStageNumber = 1,
  timerSetting = 99,
  teamMode = 'solo',
  p1Partner,
  p2Partner,
  onMatchComplete,
  onExitToHub,
  onAdvanceArcadeStage,
}: TekkenBattleEngineProps) {
  const { playSound } = useAudio();
  const [profile, setProfile] = useState<RankedProfile>(() => getRankedProfile());

  // Active Fighters in the Ring (Supports Tag Team Swapping)
  const [activeP1Archetype, setActiveP1Archetype] = useState<FighterArchetype>(playerFighter);
  const [activeP2Archetype, setActiveP2Archetype] = useState<FighterArchetype>(opponentFighter);

  // Bench (Secondary) Fighters in Tag Team Mode
  const [benchP1Archetype, setBenchP1Archetype] = useState<FighterArchetype | undefined>(p1Partner);
  const [benchP2Archetype, setBenchP2Archetype] = useState<FighterArchetype | undefined>(p2Partner);

  // Health storage for bench fighters in tag mode
  const [p1BenchHealth, setP1BenchHealth] = useState<number>(100);
  const [p2BenchHealth, setP2BenchHealth] = useState<number>(100);
  const [canTagP1, setCanTagP1] = useState<boolean>(true);
  const [tagCooldownRemaining, setTagCooldownRemaining] = useState<number>(0);

  // Rank Badges
  const p1Rank = getRankByTier(profile.rankTier);
  const p2Tier = Math.max(
    1,
    profile.rankTier + (gameMode === 'ranked' ? (Math.random() > 0.5 ? 1 : 0) : arcadeStageNumber)
  );
  const p2Rank = getRankByTier(p2Tier);

  // Check if this match qualifies as Promotion / Demotion match
  const nextRank = TEKKEN_RANKS.find((r) => r.tier === profile.rankTier + 1);
  const isPromotionMatch =
    gameMode === 'ranked' && nextRank !== undefined && profile.currentRP >= nextRank.requiredRP - 150;
  const isDemotionMatch =
    gameMode === 'ranked' && profile.rankTier > 1 && profile.currentRP <= p1Rank.requiredRP + 60;

  // Initial duration based on timerSetting
  const initialRoundDuration = timerSetting === 'infinite' ? 999999 : Number(timerSetting);

  // Round State
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [roundTime, setRoundTime] = useState<number>(
    timerSetting === 'infinite' ? 99 : Number(timerSetting)
  );
  const [isRoundActive, setIsRoundActive] = useState<boolean>(false);
  const [announcementText, setAnnouncementText] = useState<string | null>('ROUND 1');
  const [announcementSub, setAnnouncementSub] = useState<string | null>('GET READY');
  const [isSlowMo, setIsSlowMo] = useState<boolean>(false);
  const [isCinematicRage, setIsCinematicRage] = useState<boolean>(false);
  const [hitSparkPos, setHitSparkPos] = useState<[number, number, number] | null>(null);

  // Arcade Pre-Fight Story Dialogue
  const [showArcadeDialogue, setShowArcadeDialogue] = useState<boolean>(
    gameMode === 'arcade' && currentRound === 1
  );

  // Recent input log for fighting game HUD notation display
  const [recentInputs, setRecentInputs] = useState<string[]>([]);

  // Match Result Modal
  const [matchResult, setMatchResult] = useState<{
    victory: boolean;
    rpDelta: number;
    isPromotion: boolean;
    isDemotion: boolean;
    newRank: TekkenRank;
    maxCombo: number;
    pizzaAward: number;
    perfectRounds: boolean;
  } | null>(null);

  // Practice Mode state
  const [lastMoveUsed, setLastMoveUsed] = useState<MoveData | null>(null);
  const [dummyGuardMode, setDummyGuardMode] = useState<'none' | 'guard_all' | 'counter_hit' | 'cpu'>(
    gameMode === 'practice' ? 'none' : 'cpu'
  );

  // Combo state
  const [comboCount, setComboCount] = useState<number>(0);
  const [comboDamage, setComboDamage] = useState<number>(0);
  const [maxComboInMatch, setMaxComboInMatch] = useState<number>(0);
  const comboTimerRef = useRef<number | null>(null);

  // P1 Active Fighter State
  const [p1, setP1] = useState<PlayerFighterState>({
    id: activeP1Archetype.id,
    health: 100,
    recoverableHealth: 100,
    heatGauge: 100,
    isHeatActive: false,
    isRageActive: false,
    isGuarding: false,
    isJuggled: false,
    positionX: -4.5,
    positionZ: 0,
    velocityY: 0,
    heightY: 0,
    currentAnimation: 'idle',
    animTimer: 0,
    activeMove: null,
    roundsWon: 0,
  });

  // P2 Active Fighter State
  const [p2, setP2] = useState<PlayerFighterState>({
    id: activeP2Archetype.id,
    health: 100,
    recoverableHealth: 100,
    heatGauge: 100,
    isHeatActive: false,
    isRageActive: false,
    isGuarding: false,
    isJuggled: false,
    positionX: 4.5,
    positionZ: 0,
    velocityY: 0,
    heightY: 0,
    currentAnimation: 'idle',
    animTimer: 0,
    activeMove: null,
    roundsWon: 0,
  });

  // Ref tracking for live loop
  const p1Ref = useRef(p1);
  const p2Ref = useRef(p2);
  p1Ref.current = p1;
  p2Ref.current = p2;

  const isRoundActiveRef = useRef(isRoundActive);
  isRoundActiveRef.current = isRoundActive;

  const pushInputHistory = (notation: string) => {
    setRecentInputs((prev) => [...prev.slice(-8), notation]);
  };

  // Initialize Round Sequence
  const startRound = useCallback(
    (roundNum: number) => {
      setIsRoundActive(false);
      setRoundTime(timerSetting === 'infinite' ? 99 : Number(timerSetting));
      setComboCount(0);
      setComboDamage(0);
      setIsSlowMo(false);
      setIsCinematicRage(false);

      // Reset Active and Bench fighters to full health
      setP1((prev) => ({
        ...prev,
        health: 100,
        recoverableHealth: 100,
        heatGauge: 100,
        isHeatActive: false,
        isRageActive: false,
        isGuarding: false,
        isJuggled: false,
        positionX: -4.5,
        positionZ: 0,
        velocityY: 0,
        heightY: 0,
        currentAnimation: 'idle',
      }));

      setP2((prev) => ({
        ...prev,
        health: 100,
        recoverableHealth: 100,
        heatGauge: 100,
        isHeatActive: false,
        isRageActive: false,
        isGuarding: false,
        isJuggled: false,
        positionX: 4.5,
        positionZ: 0,
        velocityY: 0,
        heightY: 0,
        currentAnimation: 'idle',
      }));

      setP1BenchHealth(100);
      setP2BenchHealth(100);
      setCanTagP1(true);

      playSound('whoosh');
      setAnnouncementText(roundNum === 3 ? 'FINAL ROUND' : `ROUND ${roundNum}`);
      setAnnouncementSub(
        isPromotionMatch ? '⭐ PROMOTION MATCH' : isDemotionMatch ? '⚠️ DEMOTION MATCH' : teamMode === 'tag' ? 'TAG TEAM BATTLE' : 'GET READY'
      );

      setTimeout(() => {
        setAnnouncementText('FIGHT!');
        setAnnouncementSub(null);
        playSound('combat');
        setIsRoundActive(true);

        setTimeout(() => {
          setAnnouncementText(null);
        }, 1000);
      }, 1500);
    },
    [playSound, isPromotionMatch, isDemotionMatch, timerSetting, teamMode]
  );

  useEffect(() => {
    if (!showArcadeDialogue) {
      startRound(1);
    }
  }, [showArcadeDialogue, startRound]);

  // Round Timer Countdown (Every 1s) - Respects Infinite Timer & Custom Seconds
  useEffect(() => {
    if (!isRoundActive || gameMode === 'practice' || timerSetting === 'infinite') return;

    const timer = setInterval(() => {
      setRoundTime((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRoundActive, gameMode, timerSetting]);

  // Handle Round Finish on Knockout or Timeout
  const handleRoundEnd = (winner: 'p1' | 'p2' | 'draw') => {
    setIsRoundActive(false);
    setIsSlowMo(true);

    if (winner === 'p1') {
      const isPerfect = p1Ref.current.health >= 100;
      setAnnouncementText(isPerfect ? 'PERFECT!' : 'K.O.!');
      setAnnouncementSub(`${activeP1Archetype.name.toUpperCase()} WINS!`);
      playSound('win');
      setP1((p) => ({ ...p, roundsWon: p.roundsWon + 1, currentAnimation: 'victory' }));
    } else if (winner === 'p2') {
      setAnnouncementText('K.O.!');
      setAnnouncementSub(`${activeP2Archetype.name.toUpperCase()} WINS!`);
      playSound('slam');
      setP2((p) => ({ ...p, roundsWon: p.roundsWon + 1, currentAnimation: 'victory' }));
    } else {
      setAnnouncementText('DRAW GAME');
      setAnnouncementSub(null);
    }

    setTimeout(() => {
      setIsSlowMo(false);
      const nextP1Wins = winner === 'p1' ? p1Ref.current.roundsWon + 1 : p1Ref.current.roundsWon;
      const nextP2Wins = winner === 'p2' ? p2Ref.current.roundsWon + 1 : p2Ref.current.roundsWon;

      // Check if match won (First to 2 wins)
      if (nextP1Wins >= 2 || nextP2Wins >= 2) {
        handleMatchFinish(nextP1Wins >= 2);
      } else {
        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        startRound(nextRound);
      }
    }, 3200);
  };

  const handleTimeOut = () => {
    if (p1Ref.current.health > p2Ref.current.health) {
      handleRoundEnd('p1');
    } else if (p2Ref.current.health > p1Ref.current.health) {
      handleRoundEnd('p2');
    } else {
      handleRoundEnd('draw');
    }
  };

  const handleMatchFinish = (isVictory: boolean) => {
    const isPerfect = p1Ref.current.roundsWon === 2 && p2Ref.current.roundsWon === 0;
    const { rpDelta, isPromotion, isDemotion } = calculateMatchRP(
      profile.rankTier,
      p2Tier,
      isVictory,
      profile.winStreak,
      isPerfect
    );

    const newRP = Math.max(0, profile.currentRP + rpDelta);
    let newTier = profile.rankTier;
    if (isPromotion) newTier = Math.min(25, profile.rankTier + 1);
    else if (isDemotion) newTier = Math.max(1, profile.rankTier - 1);

    const pizzaEarned = isVictory
      ? (gameMode === 'arcade' ? 200 + arcadeStageNumber * 50 : 150) + (isPerfect ? 100 : 0)
      : 25;

    const updatedProfile: RankedProfile = {
      ...profile,
      rankTier: newTier,
      currentRP: newRP,
      wins: isVictory ? profile.wins + 1 : profile.wins,
      losses: !isVictory ? profile.losses + 1 : profile.losses,
      winStreak: isVictory ? profile.winStreak + 1 : 0,
      highestWinStreak: isVictory
        ? Math.max(profile.highestWinStreak, profile.winStreak + 1)
        : profile.highestWinStreak,
      highestRankTier: Math.max(profile.highestRankTier, newTier),
      totalDamageDealt: profile.totalDamageDealt + (100 - p2Ref.current.health),
    };

    saveRankedProfile(updatedProfile);
    setProfile(updatedProfile);

    setMatchResult({
      victory: isVictory,
      rpDelta,
      isPromotion,
      isDemotion,
      newRank: getRankByTier(newTier),
      maxCombo: maxComboInMatch,
      pizzaAward: pizzaEarned,
      perfectRounds: isPerfect,
    });

    onMatchComplete(isVictory, rpDelta, updatedProfile);
  };

  // Perform Tag Switch for Player 1
  const handleTagSwitchP1 = useCallback(() => {
    if (teamMode !== 'tag' || !benchP1Archetype || !canTagP1 || !isRoundActiveRef.current) return;

    pushInputHistory('TAG [T]');
    playSound('rankup');
    setCanTagP1(false);

    // Save current active health to bench and swap fighters
    const currentActiveHealth = p1Ref.current.health;
    const nextFighterHealth = p1BenchHealth;
    const oldActive = activeP1Archetype;
    const newActive = benchP1Archetype;

    setAnnouncementText(`TAG: ${newActive.name.toUpperCase()}!`);
    setTimeout(() => setAnnouncementText(null), 800);

    // Swap archetypes
    setActiveP1Archetype(newActive);
    setBenchP1Archetype(oldActive);
    setP1BenchHealth(currentActiveHealth);

    // Update P1 state with new character & recovered bench health
    setP1((p) => ({
      ...p,
      id: newActive.id,
      health: nextFighterHealth,
      recoverableHealth: Math.min(100, nextFighterHealth + 10), // slight tag-in heal
      isHeatActive: false,
      isRageActive: nextFighterHealth <= 25,
      currentAnimation: 'launcher', // dynamic entry leap
    }));

    setTimeout(() => {
      setP1((p) => ({ ...p, currentAnimation: 'idle' }));
    }, 400);

    // Tag cooldown penalty timer (6 seconds penalty)
    setTagCooldownRemaining(6);
    const cooldownInterval = setInterval(() => {
      setTagCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownInterval);
          setCanTagP1(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [teamMode, benchP1Archetype, canTagP1, activeP1Archetype, p1BenchHealth, playSound]);

  // Perform Tag Switch for CPU / Player 2
  const handleTagSwitchP2 = useCallback(() => {
    if (teamMode !== 'tag' || !benchP2Archetype || !isRoundActiveRef.current) return;

    playSound('whoosh');
    const currentActiveHealth = p2Ref.current.health;
    const nextFighterHealth = p2BenchHealth;
    const oldActive = activeP2Archetype;
    const newActive = benchP2Archetype;

    setAnnouncementText(`CPU TAG: ${newActive.name.toUpperCase()}!`);
    setTimeout(() => setAnnouncementText(null), 800);

    setActiveP2Archetype(newActive);
    setBenchP2Archetype(oldActive);
    setP2BenchHealth(currentActiveHealth);

    setP2((p) => ({
      ...p,
      id: newActive.id,
      health: nextFighterHealth,
      recoverableHealth: Math.min(100, nextFighterHealth + 10),
      isHeatActive: false,
      isRageActive: nextFighterHealth <= 25,
      currentAnimation: 'launcher',
    }));

    setTimeout(() => {
      setP2((p) => ({ ...p, currentAnimation: 'idle' }));
    }, 400);
  }, [teamMode, benchP2Archetype, activeP2Archetype, p2BenchHealth, playSound]);

  // Trigger attack damage on opponent with dynamic combo scaling
  const applyDamage = (attacker: 'p1' | 'p2', move: MoveData) => {
    const target = attacker === 'p1' ? p2Ref.current : p1Ref.current;
    const isTargetGuarding = target.isGuarding && (gameMode !== 'practice' || dummyGuardMode === 'guard_all');

    // Tekken chip damage in Heat
    const isAttackerInHeat = attacker === 'p1' ? p1Ref.current.isHeatActive : p2Ref.current.isHeatActive;
    let actualDamage = isTargetGuarding ? (isAttackerInHeat ? move.damage * 0.25 : 0) : move.damage;

    // Dynamic Combo Scaling Bonus (+4% per hit in combo chain, up to +60%)
    if (attacker === 'p1' && comboCount > 0 && !isTargetGuarding) {
      const comboBonus = 1 + Math.min(0.6, comboCount * 0.04);
      actualDamage *= comboBonus;
    }

    // Rage Mode Damage Scaling (+20%)
    if (attacker === 'p1' && p1Ref.current.isRageActive) actualDamage *= 1.2;
    if (attacker === 'p2' && p2Ref.current.isRageActive) actualDamage *= 1.2;

    // Hit-spark position
    const sparkX = (p1Ref.current.positionX + p2Ref.current.positionX) / 2;
    setHitSparkPos([sparkX, 1.6, 0]);
    setTimeout(() => setHitSparkPos(null), 180);

    playSound('combat');

    if (attacker === 'p1') {
      // P1 hit P2
      if (!isTargetGuarding) {
        const nextCombo = comboCount + 1;
        setComboCount(nextCombo);
        setComboDamage((d) => d + actualDamage);
        setMaxComboInMatch((prev) => Math.max(prev, nextCombo));

        // Trigger combo milestone sound
        if (nextCombo === 5 || nextCombo === 10 || nextCombo === 20) {
          playSound('rankup');
        }

        if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
        comboTimerRef.current = window.setTimeout(() => {
          setComboCount(0);
          setComboDamage(0);
        }, 1300);
      }

      setP2((prev) => {
        const nextHealth = Math.max(0, prev.health - actualDamage);
        const isRage = nextHealth <= 25 && nextHealth > 0;
        const nextAnim = isTargetGuarding ? 'block' : move.isLauncher ? 'airborne' : 'hurt';

        if (nextHealth <= 0 && isRoundActiveRef.current) {
          handleRoundEnd('p1');
        }

        return {
          ...prev,
          health: nextHealth,
          isRageActive: isRage,
          currentAnimation: nextAnim,
          heightY: move.isLauncher && !isTargetGuarding ? 2.5 : prev.heightY,
          positionX: Math.min(11, prev.positionX + (move.isWallSplat ? 2.2 : 0.8)),
        };
      });
    } else {
      // P2 hit P1
      setP1((prev) => {
        const nextHealth = Math.max(0, prev.health - actualDamage);
        const isRage = nextHealth <= 25 && nextHealth > 0;
        const nextAnim = isTargetGuarding ? 'block' : move.isLauncher ? 'airborne' : 'hurt';

        if (nextHealth <= 0 && isRoundActiveRef.current) {
          handleRoundEnd('p2');
        }

        return {
          ...prev,
          health: nextHealth,
          isRageActive: isRage,
          currentAnimation: nextAnim,
          heightY: move.isLauncher && !isTargetGuarding ? 2.5 : prev.heightY,
          positionX: Math.max(-11, prev.positionX - (move.isWallSplat ? 2.2 : 0.8)),
        };
      });
    }
  };

  // Player Input Handler (Tekken 8 Controls: 1, 2, 3, 4, Heat, Rage, Sidestep, Guard, Throw, Tag)
  const handlePlayerInput = useCallback(
    (action: AttackType) => {
      if (!isRoundActiveRef.current) return;

      const p1State = p1Ref.current;
      const moves = activeP1Archetype.moves;

      if (action === 'tag_switch') {
        handleTagSwitchP1();
        return;
      }

      if (action === 'sidestep_left') {
        pushInputHistory('u/SS');
        setP1((p) => ({ ...p, positionZ: Math.min(2.5, p.positionZ + 1.2), currentAnimation: 'sidestep' }));
        playSound('whoosh');
        setTimeout(() => setP1((p) => ({ ...p, currentAnimation: 'idle' })), 300);
        return;
      }

      if (action === 'sidestep_right') {
        pushInputHistory('d/SS');
        setP1((p) => ({ ...p, positionZ: Math.max(-2.5, p.positionZ - 1.2), currentAnimation: 'sidestep' }));
        playSound('whoosh');
        setTimeout(() => setP1((p) => ({ ...p, currentAnimation: 'idle' })), 300);
        return;
      }

      if (action === 'parry') {
        pushInputHistory('b/G');
        setP1((p) => ({ ...p, isGuarding: true, currentAnimation: 'block' }));
        setTimeout(() => setP1((p) => ({ ...p, isGuarding: false, currentAnimation: 'idle' })), 450);
        return;
      }

      // Heat Burst (1+2)
      if (action === 'heat_burst' && p1State.heatGauge > 0 && !p1State.isHeatActive) {
        pushInputHistory('1+2');
        playSound('rankup');
        setP1((p) => ({ ...p, isHeatActive: true, currentAnimation: 'heat_burst' }));
        setAnnouncementText('HEAT BURST!');
        setTimeout(() => setAnnouncementText(null), 900);

        const heatMove = moves.find((m) => m.isHeatEngager) || moves[0];
        setLastMoveUsed(heatMove);
        applyDamage('p1', heatMove);

        setTimeout(() => {
          setP1((p) => ({ ...p, currentAnimation: 'idle' }));
        }, 500);
        return;
      }

      // Heat Smash
      if (action === 'heat_smash' && p1State.isHeatActive) {
        pushInputHistory('H.SMASH');
        playSound('rankup');
        setP1((p) => ({ ...p, isHeatActive: false, heatGauge: 0, currentAnimation: 'heat_smash' }));
        setAnnouncementText('HEAT SMASH!');
        setTimeout(() => setAnnouncementText(null), 1000);

        const smashMove = moves.find((m) => m.name.includes('Heat Smash')) || moves[0];
        setLastMoveUsed(smashMove);
        applyDamage('p1', smashMove);

        setTimeout(() => {
          setP1((p) => ({ ...p, currentAnimation: 'idle' }));
        }, 650);
        return;
      }

      // Rage Art (3+4)
      if (action === 'rage_art' && p1State.isRageActive) {
        pushInputHistory('3+4 RA');
        playSound('rankup');
        setIsCinematicRage(true);
        setAnnouncementText('RAGE ART!');
        setAnnouncementSub('CRITICAL STRIKE');
        setP1((p) => ({ ...p, isRageActive: false, currentAnimation: 'rage_art' }));

        const rageMove = moves.find((m) => m.type === 'rage') || moves[0];
        setLastMoveUsed(rageMove);

        setTimeout(() => {
          applyDamage('p1', rageMove);
          setIsCinematicRage(false);
          setAnnouncementText(null);
          setAnnouncementSub(null);
          setP1((p) => ({ ...p, currentAnimation: 'idle' }));
        }, 1100);
        return;
      }

      // Standard Attacks: 1, 2, 3, 4, Throw
      let selectedMove = moves[0];
      let anim: PlayerFighterState['currentAnimation'] = 'punch_1';
      let notif = '1';

      if (action === 'lp') {
        selectedMove = moves.find((m) => m.command === '1') || moves[0];
        anim = 'punch_1';
        notif = '1 (LP)';
      } else if (action === 'rp') {
        selectedMove = moves.find((m) => m.command === '2') || moves[1];
        anim = 'punch_2';
        notif = '2 (RP)';
      } else if (action === 'lk') {
        selectedMove = moves.find((m) => m.command === '3') || moves[2];
        anim = 'kick_3';
        notif = '3 (LK)';
      } else if (action === 'rk') {
        selectedMove = moves.find((m) => m.command === '4') || moves[3];
        anim = 'launcher';
        notif = '4 (RK)';
      } else if (action === 'throw') {
        selectedMove = moves.find((m) => m.type === 'throw') || moves[0];
        anim = 'throw';
        notif = '1+3 (TH)';
      }

      pushInputHistory(notif);
      setLastMoveUsed(selectedMove);
      setP1((p) => ({ ...p, currentAnimation: anim }));
      applyDamage('p1', selectedMove);

      setTimeout(() => {
        setP1((p) => ({ ...p, currentAnimation: 'idle' }));
      }, 350);
    },
    [activeP1Archetype.moves, playSound, handleTagSwitchP1]
  );

  // Keyboard Controller Bindings (A/D, S, J, I, K, L, H, U, T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a') setP1((p) => ({ ...p, positionX: Math.max(-10, p.positionX - 0.5) }));
      else if (key === 'd')
        setP1((p) => ({ ...p, positionX: Math.min(p2Ref.current.positionX - 1.2, p.positionX + 0.5) }));
      else if (key === 's') handlePlayerInput('parry');
      else if (key === 'j') handlePlayerInput('lp');
      else if (key === 'i') handlePlayerInput('rp');
      else if (key === 'k') handlePlayerInput('lk');
      else if (key === 'l') handlePlayerInput('rk');
      else if (key === 'h') handlePlayerInput(p1Ref.current.isHeatActive ? 'heat_smash' : 'heat_burst');
      else if (key === 'u') handlePlayerInput('rage_art');
      else if (key === 't') {
        if (teamMode === 'tag') handleTagSwitchP1();
        else handlePlayerInput('throw');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayerInput, teamMode, handleTagSwitchP1]);

  // CPU Opponent AI Sparring Engine (Includes Tag Switch logic when in danger)
  useEffect(() => {
    if (!isRoundActive || dummyGuardMode === 'none') return;

    const cpuInterval = setInterval(() => {
      if (!isRoundActiveRef.current) return;
      const p2State = p2Ref.current;
      const p1State = p1Ref.current;
      const moves = activeP2Archetype.moves;

      // Tag Team AI logic: If CPU health is low and bench partner has more HP, CPU tags out
      if (teamMode === 'tag' && benchP2Archetype && p2State.health < 35 && p2BenchHealth > p2State.health && Math.random() < 0.4) {
        handleTagSwitchP2();
        return;
      }

      // Distance check
      const dist = Math.abs(p2State.positionX - p1State.positionX);

      if (dist > 3.2) {
        // Step closer
        setP2((p) => ({ ...p, positionX: Math.max(p1State.positionX + 1.5, p.positionX - 0.6) }));
      } else {
        // Attack decision
        const rand = Math.random();
        if (p2State.isRageActive && rand < 0.35) {
          // AI Rage Art
          setP2((p) => ({ ...p, isRageActive: false, currentAnimation: 'rage_art' }));
          setAnnouncementText('CPU RAGE ART!');
          setTimeout(() => {
            applyDamage('p2', moves.find((m) => m.type === 'rage') || moves[0]);
            setAnnouncementText(null);
            setP2((p) => ({ ...p, currentAnimation: 'idle' }));
          }, 1000);
        } else if (p2State.heatGauge > 0 && !p2State.isHeatActive && rand < 0.25) {
          // AI Heat Burst
          setP2((p) => ({ ...p, isHeatActive: true, currentAnimation: 'heat_burst' }));
          applyDamage('p2', moves.find((m) => m.isHeatEngager) || moves[0]);
          setTimeout(() => setP2((p) => ({ ...p, currentAnimation: 'idle' })), 400);
        } else if (rand < 0.5) {
          // AI Normal attack
          const randomMove = moves[Math.floor(Math.random() * 4)];
          setP2((p) => ({ ...p, currentAnimation: 'punch_1' }));
          applyDamage('p2', randomMove);
          setTimeout(() => setP2((p) => ({ ...p, currentAnimation: 'idle' })), 350);
        } else if (rand < 0.75) {
          // Guard
          setP2((p) => ({ ...p, isGuarding: true, currentAnimation: 'block' }));
          setTimeout(() => setP2((p) => ({ ...p, isGuarding: false, currentAnimation: 'idle' })), 500);
        }
      }
    }, 700);

    return () => clearInterval(cpuInterval);
  }, [isRoundActive, dummyGuardMode, activeP2Archetype.moves, teamMode, benchP2Archetype, p2BenchHealth, handleTagSwitchP2]);

  const dialogueInfo = ARCADE_DIALOGUES[opponentFighter.id] || {
    stageTitle: `STAGE ${arcadeStageNumber}: CLASH OF TITANS`,
    bossQuote: opponentFighter.introQuote || 'Let’s see what you’ve got!',
    playerQuote: playerFighter.introQuote || 'Let’s do this!',
  };

  return (
    <div className="w-full h-screen bg-black relative select-none overflow-hidden font-sans">
      {/* 3D Arena & Fighters Viewport */}
      <Tekken3DFightingArena
        p1={p1}
        p2={p2}
        p1Archetype={activeP1Archetype}
        p2Archetype={activeP2Archetype}
        stage={stage}
        hitSparkPos={hitSparkPos}
        isSlowMo={isSlowMo}
        isCinematicRage={isCinematicRage}
      />

      {/* Tekken 8 High-Octane HUD */}
      <TekkenFightHUD
        p1={p1}
        p2={p2}
        p1Archetype={activeP1Archetype}
        p2Archetype={activeP2Archetype}
        p1Rank={p1Rank}
        p2Rank={p2Rank}
        roundTime={roundTime}
        timerSetting={timerSetting}
        teamMode={teamMode}
        p1Partner={benchP1Archetype}
        p2Partner={benchP2Archetype}
        p1PartnerHealth={p1BenchHealth}
        p2PartnerHealth={p2BenchHealth}
        canTagP1={canTagP1}
        tagCooldownRemaining={tagCooldownRemaining}
        currentRound={currentRound}
        maxRoundsToWin={2}
        comboCount={comboCount}
        comboDamage={comboDamage}
        announcementText={announcementText}
        announcementSub={announcementSub}
        onPlayerInput={handlePlayerInput}
        isPromotionMatch={isPromotionMatch}
        isDemotionMatch={isDemotionMatch}
        recentInputs={recentInputs}
      />

      {/* Practice / Training Mode Overlay */}
      {gameMode === 'practice' && (
        <PracticeModeOverlay
          fighter={activeP1Archetype}
          lastMoveUsed={lastMoveUsed}
          onResetPositions={() => {
            setP1((p) => ({ ...p, positionX: -4.5, heightY: 0, health: 100, isHeatActive: false, heatGauge: 100 }));
            setP2((p) => ({ ...p, positionX: 4.5, heightY: 0, health: 100, isHeatActive: false, heatGauge: 100 }));
            playSound('whoosh');
          }}
          dummyGuardMode={dummyGuardMode}
          onChangeDummyMode={setDummyGuardMode}
          onClosePractice={onExitToHub}
        />
      )}

      {/* ARCADE STORY PRE-FIGHT DIALOGUE MODAL */}
      {showArcadeDialogue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col text-white relative">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <Skull size={20} className="text-amber-400" />
                <span className="font-black text-amber-300 tracking-wider text-sm uppercase">
                  {dialogueInfo.stageTitle}
                </span>
              </div>
              <span className="text-xs text-neutral-400">ARCADE STORY MODE</span>
            </div>

            {/* Boss Dialogue Row */}
            <div className="flex items-start gap-4 p-4 bg-red-950/40 border border-red-500/40 rounded-2xl mb-4">
              <div className="text-4xl sm:text-5xl">{opponentFighter.avatar}</div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-red-400 uppercase">
                  {opponentFighter.name}
                </span>
                <p className="text-sm sm:text-base text-neutral-200 italic mt-1 font-serif">
                  "{dialogueInfo.bossQuote}"
                </p>
              </div>
            </div>

            {/* Player Hero Response Row */}
            <div className="flex items-start gap-4 p-4 bg-blue-950/40 border border-blue-500/40 rounded-2xl mb-6 flex-row-reverse text-right">
              <div className="text-4xl sm:text-5xl">{playerFighter.avatar}</div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-blue-400 uppercase">
                  {playerFighter.name}
                </span>
                <p className="text-sm sm:text-base text-neutral-200 italic mt-1 font-serif">
                  "{dialogueInfo.playerQuote}"
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowArcadeDialogue(false);
                playSound('combat');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 rounded-2xl font-black text-neutral-950 text-base shadow-xl transition flex items-center justify-center gap-2 tracking-wider"
            >
              <Play size={18} />
              <span>START BATTLE!</span>
            </button>
          </div>
        </div>
      )}

      {/* MATCH RESULT / RANK PROMOTION / ARCADE ADVANCE MODAL */}
      {matchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.4)] flex flex-col items-center text-center text-white relative">
            {/* Victory / Defeat Header */}
            <div
              className={`text-5xl sm:text-6xl font-black italic tracking-tighter mb-2 ${
                matchResult.victory ? 'text-yellow-300 drop-shadow-[0_0_20px_#facc15]' : 'text-red-500'
              }`}
            >
              {matchResult.victory ? 'VICTORY' : 'DEFEAT'}
            </div>

            {/* Arcade Mode Stage Result Tag */}
            {gameMode === 'arcade' && (
              <div className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 font-black text-xs uppercase mb-3 flex items-center gap-1.5">
                {arcadeStageNumber === 5 && matchResult.victory ? (
                  <>
                    <Crown size={16} className="text-yellow-300 animate-bounce" />
                    <span className="text-yellow-200 font-black">
                      ARCADE CHAMPIONSHIP CONQUERED!
                    </span>
                  </>
                ) : (
                  <>
                    <Skull size={15} />
                    <span>
                      ARCADE STAGE {arcadeStageNumber} {matchResult.victory ? 'CLEARED' : 'FAILED'}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Promotion Match Banner */}
            {matchResult.isPromotion && (
              <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-neutral-950 font-black text-xs sm:text-sm tracking-widest uppercase mb-4 shadow-lg animate-bounce flex items-center gap-1.5">
                <Sparkles size={16} />
                <span>RANK PROMOTION ACHIEVED!</span>
              </div>
            )}

            {/* Combat Telemetry Stats */}
            <div className="grid grid-cols-3 gap-2.5 w-full my-3">
              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col items-center">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">MAX COMBO</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {matchResult.maxCombo} HITS
                </span>
              </div>
              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col items-center">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">PIZZA EARNED</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  +{matchResult.pizzaAward} 🍕
                </span>
              </div>
              <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col items-center">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">PERFECT</span>
                <span className="text-xl font-black text-cyan-400">
                  {matchResult.perfectRounds ? 'YES ⭐' : 'NO'}
                </span>
              </div>
            </div>

            {/* Rank Badge Display (For Ranked Mode) */}
            {gameMode === 'ranked' && (
              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 flex items-center gap-4 w-full my-2 shadow-inner">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-neutral-950 shadow-lg"
                  style={{ backgroundColor: matchResult.newRank.color }}
                >
                  <Award size={32} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
                    CURRENT RANK
                  </span>
                  <span className="text-2xl font-black text-white">{matchResult.newRank.dan}</span>
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    {profile.currentRP} RP ({matchResult.rpDelta >= 0 ? `+${matchResult.rpDelta}` : matchResult.rpDelta} RP)
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full mt-4">
              {/* If Arcade Mode Victory and not last stage, offer NEXT STAGE */}
              {gameMode === 'arcade' && matchResult.victory && arcadeStageNumber < 5 && onAdvanceArcadeStage ? (
                <button
                  onClick={onAdvanceArcadeStage}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 rounded-xl font-black text-sm text-neutral-950 transition flex items-center justify-center gap-2 shadow-lg animate-pulse"
                >
                  <span>NEXT STAGE</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMatchResult(null);
                    startRound(1);
                  }}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 text-neutral-200"
                >
                  <RotateCcw size={16} />
                  <span>REMATCH</span>
                </button>
              )}

              <button
                onClick={onExitToHub}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 rounded-xl font-black text-sm text-white transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Home size={16} />
                <span>BATTLE HUB</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
