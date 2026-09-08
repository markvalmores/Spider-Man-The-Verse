import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Swords,
  Award,
  Zap,
  Flame,
  Activity,
  User,
  Shield,
  BookOpen,
  ChevronRight,
  Sparkles,
  Play,
  RotateCcw,
  Star,
  Skull,
  Radio,
  Wifi,
  CheckCircle2,
  Lock,
  Flame as FireIcon,
  Crown,
  History,
} from 'lucide-react';
import MatchHistoryModal from './MatchHistoryModal';
import FighterShowcaseModal from './FighterShowcaseModal';
import {
  FIGHTER_ROSTER,
  FighterArchetype,
  ARENA_STAGES,
  ArenaStage,
  TEKKEN_RANKS,
  MatchTimerSetting,
  MatchTeamMode,
} from './FightingTypes';
import {
  getRankedProfile,
  getRankByTier,
  RankedProfile,
  saveRankedProfile,
} from './RankedProgressionSystem';
import CharacterSelectTekken from './CharacterSelectTekken';
import TekkenBattleEngine from './TekkenBattleEngine';
import { useAudio } from '../../hooks/useAudio';

interface FightingModeHubProps {
  onBackToMainMenu: () => void;
  pizza: number;
  onUpdatePizza: (val: number) => void;
  initialSubMode?: 'ranked' | 'arcade' | 'versus' | 'practice';
}

// 5 Stages of the Arcade Story Mode
const ARCADE_STAGES_CONFIG = [
  {
    stageNum: 1,
    bossId: 'kingpin',
    stageId: 'stage_brooklyn_cage',
    title: 'The Enforcer of Red Hook',
    subtitle: 'Defeat Kingpin in his underground fight pit',
    reward: 150,
  },
  {
    stageNum: 2,
    bossId: 'kraven',
    stageId: 'stage_times_square_neon',
    title: 'The Apex Hunt',
    subtitle: 'Outlast Kraven The Hunter under the neon lights',
    reward: 200,
  },
  {
    stageNum: 3,
    bossId: 'doc_ock',
    stageId: 'stage_oscorp_rooftop',
    title: 'Genetics Reactor Clash',
    subtitle: 'Dismantle Doctor Octopus on the Oscorp rooftop',
    reward: 250,
  },
  {
    stageNum: 4,
    bossId: 'green_goblin',
    stageId: 'stage_times_square_neon',
    title: 'Night of the Goblin',
    subtitle: 'Survive Green Goblin’s aerial pumpkin bombardment',
    reward: 300,
  },
  {
    stageNum: 5,
    bossId: 'venom',
    stageId: 'stage_avengers_helipad',
    title: 'FINAL BOSS: Lethal Predator',
    subtitle: 'Confront Venom at the top of Avengers Tower!',
    reward: 500,
  },
];

