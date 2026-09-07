import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Zap, Shield, Sparkles, Swords, Heart, Trophy, Crown, Star } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface BattleHUDProps {
  p1Health: number;
  p2Health: number;
  p1Name?: string;
  p2Name?: string;
  combo: number;
  ultGauge: number;
  p1Avatar?: string;
  p2Avatar?: string;
  comboDamage?: number;
  maxHealth?: number;
  p1RankName?: string;
  p2RankName?: string;
}

// Combo grade definitions
interface ComboTierInfo {
  tierName: string;
  grade: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  scaleMultiplier: number;
  glowClass: string;
  textGradient: string;
  borderGlow: string;
  bonusDmgPercent: number;
  badgeBg: string;
}

const getComboTierInfo = (hits: number): ComboTierInfo => {
  if (hits >= 30) {
    return {
      tierName: 'GODLIKE ULTRA DISMANTLE',
      grade: 'SSS',
      scaleMultiplier: 1.6,
      glowClass: 'drop-shadow-[0_0_35px_rgba(250,204,21,1)] animate-pulse',
      textGradient: 'from-amber-200 via-pink-400 to-yellow-300',
      borderGlow: 'border-yellow-300 shadow-[0_0_30px_rgba(234,179,8,0.9)]',
      bonusDmgPercent: 60,
      badgeBg: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 text-neutral-950',
    };
  }
  if (hits >= 20) {
    return {
      tierName: 'INCREDIBLE SUPREME FINISH',
      grade: 'SS',
      scaleMultiplier: 1.45,
      glowClass: 'drop-shadow-[0_0_30px_rgba(244,63,94,0.95)]',
      textGradient: 'from-purple-300 via-rose-400 to-amber-300',
      borderGlow: 'border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.8)]',
      bonusDmgPercent: 45,
      badgeBg: 'bg-gradient-to-r from-purple-500 to-rose-500 text-white',
    };
  }
  if (hits >= 15) {
    return {
      tierName: 'MARVELOUS ASSAULT',
      grade: 'S',
      scaleMultiplier: 1.35,
      glowClass: 'drop-shadow-[0_0_25px_rgba(239,68,68,0.9)]',
      textGradient: 'from-red-400 via-amber-300 to-yellow-200',
      borderGlow: 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.75)]',
      bonusDmgPercent: 35,
      badgeBg: 'bg-gradient-to-r from-red-600 to-amber-500 text-white',
    };
  }
  if (hits >= 10) {
    return {
      tierName: 'SUPERB HYPER COMBO',
      grade: 'A',
      scaleMultiplier: 1.25,
      glowClass: 'drop-shadow-[0_0_20px_rgba(249,115,22,0.85)]',
      textGradient: 'from-orange-400 via-amber-300 to-yellow-300',
      borderGlow: 'border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.7)]',
      bonusDmgPercent: 25,
      badgeBg: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-neutral-950',
    };
  }
  if (hits >= 5) {
    return {
      tierName: 'GREAT STRIKE',
      grade: 'B',
      scaleMultiplier: 1.15,
      glowClass: 'drop-shadow-[0_0_15px_rgba(234,179,8,0.75)]',
      textGradient: 'from-yellow-300 via-amber-400 to-orange-400',
      borderGlow: 'border-amber-400 shadow-[0_0_12px_rgba(234,179,8,0.6)]',
      bonusDmgPercent: 15,
      badgeBg: 'bg-amber-400 text-neutral-950',
    };
  }
  if (hits >= 3) {
    return {
      tierName: 'GOOD RUSH',
      grade: 'C',
      scaleMultiplier: 1.05,
      glowClass: 'drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]',
      textGradient: 'from-yellow-200 to-amber-400',
      borderGlow: 'border-yellow-400/80 shadow-[0_0_8px_rgba(250,204,21,0.4)]',
      bonusDmgPercent: 8,
      badgeBg: 'bg-yellow-300 text-neutral-950',
    };
  }
  return {
    tierName: 'COMBAT CHAIN',
    grade: 'D',
    scaleMultiplier: 1.0,
    glowClass: 'drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]',
    textGradient: 'from-neutral-100 to-amber-200',
    borderGlow: 'border-neutral-500',
    bonusDmgPercent: 0,
    badgeBg: 'bg-neutral-700 text-neutral-200',
  };
};

