import React from 'react';
import { History, X, Trophy, Swords, Flame, Award, Clock, Shield } from 'lucide-react';
import { MatchLogEntry, getMatchHistory } from './RankedProgressionSystem';
import { useAudio } from '../../hooks/useAudio';

interface MatchHistoryModalProps {
  onClose: () => void;
}

export default function MatchHistoryModal({ onClose }: MatchHistoryModalProps) {
  const { playSound } = useAudio();
  const history: MatchLogEntry[] = getMatchHistory();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] bg-neutral-950 border-2 border-red-600 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col text-white font-sans overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/40">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-300 to-yellow-200 tracking-wide uppercase font-['Bangers']">
                MATCH HISTORY (LAST 3 MATCHES)
              </h2>
              <p className="text-xs text-neutral-400">Review your recent Ranked combat performance & match logs</p>
            </div>
          </div>
          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Match History List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {history.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-neutral-900/40 rounded-2xl border border-neutral-800">
              <Swords size={40} className="text-neutral-600 animate-pulse" />
              <div className="text-base font-bold text-neutral-300">No Ranked Matches Recorded Yet</div>
              <p className="text-xs text-neutral-500 max-w-sm">
                Complete matches in Ranked Fighting mode to record combat logs and performance stats here.
              </p>
            </div>
          ) : (
            history.map((match, idx) => {
              const dateStr = new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              return (
                <div
                  key={match.id}
                  className={`p-4 rounded-2xl border-2 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    match.isVictory
                      ? 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-950 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                      : 'bg-gradient-to-r from-rose-950/40 via-neutral-900 to-neutral-950 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                  }`}
                >
                  {/* Left: Outcome & Opponent Info */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black ${
                      match.isVictory ? 'bg-emerald-500 text-neutral-950' : 'bg-rose-600 text-white'
                    }`}>
                      {match.isVictory ? 'W' : 'L'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">vs. {match.opponentName}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-amber-300 border border-neutral-700">
                          {match.opponentRank}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                        <Clock size={12} />
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span className="capitalize">{match.gameMode} Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Score / Rounds */}
                  <div className="flex items-center gap-4 bg-black/40 px-3.5 py-2 rounded-xl border border-neutral-800 text-xs">
                    <div>
                      <div className="text-[9px] text-neutral-500 font-bold">SCORE</div>
                      <div className="font-black text-white">{match.roundsWon} - {match.roundsLost}</div>
                    </div>
                    <div className="h-6 w-[1px] bg-neutral-800" />
                    <div>
                      <div className="text-[9px] text-neutral-500 font-bold">MAX COMBO</div>
                      <div className="font-black text-cyan-400">{match.maxCombo} Hits</div>
                    </div>
                    <div className="h-6 w-[1px] bg-neutral-800" />
                    <div>
                      <div className="text-[9px] text-neutral-500 font-bold">RP CHANGE</div>
                      <div className={`font-black ${match.rpDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {match.rpDelta >= 0 ? `+${match.rpDelta}` : match.rpDelta} RP
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800 mt-4 flex justify-between items-center text-xs text-neutral-500">
          <span>Automatically saves the last 3 combat logs</span>
          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-black hover:brightness-110 transition shadow-lg"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
