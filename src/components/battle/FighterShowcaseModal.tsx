import React, { useState } from 'react';
import { User, X, Shield, Zap, Swords, Award, Flame, Star, BookOpen } from 'lucide-react';
import { FIGHTER_ROSTER, FighterArchetype } from './FightingTypes';
import { useAudio } from '../../hooks/useAudio';

interface FighterShowcaseModalProps {
  onClose: () => void;
}

export default function FighterShowcaseModal({ onClose }: FighterShowcaseModalProps) {
  const { playSound } = useAudio();
  const [selectedFighter, setSelectedFighter] = useState<FighterArchetype>(FIGHTER_ROSTER[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-neutral-950 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col text-white font-sans overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 tracking-wide uppercase font-['Bangers']">
                MARVEL FIGHTER ROSTER & MOVE DATABASE
              </h2>
              <p className="text-xs text-neutral-400">Inspect character archetypes, stats, and complete Tekken move lists</p>
            </div>
          </div>
          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
          {/* Left: Fighter List (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-2 overflow-y-auto pr-2 max-h-[60vh] lg:max-h-none">
            {FIGHTER_ROSTER.map((fighter) => {
              const isSelected = selectedFighter.id === fighter.id;
              return (
                <button
                  key={fighter.id}
                  onClick={() => { playSound('click'); setSelectedFighter(fighter); }}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/60 via-neutral-900 to-neutral-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-neutral-900/50 hover:bg-neutral-900 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-black/60 border border-neutral-700 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                    {fighter.avatar}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-white truncate">{fighter.name}</span>
                    <span className="text-[10px] text-amber-300 truncate">{fighter.alias}</span>
                    <span className="text-[10px] text-neutral-400 truncate">{fighter.style}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Fighter Details & Move List (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4 overflow-y-auto pr-1 max-h-[60vh] lg:max-h-none bg-neutral-900/40 p-5 rounded-2xl border border-neutral-800">
            {/* Fighter Bio Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-neutral-950 border-2 border-amber-500/50 flex items-center justify-center text-4xl shadow-xl">
                  {selectedFighter.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">{selectedFighter.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-amber-300 border border-neutral-700">
                      {selectedFighter.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-amber-400 italic">"{selectedFighter.title}"</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{selectedFighter.style} • {selectedFighter.country}</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-center">
                <div className="text-[9px] text-neutral-500 font-bold">POWER</div>
                <div className="text-base font-black text-red-400">{selectedFighter.stats.power}</div>
              </div>
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-center">
                <div className="text-[9px] text-neutral-500 font-bold">SPEED</div>
                <div className="text-base font-black text-cyan-400">{selectedFighter.stats.speed}</div>
              </div>
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-center">
                <div className="text-[9px] text-neutral-500 font-bold">REACH</div>
                <div className="text-base font-black text-amber-400">{selectedFighter.stats.reach}</div>
              </div>
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-center">
                <div className="text-[9px] text-neutral-500 font-bold">JUGGLE</div>
                <div className="text-base font-black text-emerald-400">{selectedFighter.stats.juggle}</div>
              </div>
              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-center col-span-2 sm:col-span-1">
                <div className="text-[9px] text-neutral-500 font-bold">DEFENSE</div>
                <div className="text-base font-black text-purple-400">{selectedFighter.stats.defense}</div>
              </div>
            </div>

            {/* Quotes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 font-bold block mb-1">INTRO QUOTE</span>
                <p className="text-neutral-300 italic">"{selectedFighter.introQuote}"</p>
              </div>
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-500 font-bold block mb-1">WIN QUOTE</span>
                <p className="text-neutral-300 italic">"{selectedFighter.winQuote}"</p>
              </div>
            </div>

            {/* Moves & Frame Data Database */}
            <div>
              <h4 className="text-xs font-black uppercase text-neutral-400 tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen size={14} className="text-amber-400" />
                <span>Tekken Move List & Frame Data</span>
              </h4>
              <div className="space-y-2">
                {selectedFighter.moves.map((move) => (
                  <div key={move.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{move.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-amber-300 border border-neutral-700">
                          {move.command}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          move.type === 'rage' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                          move.type === 'special' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                          'bg-neutral-800 text-neutral-300'
                        }`}>
                          {move.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1">{move.description}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-[9px] text-neutral-500 font-bold">DMG</div>
                        <div className="font-black text-red-400">{move.damage}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-neutral-500 font-bold">FRAME</div>
                        <div className="font-black text-cyan-400">{move.blockAdvantage >= 0 ? `+${move.blockAdvantage}` : move.blockAdvantage}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 mt-4 flex justify-between items-center text-xs text-neutral-500">
          <span>Tekken 8 Frame Data & Roster Database</span>
          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 font-black hover:brightness-110 transition shadow-lg"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
