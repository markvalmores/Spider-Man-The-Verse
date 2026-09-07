import React, { useState } from 'react';
import {
  BookOpen,
  Settings,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Eye,
  Shield,
  Activity,
  X,
} from 'lucide-react';
import { FighterArchetype, MoveData } from './FightingTypes';

interface PracticeModeOverlayProps {
  fighter: FighterArchetype;
  lastMoveUsed: MoveData | null;
  onResetPositions: () => void;
  dummyGuardMode: 'none' | 'guard_all' | 'counter_hit' | 'cpu';
  onChangeDummyMode: (mode: 'none' | 'guard_all' | 'counter_hit' | 'cpu') => void;
  onClosePractice?: () => void;
}

export default function PracticeModeOverlay({
  fighter,
  lastMoveUsed,
  onResetPositions,
  dummyGuardMode,
  onChangeDummyMode,
  onClosePractice,
}: PracticeModeOverlayProps) {
  const [showMoveList, setShowMoveList] = useState<boolean>(false);

  return (
    <div className="absolute top-24 left-4 z-30 pointer-events-auto flex flex-col gap-2 max-w-xs font-sans">
      {/* Mini Frame Data & Dummy Control Panel */}
      <div className="p-3 bg-neutral-950/90 border border-neutral-700/80 rounded-2xl shadow-2xl backdrop-blur-md text-white text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2">
          <div className="flex items-center gap-1.5 font-black text-amber-400">
            <Activity size={14} />
            <span>PRACTICE / DOJO INFO</span>
          </div>
          <button
            onClick={onResetPositions}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
            title="Reset Positions"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Live Move Frame Data */}
        <div className="mb-3 space-y-1">
          <div className="text-[10px] text-neutral-400 font-bold uppercase">Active Attack Frame Data</div>
          {lastMoveUsed ? (
            <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-white">{lastMoveUsed.name}</span>
                <span className="text-amber-300 font-mono">{lastMoveUsed.command}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] pt-1">
                <div className="p-1 bg-black/40 rounded text-center">
                  <div className="text-neutral-500">DAMAGE</div>
                  <div className="font-bold text-red-400">{lastMoveUsed.damage}</div>
                </div>
                <div className="p-1 bg-black/40 rounded text-center">
                  <div className="text-neutral-500">HIT STUN</div>
                  <div className="font-bold text-cyan-400">+{lastMoveUsed.hitStun}f</div>
                </div>
                <div className="p-1 bg-black/40 rounded text-center">
                  <div className="text-neutral-500">ON BLOCK</div>
                  <div
                    className={`font-bold ${
                      lastMoveUsed.blockAdvantage >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {lastMoveUsed.blockAdvantage >= 0 ? `+${lastMoveUsed.blockAdvantage}` : lastMoveUsed.blockAdvantage}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-neutral-900/50 rounded-xl text-[11px] text-neutral-500 italic text-center">
              Execute any attack to inspect frame data
            </div>
          )}
        </div>

        {/* Dummy AI Reaction Mode Toggle */}
        <div className="mb-2">
          <div className="text-[10px] text-neutral-400 font-bold uppercase mb-1">Dummy Guard Setting</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onChangeDummyMode('none')}
              className={`p-1.5 rounded-lg text-[10px] font-bold border transition ${
                dummyGuardMode === 'none'
                  ? 'bg-amber-500 border-yellow-300 text-neutral-950 shadow'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              Stand / No Guard
            </button>
            <button
              onClick={() => onChangeDummyMode('guard_all')}
              className={`p-1.5 rounded-lg text-[10px] font-bold border transition ${
                dummyGuardMode === 'guard_all'
                  ? 'bg-blue-600 border-blue-400 text-white shadow'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              Guard All Hits
            </button>
            <button
              onClick={() => onChangeDummyMode('counter_hit')}
              className={`p-1.5 rounded-lg text-[10px] font-bold border transition ${
                dummyGuardMode === 'counter_hit'
                  ? 'bg-red-600 border-red-400 text-white shadow'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              Counter-Hit State
            </button>
            <button
              onClick={() => onChangeDummyMode('cpu')}
              className={`p-1.5 rounded-lg text-[10px] font-bold border transition ${
                dummyGuardMode === 'cpu'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              CPU Sparring AI
            </button>
          </div>
        </div>

        {/* View Move List Button */}
        <button
          onClick={() => setShowMoveList(true)}
          className="w-full py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold flex items-center justify-center gap-1 text-neutral-200 transition"
        >
          <BookOpen size={13} />
          <span>View Command Move List</span>
        </button>
      </div>

      {/* Full Move List Command Modal */}
      {showMoveList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[85vh] bg-neutral-950 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl flex flex-col text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{fighter.avatar}</span>
                <div>
                  <h3 className="text-xl font-black text-amber-300">{fighter.name} Move List</h3>
                  <span className="text-xs text-neutral-400">{fighter.style}</span>
                </div>
              </div>
              <button
                onClick={() => setShowMoveList(false)}
                className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {fighter.moves.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{m.name}</span>
                      {m.isLauncher && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-neutral-950">
                          LAUNCHER
                        </span>
                      )}
                      {m.isHeatEngager && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-400 text-neutral-950">
                          HEAT ENGAGER
                        </span>
                      )}
                      {m.type === 'rage' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-red-600 text-white">
                          RAGE ART
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400">{m.description}</span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-700 font-mono font-black text-amber-300 text-xs">
                      {m.command}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-1">{m.damage} DMG</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
