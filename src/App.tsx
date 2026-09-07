/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import AuthPortal from './components/AuthPortal';
import CharacterSelection from './components/CharacterSelection';
import DailyChallenges from './components/DailyChallenges';
import LoginCalendar from './components/LoginCalendar';
import PizzaRewardCenter from './components/PizzaRewardCenter';
import GachaShop from './components/GachaShop';
import SkillTree from './components/SkillTree';
import BattleHUD from './components/BattleHUD';
import MissionBriefing from './components/MissionBriefing';
import BattleResult from './components/BattleResult';
import Leaderboard from './components/Leaderboard';
import Achievements from './components/Achievements';
import CityExplorer3D from './components/3d/CityExplorer3D';
import FightingModeHub from './components/battle/FightingModeHub';
import HelpModal from './components/HelpModal';
import { useAudio } from './hooks/useAudio';
import { Character } from './types';
import {
  calculatePizzaReward,
  isTodayClaimed,
  markDayClaimed,
  STORAGE_KEYS,
} from './utils/pizzaRewards';
import { Gift, Sparkles, LogOut, User as UserIcon, Shield, RefreshCw, Trophy, Gamepad2, Smartphone, Monitor, Glasses, HelpCircle } from 'lucide-react';
import { detectDevice, detectConnectedGamepad } from './utils/deviceDetector';