export default function BattleHUD({
  p1Health,
  p2Health,
  p1Name = 'SPIDER-MAN',
  p2Name = 'ENEMY FIGHTER',
  combo,
  ultGauge,
  p1Avatar = '🕷️',
  p2Avatar = '🦹',
  comboDamage = 0,
  maxHealth = 100,
  p1RankName,
  p2RankName,
}: BattleHUDProps) {
  const { playSound } = useAudio();

  // Smooth shrinking red damage trails
  const [p1TrailHealth, setP1TrailHealth] = useState(p1Health);
  const [p2TrailHealth, setP2TrailHealth] = useState(p2Health);

  // White flash state on hit
  const [p1HitFlash, setP1HitFlash] = useState(false);
  const [p2HitFlash, setP2HitFlash] = useState(false);

  // Floating damage numbers
  const [p1DamagePopup, setP1DamagePopup] = useState<number | null>(null);
  const [p2DamagePopup, setP2DamagePopup] = useState<number | null>(null);

  // Dynamic Combo Hit Impact Pulse
  const [comboPulseKey, setComboPulseKey] = useState(0);

  const prevP1Health = useRef(p1Health);
  const prevP2Health = useRef(p2Health);
  const p1TrailTimeout = useRef<number | null>(null);
  const p2TrailTimeout = useRef<number | null>(null);

  // Combo tier information
  const tierInfo = getComboTierInfo(combo);

  // Trigger combo pulse animation whenever combo increases
  useEffect(() => {
    if (combo > 0) {
      setComboPulseKey((k) => k + 1);
      if (combo === 5 || combo === 10 || combo === 20) {
        playSound('rankup');
      }
    }
  }, [combo, playSound]);

  // P1 Damage detection & smooth trail shrink
  useEffect(() => {
    if (p1Health < prevP1Health.current) {
      const damage = prevP1Health.current - p1Health;
      setP1HitFlash(true);
      setP1DamagePopup(damage);
      if (damage >= 25) {
        playSound('impact_heavy');
      } else {
        playSound('impact_light');
      }
      setTimeout(() => setP1HitFlash(false), 200);
      setTimeout(() => setP1DamagePopup(null), 900);

      if (p1TrailTimeout.current) clearTimeout(p1TrailTimeout.current);
      // Wait 350ms before smoothly shrinking the damage trail bar
      p1TrailTimeout.current = window.setTimeout(() => {
        setP1TrailHealth(p1Health);
      }, 350);
    } else if (p1Health > prevP1Health.current) {
      // Immediate heal
      setP1TrailHealth(p1Health);
    }
    prevP1Health.current = p1Health;
  }, [p1Health, playSound]);

  // P2 Damage detection & smooth trail shrink
  useEffect(() => {
    if (p2Health < prevP2Health.current) {
      const damage = prevP2Health.current - p2Health;
      setP2HitFlash(true);
      setP2DamagePopup(damage);
      if (damage >= 25) {
        playSound('impact_heavy');
      } else {
        playSound('impact_light');
      }
      setTimeout(() => setP2HitFlash(false), 200);
      setTimeout(() => setP2DamagePopup(null), 900);

      if (p2TrailTimeout.current) clearTimeout(p2TrailTimeout.current);
      // Wait 350ms before smoothly shrinking the damage trail bar
      p2TrailTimeout.current = window.setTimeout(() => {
        setP2TrailHealth(p2Health);
      }, 350);
    } else if (p2Health > prevP2Health.current) {
      // Immediate heal
      setP2TrailHealth(p2Health);
    }
    prevP2Health.current = p2Health;
  }, [p2Health, playSound]);

  return (
    <div className="absolute top-0 left-0 w-full p-3 sm:p-6 flex flex-col justify-between items-center font-sans text-white pointer-events-none select-none z-30">
      {/* Top Combat Header with Health Meters */}
      <div className="w-full flex items-start justify-between gap-2 sm:gap-4 max-w-6xl">
        {/* PLAYER 1 HEALTH CONTAINER (LEFT) */}
        <div className="w-5/12 flex flex-col items-start">
          {/* Fighter Name & Badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-2xl drop-shadow-md">{p1Avatar}</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-lg font-black italic tracking-wider text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {p1Name}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white shadow">
                  P1
                </span>
                {p1RankName && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950 shadow">
                    {p1RankName}
                  </span>
                )}
              </div>
              <div className="text-[10px] sm:text-[11px] font-mono font-bold text-neutral-300">
                {Math.max(0, Math.round(p1Health))} / {maxHealth} HP
              </div>
            </div>
          </div>

          {/* Angled Health Bar Frame */}
          <div className="w-full h-6 sm:h-8 bg-neutral-950 border-2 border-neutral-700/90 rounded-sm overflow-hidden p-0.5 relative shadow-[0_8px_20px_rgba(0,0,0,0.8)] skew-x-[-12deg]">
            {/* Background Base */}
            <div className="absolute inset-0.5 bg-neutral-900" />

            {/* Segment Notch Guides (25%, 50%, 75%) */}
            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-20 opacity-30">
              <div className="w-0.5 h-full bg-black ml-[25%]" />
              <div className="w-0.5 h-full bg-black ml-[25%]" />
              <div className="w-0.5 h-full bg-black ml-[25%]" />
            </div>

            {/* Smooth Red Damage Trailing Bar (Delays then shrinks smoothly) */}
            <motion.div
              className="absolute top-0.5 bottom-0.5 left-0.5 bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
              animate={{ width: `${Math.max(0, (p1TrailHealth / maxHealth) * 100)}%` }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Main Swift Current Health Bar */}
            <motion.div
              className={`h-full relative shadow-md ${
                p1Health <= 25
                  ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 animate-pulse'
                  : p1Health <= 50
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300'
                  : 'bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300'
              }`}
              animate={{ width: `${Math.max(0, (p1Health / maxHealth) * 100)}%` }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
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

              {/* Danger / Low Health Flame Icon */}
              {p1Health <= 25 && p1Health > 0 && (
                <div className="absolute right-1 top-0 bottom-0 flex items-center">
                  <Flame size={14} className="text-white animate-bounce" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Floating Damage Popup */}
          <AnimatePresence>
            {p1DamagePopup !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.6 }}
                animate={{ opacity: 1, y: -20, scale: 1.2 }}
                exit={{ opacity: 0, y: -35 }}
                transition={{ duration: 0.6 }}
                className="text-red-400 font-black italic text-base sm:text-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,1)] tracking-wider mt-1"
              >
                -{Math.round(p1DamagePopup)} DMG
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* VS EMBLEM / CENTER BADGE */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-neutral-950 border-2 border-amber-500/80 flex items-center justify-center text-amber-300 font-black italic text-xs sm:text-base shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            VS
          </div>
        </div>

        {/* PLAYER 2 / OPPONENT HEALTH CONTAINER (RIGHT) */}
        <div className="w-5/12 flex flex-col items-end">
          {/* Fighter Name & Badge */}
          <div className="flex items-center gap-2 mb-1.5 flex-row-reverse">
            <span className="text-2xl drop-shadow-md">{p2Avatar}</span>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 flex-row-reverse">
                <span className="text-sm sm:text-lg font-black italic tracking-wider text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {p2Name}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shadow">
                  P2
                </span>
                {p2RankName && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-400 text-neutral-950 shadow">
                    {p2RankName}
                  </span>
                )}
              </div>
              <div className="text-[10px] sm:text-[11px] font-mono font-bold text-neutral-300">
                {Math.max(0, Math.round(p2Health))} / {maxHealth} HP
              </div>
            </div>
          </div>

          {/* Angled Health Bar Frame (Skewed right) */}
          <div className="w-full h-6 sm:h-8 bg-neutral-950 border-2 border-neutral-700/90 rounded-sm overflow-hidden p-0.5 relative shadow-[0_8px_20px_rgba(0,0,0,0.8)] skew-x-[12deg]">
            {/* Background Base */}
            <div className="absolute inset-0.5 bg-neutral-900" />

            {/* Segment Notch Guides (25%, 50%, 75%) */}
            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-20 opacity-30">
              <div className="w-0.5 h-full bg-black ml-[25%]" />
              <div className="w-0.5 h-full bg-black ml-[25%]" />
              <div className="w-0.5 h-full bg-black ml-[25%]" />
            </div>

            {/* Smooth Red Damage Trailing Bar (Right-aligned, delays then shrinks smoothly) */}
            <motion.div
              className="absolute top-0.5 bottom-0.5 right-0.5 bg-gradient-to-l from-red-700 via-rose-600 to-amber-600 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
              animate={{ width: `${Math.max(0, (p2TrailHealth / maxHealth) * 100)}%` }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Main Swift Current Health Bar */}
            <motion.div
              className={`h-full ml-auto relative shadow-md ${
                p2Health <= 25
                  ? 'bg-gradient-to-l from-red-600 via-rose-500 to-amber-400 animate-pulse'
                  : p2Health <= 50
                  ? 'bg-gradient-to-l from-amber-500 via-yellow-400 to-amber-300'
                  : 'bg-gradient-to-l from-emerald-500 via-green-400 to-lime-300'
              }`}
              animate={{ width: `${Math.max(0, (p2Health / maxHealth) * 100)}%` }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
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

              {/* Danger / Low Health Flame Icon */}
              {p2Health <= 25 && p2Health > 0 && (
                <div className="absolute left-1 top-0 bottom-0 flex items-center">
                  <Flame size={14} className="text-white animate-bounce" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Floating Damage Popup */}
          <AnimatePresence>
            {p2DamagePopup !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.6 }}
                animate={{ opacity: 1, y: -20, scale: 1.2 }}
                exit={{ opacity: 0, y: -35 }}
                transition={{ duration: 0.6 }}
                className="text-amber-300 font-black italic text-base sm:text-2xl drop-shadow-[0_2px_6px_rgba(0,0,0,1)] tracking-wider mt-1"
              >
                -{Math.round(p2DamagePopup)} DMG
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* DYNAMIC SCALING & GLOWING COMBO COUNTER */}
      <AnimatePresence>
        {combo > 0 && (
          <motion.div
            key={comboPulseKey}
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{
              opacity: 1,
              scale: [tierInfo.scaleMultiplier * 1.35, tierInfo.scaleMultiplier],
              rotate: [combo % 2 === 0 ? -4 : 4, 0],
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.7, y: -15 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 18,
              mass: 0.8,
            }}
            className="flex flex-col items-center justify-center my-4 sm:my-6 relative z-40"
          >
            {/* Ambient Radial Aura Glow behind the combo */}
            <div
              className={`absolute -inset-6 rounded-full blur-2xl opacity-70 pointer-events-none transition-all duration-300 ${
                combo >= 20
                  ? 'bg-gradient-to-r from-yellow-500 via-rose-500 to-purple-600 animate-pulse'
                  : combo >= 10
                  ? 'bg-gradient-to-r from-amber-500 to-red-600'
                  : 'bg-yellow-500/40'
              }`}
            />

            {/* Top Grade Badge & Burst Particles */}
            <div className="flex items-center gap-2 mb-1 z-10">
              <span
                className={`px-3 py-0.5 rounded-full font-black text-xs sm:text-sm tracking-widest uppercase shadow-lg flex items-center gap-1.5 ${tierInfo.badgeBg}`}
              >
                {combo >= 20 && <Crown size={15} className="animate-bounce" />}
                {combo >= 10 && combo < 20 && <Flame size={15} className="text-amber-200" />}
                <span>GRADE {tierInfo.grade}</span>
              </span>

              {tierInfo.bonusDmgPercent > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/90 text-white font-mono font-black text-[10px] sm:text-xs shadow border border-red-400/80 animate-pulse">
                  +{tierInfo.bonusDmgPercent}% DMG SCALING
                </span>
              )}
            </div>

            {/* Massive Glowing Hit Counter Text */}
            <div
              className={`text-5xl sm:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${tierInfo.textGradient} ${tierInfo.glowClass} z-10 flex items-baseline gap-2`}
            >
              <span className="font-mono text-white drop-shadow-[0_4px_12px_rgba(0,0,0,1)]">
                {combo}
              </span>
              <span className="text-3xl sm:text-5xl">HITS!</span>
            </div>

            {/* Dynamic Tier Title & Total Damage Accumulator */}
            <div
              className={`flex items-center gap-2 mt-1 px-4 py-1 rounded-full bg-black/85 backdrop-blur-md border ${tierInfo.borderGlow} z-10 shadow-2xl`}
            >
              <Sparkles size={14} className="text-amber-300 animate-spin" />
              <span className="text-xs sm:text-sm font-black italic text-amber-200 tracking-wider">
                {tierInfo.tierName}
              </span>
              {comboDamage > 0 && (
                <>
                  <span className="text-neutral-500">•</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-yellow-300">
                    {Math.round(comboDamage)} TOTAL DMG
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ultimate Special Gauge (Bottom Left) */}
      <div className="fixed bottom-6 left-6 flex flex-col items-start z-30">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap
            size={14}
            className={ultGauge >= 100 ? 'text-yellow-400 animate-bounce' : 'text-neutral-400'}
          />
          <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
            {ultGauge >= 100 ? 'ULTIMATE READY' : 'SPECIAL GAUGE'}
          </span>
        </div>

        <div className="w-48 sm:w-60 h-4 bg-neutral-950 border-2 border-neutral-700 rounded-sm overflow-hidden p-0.5 relative shadow-xl">
          <motion.div
            className={`h-full rounded-sm transition-all ${
              ultGauge >= 100
                ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-100 shadow-[0_0_15px_#facc15]'
                : 'bg-gradient-to-r from-blue-600 to-cyan-400'
            }`}
            animate={{
              width: `${Math.min(100, Math.max(0, ultGauge))}%`,
              opacity: ultGauge >= 100 ? [1, 0.75, 1] : 1,
            }}
            transition={{
              width: { duration: 0.2 },
              opacity: { repeat: ultGauge >= 100 ? Infinity : 0, duration: 0.8 },
            }}
          />
        </div>
      </div>
    </div>
  );
}
