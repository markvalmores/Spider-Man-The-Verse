import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Zap,
  Shield,
  Crosshair,
  Award,
  Swords,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Users,
  Infinity as InfinityIcon,
  RefreshCw,
  Home,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  PlayerFighterState,
  FighterArchetype,
  TekkenRank,
  AttackType,
  MatchTimerSetting,
  MatchTeamMode,
} from './FightingTypes';

interface TekkenFightHUDProps {
  p1: PlayerFighterState;
  p2: PlayerFighterState;
  p1Archetype: FighterArchetype;
  p2Archetype: FighterArchetype;
  p1Rank: TekkenRank;
  p2Rank: TekkenRank;
  roundTime: number;
  timerSetting?: MatchTimerSetting;
  teamMode?: MatchTeamMode;
  p1Partner?: FighterArchetype;
  p2Partner?: FighterArchetype;
  p1PartnerHealth?: number;
  p2PartnerHealth?: number;
  canTagP1?: boolean;
  tagCooldownRemaining?: number;
  currentRound: number;
  maxRoundsToWin: number;
  comboCount: number;
  comboDamage: number;
  announcementText: string | null;
  announcementSub: string | null;
  onPlayerInput: (action: AttackType) => void;
  isTouchDevice?: boolean;
  isPromotionMatch?: boolean;
  isDemotionMatch?: boolean;
  recentInputs?: string[];
  onForceStartRound?: () => void;
  isUiHidden: boolean;
  onToggleUi: () => void;
  onExitToHub: () => void;
}

