import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Swords,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  Flame,
  Award,
  Sparkles,
  MapPin,
  Play,
  RotateCcw,
  Clock,
  Users,
  User,
  Infinity as InfinityIcon,
  Layers,
} from 'lucide-react';
import {
  FIGHTER_ROSTER,
  FighterArchetype,
  FighterId,
  ARENA_STAGES,
  ArenaStage,
  MatchTimerSetting,
  MatchTeamMode,
} from './FightingTypes';
import { useAudio } from '../../hooks/useAudio';

interface CharacterSelectTekkenProps {
  onConfirmSelection: (
    playerFighter: FighterArchetype,
    opponentFighter: FighterArchetype,
    selectedStage: ArenaStage,
    timerSetting: MatchTimerSetting,
    teamMode: MatchTeamMode,
    p1Partner?: FighterArchetype,
    p2Partner?: FighterArchetype
  ) => void;
  onBackToMenu: () => void;
  gameModeTitle?: string;
  defaultP1Id?: FighterId;
  defaultP2Id?: FighterId;
  initialTimerSetting?: MatchTimerSetting;
  initialTeamMode?: MatchTeamMode;
}

export default function CharacterSelectTekken({
  onConfirmSelection,
  onBackToMenu,
  gameModeTitle = 'RANKED MATCH',
  defaultP1Id = 'spiderman_peter',
  defaultP2Id = 'venom',
  initialTimerSetting = 99,
  initialTeamMode = 'solo',
}: CharacterSelectTekkenProps) {
  const { playSound } = useAudio();

  // Primary Fighters
  const [selectedP1Index, setSelectedP1Index] = useState<number>(() => {
    const idx = FIGHTER_ROSTER.findIndex((f) => f.id === defaultP1Id);
    return idx >= 0 ? idx : 0;
  });

  const [selectedP2Index, setSelectedP2Index] = useState<number>(() => {
    const idx = FIGHTER_ROSTER.findIndex((f) => f.id === defaultP2Id);
    return idx >= 0 ? idx : 2;
  });

  // Tag Team Partners (Secondary Fighters)
  const [selectedP1TagIndex, setSelectedP1TagIndex] = useState<number>(1); // Miles by default
  const [selectedP2TagIndex, setSelectedP2TagIndex] = useState<number>(3); // Green Goblin by default

  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'p1' | 'p1_tag' | 'p2' | 'p2_tag' | 'stage' | 'rules'>('p1');

  // Match Rule Options
  const [timerSetting, setTimerSetting] = useState<MatchTimerSetting>(initialTimerSetting);
  const [teamMode, setTeamMode] = useState<MatchTeamMode>(initialTeamMode);

  const p1 = FIGHTER_ROSTER[selectedP1Index];
  const p2 = FIGHTER_ROSTER[selectedP2Index];
  const p1Tag = FIGHTER_ROSTER[selectedP1TagIndex];
  const p2Tag = FIGHTER_ROSTER[selectedP2TagIndex];
  const stage = ARENA_STAGES[selectedStageIndex];

  const handleSelectFighter = (index: number) => {
    playSound('whoosh');
    if (activeTab === 'p1') setSelectedP1Index(index);
    else if (activeTab === 'p1_tag') setSelectedP1TagIndex(index);
    else if (activeTab === 'p2') setSelectedP2Index(index);
    else if (activeTab === 'p2_tag') setSelectedP2TagIndex(index);
  };

  const handleStartFight = () => {
    playSound('combat');
    onConfirmSelection(
      p1,
      p2,
      stage,
      timerSetting,
      teamMode,
      teamMode === 'tag' ? p1Tag : undefined,
      teamMode === 'tag' ? p2Tag : undefined
    );
  };

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-3 sm:p-6 select-none font-sans relative overflow-hidden">
      {/* Background Animated Gradients */}
      <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-red-950/40 pointer-events-none" />

      {/* Top Header Banner */}
      <div className="flex items-center justify-between z-10 border-b border-neutral-800 pb-3 flex-wrap gap-2">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition text-xs sm:text-sm font-bold"
        >
          <ChevronLeft size={16} />
          <span>RETURN TO LOBBY</span>
        </button>

        <div className="flex flex-col items-center">
          <div className="text-[10px] sm:text-xs tracking-widest uppercase font-extrabold text-amber-400">
            {gameModeTitle}
          </div>
          <h1 className="text-lg sm:text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-red-400">
            FIGHTER, TIMER & MODE SELECTION
          </h1>
        </div>

        <button
          onClick={handleStartFight}
          className="flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-red-600 hover:brightness-110 font-black text-neutral-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] transition active:scale-95 text-xs sm:text-base animate-pulse"
        >
          <Play size={18} />
          <span>START BATTLE!</span>
        </button>
      </div>

      {/* Top Match Configuration Quick-Bar (Timer & Tag Team / Solo Toggles) */}
      <div className="flex items-center justify-between gap-3 bg-neutral-900/95 border border-neutral-800 px-4 py-2.5 rounded-2xl z-10 my-2 flex-wrap">
        {/* Match Format: Solo vs Tag Team */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
            <Layers size={14} className="text-amber-400" />
            <span>FORMAT:</span>
          </span>
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => {
                setTeamMode('solo');
                playSound('click');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                teamMode === 'solo'
                  ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <User size={13} />
              <span>1v1 SOLO</span>
            </button>
            <button
              onClick={() => {
                setTeamMode('tag');
                playSound('rankup');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                teamMode === 'tag'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users size={13} />
              <span>2v2 TAG TEAM</span>
            </button>
          </div>
        </div>

        {/* Match Timer Selector (30s, 60s, 99s, Infinite) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
            <Clock size={14} className="text-amber-400" />
            <span>ROUND TIMER:</span>
          </span>
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 gap-1">
            {[30, 60, 99, 'infinite'].map((val) => {
              const isSelected = timerSetting === val;
              return (
                <button
                  key={val}
                  onClick={() => {
                    setTimerSetting(val as MatchTimerSetting);
                    playSound('click');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-400 text-neutral-950 shadow-md font-mono'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {val === 'infinite' ? (
                    <>
                      <InfinityIcon size={14} />
                      <span>INFINITE</span>
                    </>
                  ) : (
                    <span>{val}s</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Arena pill summary */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-300">
          <MapPin size={13} className="text-amber-400" />
          <span className="text-neutral-500">Arena:</span>
          <span className="font-black text-amber-300">{stage.name}</span>
        </div>
      </div>

      {/* Main Selection Area: P1 vs P2 Cards & Center Roster */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-start my-2 z-10 overflow-y-auto">
        {/* LEFT COLUMN: PLAYER 1 CARD */}
        <div className="lg:col-span-3 flex flex-col p-3.5 bg-neutral-900/90 border-2 border-red-600/80 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-red-600 text-white">
                PLAYER 1
              </span>
              {teamMode === 'tag' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-amber-300 border border-amber-500/40">
                  POINT FIGHTER
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-neutral-400">{p1.difficulty}</span>
          </div>

          {/* Primary Avatar & Emblem */}
          <div className="w-full h-36 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 flex flex-col items-center justify-center relative border border-neutral-700/60 mb-2 shadow-inner">
            <span className="text-6xl mb-1">{p1.avatar}</span>
            <span className="text-lg font-black italic tracking-wide text-white uppercase">
              {p1.name}
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">{p1.title}</span>
          </div>

          {/* Tag Team Secondary Partner Slot for P1 */}
          {teamMode === 'tag' && (
            <div
              onClick={() => setActiveTab('p1_tag')}
              className={`w-full p-2 rounded-2xl border-2 mb-2 flex items-center justify-between cursor-pointer transition ${
                activeTab === 'p1_tag'
                  ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-[1.02]'
                  : 'bg-neutral-950/80 border-neutral-700 hover:border-purple-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p1Tag.avatar}</span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-purple-300">
                    TAG PARTNER (P1)
                  </span>
                  <span className="text-xs font-extrabold text-white">{p1Tag.name}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-950/90 px-2 py-0.5 rounded-lg border border-purple-500/40">
                SWAP [T]
              </span>
            </div>
          )}

          {/* Fighter Stats */}
          <div className="space-y-1 text-xs mb-2">
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold mb-0.5">
                <span>POWER</span>
                <span className="text-amber-300">{p1.stats.power}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${p1.stats.power}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold mb-0.5">
                <span>SPEED</span>
                <span className="text-amber-300">{p1.stats.speed}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${p1.stats.speed}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold mb-0.5">
                <span>AERIAL JUGGLE</span>
                <span className="text-amber-300">{p1.stats.juggle}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${p1.stats.juggle}%` }} />
              </div>
            </div>
          </div>

          <div className="p-2 bg-black/50 rounded-xl border border-neutral-800 text-[10px] text-neutral-300 italic">
            "{p1.introQuote}"
          </div>
        </div>

        {/* CENTER COLUMN: ROSTER GRID & STAGE SELECTOR */}
        <div className="lg:col-span-6 flex flex-col items-center gap-3">
          {/* Selector Mode Toggle Tabs */}
          <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1.5 rounded-2xl border border-neutral-800 flex-wrap justify-center">
            <button
              onClick={() => setActiveTab('p1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'p1' ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              SELECT P1 MAIN
            </button>

            {teamMode === 'tag' && (
              <button
                onClick={() => setActiveTab('p1_tag')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  activeTab === 'p1_tag'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-purple-400 hover:text-white'
                }`}
              >
                SELECT P1 PARTNER
              </button>
            )}

            <button
              onClick={() => setActiveTab('p2')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'p2' ? 'bg-blue-600 text-white shadow' : 'text-neutral-400 hover:text-white'
              }`}
            >
              SELECT OPPONENT
            </button>

            {teamMode === 'tag' && (
              <button
                onClick={() => setActiveTab('p2_tag')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  activeTab === 'p2_tag'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-indigo-400 hover:text-white'
                }`}
              >
                SELECT CPU PARTNER
              </button>
            )}

            <button
              onClick={() => setActiveTab('stage')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'stage'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              SELECT STAGE
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                activeTab === 'rules'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              MATCH RULES
            </button>
          </div>

          {/* Active Tab Target Banner */}
          <div className="text-xs font-black uppercase text-amber-300 flex items-center gap-1">
            <Sparkles size={13} />
            <span>
              {activeTab === 'p1'
                ? 'Choose Player 1 Primary Fighter'
                : activeTab === 'p1_tag'
                ? 'Choose Player 1 Tag Partner'
                : activeTab === 'p2'
                ? 'Choose Opponent Primary Fighter'
                : activeTab === 'p2_tag'
                ? 'Choose Opponent Tag Partner'
                : activeTab === 'stage'
                ? 'Choose Battle Arena & Environment'
                : 'Configure Match Timer & Team Rules'}
            </span>
          </div>

          {/* Tab Content Panel */}
          {activeTab === 'rules' ? (
            <div className="flex flex-col gap-4 w-full max-w-lg bg-neutral-900/90 p-5 rounded-2xl border border-neutral-800">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-neutral-400">ROUND TIMER SETTING</span>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 99, 'infinite'].map((t) => (
                    <button
                      key={String(t)}
                      onClick={() => { setTimerSetting(t as MatchTimerSetting); playSound('click'); }}
                      className={`py-2 rounded-xl text-xs font-black border transition ${
                        timerSetting === t
                          ? 'bg-amber-500 border-amber-300 text-neutral-950 shadow'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
                      }`}
                    >
                      {t === 'infinite' ? '∞' : `${t}s`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-neutral-400">TEAM FORMAT</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { mode: 'solo', label: '1v1 SOLO BATTLE' },
                    { mode: 'tag', label: '2v2 TAG TEAM' },
                  ].map((m) => (
                    <button
                      key={m.mode}
                      onClick={() => { setTeamMode(m.mode as MatchTeamMode); playSound('click'); }}
                      className={`py-2.5 rounded-xl text-xs font-black border transition ${
                        teamMode === m.mode
                          ? 'bg-purple-600 border-purple-400 text-white shadow'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:bg-neutral-900'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'stage' ? (
            /* Arena Stages Grid */
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              {ARENA_STAGES.map((stg, idx) => {
                const isSelected = selectedStageIndex === idx;

                return (
                  <button
                    key={stg.id}
                    onClick={() => {
                      setSelectedStageIndex(idx);
                      playSound('whoosh');
                    }}
                    className={`flex flex-col p-3 rounded-2xl border-2 text-left transition ${
                      isSelected
                        ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105'
                        : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-amber-300">{stg.name}</span>
                      {stg.hasWallBreak && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-bold">
                          WALL SPLAT
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400">{stg.subtitle}</span>
                    <span className="text-[9px] text-neutral-500 mt-1">📍 {stg.location}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Fighter Grid */
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 w-full">
              {FIGHTER_ROSTER.map((f, idx) => {
                let isSelected = false;
                let activeColor = 'border-amber-400';

                if (activeTab === 'p1') {
                  isSelected = selectedP1Index === idx;
                  activeColor = 'bg-red-950/80 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]';
                } else if (activeTab === 'p1_tag') {
                  isSelected = selectedP1TagIndex === idx;
                  activeColor = 'bg-purple-950/80 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]';
                } else if (activeTab === 'p2') {
                  isSelected = selectedP2Index === idx;
                  activeColor = 'bg-blue-950/80 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]';
                } else if (activeTab === 'p2_tag') {
                  isSelected = selectedP2TagIndex === idx;
                  activeColor = 'bg-indigo-950/80 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]';
                }

                return (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFighter(idx)}
                    className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                      isSelected
                        ? `${activeColor} scale-105`
                        : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl mb-1">{f.avatar}</span>
                    <span className="text-[10px] font-black uppercase text-center leading-tight">
                      {f.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Rule Badges */}
          <div className="flex items-center gap-3 bg-neutral-900/90 border border-neutral-700/80 px-4 py-2 rounded-2xl text-xs flex-wrap justify-center">
            <span className="text-neutral-400">Match Rules:</span>
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-amber-300 font-mono font-bold">
              {timerSetting === 'infinite' ? '∞ INFINITE TIME' : `${timerSetting}s TIMER`}
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-purple-300 font-bold">
              {teamMode === 'tag' ? '2v2 TAG TEAM BATTLE' : '1v1 SOLO CLASH'}
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-emerald-300 font-bold">
              BEST 2 OF 3 ROUNDS
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: OPPONENT (P2) CARD */}
        <div className="lg:col-span-3 flex flex-col p-3.5 bg-neutral-900/90 border-2 border-blue-600/80 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-blue-600 text-white">
                CPU OPPONENT
              </span>
              {teamMode === 'tag' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-blue-300 border border-blue-500/40">
                  POINT FIGHTER
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-neutral-400">{p2.difficulty}</span>
          </div>

          {/* Avatar & Emblem */}
          <div className="w-full h-36 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 flex flex-col items-center justify-center relative border border-neutral-700/60 mb-2 shadow-inner">
            <span className="text-6xl mb-1">{p2.avatar}</span>
            <span className="text-lg font-black italic tracking-wide text-white uppercase">
              {p2.name}
            </span>
            <span className="text-[11px] text-neutral-400 font-semibold">{p2.title}</span>
          </div>

          {/* Tag Team Secondary Partner Slot for P2 */}
          {teamMode === 'tag' && (
            <div
              onClick={() => setActiveTab('p2_tag')}
              className={`w-full p-2 rounded-2xl border-2 mb-2 flex items-center justify-between cursor-pointer transition ${
                activeTab === 'p2_tag'
                  ? 'bg-indigo-950/80 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)] scale-[1.02]'
                  : 'bg-neutral-950/80 border-neutral-700 hover:border-indigo-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p2Tag.avatar}</span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-indigo-300">
                    CPU PARTNER (P2)
                  </span>
                  <span className="text-xs font-extrabold text-white">{p2Tag.name}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/90 px-2 py-0.5 rounded-lg border border-indigo-500/40">
                REINFORCEMENT
              </span>
            </div>
          )}

          {/* Fighter Stats */}
          <div className="space-y-1 text-xs mb-2">
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold mb-0.5">
                <span>POWER</span>
                <span className="text-amber-300">{p2.stats.power}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${p2.stats.power}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold mb-0.5">
                <span>DEFENSE</span>
                <span className="text-amber-300">{p2.stats.defense}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${p2.stats.defense}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-neutral-400 font-bold mb-0.5">
                <span>REACH</span>
                <span className="text-amber-300">{p2.stats.reach}%</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${p2.stats.reach}%` }} />
              </div>
            </div>
          </div>

          <div className="p-2 bg-black/50 rounded-xl border border-neutral-800 text-[10px] text-neutral-300 italic">
            "{p2.introQuote}"
          </div>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="flex items-center justify-between border-t border-neutral-800/80 pt-2 text-xs text-neutral-400 z-10 flex-wrap gap-2">
        <span>Tekken 8 Controls: 1 (LP), 2 (RP), 3 (LK), 4 (RK), H (Heat), U (Rage Art), T (Tag Partner)</span>
        <span className="font-bold text-amber-400">
          Selected: {teamMode === 'tag' ? '2v2 Tag Team' : '1v1 Solo'} • {timerSetting === 'infinite' ? 'Infinite Timer' : `${timerSetting}s Timer`}
        </span>
      </div>
    </div>
  );
}