type GameMode =
  | 'Main Menu'
  | 'Explore the World'
  | 'Battle Mode'
  | 'Arcade Mode'
  | 'Rank Fighting'
  | 'Character Selection'
  | 'Gacha Shop'
  | 'Skill Tree'
  | 'Leaderboard'
  | 'Achievements'
  | 'Daily Pizza Rewards';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [currentMode, setCurrentMode] = useState<GameMode>('Main Menu');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [pizza, setPizza] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PIZZA_TOTAL);
      if (saved) return parseInt(saved, 10);
    } catch {
      // Ignore
    }
    return 1250;
  });
  const [battleState, setBattleState] = useState<{ active: boolean; result?: 'WIN' | 'LOSS' }>({
    active: false,
  });
  const [autoClaimNotice, setAutoClaimNotice] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const { playSound } = useAudio();
  const [deviceInfo] = useState(() => detectDevice());
  const [gamepadInfo, setGamepadInfo] = useState(() => detectConnectedGamepad());

  // Gamepad listener on Main Menu
  useEffect(() => {
    const handleGamepadChange = () => {
      setGamepadInfo(detectConnectedGamepad());
    };
    window.addEventListener('gamepadconnected', handleGamepadChange);
    window.addEventListener('gamepaddisconnected', handleGamepadChange);
    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadChange);
      window.removeEventListener('gamepaddisconnected', handleGamepadChange);
    };
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const savedEmail = localStorage.getItem('game_hero_email');
        if (savedEmail && !user.email) {
          try {
            Object.defineProperty(user, 'email', {
              value: savedEmail,
              writable: true,
              configurable: true,
            });
          } catch {
            // Ignore
          }
        }
      }
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Helper to persist pizza state
  const updatePizza = (newVal: number) => {
    setPizza(newVal);
    try {
      localStorage.setItem(STORAGE_KEYS.PIZZA_TOTAL, String(newVal));
    } catch {
      // Ignore
    }
  };

  // On mount: Check if a day was missed or auto-claim should trigger
  useEffect(() => {
    const today = new Date();
    const lastClaim = localStorage.getItem(STORAGE_KEYS.LAST_CLAIM_DATE);

    // If last claim is from previous date and today is not claimed, auto-claim previous if missed
    if (!isTodayClaimed()) {
      // If midnight already passed since last session
      if (lastClaim && lastClaim !== today.toISOString().split('T')[0]) {
        const reward = calculatePizzaReward(today);
        markDayClaimed(today);
        const newTotal = pizza + reward.totalReward;
        updatePizza(newTotal);
        setAutoClaimNotice(`🕛 Midnight Auto-Claim: +${reward.totalReward.toLocaleString()} 🍕 deposited for ${reward.occasionName || reward.dayOfWeek}!`);
        playSound('win');
      }
    }
  }, []);

  const modes: { name: GameMode; label: string; isSpecial?: boolean }[] = [
    { name: 'Daily Pizza Rewards', label: '🎁 Claim Daily Pizza', isSpecial: true },
    { name: 'Explore the World', label: 'Explore the World' },
    { name: 'Battle Mode', label: 'Battle Mode' },
    { name: 'Arcade Mode', label: 'Arcade Mode' },
    { name: 'Rank Fighting', label: 'Rank Fighting' },
    { name: 'Character Selection', label: 'Change Suit' },
    { name: 'Gacha Shop', label: 'Gacha Shop' },
    { name: 'Skill Tree', label: 'Skill Tree' },
    { name: 'Leaderboard', label: 'Leaderboard' },
    { name: 'Achievements', label: '🏆 Achievements' },
  ];

  const changeMode = (mode: GameMode) => {
    playSound('click');
    setCurrentMode(mode);
  };

  // 1. Loading State while checking Firebase Auth
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-6 font-['Bangers']">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-3xl tracking-widest text-red-500 animate-pulse">CONNECTING TO HERO DATABASE...</h2>
        <p className="text-neutral-400 font-sans text-sm mt-2">Authenticating Spider-Protocol Security Clearance</p>
      </div>
    );
  }

  // 2. Auth Guard: User MUST register or login to play
  if (!currentUser) {
    return <AuthPortal onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  if (currentMode === 'Daily Pizza Rewards') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4 sm:p-6">
        <PizzaRewardCenter
          currentPizza={pizza}
          onUpdatePizza={updatePizza}
          onClose={() => setCurrentMode('Main Menu')}
        />
        <button
          onClick={() => setCurrentMode('Main Menu')}
          className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition text-white font-['Bangers'] tracking-wider text-xl"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  if (currentMode === 'Gacha Shop') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-6">
        <div className="text-2xl mb-4 font-bold">{pizza} 🍕</div>
        <GachaShop pizza={pizza} onBuy={(cost) => updatePizza(pizza - cost)} />
        <button onClick={() => setCurrentMode('Main Menu')} className="mt-4 px-6 py-2 bg-red-600 rounded">Back</button>
      </div>
    );
  }

  if (currentMode === 'Skill Tree') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-6">
        <div className="text-2xl mb-4 font-bold">{pizza} 🍕</div>
        <SkillTree pizza={pizza} onBuy={(cost) => { playSound('click'); updatePizza(pizza - cost); }} />
        <button onClick={() => setCurrentMode('Main Menu')} className="mt-4 px-6 py-2 bg-red-600 rounded">Back</button>
      </div>
    );
  }

  if (currentMode === 'Leaderboard') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4 sm:p-6">
        <Leaderboard onClose={() => setCurrentMode('Main Menu')} />
      </div>
    );
  }

  if (currentMode === 'Achievements') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-4 sm:p-6">
        <Achievements
          pizza={pizza}
          onUpdatePizza={updatePizza}
          onClose={() => setCurrentMode('Main Menu')}
        />
      </div>
    );
  }

  if (currentMode === 'Character Selection') {
    return (
      <CharacterSelection
        selectedCharacter={selectedCharacter}
        onSelect={(c) => {
          setSelectedCharacter(c);
          setCurrentMode('Explore the World');
        }}
        onBack={() => setCurrentMode('Main Menu')}
      />
    );
  }

  if (currentMode === 'Explore the World') {
    return (
      <CityExplorer3D
        selectedCharacter={selectedCharacter}
        pizza={pizza}
        onUpdatePizza={updatePizza}
        onExit={() => setCurrentMode('Main Menu')}
        onOpenCharacterSelection={() => setCurrentMode('Character Selection')}
      />
    );
  }

  if (currentMode === 'Battle Mode' || currentMode === 'Rank Fighting' || currentMode === 'Arcade Mode') {
    const subMode =
      currentMode === 'Rank Fighting'
        ? 'ranked'
        : currentMode === 'Arcade Mode'
        ? 'arcade'
        : 'versus';

    return (
      <FightingModeHub
        pizza={pizza}
        onUpdatePizza={updatePizza}
        initialSubMode={subMode}
        onBackToMainMenu={() => setCurrentMode('Main Menu')}
      />
    );
  }

  if (battleState.active) {
    return (
      <div className="h-screen w-full bg-neutral-800 relative">
        <BattleHUD p1Health={85} p2Health={60} combo={12} ultGauge={100} />
        <MissionBriefing title="Defeat Enemy" objective="Use web-shots to immobilize opponents!" />
        <button 
          onClick={() => { playSound('combat'); setBattleState({ active: false, result: 'WIN' }); }}
          className="absolute bottom-6 right-6 px-6 py-3 bg-green-600 rounded text-white"
        >
          Simulate Victory
        </button>
      </div>
    );
  }

  if (battleState.result) {
    return <BattleResult result={battleState.result} onReturn={() => { playSound('click'); setBattleState({ active: false }); }} />;
  }

  if (currentMode !== 'Main Menu') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 text-white">
        <h1 className="text-4xl font-bold mb-8">{currentMode}</h1>
        <p className="mb-4">Selected: {selectedCharacter?.name || 'Classic Suit'}</p>
        <button 
          onClick={() => setCurrentMode('Main Menu')}
          className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          Return to Main Menu
        </button>
      </div>
    );
  }

  const todayUnclaimed = !isTodayClaimed();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950 text-white p-6 font-['Bangers']">
      {/* Top Bar with User Profile, Pizza Counter & Quick Claim Action */}
      <div className="fixed top-6 right-6 flex items-center gap-3 z-50 flex-wrap justify-end">
        {/* User Account Chip */}
        <div className="flex items-center gap-2 bg-neutral-900/95 border border-neutral-700 px-3.5 py-1.5 rounded-full text-sm font-sans shadow-xl backdrop-blur-md">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <UserIcon size={14} className="text-red-400" />
          <span
            className="text-neutral-200 font-semibold max-w-[130px] sm:max-w-[180px] truncate"
            title={currentUser.email || ''}
          >
            {currentUser.displayName || currentUser.email?.split('@')[0]}
          </span>
          <button
            onClick={() => {
              playSound('click');
              try {
                localStorage.removeItem('game_hero_email');
              } catch {
                // Ignore
              }
              signOut(auth);
            }}
            className="text-neutral-400 hover:text-red-400 ml-1 p-1 hover:bg-neutral-800 rounded transition"
            title="Sign Out (Requires login to play)"
          >
            <LogOut size={14} />
          </button>
        </div>

        <div className="text-2xl font-bold bg-neutral-900 px-4 py-2 rounded-full border border-neutral-700 shadow-xl flex items-center gap-1.5">
          <span>{pizza.toLocaleString()}</span>
          <span>🍕</span>
        </div>

        <button
          onClick={() => {
            playSound('click');
            setCurrentMode('Achievements');
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-sm bg-neutral-900 hover:bg-neutral-800 text-yellow-400 border border-neutral-700 hover:border-yellow-500/50 shadow-xl transition active:scale-95"
          title="Open Achievements Tracker"
        >
          <Trophy size={16} className="text-yellow-400" />
          <span className="font-sans">ACHIEVEMENTS</span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setShowHelpModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-sm bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-700 hover:border-amber-500/50 shadow-xl transition active:scale-95"
          title="Open Help & How to Play Manual"
        >
          <HelpCircle size={16} className="text-amber-400" />
          <span className="font-sans">HELP / MANUAL</span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setCurrentMode('Daily Pizza Rewards');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-lg border transition shadow-xl ${
            todayUnclaimed
              ? 'bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-neutral-950 border-yellow-300 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-600'
          }`}
          title="Open Daily Pizza Rewards & Calendar"
        >
          <Gift size={18} className={todayUnclaimed ? 'fill-neutral-950' : 'text-neutral-400'} />
          <span>{todayUnclaimed ? 'CLAIM 🍕' : 'REWARDS'}</span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}

      {/* Midnight Auto-Claim Banner Notification */}
      {autoClaimNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border border-purple-400 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-sans text-sm animate-bounce">
          <Sparkles className="text-yellow-300 w-5 h-5 shrink-0" />
          <span className="font-semibold">{autoClaimNotice}</span>
          <button
            onClick={() => setAutoClaimNotice(null)}
            className="text-xs bg-black/40 hover:bg-black/60 px-2.5 py-1 rounded-lg ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <h1 className="text-8xl font-extrabold mb-2 tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700 animate-aura drop-shadow-lg">
        SPIDER-MAN
      </h1>
      <h2 className="text-4xl font-light mb-12 text-white tracking-widest uppercase drop-shadow-md">
        The Verse
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="grid grid-cols-1 gap-4">
          {modes.map((mode) => (
            <button
              key={mode.name}
              onClick={() => changeMode(mode.name)}
              className={`px-8 py-4 text-2xl rounded-xl transition duration-300 shadow-lg text-left border tracking-wider ${
                mode.isSpecial
                  ? 'bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-neutral-950 font-black border-yellow-300 shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-98'
                  : ['Character Selection', 'Gacha Shop', 'Skill Tree', 'Leaderboard'].includes(mode.name)
                  ? 'bg-neutral-800 border-neutral-600 hover:bg-neutral-700' 
                  : 'bg-red-900/40 border-red-800 hover:bg-red-700'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <DailyChallenges pizza={pizza} />
          <LoginCalendar
            pizza={pizza}
            onUpdatePizza={updatePizza}
            onOpenFullCenter={() => setCurrentMode('Daily Pizza Rewards')}
          />
        </div>
      </div>

      {/* Universal Device & Gamepad Hardware Detector Pill */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-sans text-xs bg-neutral-900/90 border border-neutral-800 backdrop-blur-md px-5 py-2.5 rounded-full text-neutral-300 shadow-xl max-w-2xl text-center">
        <div className="flex items-center gap-1.5 text-red-400 font-bold">
          {deviceInfo.isMetaQuest ? (
            <Glasses size={14} className="text-purple-400" />
          ) : deviceInfo.isTouch ? (
            <Smartphone size={14} className="text-cyan-400" />
          ) : (
            <Monitor size={14} className="text-blue-400" />
          )}
          <span>{deviceInfo.label}</span>
        </div>

        <span className="text-neutral-600">•</span>

        <div className="flex items-center gap-1.5">
          <Gamepad2
            size={14}
            className={gamepadInfo.connected ? 'text-emerald-400' : 'text-neutral-500'}
          />
          <span>
            {gamepadInfo.connected
              ? `${gamepadInfo.brandLabel} [Auto-Mapped]`
              : deviceInfo.isTouch
              ? 'Touch Controls Active (PlayStation / Xbox / Numeric Glyphs)'
              : 'Keyboard & Mouse + Gamepad Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
