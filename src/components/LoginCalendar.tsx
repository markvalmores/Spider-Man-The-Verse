import { useState, useEffect, useMemo } from 'react';
import {
  calculatePizzaReward,
  formatTimeUntilMidnight,
  getSecondsUntilMidnight,
  isTodayClaimed,
  markDayClaimed,
} from '../utils/pizzaRewards';
import { useAudio } from '../hooks/useAudio';
import { Clock, Sparkles, CheckCircle2, Gift } from 'lucide-react';

interface LoginCalendarProps {
  pizza: number;
  onUpdatePizza: (newTotal: number) => void;
  onOpenFullCenter?: () => void;
}

export default function LoginCalendar({
  pizza,
  onUpdatePizza,
  onOpenFullCenter,
}: LoginCalendarProps) {
  const { playSound } = useAudio();
  const [hasClaimed, setHasClaimed] = useState<boolean>(() => isTodayClaimed());
  const [secondsLeft, setSecondsLeft] = useState<number>(() => getSecondsUntilMidnight());

  const todayReward = useMemo(() => calculatePizzaReward(new Date()), []);

  // Update seconds and auto-claim check at midnight
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getSecondsUntilMidnight();
      setSecondsLeft(remaining);

      // Auto-claim trigger at midnight
      if (remaining <= 1 && !isTodayClaimed()) {
        const reward = calculatePizzaReward(new Date()).totalReward;
        markDayClaimed();
        setHasClaimed(true);
        onUpdatePizza(pizza + reward);
        playSound('win');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [pizza, onUpdatePizza, playSound]);

  const handleClaim = () => {
    if (hasClaimed) return;
    markDayClaimed();
    setHasClaimed(true);
    onUpdatePizza(pizza + todayReward.totalReward);
    playSound(todayReward.totalReward >= 2337 ? 'win' : 'pickup');
  };

  // Generate 7-day strip centered on today or Mon-Sun week
  const weekDays = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon ...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + mondayOffset + i);
      const rew = calculatePizzaReward(d);
      const isToday = d.toDateString() === now.toDateString();
      days.push({
        name: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
        fullDay: d.toLocaleDateString(undefined, { weekday: 'short' }),
        dateNum: d.getDate(),
        reward: rew.totalReward,
        isToday,
        isOccasion: rew.occasionType !== 'standard',
        occasionName: rew.occasionName,
      });
    }
    return days;
  }, []);

  return (
    <div
      id="login-calendar"
      className="bg-neutral-900/95 p-5 rounded-2xl border border-neutral-700/80 w-full max-w-sm mt-4 shadow-xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-red-500" />
          <h3 className="text-xl font-bold font-['Bangers'] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
            DAILY PIZZA REWARD
          </h3>
        </div>
        {onOpenFullCenter && (
          <button
            onClick={onOpenFullCenter}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-sans"
          >
            All Rewards →
          </button>
        )}
      </div>

      {/* Today's Active Reward Banner */}
      <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-sans mb-1">
          <span>{todayReward.dayOfWeek} • {todayReward.occasionName || 'Patrol'}</span>
          <span className="flex items-center gap-1 text-amber-400 font-mono text-[11px]">
            <Clock size={12} /> {formatTimeUntilMidnight(secondsLeft)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-3xl font-extrabold font-['Bangers'] text-yellow-400">
            +{todayReward.totalReward.toLocaleString()} 🍕
          </div>

          {hasClaimed ? (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg font-sans">
              <CheckCircle2 size={14} />
              <span>CLAIMED</span>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-['Bangers'] text-base rounded-xl shadow-lg active:scale-95 transition flex items-center gap-1.5 animate-pulse"
            >
              <Sparkles size={14} className="fill-white" />
              <span>CLAIM</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-neutral-400 mt-2 font-sans">
          Auto-claims at midnight if unclaimed.
        </p>
      </div>

      {/* 7-Day Mini Tracker */}
      <div className="grid grid-cols-7 gap-1 text-center font-sans">
        {weekDays.map((d, i) => (
          <div
            key={i}
            className={`py-1.5 px-0.5 rounded-lg border text-xs transition ${
              d.isToday
                ? 'bg-red-950/80 border-red-500 text-white font-bold ring-1 ring-red-500/50'
                : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-400'
            }`}
            title={d.occasionName ? `${d.fullDay}: ${d.occasionName} (${d.reward} 🍕)` : `${d.fullDay} (${d.reward} 🍕)`}
          >
            <div className="text-[10px] uppercase">{d.name}</div>
            <div className={`font-mono text-xs ${d.isToday ? 'text-yellow-400' : 'text-neutral-300'}`}>
              {d.reward >= 1000 ? `${(d.reward / 1000).toFixed(0)}k` : d.reward}
            </div>
            {d.isOccasion && (
              <div className="w-1 h-1 bg-amber-400 rounded-full mx-auto mt-0.5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
