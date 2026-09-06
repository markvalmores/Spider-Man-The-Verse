import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  X,
  Footprints,
  Flame,
  Layers,
  ArrowUp,
  RotateCw,
  Compass,
  Shield,
  Gift
} from 'lucide-react';
import { useAudio, SoundEffect } from '../hooks/useAudio';

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  category: 'traversal' | 'economy' | 'heroic';
  icon: string;
  current: number;
  target: number;
  unit: string;
  rewardPizza: number;
  unlocked: boolean;
  claimed: boolean;
  unlockedAt?: number;
}

export const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'pizza_5000',
    title: 'Pizza Tycoon',
    description: 'Reach a milestone of 5,000 delicious pizzas in your bankroll!',
    category: 'economy',
    icon: '🍕',
    current: 0,
    target: 5000,
    unit: '🍕',
    rewardPizza: 1000,
    unlocked: false,
    claimed: false,
  },
  {
    id: 'pizza_1000',
    title: 'Pizza Slinger',
    description: 'Accumulate 1,000 pizzas from daily rewards and city deliveries.',
    category: 'economy',
    icon: '🛵',
    current: 0,
    target: 1000,
    unit: '🍕',
    rewardPizza: 200,
    unlocked: false,
    claimed: false,
  },
  {
    id: 'wall_stick',
    title: 'Stick to Wall',
    description: 'Adhere to any skyscraper glass or brick facade with spider adhesion.',
    category: 'traversal',
    icon: '🧗',
    current: 0,
    target: 1,
    unit: 'times',
    rewardPizza: 150,
    unlocked: false,
    claimed: false,
  },
  {
    id: 'wall_crawl',
    title: 'Urban Wall Crawler',
    description: 'Crawl along vertical skyscraper surfaces in 4 directions like a true arachnid.',
    category: 'traversal',
    icon: '🕷️',
    current: 0,
    target: 10,
    unit: 'sec',
    rewardPizza: 200,
    unlocked: false,
    claimed: false,
  },
  {
    id: 'wall_climb',
    title: 'Skyscraper Climb',
    description: 'Perform rapid hand-over-hand climbing up skyscraper facades and ledges.',
    category: 'traversal',
    icon: '🧗‍♂️',
    current: 0,
    target: 25,
    unit: 'm',
    rewardPizza: 250,
    unlocked: false,
    claimed: false,
  },
  {
    id: 'wall_run',
    title: "Marvel's Wall Runner",
    description: 'Sprint vertically up or horizontally across Manhattan skyscraper walls.',
    category: 'traversal',
    icon: '⚡',
    current: 0,
    target: 5,
    unit: 'runs',
    rewardPizza: 300,
    unlocked: false,
    claimed: false,
  },
  {
    id: 'wall_jump',
    title: 'Wall Kick & Launch',
    description: 'Perform explosive wall jumps launching Spider-Man off building facades into open air.',
    category: 'traversal',
    icon: '🦿',
    current: 0,
    target: 5,
    unit: 'jumps',
    rewardPizza: 250,
    unlocked: false,
    claimed: false,
  },
  {
    id: 'wall_acrobat',
    title: 'Spider-Man 2 Acrobat',
    description: 'Chain wall-runs into somersault leaps, corkscrews, and rooftop obstacle vaults.',
    category: 'traversal',
    icon: '🤸',
    current: 0,
    target: 5,
    unit: 'acrobatics',
    rewardPizza: 350,
    unlocked: false,
    claimed: false,
  },
  {
    id: 'web_swing',
    title: 'Thwip! Master',
    description: 'Perform pendulum web swings between skyscrapers across the city.',
    category: 'traversal',
    icon: '🕸️',
    current: 0,
    target: 5,
    unit: 'swings',
    rewardPizza: 150,
    unlocked: false,
    claimed: false,
  },
  {
    id: 'rooftop_climber',
    title: 'Skyline Apex',
    description: 'Climb to the summit apex antenna of the highest skyscraper (>65m).',
    category: 'heroic',
    icon: '🏙️',
    current: 0,
    target: 65,
    unit: 'm altitude',
    rewardPizza: 400,
    unlocked: false,
    claimed: false,
  },
  {
    id: 'crime_patrol',
    title: 'Neighborhood Watch',
    description: 'Intercept and neutralize city crimes and patrol events in Manhattan.',
    category: 'heroic',
    icon: '🚨',
    current: 0,
    target: 1,
    unit: 'crimes',
    rewardPizza: 300,
    unlocked: false,
    claimed: false,
  },
];

const STORAGE_ACHIEVEMENTS_KEY = 'spiderman_achievements_state_v1';

