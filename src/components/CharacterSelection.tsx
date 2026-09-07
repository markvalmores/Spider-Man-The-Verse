import { useState, useMemo } from 'react';
import { AVAILABLE_CHARACTERS, Character } from '../types';
import { Shield, Sparkles, Film, ArrowLeft, Check, Lock, Zap } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface CharacterSelectionProps {
  selectedCharacter?: Character | null;
  onSelect: (c: Character) => void;
  onBack?: () => void;
}

type EraFilter = 'All' | 'Raimi Trilogy' | 'The Amazing Spider-Man' | 'MCU Era' | 'Spider-Verse & Comics';

export default function CharacterSelection({
  selectedCharacter,
  onSelect,
  onBack,
}: CharacterSelectionProps) {
  const { playSound } = useAudio();
  const [activeEra, setActiveEra] = useState<EraFilter>('All');
  const [currentSuit, setCurrentSuit] = useState<Character>(() => {
    return selectedCharacter || AVAILABLE_CHARACTERS[0];
  });

  const filteredSuits = useMemo(() => {
    return AVAILABLE_CHARACTERS.filter((suit) => {
      if (activeEra === 'All') return true;
      if (activeEra === 'Raimi Trilogy') {
        return suit.id.includes('spiderman-1') || suit.id.includes('spiderman-2') || suit.id.includes('spiderman-3');
      }
      if (activeEra === 'The Amazing Spider-Man') {
        return suit.id.includes('tasm');
      }
      if (activeEra === 'MCU Era') {
        return suit.id.includes('homecoming') || suit.id.includes('far-from-home') || suit.id.includes('no-way-home') || suit.id.includes('night-monkey') || suit.id.includes('iron-spider');
      }
      if (activeEra === 'Spider-Verse & Comics') {
        return suit.id.includes('miles') || suit.id.includes('gwen') || suit.id.includes('2099') || suit.id.includes('brand-new-day');
      }
      return true;
    });
  }, [activeEra]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-neutral-950 text-white p-4 sm:p-6 w-full max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={() => {
                playSound('click');
                onBack();
              }}
              className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-500/50 hover:bg-neutral-800 transition"
              title="Back to Menu"
            >
              <ArrowLeft size={20} className="text-neutral-300" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
              SPIDER-MAN SUIT VAULT
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Unlock and equip iconic cinematic suits across movie history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400">
          <Sparkles size={14} />
          <span>ALL CINEMATIC SUITS UNLOCKED</span>
        </div>
      </div>

      {/* Era Filter Chips */}
      <div className="flex gap-2 overflow-x-auto w-full pb-3 mb-6 scrollbar-none">
        {(['All', 'Raimi Trilogy', 'The Amazing Spider-Man', 'MCU Era', 'Spider-Verse & Comics'] as EraFilter[]).map((era) => (
          <button
            key={era}
            onClick={() => {
              playSound('click');
              setActiveEra(era);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeEra === era
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border border-red-500 scale-105'
                : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {era}
          </button>
        ))}
      </div>

      {/* Main Grid: Suit Selector Left + Selected Suit Detailed View Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full flex-1">
        {/* Left Column: Suit Thumbnails Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
          {filteredSuits.map((suit) => {
            const isEquipped = currentSuit.id === suit.id;
            return (
              <button
                key={suit.id}
                onClick={() => {
                  playSound('whoosh');
                  setCurrentSuit(suit);
                }}
                className={`relative flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left ${
                  isEquipped
                    ? 'bg-gradient-to-b from-red-950/60 to-neutral-900 border-red-500 shadow-xl shadow-red-950/30 scale-[1.02]'
                    : 'bg-neutral-900/70 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900'
                }`}
              >
                {/* Suit Icon & Rarity Badge */}
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-3xl">{suit.thumbnail}</span>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                    suit.rarity === 'Legendary'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                  }`}>
                    {suit.rarity}
                  </span>
                </div>

                <div className="font-bold text-sm text-neutral-100 line-clamp-1 mb-0.5">
                  {suit.name}
                </div>
                <div className="text-[11px] text-neutral-400 line-clamp-1 mb-2">
                  {suit.movie} ({suit.year})
                </div>

                {/* Color Swatch Indicators */}
                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-neutral-800/80 w-full">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: suit.primaryColor }}
                    title="Primary Fabric"
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: suit.secondaryColor }}
                    title="Secondary Fabric"
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                    style={{ backgroundColor: suit.eyeColor }}
                    title="Eye Optics"
                  />
                  {isEquipped && (
                    <span className="ml-auto text-emerald-400 text-xs flex items-center gap-0.5 font-bold">
                      <Check size={12} /> Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Suit Showcase */}
        <div className="lg:col-span-5 flex flex-col bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md justify-between">
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Film size={18} className="text-red-400" />
                <span className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">
                  {currentSuit.movie}
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300">
                {currentSuit.year}
              </span>
            </div>

            {/* Suit Name & Big Emoji Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-4xl shadow-inner">
                {currentSuit.thumbnail}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{currentSuit.name}</h2>
                <span className="inline-block mt-1 text-xs font-bold text-red-400 uppercase tracking-wide">
                  Texture Pattern: {currentSuit.texturePattern.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-300 leading-relaxed mb-6 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80">
              {currentSuit.description}
            </p>

            {/* Suit Technical Breakdown */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-extrabold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                <Shield size={14} className="text-red-400" /> Fabric & Optics Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">Primary Fabric</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-200">{currentSuit.primaryColor}</span>
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: currentSuit.primaryColor }} />
                  </div>
                </div>
                <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">Secondary Accent</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-200">{currentSuit.secondaryColor}</span>
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: currentSuit.secondaryColor }} />
                  </div>
                </div>
                <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">Eye Lens Optics</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-200">{currentSuit.eyeColor}</span>
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: currentSuit.eyeColor }} />
                  </div>
                </div>
                <div className="bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-neutral-400">Webbing Shading</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-neutral-200">{currentSuit.webColor}</span>
                    <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: currentSuit.webColor }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Equip Button */}
          <button
            onClick={() => {
              playSound('rankup');
              onSelect(currentSuit);
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-red-950/50 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Zap size={18} /> Equip & Explore City with {currentSuit.name}
          </button>
        </div>
      </div>
    </div>
  );
}
