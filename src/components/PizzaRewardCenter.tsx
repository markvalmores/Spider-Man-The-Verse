import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  calculatePizzaReward,
  formatTimeUntilMidnight,
  getSecondsUntilMidnight,
  isTodayClaimed,
  markDayClaimed,
  RewardInfo,
  SUPPORTED_COUNTRIES,
  getEasterSunday,
  STORAGE_KEYS,
} from '../utils/pizzaRewards';
import { useAudio } from '../hooks/useAudio';
import { Calendar, Clock, Sparkles, CheckCircle2, Globe, Flame, RefreshCw } from 'lucide-react';

interface PizzaRewardCenterProps {
  currentPizza: number;
  onUpdatePizza: (newTotal: number) => void;
  onClose?: () => void;
}

export default function PizzaRewardCenter({
  currentPizza,
  onUpdatePizza,
  onClose,
}: PizzaRewardCenterProps) {
  const { playSound } = useAudio();

  // Selected country for regional festivities
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.COUNTRY_SETTING) || 'global';
  });

  // Simulator date (null means real live system date)
  const [simulatedDate, setSimulatedDate] = useState<Date | null>(null);

  // Claimed status for current active date
  const [hasClaimed, setHasClaimed] = useState<boolean>(() => isTodayClaimed());
  const [claimToast, setClaimToast] = useState<{ message: string; amount: number; type: 'manual' | 'auto' } | null>(null);

  // Live countdown to midnight
  const [secondsLeft, setSecondsLeft] = useState<number>(() => getSecondsUntilMidnight());

  // Active date object
  const activeDate = useMemo(() => simulatedDate || new Date(), [simulatedDate]);

  // Active calculated reward
  const rewardInfo: RewardInfo = useMemo(() => {
    return calculatePizzaReward(activeDate, selectedCountry);
  }, [activeDate, selectedCountry]);

  // Handle Country selection change
  const handleCountryChange = (cid: string) => {
    setSelectedCountry(cid);
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTRY_SETTING, cid);
    } catch {
      // Ignore
    }
    playSound('click');
  };

  // Check if simulated/active date was claimed
  useEffect(() => {
    setHasClaimed(isTodayClaimed(activeDate));
  }, [activeDate]);

  // Live 1-second midnight timer & auto-claim watcher
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getSecondsUntilMidnight();
      setSecondsLeft(remaining);

      // If midnight strikes (remaining is 0 or rolls over) and not claimed yet
      if (remaining <= 1 && !isTodayClaimed() && !simulatedDate) {
        const todayReward = calculatePizzaReward(new Date(), selectedCountry);
        markDayClaimed(new Date());
        setHasClaimed(true);
        const newTotal = currentPizza + todayReward.totalReward;
        onUpdatePizza(newTotal);
        playSound('win');
        setClaimToast({
          message: `Midnight struck! Auto-claimed ${todayReward.totalReward} 🍕 for ${todayReward.occasionName || todayReward.dayOfWeek}!`,
          amount: todayReward.totalReward,
          type: 'auto',
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPizza, onUpdatePizza, playSound, selectedCountry, simulatedDate]);

  // Manual Claim Handler
  const handleClaim = useCallback(() => {
    if (hasClaimed) return;

    markDayClaimed(activeDate);
    setHasClaimed(true);
    const newTotal = currentPizza + rewardInfo.totalReward;
    onUpdatePizza(newTotal);
    playSound(rewardInfo.totalReward >= 2337 ? 'win' : 'pickup');

    setClaimToast({
      message: `Successfully claimed +${rewardInfo.totalReward.toLocaleString()} 🍕! (${rewardInfo.occasionName || rewardInfo.dayOfWeek})`,
      amount: rewardInfo.totalReward,
      type: 'manual',
    });

    setTimeout(() => {
      setClaimToast(null);
    }, 4500);
  }, [hasClaimed, activeDate, currentPizza, rewardInfo, onUpdatePizza, playSound]);

  // Trigger Instant Midnight Auto-Claim Simulation (for testing convenience)
  const handleSimulateMidnightAutoClaim = () => {
    playSound('win');
    const reward = rewardInfo.totalReward;
    markDayClaimed(activeDate);
    setHasClaimed(true);
    onUpdatePizza(currentPizza + reward);

    setClaimToast({
      message: `🕛 Midnight Auto-Claim triggered! Automatically deposited +${reward.toLocaleString()} 🍕 into your vault!`,
      amount: reward,
      type: 'auto',
    });

    setTimeout(() => {
      setClaimToast(null);
    }, 5000);
  };

  // Reset claim status for testing
  const handleResetClaim = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LAST_CLAIM_DATE);
    } catch {
      // Ignore
    }
    setHasClaimed(false);
    playSound('click');
  };

  // Quick Preset dates for testing specific user requirements
  const year = activeDate.getFullYear();
  const easterDate = getEasterSunday(year);
  const goodFridayDate = new Date(easterDate.getTime() - 2 * 24 * 60 * 60 * 1000);
  const palmSundayDate = new Date(easterDate.getTime() - 7 * 24 * 60 * 60 * 1000);

  const presets = [
    { label: 'Real Today', date: null, desc: 'Real current system date' },
    { label: 'Easter Sunday (34,000 🍕)', date: easterDate, desc: 'Resurrection of Jesus (End of Holy Week)' },
    { label: 'Good Friday (2,337 🍕)', date: goodFridayDate, desc: 'Holy Week Observance' },
    { label: 'Palm Sunday (2,337 🍕)', date: palmSundayDate, desc: 'Holy Week Start' },
    { label: "All Saints' Day (2,337 🍕)", date: new Date(year, 10, 1), desc: 'Nov 1 Solemnity' },
    { label: 'Christmas (777 🍕)', date: new Date(year, 11, 25), desc: 'Dec 25 Nativity' },
    { label: "Valentine's (777 🍕)", date: new Date(year, 1, 14), desc: 'Feb 14 Celebration' },
    { label: "New Year's (777 🍕)", date: new Date(year, 0, 1), desc: 'Jan 1 Celebration' },
    { label: 'Summer Solstice (777 🍕)', date: new Date(year, 5, 21), desc: 'June 21 Season' },
    { label: 'Standard Weekend (100 🍕)', date: new Date(year, 8, 5), desc: 'Saturday Patrol' }, // Sep 5, 2026 is Saturday
    { label: 'Standard Weekday (50 🍕)', date: new Date(year, 8, 7), desc: 'Monday Patrol' }, // Sep 7, 2026 is Monday
  ];

  return (
    <div id="pizza-reward-center" className="w-full max-w-4xl bg-neutral-900/95 border border-red-800/80 rounded-3xl p-6 md:p-8 text-white shadow-2xl backdrop-blur-md font-sans">
      {/* Toast Announcement */}
      {claimToast && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between border shadow-xl animate-bounce ${
          claimToast.type === 'auto'
            ? 'bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-400 text-white'
            : 'bg-gradient-to-r from-amber-600 to-red-600 border-yellow-300 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <Sparkles className="text-yellow-300 w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-lg">{claimToast.message}</p>
              <p className="text-xs opacity-90">
                {claimToast.type === 'auto' ? 'Auto-Claim activated because midnight was reached!' : 'Added directly to your Pizza vault.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setClaimToast(null)}
            className="text-xs bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-lg ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍕</span>
            <h2 className="text-3xl font-extrabold tracking-wide font-['Bangers'] text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500">
              DAILY PIZZA REWARD SYSTEM
            </h2>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Claim your daily hero rations. Never miss out — <span className="text-amber-400 font-semibold">unclaimed pizzas auto-claim at midnight!</span>
          </p>
        </div>

        {/* Country Selector */}
        <div className="flex items-center gap-2 bg-neutral-800/90 border border-neutral-700 px-3 py-1.5 rounded-2xl self-stretch sm:self-auto">
          <Globe size={16} className="text-sky-400" />
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="bg-transparent text-sm text-neutral-200 outline-none cursor-pointer"
          >
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.id} value={c.id} className="bg-neutral-900 text-white">
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Reward Card */}
      <div className="mt-6 bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950/40 border border-neutral-700/80 rounded-2xl p-6 relative overflow-hidden shadow-inner">
        {/* Decorative Watermark */}
        <div className="absolute -right-8 -bottom-8 text-9xl opacity-5 select-none pointer-events-none">
          🍕
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Reward Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider bg-gradient-to-r ${rewardInfo.badgeColor}`}>
                {rewardInfo.occasionType === 'easter_resurrection'
                  ? '🌟 ULTIMATE RESURRECTION BOUNTY'
                  : rewardInfo.occasionType === 'holy_week'
                  ? '✝️ HOLY WEEK SPECIAL'
                  : rewardInfo.occasionType === 'all_saints'
                  ? "🕯️ ALL SAINTS' DAY"
                  : rewardInfo.occasionType === 'celebration'
                  ? '🎉 CELEBRATION & FEAST'
                  : rewardInfo.isWeekend
                  ? '🏖️ WEEKEND BONUS'
                  : '🛡️ WEEKDAY PATROL'}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {rewardInfo.date.toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              {rewardInfo.occasionName}
            </h3>
            <p className="text-sm text-neutral-300 mt-1 max-w-xl">
              {rewardInfo.description}
            </p>

            {/* Auto-Claim Notice & Countdown */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-xl">
                <Clock size={14} className="animate-spin-slow" />
                <span>
                  Auto-claims in: <strong className="text-white text-sm">{formatTimeUntilMidnight(secondsLeft)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
                <CheckCircle2 size={14} />
                <span>Safe vault: 100% auto-deposit on midnight</span>
              </div>
            </div>
          </div>

          {/* Right: Giant Claim Action */}
          <div className="flex flex-col items-center gap-3 w-full md:w-auto">
            <div className="text-center">
              <span className="text-xs text-neutral-400 tracking-widest uppercase">TODAY'S BOUNTY</span>
              <div className="text-5xl sm:text-6xl font-black font-['Bangers'] tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-[0_2px_12px_rgba(234,179,8,0.4)]">
                +{rewardInfo.totalReward.toLocaleString()} 🍕
              </div>
            </div>

            {hasClaimed ? (
              <button
                disabled
                className="w-full md:w-56 py-3.5 px-6 rounded-2xl bg-neutral-800 border border-neutral-700 text-neutral-400 font-bold flex items-center justify-center gap-2 cursor-not-allowed text-lg"
              >
                <CheckCircle2 size={20} className="text-emerald-500" />
                <span>CLAIMED TODAY</span>
              </button>
            ) : (
              <button
                onClick={handleClaim}
                className="w-full md:w-56 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:via-amber-500 hover:to-yellow-400 text-neutral-950 font-black font-['Bangers'] text-2xl tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.5)] active:scale-95 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Sparkles size={22} className="text-white fill-white" />
                <span>CLAIM PIZZA</span>
              </button>
            )}

            {/* Helper simulation links */}
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <button
                onClick={handleSimulateMidnightAutoClaim}
                className="hover:text-amber-400 underline transition"
                title="Test how midnight auto-claim executes automatically"
              >
                Simulate Midnight Now
              </button>
              {hasClaimed && (
                <>
                  <span>•</span>
                  <button
                    onClick={handleResetClaim}
                    className="hover:text-sky-400 underline transition"
                  >
                    Reset Claim Status
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Breakdown Matrix */}
      <div className="mt-8">
        <h4 className="text-base font-bold text-neutral-300 mb-3 flex items-center gap-2 font-['Bangers'] tracking-wider text-xl">
          <Flame size={18} className="text-red-500" />
          <span>REWARD SCHEDULE & CELEBRATION TIERS</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* Weekday */}
          <div className={`p-3.5 rounded-xl border ${rewardInfo.totalReward === 50 ? 'bg-neutral-800 border-red-500 shadow-md ring-1 ring-red-500' : 'bg-neutral-950/60 border-neutral-800'}`}>
            <span className="text-xs text-neutral-400 block font-medium">Mon – Fri</span>
            <div className="text-2xl font-black text-white mt-1">50 🍕</div>
            <span className="text-[11px] text-neutral-400 mt-1 block">Weekday Patrol</span>
          </div>

          {/* Weekend */}
          <div className={`p-3.5 rounded-xl border ${rewardInfo.totalReward === 100 ? 'bg-neutral-800 border-sky-500 shadow-md ring-1 ring-sky-500' : 'bg-neutral-950/60 border-neutral-800'}`}>
            <span className="text-xs text-sky-400 block font-medium">Sat & Sun</span>
            <div className="text-2xl font-black text-sky-300 mt-1">100 🍕</div>
            <span className="text-[11px] text-neutral-400 mt-1 block">Weekend Rations</span>
          </div>

          {/* Occasions / Seasons / Feasts */}
          <div className={`p-3.5 rounded-xl border ${rewardInfo.totalReward === 777 ? 'bg-neutral-800 border-amber-500 shadow-md ring-1 ring-amber-500' : 'bg-neutral-950/60 border-neutral-800'}`}>
            <span className="text-xs text-amber-400 block font-medium">Celebrations</span>
            <div className="text-2xl font-black text-amber-300 mt-1">777 🍕</div>
            <span className="text-[11px] text-neutral-400 mt-1 block">Holidays & Feasts</span>
          </div>

          {/* All Saints' Day */}
          <div className={`p-3.5 rounded-xl border ${rewardInfo.occasionType === 'all_saints' ? 'bg-neutral-800 border-orange-500 shadow-md ring-1 ring-orange-500' : 'bg-neutral-950/60 border-neutral-800'}`}>
            <span className="text-xs text-orange-400 block font-medium">Nov 1</span>
            <div className="text-2xl font-black text-orange-300 mt-1">2,337 🍕</div>
            <span className="text-[11px] text-neutral-400 mt-1 block">All Saints' Day</span>
          </div>

          {/* Holy Week */}
          <div className={`p-3.5 rounded-xl border ${rewardInfo.occasionType === 'holy_week' ? 'bg-neutral-800 border-purple-500 shadow-md ring-1 ring-purple-500' : 'bg-neutral-950/60 border-neutral-800'}`}>
            <span className="text-xs text-purple-400 block font-medium">Holy Week</span>
            <div className="text-2xl font-black text-purple-300 mt-1">2,337 🍕</div>
            <span className="text-[11px] text-neutral-400 mt-1 block">All Sacred Days</span>
          </div>

          {/* Easter Resurrection */}
          <div className={`p-3.5 rounded-xl border ${rewardInfo.occasionType === 'easter_resurrection' ? 'bg-neutral-800 border-yellow-400 shadow-lg ring-2 ring-yellow-400 animate-pulse' : 'bg-neutral-950/60 border-neutral-800'}`}>
            <span className="text-xs text-yellow-400 block font-bold">Easter Sun</span>
            <div className="text-2xl font-black text-yellow-300 mt-1">34,000 🍕</div>
            <span className="text-[11px] text-neutral-400 mt-1 block">Jesus Resurrects</span>
          </div>
        </div>
      </div>

      {/* Date & Occasion Simulator Testing Bar */}
      <div className="mt-8 bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-red-400" />
            <span className="text-sm font-bold text-neutral-200">
              Interactive Occasion Simulator & Tester
            </span>
          </div>
          {simulatedDate && (
            <button
              onClick={() => {
                setSimulatedDate(null);
                playSound('click');
              }}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-700"
            >
              <RefreshCw size={12} /> Return to Real Date
            </button>
          )}
        </div>

        <p className="text-xs text-neutral-400 mb-3">
          Select any date preset below to preview and test the exact reward calculations, themes, and claim mechanics:
        </p>

        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => {
            const isActive =
              (p.date === null && simulatedDate === null) ||
              (p.date !== null && simulatedDate !== null && p.date.toDateString() === simulatedDate.toDateString());

            return (
              <button
                key={idx}
                onClick={() => {
                  setSimulatedDate(p.date);
                  playSound('click');
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                  isActive
                    ? 'bg-red-600 border-red-400 text-white font-bold shadow-md'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800'
                }`}
                title={p.desc}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Close button if rendered as modal */}
      {onClose && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-200 font-semibold text-sm transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