export function loadStoredAchievements(): AchievementItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_ACHIEVEMENTS_KEY);
    if (!raw) return INITIAL_ACHIEVEMENTS;
    const parsed: Partial<AchievementItem>[] = JSON.parse(raw);
    return INITIAL_ACHIEVEMENTS.map((item) => {
      const match = parsed.find((p) => p.id === item.id);
      if (match) {
        return {
          ...item,
          current: typeof match.current === 'number' ? match.current : item.current,
          unlocked: Boolean(match.unlocked),
          claimed: Boolean(match.claimed),
          unlockedAt: match.unlockedAt,
        };
      }
      return item;
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveAchievements(items: AchievementItem[]) {
  try {
    localStorage.setItem(STORAGE_ACHIEVEMENTS_KEY, JSON.stringify(items));
  } catch {
    // Ignore in private storage
  }
}

export function trackAchievementProgress(
  id: string,
  amount: number,
  mode: 'set' | 'increment' = 'increment'
): { unlockedItem: AchievementItem | null } {
  try {
    const list = loadStoredAchievements();
    const item = list.find((a) => a.id === id);
    if (!item) return { unlockedItem: null };

    const wasUnlocked = item.unlocked;
    if (mode === 'set') {
      item.current = Math.max(item.current, amount);
    } else {
      item.current = Math.min(item.target * 2, item.current + amount);
    }

    let newlyUnlockedItem: AchievementItem | null = null;
    if (!wasUnlocked && item.current >= item.target) {
      item.unlocked = true;
      item.unlockedAt = Date.now();
      newlyUnlockedItem = { ...item };
    }

    saveAchievements(list);
    return { unlockedItem: newlyUnlockedItem };
  } catch {
    return { unlockedItem: null };
  }
}

// -------------------------------------------------------------
// Small Pop-up Toast Notification Component
// -------------------------------------------------------------
export interface AchievementNotificationProps {
  achievement: AchievementItem | null;
  onDismiss: () => void;
  onViewAchievements?: () => void;
}

export function AchievementToast({
  achievement,
  onDismiss,
  onViewAchievements,
}: AchievementNotificationProps) {
  if (!achievement) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-bounce sm:animate-none">
      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-950 via-red-950 to-neutral-950 border-2 border-yellow-400/90 rounded-2xl shadow-[0_0_25px_rgba(234,179,8,0.5)] p-4 text-white backdrop-blur-md">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-amber-300 animate-pulse" />
        
        <div className="flex items-start gap-3">
          {/* Glowing Trophy Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-2xl shadow-lg border border-yellow-300 shrink-0">
            {achievement.icon || '🏆'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400 font-['Bangers'] tracking-wider uppercase">
              <Sparkles size={13} className="text-yellow-300 animate-spin" />
              <span>ACHIEVEMENT UNLOCKED!</span>
            </div>
            <h4 className="text-base font-black text-white truncate font-['Bangers'] tracking-wide">
              {achievement.title}
            </h4>
            <p className="text-xs text-neutral-300 line-clamp-2 mt-0.5 leading-snug">
              {achievement.description}
            </p>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>+{achievement.rewardPizza}</span>
                <span>🍕</span>
                <span className="text-[10px] text-neutral-400 font-sans">reward</span>
              </span>

              {onViewAchievements && (
                <button
                  onClick={onViewAchievements}
                  className="text-xs text-sky-400 hover:text-sky-300 underline font-semibold flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 rounded-lg transition shrink-0"
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Full Interactive Achievements Modal
// -------------------------------------------------------------
interface AchievementsModalProps {
  pizza: number;
  onUpdatePizza: (newVal: number) => void;
  onClose: () => void;
  onTriggerAchievementToast?: (ach: AchievementItem) => void;
}

export default function Achievements({
  pizza,
  onUpdatePizza,
  onClose,
}: AchievementsModalProps) {
  const [achievements, setAchievements] = useState<AchievementItem[]>(() => loadStoredAchievements());
  const [activeTab, setActiveTab] = useState<'all' | 'traversal' | 'economy' | 'heroic'>('all');
  const { playSound } = useAudio();

  // Sync Pizza total into economy achievements whenever pizza changes
  useEffect(() => {
    setAchievements((prev) => {
      let changed = false;
      const updated = prev.map((item) => {
        if (item.id === 'pizza_5000' || item.id === 'pizza_1000') {
          const newCurrent = Math.max(item.current, pizza);
          const shouldUnlock = newCurrent >= item.target;
          if (newCurrent !== item.current || (shouldUnlock && !item.unlocked)) {
            changed = true;
            return {
              ...item,
              current: newCurrent,
              unlocked: item.unlocked || shouldUnlock,
              unlockedAt: item.unlocked ? item.unlockedAt : shouldUnlock ? Date.now() : undefined,
            };
          }
        }
        return item;
      });

      if (changed) {
        saveAchievements(updated);
        return updated;
      }
      return prev;
    });
  }, [pizza]);

  // Total completed stats
  const completedCount = useMemo(() => achievements.filter((a) => a.unlocked).length, [achievements]);
  const totalCount = achievements.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const filteredAchievements = useMemo(() => {
    if (activeTab === 'all') return achievements;
    return achievements.filter((a) => a.category === activeTab);
  }, [achievements, activeTab]);

  const handleClaimReward = (item: AchievementItem) => {
    if (!item.unlocked || item.claimed) return;
    playSound('win');
    onUpdatePizza(pizza + item.rewardPizza);

    setAchievements((prev) => {
      const next = prev.map((a) => (a.id === item.id ? { ...a, claimed: true } : a));
      saveAchievements(next);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-red-600/70 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.3)] flex flex-col overflow-hidden text-white">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 bg-gradient-to-r from-red-950/60 via-neutral-900 to-red-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-2xl shadow-lg border border-yellow-300">
              <Trophy size={24} className="text-yellow-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black font-['Bangers'] tracking-wide text-white">
                  GAMEPLAY ACHIEVEMENTS
                </h2>
                <span className="px-2.5 py-0.5 bg-red-600/30 border border-red-500/50 text-red-400 text-xs font-bold rounded-full uppercase tracking-wider font-sans">
                  Marvel's Milestones
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans">
                Master wall-crawling, wall-running, acrobatic jumps, and reach 5,000 pizza!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 rounded-xl transition"
            title="Close Achievements"
          >
            <X size={20} />
          </button>
        </div>

        {/* Overview Stats Bar */}
        <div className="px-6 py-4 bg-neutral-950/80 border-b border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <Award size={20} />
            </div>
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                Progress
              </div>
              <div className="text-lg font-black font-['Bangers'] text-white">
                {completedCount} / {totalCount} Unlocked ({completionPercentage}%)
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-lg">
              🍕
            </div>
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                Current Pizza
              </div>
              <div className="text-lg font-black font-['Bangers'] text-amber-400">
                {pizza.toLocaleString()} 🍕
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
                Wall & Movement Physics
              </div>
              <div className="text-xs font-bold text-emerald-400">
                Wall Stick • Run • Jump • Acrobat
              </div>
            </div>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="px-6 py-2.5 bg-neutral-900/50 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Milestones' },
              { id: 'traversal', label: 'Wall & Parkour Physics' },
              { id: 'economy', label: 'Pizza & Economy' },
              { id: 'heroic', label: 'Hero Patrol' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playSound('click');
                setActiveTab(tab.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievements List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredAchievements.map((item) => {
            const progress = Math.min(100, Math.round((item.current / item.target) * 100));
            const isFinished = item.unlocked;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isFinished
                    ? 'bg-gradient-to-r from-neutral-900 via-neutral-950 to-yellow-950/30 border-yellow-500/50 shadow-md'
                    : 'bg-neutral-900/60 border-neutral-800/90 opacity-90'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                      isFinished
                        ? 'bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-300 text-yellow-950 shadow-md'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-500'
                    }`}
                  >
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black font-['Bangers'] tracking-wide text-white">
                        {item.title}
                      </h3>
                      {isFinished ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <CheckCircle2 size={11} />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-neutral-800 text-neutral-400 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <Lock size={11} />
                          <span>Locked</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFinished
                              ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-neutral-400 shrink-0">
                        {item.current.toLocaleString()} / {item.target.toLocaleString()} {item.unit} ({progress}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reward / Claim Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
                  <div className="text-right">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold block">
                      Reward
                    </span>
                    <span className="text-base font-black font-['Bangers'] text-amber-400 flex items-center gap-1">
                      <span>+{item.rewardPizza}</span>
                      <span>🍕</span>
                    </span>
                  </div>

                  {isFinished ? (
                    item.claimed ? (
                      <span className="px-3 py-1.5 bg-neutral-800/80 text-neutral-400 rounded-xl text-xs font-bold tracking-wider font-['Bangers']">
                        CLAIMED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimReward(item)}
                        className="px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 active:scale-95 text-neutral-950 rounded-xl text-xs font-black tracking-wider font-['Bangers'] shadow-lg border border-yellow-200 transition flex items-center gap-1.5 animate-pulse"
                      >
                        <Gift size={13} />
                        <span>CLAIM PIZZA</span>
                      </button>
                    )
                  ) : (
                    <span className="text-[11px] text-neutral-500 italic">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Milestones automatically update during free-roam and daily play.</span>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold font-['Bangers'] tracking-wider text-sm transition"
          >
            RETURN TO GAME
          </button>
        </div>

      </div>
    </div>
  );
}