export default function TekkenFightHUD({
  p1,
  p2,
  p1Archetype,
  p2Archetype,
  p1Rank,
  p2Rank,
  roundTime,
  timerSetting = 99,
  teamMode = 'solo',
  p1Partner,
  p2Partner,
  p1PartnerHealth = 100,
  p2PartnerHealth = 100,
  canTagP1 = true,
  tagCooldownRemaining = 0,
  currentRound,
  maxRoundsToWin,
  comboCount,
  comboDamage,
  announcementText,
  announcementSub,
  onPlayerInput,
  isTouchDevice = true,
  isPromotionMatch = false,
  isDemotionMatch = false,
  recentInputs = [],
  onForceStartRound,
  isUiHidden,
  onToggleUi,
  onExitToHub,
}: TekkenFightHUDProps) {
  // Smooth Shrinking Red Damage Trails
  const [p1TrailHealth, setP1TrailHealth] = useState(p1.health);
  const [p2TrailHealth, setP2TrailHealth] = useState(p2.health);

  // White flash on impact
  const [p1HitFlash, setP1HitFlash] = useState(false);
  const [p2HitFlash, setP2HitFlash] = useState(false);

  // Floating damage number popups
  const [p1DamagePopup, setP1DamagePopup] = useState<number | null>(null);
  const [p2DamagePopup, setP2DamagePopup] = useState<number | null>(null);

  // Screen shake intensity
  const [hudShake, setHudShake] = useState(false);

  const prevP1Health = useRef(p1.health);
  const prevP2Health = useRef(p2.health);
  const p1TrailTimeout = useRef<number | null>(null);
  const p2TrailTimeout = useRef<number | null>(null);

  // P1 Damage Listener: trigger impact flash, popup, and smooth delayed trail shrink
  useEffect(() => {
    if (p1.health < prevP1Health.current) {
      const delta = prevP1Health.current - p1.health;
      setP1HitFlash(true);
      setP1DamagePopup(delta);
      setHudShake(true);
      setTimeout(() => setP1HitFlash(false), 180);
      setTimeout(() => setP1DamagePopup(null), 850);
      setTimeout(() => setHudShake(false), 220);

      if (p1TrailTimeout.current) clearTimeout(p1TrailTimeout.current);
      p1TrailTimeout.current = window.setTimeout(() => {
        setP1TrailHealth(p1.health);
      }, 350);
    } else if (p1.health > prevP1Health.current) {
      setP1TrailHealth(p1.health);
    }
    prevP1Health.current = p1.health;
  }, [p1.health]);

  // P2 Damage Listener: trigger impact flash, popup, and smooth delayed trail shrink
  useEffect(() => {
    if (p2.health < prevP2Health.current) {
      const delta = prevP2Health.current - p2.health;
      setP2HitFlash(true);
      setP2DamagePopup(delta);
      setHudShake(true);
      setTimeout(() => setP2HitFlash(false), 180);
      setTimeout(() => setP2DamagePopup(null), 850);
      setTimeout(() => setHudShake(false), 220);

      if (p2TrailTimeout.current) clearTimeout(p2TrailTimeout.current);
      p2TrailTimeout.current = window.setTimeout(() => {
        setP2TrailHealth(p2.health);
      }, 350);
    } else if (p2.health > prevP2Health.current) {
      setP2TrailHealth(p2.health);
    }
    prevP2Health.current = p2.health;
  }, [p2.health]);

  // Derive Dynamic Combo Grade Badge based on hit count
  const getComboGrade = (hits: number) => {
    if (hits >= 15) return { grade: 'SSS', color: 'from-amber-300 via-rose-500 to-red-600', label: 'GODLIKE JUGGLE' };
    if (hits >= 10) return { grade: 'S', color: 'from-red-500 to-amber-400', label: 'EXTREME AIR COMBO' };
    if (hits >= 7) return { grade: 'A', color: 'from-orange-500 to-yellow-400', label: 'GREAT COMBO' };
    if (hits >= 4) return { grade: 'B', color: 'from-yellow-400 to-emerald-400', label: 'NICE CHAIN' };
    return { grade: 'C', color: 'from-cyan-400 to-blue-500', label: 'HIT COMBO' };
  };

  const comboGrade = comboCount >= 2 ? getComboGrade(comboCount) : null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-5 overflow-hidden select-none font-sans transition-transform ${
        hudShake ? 'translate-y-1' : 'translate-y-0'
      }`}
    >
      {/* Top-Right Action Toolbar (Menu & Hide/Show UI) */}
      <div className="absolute top-2 right-2 flex items-center gap-2 z-50 pointer-events-auto">
        <button
          onClick={onToggleUi}
          className="px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-amber-300 font-black text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md transition"
          title={isUiHidden ? "Show All UI" : "Hide All UI for Free View"}
        >
          {isUiHidden ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>{isUiHidden ? 'SHOW UI' : 'HIDE UI'}</span>
        </button>
        <button
          onClick={onExitToHub}
          className="px-3 py-1.5 rounded-xl bg-red-950/90 hover:bg-red-900 border border-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-md transition"
          title="Return to Battle Hub / Main Menu"
        >
          <Home size={14} />
          <span>MENU</span>
        </button>
      </div>

      {!isUiHidden && (
        <>
          {/* Top Banner for Promotion / Demotion Matches */}
          <AnimatePresence>
            {isPromotionMatch && (
              <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                className="absolute top-1 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-neutral-950 font-black text-[10px] sm:text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.8)] border border-yellow-100 flex items-center gap-1.5 z-40 animate-pulse"
              >
                <Sparkles size={14} />
                <span>PROMOTION CHANCE MATCH</span>
              </motion.div>
            )}
            {isDemotionMatch && (
              <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                className="absolute top-1 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-[10px] sm:text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(239,68,68,0.8)] border border-red-300 flex items-center gap-1.5 z-40 animate-pulse"
              >
                <AlertTriangle size={14} />
                <span>DEMOTION RISK MATCH</span>
              </motion.div>
            )}
          </AnimatePresence>

      {/* TOP COMBAT BAR: Health Bars, Heat Gauges, Round Indicators, Timer, Tag Partners & Dan Badges */}
      <div className="w-full flex items-start justify-between gap-2 sm:gap-4 relative z-20 mt-10 sm:mt-12">
        {/* PLAYER 1 (LEFT) */}
        <div className="flex-1 flex flex-col items-start max-w-[43%]">
          {/* Name & Rank Tag */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl sm:text-2xl drop-shadow-md">{p1Archetype.avatar}</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-lg font-black italic tracking-wide text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {p1Archetype.name}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white shadow">
                  P1
                </span>
                {teamMode === 'tag' && (
                  <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-900/90 text-purple-200 border border-purple-500/50">
                    TAG POINT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.2 rounded-sm text-neutral-950 shadow flex items-center gap-1"
                  style={{ backgroundColor: p1Rank.color }}
                >
                  <Award size={10} />
                  <span>{p1Rank.dan}</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-neutral-300">
                  {Math.max(0, Math.round(p1.health))} HP
                </span>
              </div>
            </div>
          </div>

          {/* Angled High-Contrast Tekken 8 Health Bar */}
          <div className="w-full h-5 sm:h-7 bg-neutral-950 border-2 border-neutral-700/90 rounded-sm overflow-hidden p-0.5 relative shadow-[0_8px_25px_rgba(0,0,0,0.9)] skew-x-[-12deg]">
            {/* Background Base */}
            <div className="absolute inset-0.5 bg-neutral-900" />

            {/* Segment Notches (25%, 50%, 75%) */}
            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-20 opacity-40">
              <div className="w-0.5 h-full bg-black ml-[25%]" />
              <div className="w-0.5 h-full bg-black ml-[25%]" />
              <div className="w-0.5 h-full bg-black ml-[25%]" />
            </div>

            {/* Recoverable Health (Grey) */}
            <div
              className="absolute top-0.5 bottom-0.5 left-0.5 bg-neutral-400/50 transition-all duration-700"
              style={{ width: `${p1.recoverableHealth}%` }}
            />

            {/* Red Delayed Smooth Shrinking Damage Trail */}
            <motion.div
              className="absolute top-0.5 bottom-0.5 left-0.5 bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
              animate={{ width: `${Math.max(0, p1TrailHealth)}%` }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Swift Current Health Bar (Amber/Yellow -> Red when in Rage) */}
            <motion.div
              className={`h-full relative shadow-md ${
                p1.isRageActive
                  ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 animate-pulse'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-yellow-200'
              }`}
              animate={{ width: `${Math.max(0, p1.health)}%` }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {/* White Impact Hit Flash Overlay */}
              {p1HitFlash && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-white"
                />
              )}

              {/* Flame icon for Rage */}
              {p1.isRageActive && (
                <div className="absolute right-1 top-0 bottom-0 flex items-center">
                  <Flame size={14} className="text-white animate-bounce" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Tag Team Partner Health Micro-Bar (P1) */}
          {teamMode === 'tag' && p1Partner && (
            <div className="w-full flex items-center gap-1.5 mt-1 skew-x-[-12deg]">
              <div className="text-[8px] font-black px-1 py-0.2 rounded-sm bg-purple-950 text-purple-300 border border-purple-500/50 flex items-center gap-1">
                <span>{p1Partner.avatar}</span>
                <span className="hidden sm:inline">{p1Partner.name.split(' ')[0]}</span>
              </div>
              <div className="flex-1 h-1.5 bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden p-0.2 relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-400"
                  animate={{ width: `${Math.max(0, p1PartnerHealth)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[8px] font-mono text-purple-300 font-bold">
                {Math.round(p1PartnerHealth)}%
              </span>
            </div>
          )}

          {/* Floating Damage Popup for P1 */}
          <AnimatePresence>
            {p1DamagePopup !== null && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.7 }}
                animate={{ opacity: 1, y: -15, scale: 1.15 }}
                exit={{ opacity: 0, y: -28 }}
                transition={{ duration: 0.6 }}
                className="text-red-400 font-black italic text-sm sm:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wider mt-0.5 ml-1"
              >
                -{Math.round(p1DamagePopup)} DMG
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tekken 8 Heat Gauge */}
          <div className="w-full flex items-center gap-1.5 mt-1 skew-x-[-12deg]">
            <div
              className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 ${
                p1.isHeatActive
                  ? 'bg-cyan-400 text-neutral-950 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse'
                  : 'bg-neutral-800 text-neutral-500'
              }`}
            >
              <Zap size={10} />
              <span>HEAT</span>
            </div>
            <div className="flex-1 h-2 sm:h-2.5 bg-neutral-950 border border-neutral-700 rounded-sm overflow-hidden p-0.2 relative">
              <motion.div
                className={`h-full ${
                  p1.isHeatActive
                    ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 shadow-[0_0_10px_#38bdf8]'
                    : 'bg-cyan-700/60'
                }`}
                animate={{ width: `${Math.max(0, p1.heatGauge)}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>

          {/* Round Won Indicators */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {Array.from({ length: maxRoundsToWin }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-all ${
                  i < p1.roundsWon
                    ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_10px_#facc15] scale-110'
                    : 'bg-neutral-900 border-neutral-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CENTER FIGHT TIMER & ROUND NUMBER */}
        <div className="flex flex-col items-center justify-center pt-0.5">
          <div className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-neutral-400 mb-0.5">
            ROUND {currentRound}
          </div>
          <div
            className={`w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-neutral-950/95 border-2 ${
              timerSetting !== 'infinite' && roundTime <= 10
                ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] text-red-400 animate-ping'
                : 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.5)] text-amber-300'
            } flex items-center justify-center text-2xl sm:text-4xl font-black font-mono tracking-tighter`}
          >
            {timerSetting === 'infinite' ? (
              <InfinityIcon size={28} className="text-amber-300 animate-pulse" />
            ) : roundTime < 10 ? (
              `0${roundTime}`
            ) : (
              roundTime
            )}
          </div>
          {teamMode === 'tag' && (
            <span className="text-[8px] font-black uppercase tracking-wider text-purple-400 mt-0.5 bg-purple-950/80 px-1.5 rounded">
              TAG MODE
            </span>
          )}
        </div>

        {/* PLAYER 2 / CPU (RIGHT) */}
        <div className="flex-1 flex flex-col items-end max-w-[43%]">
          {/* Name & Rank Tag */}
          <div className="flex items-center gap-2 mb-1 flex-row-reverse">
            <span className="text-xl sm:text-2xl drop-shadow-md">{p2Archetype.avatar}</span>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 flex-row-reverse">
                <span className="text-sm sm:text-lg font-black italic tracking-wide text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {p2Archetype.name}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white shadow">
                  CPU
                </span>
                {teamMode === 'tag' && (
                  <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded bg-indigo-900/90 text-indigo-200 border border-indigo-500/50">
                    TAG POINT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-row-reverse">
                <span
                  className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.2 rounded-sm text-neutral-950 shadow flex items-center gap-1"
                  style={{ backgroundColor: p2Rank.color }}
                >
                  <Award size={10} />
                  <span>{p2Rank.dan}</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-neutral-300">
                  {Math.max(0, Math.round(p2.health))} HP
                </span>
              </div>
            </div>
          </div>

          {/* Angled High-Contrast Tekken 8 Health Bar (Mirrored) */}
          <div className="w-full h-5 sm:h-7 bg-neutral-950 border-2 border-neutral-700/90 rounded-sm overflow-hidden p-0.5 relative shadow-[0_8px_25px_rgba(0,0,0,0.9)] skew-x-[12deg]">
            {/* Background Base */}
            <div className="absolute inset-0.5 bg-neutral-900" />

            {/* Segment Notches */}
            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-20 opacity-40">
              <div className="w-0.5 h-full bg-black ml-[25%]" />
              <div className="w-0.5 h-full bg-black ml-[25%]" />
              <div className="w-0.5 h-full bg-black ml-[25%]" />
            </div>

            {/* Recoverable Health (Grey) */}
            <div
              className="absolute top-0.5 bottom-0.5 right-0.5 bg-neutral-400/50 transition-all duration-700"
              style={{ width: `${p2.recoverableHealth}%` }}
            />

            {/* Red Delayed Smooth Shrinking Damage Trail */}
            <motion.div
              className="absolute top-0.5 bottom-0.5 right-0.5 bg-gradient-to-l from-red-700 via-rose-600 to-amber-600 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
              animate={{ width: `${Math.max(0, p2TrailHealth)}%` }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Swift Current Health Bar */}
            <motion.div
              className={`h-full relative shadow-md ml-auto ${
                p2.isRageActive
                  ? 'bg-gradient-to-l from-red-600 via-rose-500 to-amber-400 animate-pulse'
                  : 'bg-gradient-to-l from-amber-400 via-yellow-300 to-yellow-200'
              }`}
              animate={{ width: `${Math.max(0, p2.health)}%` }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >
              {/* White Impact Hit Flash Overlay */}
              {p2HitFlash && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-white"
                />
              )}

              {/* Flame icon for Rage */}
              {p2.isRageActive && (
                <div className="absolute left-1 top-0 bottom-0 flex items-center">
                  <Flame size={14} className="text-white animate-bounce" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Tag Team Partner Health Micro-Bar (P2) */}
          {teamMode === 'tag' && p2Partner && (
            <div className="w-full flex items-center gap-1.5 mt-1 skew-x-[12deg] flex-row-reverse">
              <div className="text-[8px] font-black px-1 py-0.2 rounded-sm bg-indigo-950 text-indigo-300 border border-indigo-500/50 flex items-center gap-1">
                <span>{p2Partner.avatar}</span>
                <span className="hidden sm:inline">{p2Partner.name.split(' ')[0]}</span>
              </div>
              <div className="flex-1 h-1.5 bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden p-0.2 relative">
                <motion.div
                  className="h-full bg-gradient-to-l from-indigo-500 to-blue-400 ml-auto"
                  animate={{ width: `${Math.max(0, p2PartnerHealth)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[8px] font-mono text-indigo-300 font-bold">
                {Math.round(p2PartnerHealth)}%
              </span>
            </div>
          )}

          {/* Floating Damage Popup for P2 */}
          <AnimatePresence>
            {p2DamagePopup !== null && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.7 }}
                animate={{ opacity: 1, y: -15, scale: 1.15 }}
                exit={{ opacity: 0, y: -28 }}
                transition={{ duration: 0.6 }}
                className="text-red-400 font-black italic text-sm sm:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wider mt-0.5 mr-1"
              >
                -{Math.round(p2DamagePopup)} DMG
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tekken 8 Heat Gauge */}
          <div className="w-full flex items-center gap-1.5 mt-1 skew-x-[12deg] flex-row-reverse">
            <div
              className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 ${
                p2.isHeatActive
                  ? 'bg-cyan-400 text-neutral-950 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-pulse'
                  : 'bg-neutral-800 text-neutral-500'
              }`}
            >
              <Zap size={10} />
              <span>HEAT</span>
            </div>
            <div className="flex-1 h-2 sm:h-2.5 bg-neutral-950 border border-neutral-700 rounded-sm overflow-hidden p-0.2 relative">
              <motion.div
                className={`h-full ml-auto ${
                  p2.isHeatActive
                    ? 'bg-gradient-to-l from-cyan-400 via-sky-300 to-blue-500 shadow-[0_0_10px_#38bdf8]'
                    : 'bg-cyan-700/60'
                }`}
                animate={{ width: `${Math.max(0, p2.heatGauge)}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>

          {/* Round Won Indicators */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-row-reverse">
            {Array.from({ length: maxRoundsToWin }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-all ${
                  i < p2.roundsWon
                    ? 'bg-yellow-400 border-yellow-200 shadow-[0_0_10px_#facc15] scale-110'
                    : 'bg-neutral-900 border-neutral-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CENTER DYNAMIC COMBO COUNTER & ANNOUNCEMENT BANNER */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-auto">
        {/* Dynamic Scaling Glow Combo Counter (Left-Center) */}
        <AnimatePresence>
          {comboCount >= 2 && comboGrade && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, x: -60 }}
              animate={{ scale: [1.2, 1], opacity: 1, x: 0 }}
              exit={{ scale: 0.7, opacity: 0, x: -40 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="absolute left-4 sm:left-12 top-1/2 -translate-y-1/2 flex flex-col items-start select-none z-30"
            >
              {/* Dynamic Tier Badge */}
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-black bg-gradient-to-r ${comboGrade.color} text-neutral-950 shadow-lg tracking-wider`}
                >
                  GRADE {comboGrade.grade}
                </span>
                <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-amber-300 drop-shadow">
                  {comboGrade.label}
                </span>
              </div>

              {/* Glowing Scaled Hits Counter */}
              <div className="flex items-baseline gap-2">
                <motion.span
                  key={comboCount}
                  initial={{ scale: 1.4, rotate: -4 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-5xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-red-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.9)]"
                >
                  {comboCount}
                </motion.span>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-3xl font-black italic text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                    HITS!
                  </span>
                  <span className="text-xs sm:text-sm font-black font-mono text-red-400 drop-shadow">
                    {Math.round(comboDamage)} DAMAGE
                  </span>
                </div>
              </div>

              {/* Combo Meter Bar */}
              <div className="w-28 sm:w-36 h-1.5 bg-neutral-900/80 rounded-full overflow-hidden border border-amber-500/40 mt-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-600"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 1.3, ease: 'linear' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fight Announcements (ROUND 1, FIGHT, KO, YOU WIN, etc.) */}
        <AnimatePresence>
          {announcementText && (
            <motion.div
              initial={{ scale: 2.2, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              onClick={onForceStartRound}
              className="text-center z-30 pointer-events-auto cursor-pointer flex flex-col items-center group"
              title="Click to start fight immediately"
            >
              {announcementText.includes('WIN') || announcementText.includes('PERFECT') || announcementText.includes('K.O.') ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="mb-2 p-2 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.6)]"
                >
                  <Award size={28} />
                </motion.div>
              ) : null}

              <h2 className="text-4xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-red-600 drop-shadow-[0_0_40px_rgba(245,158,11,0.95)] uppercase">
                {announcementText}
              </h2>
              {announcementSub && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-2 mt-1.5 px-4 py-1 rounded-full bg-black/60 border border-amber-400/40 backdrop-blur-md"
                >
                  <Sparkles size={16} className="text-amber-300 animate-spin" />
                  <p className="text-xs sm:text-lg font-black tracking-widest text-amber-200 uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    {announcementSub}
                  </p>
                  <Sparkles size={16} className="text-amber-300 animate-spin" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM COMBAT CONTROLS & COMMAND INTERFACE */}
      <div className="w-full flex items-end justify-between gap-2 sm:gap-6 relative z-30 pointer-events-auto">
        {/* Left Side: Directional Movement & Sidesteps */}
        <div className="flex flex-col gap-2">
          {/* Input Notation Display Stream */}
          {recentInputs.length > 0 && (
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-neutral-800 self-start">
              <span className="text-[9px] font-mono text-neutral-400 uppercase">INPUT:</span>
              <div className="flex items-center gap-1">
                {recentInputs.slice(-6).map((inp, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[10px] font-black text-amber-300 font-mono"
                  >
                    {inp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* D-Pad / Movement & Sidestep Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPlayerInput('sidestep_left')}
              className="px-2.5 sm:px-3 py-2 bg-neutral-900/95 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-700 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95 flex items-center gap-1"
            >
              <span>↖ STEP L</span>
            </button>
            <button
              onClick={() => onPlayerInput('parry')}
              className="px-3 sm:px-4 py-2 bg-blue-900/80 hover:bg-blue-800 active:bg-blue-700 border border-blue-400/60 rounded-xl text-xs sm:text-sm font-black text-blue-200 shadow-lg transition active:scale-95 flex items-center gap-1"
            >
              <Shield size={14} />
              <span>GUARD (S)</span>
            </button>
            <button
              onClick={() => onPlayerInput('sidestep_right')}
              className="px-2.5 sm:px-3 py-2 bg-neutral-900/95 hover:bg-neutral-800 active:bg-neutral-700 border border-neutral-700 rounded-xl text-xs font-bold text-white shadow-lg transition active:scale-95 flex items-center gap-1"
            >
              <span>STEP R ↘</span>
            </button>

            {/* Tag Switch Button (Available in Tag Team Mode) */}
            {teamMode === 'tag' && p1Partner && (
              <button
                onClick={() => onPlayerInput('tag_switch')}
                disabled={!canTagP1}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition active:scale-95 shadow-lg ${
                  canTagP1
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-300 hover:brightness-110 animate-pulse'
                    : 'bg-neutral-900 border border-purple-900/60 text-purple-400/80 cursor-not-allowed'
                }`}
              >
                <RefreshCw size={14} className={canTagP1 ? 'animate-spin' : ''} />
                <span>
                  {canTagP1 ? 'TAG [T]' : `TAG COOLDOWN (${tagCooldownRemaining}s)`}
                </span>
              </button>
            )}
          </div>

          <div className="text-[10px] text-neutral-400 font-semibold pl-1 hidden sm:block">
            Keys: <span className="text-amber-300 font-mono">A/D</span> Move, <span className="text-amber-300 font-mono">S</span> Guard, <span className="text-amber-300 font-mono">J/I/K/L</span> Attacks, <span className="text-amber-300 font-mono">H</span> Heat, <span className="text-amber-300 font-mono">U</span> Rage Art{teamMode === 'tag' ? ', T Tag' : ''}
          </div>
        </div>

        {/* Right Side: 4 Attack Buttons + Heat / Rage Art */}
        <div className="flex flex-col items-end gap-1.5 sm:gap-2">
          {/* Top Row Specials: Heat Burst / Heat Smash & Rage Art */}
          <div className="flex items-center gap-2">
            {/* Heat Action Button */}
            <button
              onClick={() => {
                if (p1.isHeatActive) {
                  onPlayerInput('heat_smash');
                } else if (p1.heatGauge > 0) {
                  onPlayerInput('heat_burst');
                }
              }}
              disabled={!p1.isHeatActive && p1.heatGauge <= 0}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-sm font-black flex items-center gap-1.5 transition active:scale-95 shadow-xl ${
                p1.isHeatActive
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-neutral-950 border-2 border-white animate-pulse'
                  : p1.heatGauge > 0
                  ? 'bg-cyan-950 border border-cyan-400/80 text-cyan-200 hover:brightness-110'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Zap size={14} />
              <span>{p1.isHeatActive ? 'HEAT SMASH [H]' : 'HEAT BURST (1+2) [H]'}</span>
            </button>

            {/* Rage Art Button */}
            <button
              onClick={() => onPlayerInput('rage_art')}
              disabled={!p1.isRageActive}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-sm font-black flex items-center gap-1.5 transition active:scale-95 shadow-xl ${
                p1.isRageActive
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white border-2 border-yellow-300 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Flame size={14} />
              <span>RAGE ART (3+4) [U]</span>
            </button>
          </div>

          {/* Core 4 Tekken Buttons (1, 2, 3, 4) & Throw */}
          <div className="grid grid-cols-5 gap-1 sm:gap-2">
            {/* 1: Left Punch (J) */}
            <button
              onClick={() => onPlayerInput('lp')}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-neutral-900/95 hover:bg-neutral-800 active:bg-pink-600 border-2 border-pink-400 text-pink-300 shadow-xl flex flex-col items-center justify-center transition active:scale-90 font-black"
            >
              <span className="text-xs sm:text-base leading-none">1</span>
              <span className="text-[8px] sm:text-[9px] opacity-70">LP [J]</span>
            </button>

            {/* 2: Right Punch (I) */}
            <button
              onClick={() => onPlayerInput('rp')}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-neutral-900/95 hover:bg-neutral-800 active:bg-yellow-500 border-2 border-yellow-400 text-yellow-300 shadow-xl flex flex-col items-center justify-center transition active:scale-90 font-black"
            >
              <span className="text-xs sm:text-base leading-none">2</span>
              <span className="text-[8px] sm:text-[9px] opacity-70">RP [I]</span>
            </button>

            {/* 3: Left Kick (K) */}
            <button
              onClick={() => onPlayerInput('lk')}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-neutral-900/95 hover:bg-neutral-800 active:bg-cyan-500 border-2 border-cyan-400 text-cyan-300 shadow-xl flex flex-col items-center justify-center transition active:scale-90 font-black"
            >
              <span className="text-xs sm:text-base leading-none">3</span>
              <span className="text-[8px] sm:text-[9px] opacity-70">LK [K]</span>
            </button>

            {/* 4: Right Kick / Launcher (L) */}
            <button
              onClick={() => onPlayerInput('rk')}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-neutral-900/95 hover:bg-neutral-800 active:bg-red-500 border-2 border-red-400 text-red-300 shadow-xl flex flex-col items-center justify-center transition active:scale-90 font-black"
            >
              <span className="text-xs sm:text-base leading-none">4</span>
              <span className="text-[8px] sm:text-[9px] opacity-70">RK [L]</span>
            </button>

            {/* Throw (1+3) */}
            <button
              onClick={() => onPlayerInput('throw')}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-neutral-900/95 hover:bg-neutral-800 active:bg-amber-600 border-2 border-amber-400 text-amber-300 shadow-xl flex flex-col items-center justify-center transition active:scale-90 font-black"
            >
              <Crosshair size={14} className="sm:w-4 sm:h-4" />
              <span className="text-[8px] sm:text-[9px] opacity-70">THROW</span>
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