export default function FightingModeHub({
  onBackToMainMenu,
  pizza,
  onUpdatePizza,
  initialSubMode = 'ranked',
}: FightingModeHubProps) {
  const { playSound } = useAudio();
  const [currentView, setCurrentView] = useState<'hub' | 'select' | 'battle' | 'arcade_map' | 'rank_ladder'>('hub');
  const [selectedSubMode, setSelectedSubMode] = useState<'ranked' | 'arcade' | 'versus' | 'practice'>(initialSubMode);
  const [profile, setProfile] = useState<RankedProfile>(() => getRankedProfile());

  // Fighter and Stage choices for battle
  const [playerFighter, setPlayerFighter] = useState<FighterArchetype>(FIGHTER_ROSTER[0]);
  const [opponentFighter, setOpponentFighter] = useState<FighterArchetype>(FIGHTER_ROSTER[2]);
  const [p1Partner, setP1Partner] = useState<FighterArchetype | undefined>(undefined);
  const [p2Partner, setP2Partner] = useState<FighterArchetype | undefined>(undefined);
  const [timerSetting, setTimerSetting] = useState<MatchTimerSetting>(99);
  const [teamMode, setTeamMode] = useState<MatchTeamMode>('solo');
  const [selectedStage, setSelectedStage] = useState<ArenaStage>(ARENA_STAGES[0]);
  const [arcadeStageNum, setArcadeStageNum] = useState<number>(1);

  // Ranked Matchmaking Simulation State
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchFound, setMatchFound] = useState<FighterArchetype | null>(null);
  const [showMatchHistory, setShowMatchHistory] = useState(false);
  const [showFighterDatabase, setShowFighterDatabase] = useState(false);

  const currentRank = getRankByTier(profile.rankTier);
  const nextRank = TEKKEN_RANKS.find((r) => r.tier === profile.rankTier + 1);
  const winRate =
    profile.wins + profile.losses > 0
      ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
      : 0;

  const handleClaimMilestone = (tier: number) => {
    const claimed = profile.claimedMilestones || [];
    if (claimed.includes(tier)) return;
    const updatedClaimed = [...claimed, tier];
    const updatedProfile = { ...profile, claimedMilestones: updatedClaimed };
    saveRankedProfile(updatedProfile);
    setProfile(updatedProfile);
    onUpdatePizza(pizza + 250);
    playSound('rankup');
  };

  // Handle Mode Click
  const handleLaunchMode = (mode: 'ranked' | 'arcade' | 'versus' | 'practice') => {
    setSelectedSubMode(mode);
    playSound('click');

    if (mode === 'arcade') {
      setCurrentView('arcade_map');
    } else if (mode === 'ranked') {
      setCurrentView('select');
    } else {
      setCurrentView('select');
    }
  };

  // Start Ranked Matchmaking Queue
  const handleStartRankedQueue = (
    selectedP1: FighterArchetype,
    partnerP1?: FighterArchetype,
    timerSet: MatchTimerSetting = 99,
    modeTeam: MatchTeamMode = 'solo'
  ) => {
    setPlayerFighter(selectedP1);
    setP1Partner(partnerP1);
    setTimerSetting(timerSet);
    setTeamMode(modeTeam);
    setIsMatchmaking(true);
    playSound('whoosh');

    // Simulate matchmaking search
    setTimeout(() => {
      // Pick random opponent from roster
      const opponents = FIGHTER_ROSTER.filter((f) => f.id !== selectedP1.id);
      const matched = opponents[Math.floor(Math.random() * opponents.length)];
      setMatchFound(matched);
      setOpponentFighter(matched);

      if (modeTeam === 'tag') {
        const remainingForPartner = opponents.filter((f) => f.id !== matched.id);
        setP2Partner(remainingForPartner[Math.floor(Math.random() * remainingForPartner.length)]);
      } else {
        setP2Partner(undefined);
      }

      setSelectedStage(ARENA_STAGES[Math.floor(Math.random() * ARENA_STAGES.length)]);
      playSound('rankup');

      setTimeout(() => {
        setIsMatchmaking(false);
        setMatchFound(null);
        setCurrentView('battle');
      }, 2000);
    }, 2200);
  };

  const handleStartBattle = (
    p1: FighterArchetype,
    p2: FighterArchetype,
    stage: ArenaStage,
    timerSet: MatchTimerSetting = 99,
    modeTeam: MatchTeamMode = 'solo',
    p1Part?: FighterArchetype,
    p2Part?: FighterArchetype
  ) => {
    setPlayerFighter(p1);
    setOpponentFighter(p2);
    setP1Partner(p1Part);
    setP2Partner(p2Part);
    setTimerSetting(timerSet);
    setTeamMode(modeTeam);
    setSelectedStage(stage);

    if (selectedSubMode === 'ranked') {
      handleStartRankedQueue(p1, p1Part, timerSet, modeTeam);
    } else {
      setCurrentView('battle');
    }
  };

  // Launch specific Arcade Stage
  const handleStartArcadeStage = (stageNumber: number) => {
    const config = ARCADE_STAGES_CONFIG[stageNumber - 1];
    const boss = FIGHTER_ROSTER.find((f) => f.id === config.bossId) || FIGHTER_ROSTER[2];
    const stage = ARENA_STAGES.find((s) => s.id === config.stageId) || ARENA_STAGES[0];

    setArcadeStageNum(stageNumber);
    setOpponentFighter(boss);
    setSelectedStage(stage);
    setSelectedSubMode('arcade');
    playSound('click');
    setCurrentView('select');
  };

  // Advance to next arcade stage upon victory
  const handleAdvanceArcadeStage = () => {
    if (arcadeStageNum < 5) {
      const nextNum = arcadeStageNum + 1;
      setArcadeStageNum(nextNum);
      const config = ARCADE_STAGES_CONFIG[nextNum - 1];
      const boss = FIGHTER_ROSTER.find((f) => f.id === config.bossId) || FIGHTER_ROSTER[2];
      const stage = ARENA_STAGES.find((s) => s.id === config.stageId) || ARENA_STAGES[0];

      setOpponentFighter(boss);
      setSelectedStage(stage);
      setCurrentView('battle');
      playSound('rankup');
    } else {
      setCurrentView('arcade_map');
    }
  };

  // 1. Battle View (Active 3D 1v1 Tekken 8 Fight)
  if (currentView === 'battle') {
    return (
      <TekkenBattleEngine
        playerFighter={playerFighter}
        opponentFighter={opponentFighter}
        stage={selectedStage}
        gameMode={selectedSubMode}
        arcadeStageNumber={arcadeStageNum}
        timerSetting={timerSetting}
        teamMode={teamMode}
        p1Partner={p1Partner}
        p2Partner={p2Partner}
        onMatchComplete={(victory, rpDelta, newProf) => {
          setProfile(newProf);
          if (victory) {
            const pizzaBonus = selectedSubMode === 'arcade' ? 250 : 150;
            onUpdatePizza(pizza + pizzaBonus);
          }
        }}
        onExitToHub={() => setCurrentView('hub')}
        onAdvanceArcadeStage={handleAdvanceArcadeStage}
      />
    );
  }

  // 2. Character & Stage Select View
  if (currentView === 'select') {
    return (
      <CharacterSelectTekken
        gameModeTitle={
          selectedSubMode === 'ranked'
            ? 'ONLINE RANKED LADDER'
            : selectedSubMode === 'arcade'
            ? `ARCADE STAGE ${arcadeStageNum}: ${ARCADE_STAGES_CONFIG[arcadeStageNum - 1]?.title.toUpperCase()}`
            : selectedSubMode === 'versus'
            ? 'VERSUS QUICK BATTLE'
            : 'DOJO PRACTICE & COMBO TRIALS'
        }
        defaultP1Id={playerFighter.id}
        defaultP2Id={opponentFighter.id}
        initialTimerSetting={timerSetting}
        initialTeamMode={teamMode}
        onConfirmSelection={handleStartBattle}
        onBackToMenu={() => setCurrentView('hub')}
      />
    );
  }

  // 3. Arcade Story Mode 5-Stage Ladder View
  if (currentView === 'arcade_map') {
    return (
      <div className="w-full min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none font-sans relative overflow-x-hidden">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 rounded-2xl text-neutral-950 shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <Skull size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-amber-300">
                ARCADE STORY LADDER
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                Defeat 5 consecutive bosses to unlock the Arcade Championship & 500 Pizza bonus!
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('hub')}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-2xl text-xs sm:text-sm font-bold text-neutral-300 transition"
          >
            BACK TO HUB
          </button>
        </div>

        {/* 5-Stage Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-8 z-10">
          {ARCADE_STAGES_CONFIG.map((stage) => {
            const boss = FIGHTER_ROSTER.find((f) => f.id === stage.bossId);
            const isCurrent = arcadeStageNum === stage.stageNum;
            const isCompleted = arcadeStageNum > stage.stageNum;

            return (
              <div
                key={stage.stageNum}
                className={`flex flex-col justify-between p-5 rounded-3xl border-2 transition-all relative overflow-hidden ${
                  isCurrent
                    ? 'bg-gradient-to-b from-amber-950/80 via-neutral-900 to-neutral-950 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] scale-105'
                    : isCompleted
                    ? 'bg-neutral-900/60 border-emerald-500/50'
                    : 'bg-neutral-950/80 border-neutral-800 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-1 rounded-full ${
                        isCurrent
                          ? 'bg-amber-400 text-neutral-950'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      STAGE {stage.stageNum}
                    </span>
                    {isCompleted && <CheckCircle2 size={18} className="text-emerald-400" />}
                    {!isCompleted && !isCurrent && <Lock size={16} className="text-neutral-600" />}
                  </div>

                  <div className="text-4xl sm:text-5xl my-3 text-center drop-shadow-md">
                    {boss?.avatar || '🦹'}
                  </div>

                  <h3 className="text-base font-black text-white text-center mb-1">
                    {boss?.name.toUpperCase()}
                  </h3>
                  <p className="text-[11px] text-neutral-400 text-center line-clamp-2 mb-3">
                    {stage.subtitle}
                  </p>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-amber-300 text-center mb-3 bg-neutral-950/80 py-1 rounded-lg border border-neutral-800">
                    +{stage.reward} PIZZA REWARD
                  </div>

                  <button
                    onClick={() => handleStartArcadeStage(stage.stageNum)}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg ${
                      isCurrent
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-neutral-950 hover:brightness-110 animate-pulse'
                        : isCompleted
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Play size={13} />
                    <span>{isCompleted ? 'REPLAY STAGE' : 'FIGHT BOSS'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-800 pt-4 text-xs text-neutral-500 z-10">
          <span>Tekken 8 Arcade Engine: Clear all stages with Spider-Man or Miles Morales</span>
          <span>Stage 5 unlocks Symbiote Mastery</span>
        </div>
      </div>
    );
  }

  // 4. Tekken Rank Ladder Tier Progression View
  if (currentView === 'rank_ladder') {
    return (
      <div className="w-full min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none font-sans relative overflow-x-hidden">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-600 rounded-2xl text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-300 to-yellow-200">
                TEKKEN 8 RANK LADDER (25 TIERS)
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400">
                Your Current Rank: <span className="font-bold text-amber-300">{currentRank.dan}</span> ({profile.currentRP} RP)
              </p>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('hub')}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-2xl text-xs sm:text-sm font-bold text-neutral-300 transition"
          >
            BACK TO HUB
          </button>
        </div>

        {/* 25 Rank Ladder List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 my-6 max-h-[70vh] overflow-y-auto pr-2 z-10">
          {TEKKEN_RANKS.map((rank) => {
            const isUserRank = rank.tier === profile.rankTier;
            const isUnlocked = profile.highestRankTier >= rank.tier;
            const isMilestone = rank.tier % 5 === 0;
            const claimedMilestones = profile.claimedMilestones || [];
            const isClaimed = claimedMilestones.includes(rank.tier);
            const canClaim = isUnlocked && isMilestone && !isClaimed;

            return (
              <div
                key={rank.tier}
                className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between gap-3 transition ${
                  isUserRank
                    ? 'bg-neutral-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-102'
                    : isUnlocked
                    ? 'bg-neutral-950 border-neutral-800'
                    : 'bg-neutral-950/60 border-neutral-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-black text-neutral-950 shadow-md flex-shrink-0"
                    style={{ backgroundColor: rank.color }}
                  >
                    <Award size={22} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-black text-white truncate">{rank.dan}</span>
                      {isUserRank && (
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400">{rank.category} Division</span>
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      {rank.requiredRP.toLocaleString()} RP
                    </span>
                  </div>
                </div>

                {isMilestone && (
                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300">🎁 Milestone +250 🍕</span>
                    {canClaim ? (
                      <button
                        onClick={() => handleClaimMilestone(rank.tier)}
                        className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-[10px] transition shadow"
                      >
                        CLAIM
                      </button>
                    ) : isClaimed ? (
                      <span className="text-[10px] font-bold text-emerald-400">CLAIMED</span>
                    ) : (
                      <span className="text-[10px] text-neutral-600">LOCKED</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-800 pt-4 text-xs text-neutral-500 z-10">
          <span>Earn +100 to +300 RP per ranked win. Win streaks award bonus promotion points!</span>
          <button
            onClick={() => handleLaunchMode('ranked')}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-xl font-black text-xs shadow-lg hover:brightness-110 transition"
          >
            ENTER RANKED QUEUE
          </button>
        </div>
      </div>
    );
  }

  // 5. Main Fighting Lounge / Hub View
  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none font-sans relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950/40 pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-red-600 to-amber-500 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.5)]">
            <Swords size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-300 to-yellow-200">
              TEKKEN 8 FIGHTING ARENA
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              3D Combat Engine with Smooth Shrinking Health Feedback, Heat System, Rage Arts & Ranked Progression
            </p>
          </div>
        </div>

        <button
          onClick={onBackToMainMenu}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-2xl text-xs sm:text-sm font-bold text-neutral-300 transition"
        >
          BACK TO MENU
        </button>
      </div>

      {/* Center Grid: Game Modes & Ranked Passport Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 z-10 flex-1 items-center">
        {/* LEFT COLUMN: 4 FIGHTING MODES */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. RANKED MATCH */}
          <button
            onClick={() => handleLaunchMode('ranked')}
            className="flex flex-col justify-between p-5 bg-gradient-to-br from-red-950/60 via-neutral-900 to-neutral-950 border-2 border-red-600/70 hover:border-red-500 rounded-3xl text-left shadow-xl transition active:scale-95 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition">
                <Trophy size={22} />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/40">
                25-TIER LADDER
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white group-hover:text-red-400 transition mb-1">
                RANKED FIGHTING
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Climb the Tekken rank ladder from 1st Dan to God of Destruction with RP points!
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-red-400 mt-4">
              <span>ENTER MATCHMAKING</span>
              <ChevronRight size={15} />
            </div>
          </button>

          {/* 2. ARCADE BATTLE */}
          <button
            onClick={() => handleLaunchMode('arcade')}
            className="flex flex-col justify-between p-5 bg-gradient-to-br from-amber-950/60 via-neutral-900 to-neutral-950 border-2 border-amber-600/70 hover:border-amber-500 rounded-3xl text-left shadow-xl transition active:scale-95 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500 rounded-2xl text-neutral-950 shadow-lg group-hover:scale-110 transition">
                <Skull size={22} />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40">
                5 BOSS LADDER
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition mb-1">
                ARCADE MODE
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Battle through Fisk, Kraven, and Goblin before confronting final boss Venom!
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 mt-4">
              <span>VIEW 5-STAGE LADDER</span>
              <ChevronRight size={15} />
            </div>
          </button>

          {/* 3. VERSUS QUICK FIGHT */}
          <button
            onClick={() => handleLaunchMode('versus')}
            className="flex flex-col justify-between p-5 bg-gradient-to-br from-blue-950/60 via-neutral-900 to-neutral-950 border-2 border-blue-600/70 hover:border-blue-500 rounded-3xl text-left shadow-xl transition active:scale-95 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition">
                <Swords size={22} />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/40">
                CUSTOM MATCH
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition mb-1">
                VERSUS / CPU 1V1
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Pick any Marvel fighter, custom arena stage, and AI difficulty for instant action.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-400 mt-4">
              <span>QUICK FIGHT</span>
              <ChevronRight size={15} />
            </div>
          </button>

          {/* 4. PRACTICE / DOJO */}
          <button
            onClick={() => handleLaunchMode('practice')}
            className="flex flex-col justify-between p-5 bg-gradient-to-br from-purple-950/60 via-neutral-900 to-neutral-950 border-2 border-purple-600/70 hover:border-purple-500 rounded-3xl text-left shadow-xl transition active:scale-95 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition">
                <BookOpen size={22} />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/40">
                FRAME DATA
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white group-hover:text-purple-400 transition mb-1">
                PRACTICE / DOJO
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Master 1, 2, 3, 4 launchers, Heat Engagers, Rage Arts, and dummy frame advantage.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-400 mt-4">
              <span>ENTER DOJO</span>
              <ChevronRight size={15} />
            </div>
          </button>
        </div>

        {/* RIGHT COLUMN: TEKKEN 8 RANKED PASSPORT & STATS */}
        <div className="lg:col-span-5 flex flex-col p-6 bg-neutral-900/90 border-2 border-neutral-800 rounded-3xl shadow-2xl relative">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
              RANKED PASSPORT
            </span>
            <button
              onClick={() => setCurrentView('rank_ladder')}
              className="text-xs text-amber-300 font-bold hover:underline flex items-center gap-0.5"
            >
              <span>View All 25 Tiers</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Rank Badge Visual */}
          <div className="flex items-center gap-4 p-4 bg-neutral-950 rounded-2xl border border-neutral-800 mb-4 shadow-inner">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-neutral-950 shadow-xl"
              style={{ backgroundColor: currentRank.color }}
            >
              <Award size={36} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white italic tracking-wide">
                {currentRank.dan}
              </span>
              <span className="text-xs text-neutral-400 font-semibold">
                {currentRank.category} Division
              </span>
              <span className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                {profile.currentRP.toLocaleString()} RP
              </span>
            </div>
          </div>

          {/* RP Progress Bar to Next Rank */}
          {nextRank && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-neutral-400 font-semibold mb-1">
                <span>PROGRESS TO {nextRank.dan.toUpperCase()}</span>
                <span className="text-amber-300 font-mono">{nextRank.requiredRP} RP</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (profile.currentRP / nextRank.requiredRP) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Combat Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-center">
            <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
              <div className="text-[10px] text-neutral-500 font-bold">WINS</div>
              <div className="text-lg font-black text-emerald-400">{profile.wins}</div>
            </div>
            <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
              <div className="text-[10px] text-neutral-500 font-bold">LOSSES</div>
              <div className="text-lg font-black text-rose-400">{profile.losses}</div>
            </div>
            <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
              <div className="text-[10px] text-neutral-500 font-bold">WIN RATE</div>
              <div className="text-lg font-black text-amber-300">{winRate}%</div>
            </div>
            <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
              <div className="text-[10px] text-neutral-500 font-bold">STREAK</div>
              <div className="text-lg font-black text-cyan-400">{profile.winStreak} 🔥</div>
            </div>
          </div>

          <div className="p-3 bg-black/40 rounded-2xl border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2 mb-3">
            <Flame size={18} className="text-red-500 flex-shrink-0" />
            <span>
              Win ranked matches to earn bonus RP, climb divisions, and climb the Marvel leaderboard!
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => { playSound('click'); setShowMatchHistory(true); }}
              className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-700 hover:border-red-500/50 text-xs font-bold text-amber-400 flex items-center justify-center gap-2 transition shadow"
            >
              <History size={15} />
              <span>VIEW MATCH HISTORY (LAST 10 MATCHES)</span>
            </button>
            <button
              onClick={() => { playSound('click'); setShowFighterDatabase(true); }}
              className="w-full py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-700 hover:border-amber-500/50 text-xs font-bold text-cyan-400 flex items-center justify-center gap-2 transition shadow"
            >
              <User size={15} />
              <span>MARVEL FIGHTER & MOVE DATABASE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showMatchHistory && <MatchHistoryModal onClose={() => setShowMatchHistory(false)} />}
      {showFighterDatabase && <FighterShowcaseModal onClose={() => setShowFighterDatabase(false)} />}

      {/* Matchmaking Overlay Modal */}
      <AnimatePresence>
        {isMatchmaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <div className="w-full max-w-md bg-neutral-900 border-2 border-red-600 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center text-white relative shadow-[0_0_60px_rgba(239,68,68,0.4)]">
              {matchFound ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Wifi size={14} />
                    <span>OPPONENT FOUND (18ms)</span>
                  </div>
                  <div className="text-3xl font-black italic text-yellow-300 mb-4">
                    MATCH CONFIRMED!
                  </div>

                  <div className="flex items-center gap-6 my-4">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl">{playerFighter.avatar}</span>
                      <span className="text-sm font-black mt-1">{playerFighter.name}</span>
                      <span className="text-[10px] text-red-400 font-bold">{currentRank.dan}</span>
                    </div>
                    <span className="text-2xl font-black text-neutral-500">VS</span>
                    <div className="flex flex-col items-center">
                      <span className="text-4xl">{matchFound.avatar}</span>
                      <span className="text-sm font-black mt-1">{matchFound.name}</span>
                      <span className="text-[10px] text-blue-400 font-bold">{currentRank.dan}</span>
                    </div>
                  </div>

                  <div className="text-xs text-neutral-400 animate-pulse mt-2">
                    Entering Arena... Get Ready for Battle!
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-red-500 border-t-transparent animate-spin mb-4 flex items-center justify-center">
                    <Radio size={28} className="text-red-400" />
                  </div>
                  <div className="text-2xl font-black italic text-white mb-1">
                    SEARCHING FOR OPPONENT
                  </div>
                  <div className="text-xs text-neutral-400 mb-3">
                    Matching within {currentRank.category} Division ({currentRank.dan})
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono">
                    <Activity size={13} className="animate-pulse" />
                    <span>Ping: 18ms | Region: US-East</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer System Info */}
      <div className="flex items-center justify-between border-t border-neutral-800/80 pt-4 text-xs text-neutral-500 z-10">
        <span>Tekken 8 Battle System: 1 (LP), 2 (RP), 3 (LK), 4 (RK), Heat Burst, Heat Smash & Rage Arts</span>
        <span>Version 2.0 (Battle, Arcade & Ranked Ladder Engine)</span>
      </div>
    </div>
  );
}
