import React, { useState, useMemo } from 'react';
import {
  X,
  Gift,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  Flame,
  Award,
  Globe,
  Star,
} from 'lucide-react';
import {
  HOLIDAY_OCCASIONS,
  HolidayOccasion,
  getClaimedHolidayBonusIds,
  saveClaimedHolidayBonusId,
  getCurrentHolidayOccasions,
} from './3d/HolidayPizzaBonuses';
import { useAudio } from '../hooks/useAudio';

interface HolidayPizzaBonusesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pizza: number;
  onUpdatePizza: (newTotal: number) => void;
  onBonusClaimed?: (occasionName: string, amount: number) => void;
}

export default function HolidayPizzaBonusesModal({
  isOpen,
  onClose,
  pizza,
  onUpdatePizza,
  onBonusClaimed,
}: HolidayPizzaBonusesModalProps) {
  const { playSound } = useAudio();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [claimedIds, setClaimedIds] = useState<string[]>(() => getClaimedHolidayBonusIds());
  const [celebratingOccasion, setCelebratingOccasion] = useState<HolidayOccasion | null>(null);

  const activeToday = useMemo(() => getCurrentHolidayOccasions(), []);

  const months = [
    { num: 1, name: 'Jan' },
    { num: 2, name: 'Feb' },
    { num: 3, name: 'Mar' },
    { num: 4, name: 'Apr' },
    { num: 5, name: 'May' },
    { num: 6, name: 'Jun' },
    { num: 7, name: 'Jul' },
    { num: 8, name: 'Aug' },
    { num: 9, name: 'Sep' },
    { num: 10, name: 'Oct' },
    { num: 11, name: 'Nov' },
    { num: 12, name: 'Dec' },
  ];

  const occasionsInMonth = useMemo(() => {
    return HOLIDAY_OCCASIONS.filter((occ) => occ.month === selectedMonth);
  }, [selectedMonth]);

  const totalBonusesClaimable = useMemo(() => {
    return HOLIDAY_OCCASIONS.reduce((acc, occ) => acc + occ.bonusPizza, 0);
  }, []);

  const totalClaimedCount = claimedIds.length;

  const handleClaimOccasion = (occ: HolidayOccasion) => {
    if (claimedIds.includes(occ.id)) return;

    const newClaimed = saveClaimedHolidayBonusId(occ.id);
    setClaimedIds(newClaimed);

    const newTotal = pizza + occ.bonusPizza;
    onUpdatePizza(newTotal);

    playSound('rankup');
    setCelebratingOccasion(occ);

    if (onBonusClaimed) {
      onBonusClaimed(occ.name, occ.bonusPizza);
    }

    setTimeout(() => {
      setCelebratingOccasion(null);
    }, 2800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-neutral-950 border border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-gradient-to-r from-amber-950/70 via-neutral-900 to-red-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl shadow-lg border border-amber-300">
              <Gift size={22} className="text-neutral-950 font-black animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-red-400">
                  HOLIDAY & OCCASION PIZZA CALENDAR
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  {totalClaimedCount}/{HOLIDAY_OCCASIONS.length} CLAIMED
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Celebrate cultural holidays, solstices, and international observances with free pizza slices!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-neutral-900/90 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Active Today Banner */}
        {activeToday.length > 0 && (
          <div className="mx-6 mt-4 p-3.5 bg-gradient-to-r from-amber-600/30 via-red-600/30 to-amber-600/30 border border-amber-400/60 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">{activeToday[0].icon}</span>
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                  TODAY'S SPECIAL OCCASION
                </span>
                <div className="text-sm sm:text-base font-bold text-white">
                  {activeToday[0].name} ({activeToday[0].dateStr})
                </div>
              </div>
            </div>

            <button
              onClick={() => handleClaimOccasion(activeToday[0])}
              disabled={claimedIds.includes(activeToday[0].id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition active:scale-95 shadow-lg ${
                claimedIds.includes(activeToday[0].id)
                  ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-400 cursor-default'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-neutral-950 hover:brightness-110 animate-pulse'
              }`}
            >
              {claimedIds.includes(activeToday[0].id) ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>CLAIMED (+{activeToday[0].bonusPizza} 🍕)</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>CLAIM TODAY'S +{activeToday[0].bonusPizza} 🍕</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Month Selector Bar */}
        <div className="px-6 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-neutral-800/80">
          {months.map((m) => {
            const isSelected = selectedMonth === m.num;
            const currentMonthOccasions = HOLIDAY_OCCASIONS.filter((o) => o.month === m.num);
            const claimedInThisMonth = currentMonthOccasions.filter((o) =>
              claimedIds.includes(o.id)
            ).length;

            return (
              <button
                key={m.num}
                onClick={() => {
                  setSelectedMonth(m.num);
                  playSound('whoosh');
                }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-500 border-yellow-300 text-neutral-950 shadow-md scale-105'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <span>{m.name}</span>
                <span
                  className={`text-[10px] px-1 py-0.2 rounded-full ${
                    isSelected ? 'bg-neutral-950/30 text-neutral-950 font-black' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {claimedInThisMonth}/{currentMonthOccasions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Occasion Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {occasionsInMonth.map((occ) => {
            const isClaimed = claimedIds.includes(occ.id);
            const isToday = occ.isHolidayMatch(new Date());

            return (
              <div
                key={occ.id}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                  isClaimed
                    ? 'bg-neutral-900/60 border-neutral-800 opacity-80'
                    : isToday
                    ? 'bg-gradient-to-br from-amber-950/40 via-neutral-900 to-red-950/40 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-2 bg-black/50 rounded-2xl border border-neutral-800">
                        {occ.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-base text-white">{occ.name}</h3>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white animate-pulse">
                              TODAY
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-amber-400">
                          📅 {occ.dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs uppercase font-extrabold text-neutral-400">
                        Bonus
                      </span>
                      <span className="text-sm font-black text-amber-300">
                        +{occ.bonusPizza} 🍕
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                    {occ.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    {occ.category} observance
                  </span>

                  <button
                    onClick={() => handleClaimOccasion(occ)}
                    disabled={isClaimed}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 ${
                      isClaimed
                        ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-neutral-950 shadow-md'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>CLAIMED</span>
                      </>
                    ) : (
                      <>
                        <Gift size={13} />
                        <span>CLAIM +{occ.bonusPizza} 🍕</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-amber-400" />
            <span>All 12 Months: 30+ Global, Seasonal & Cultural Occasions</span>
          </div>
          <div className="font-bold text-amber-400">
            Total Possible Bonuses: +{totalBonusesClaimable} 🍕
          </div>
        </div>

        {/* Celebration Toast Modal overlay */}
        {celebratingOccasion && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-scaleIn">
            <div className="flex flex-col items-center text-center p-8 bg-gradient-to-b from-amber-950 via-neutral-900 to-neutral-950 border-2 border-amber-400 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.6)]">
              <span className="text-6xl mb-3 animate-bounce">{celebratingOccasion.icon}</span>
              <h4 className="text-2xl font-black text-yellow-300 mb-1">
                {celebratingOccasion.name} Bonus!
              </h4>
              <p className="text-sm text-neutral-300 max-w-sm mb-4">
                {celebratingOccasion.description}
              </p>
              <div className="px-6 py-2.5 rounded-2xl bg-amber-500 text-neutral-950 font-black text-xl shadow-xl flex items-center gap-2 animate-pulse">
                <Sparkles size={20} />
                <span>+{celebratingOccasion.bonusPizza} PIZZA SLICES!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
