import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Trophy, Shield, Pizza, Zap, Star, RefreshCw } from 'lucide-react';

export interface LeaderboardPlayer {
  userId: string;
  displayName: string;
  score: number;
  pizzas: number;
  missions: number;
  heroKarma: number;
  suit: string;
  updatedAt?: number;
}

interface LeaderboardProps {
  onClose?: () => void;
}

export default function Leaderboard({ onClose }: LeaderboardProps) {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSort, setActiveSort] = useState<'score' | 'pizzas' | 'missions'>('score');

  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'leaderboard'),
      orderBy(activeSort, 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: LeaderboardPlayer[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as LeaderboardPlayer);
        });
        setPlayers(list);
        setLoading(false);
      },
      (error) => {
        console.error('Leaderboard realtime sync error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeSort]);

  return (
    <div className="bg-neutral-900/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-neutral-700/80 w-full max-w-3xl text-white shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg">
            <Trophy size={28} className="text-neutral-950" />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 font-['Bangers'] tracking-wider">
              REALTIME FIRESTORE LEADERBOARD
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-sans mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-400 font-semibold">LIVE FIRESTORE DATABASE STREAM</span>
              <span>•</span>
              <span>Top Heroes in Manhattan</span>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl font-['Bangers'] tracking-wider text-base text-neutral-300 border border-neutral-700 transition"
          >
            Close
          </button>
        )}
      </div>

      {/* Sorting Tabs */}
      <div className="flex items-center gap-2 mb-5 font-['Bangers'] tracking-wider text-sm sm:text-base flex-wrap">
        <button
          onClick={() => setActiveSort('score')}
          className={`px-4 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
            activeSort === 'score'
              ? 'bg-yellow-500 text-neutral-950 font-bold border-yellow-300 shadow-md'
              : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          <Star size={16} />
          <span>TOP SCORE</span>
        </button>

        <button
          onClick={() => setActiveSort('pizzas')}
          className={`px-4 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
            activeSort === 'pizzas'
              ? 'bg-red-600 text-white font-bold border-red-400 shadow-md'
              : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          <Pizza size={16} />
          <span>PIZZA DELIVERIES</span>
        </button>

        <button
          onClick={() => setActiveSort('missions')}
          className={`px-4 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
            activeSort === 'missions'
              ? 'bg-sky-600 text-white font-bold border-sky-400 shadow-md'
              : 'bg-neutral-800/80 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
          }`}
        >
          <Shield size={16} />
          <span>CRIMES STOPPED</span>
        </button>
      </div>

      {/* Leaderboard Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <RefreshCw size={36} className="text-yellow-400 animate-spin mb-3" />
          <p className="text-neutral-400 font-['Bangers'] text-xl tracking-wider">
            SYNCHRONIZING WITH FIRESTORE...
          </p>
        </div>
      ) : players.length === 0 ? (
        /* NO PLAYERS NO LEADERBOARDS EMPTY STATE */
        <div className="py-14 px-6 bg-neutral-950/70 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center border border-neutral-700 mb-4">
            <Trophy size={32} className="text-neutral-600" />
          </div>
          <h3 className="text-2xl font-bold font-['Bangers'] tracking-wider text-neutral-300 mb-2">
            NO PLAYERS RECORDED YET
          </h3>
          <p className="text-sm text-neutral-400 max-w-md font-sans leading-relaxed mb-4">
            The city leaderboard is currently empty. No players have recorded scores in the database yet.
            Register your hero account, stop crimes, collect pizza slices, and claim Rank #1!
          </p>
          <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-300 text-xs font-semibold">
            ⚡ Be the first Spider-Hero on the global leaderboard
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {players.map((player, index) => {
            const isCurrentUser = player.userId === currentUserId;
            const rank = index + 1;

            return (
              <div
                key={player.userId || index}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition border ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-red-950/90 via-neutral-900 to-amber-950/90 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                    : rank === 1
                    ? 'bg-gradient-to-r from-yellow-950/40 to-neutral-900 border-yellow-500/50'
                    : rank === 2
                    ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 border-neutral-500/50'
                    : rank === 3
                    ? 'bg-gradient-to-r from-amber-950/30 to-neutral-900 border-amber-600/40'
                    : 'bg-neutral-800/60 border-neutral-700/60 hover:bg-neutral-800'
                }`}
              >
                {/* Left: Rank & Player Info */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 shrink-0 font-['Bangers'] text-xl sm:text-2xl">
                    {rank === 1 ? (
                      <span className="text-yellow-400 font-extrabold text-2xl drop-shadow">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-neutral-300 font-extrabold text-2xl drop-shadow">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-amber-500 font-extrabold text-2xl drop-shadow">🥉</span>
                    ) : (
                      <span className="text-neutral-500 font-bold">#{rank}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-['Bangers'] text-xl sm:text-2xl text-white tracking-wide truncate">
                        {player.displayName || 'Unknown Hero'}
                      </span>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-yellow-400 text-neutral-950 font-black text-[10px] uppercase rounded-full tracking-wider font-sans">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 font-sans mt-0.5">
                      <span>{player.suit || 'Classic Suit'}</span>
                      <span>•</span>
                      <span className="text-red-400 flex items-center gap-0.5">
                        <Pizza size={12} /> {player.pizzas || 0}
                      </span>
                      <span>•</span>
                      <span className="text-sky-400 flex items-center gap-0.5">
                        <Shield size={12} /> {player.missions || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score */}
                <div className="text-right shrink-0 font-['Bangers']">
                  <div className="text-2xl sm:text-3xl text-yellow-400 tracking-wider">
                    {activeSort === 'pizzas'
                      ? `${(player.pizzas || 0).toLocaleString()} 🍕`
                      : activeSort === 'missions'
                      ? `${(player.missions || 0).toLocaleString()} 🚨`
                      : `${(player.score || 0).toLocaleString()} PTS`}
                  </div>
                  {player.heroKarma > 0 && (
                    <div className="text-[11px] text-emerald-400 font-sans font-semibold flex items-center justify-end gap-0.5">
                      <Zap size={11} /> +{player.heroKarma} Karma
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
