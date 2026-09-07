import React, { useState } from 'react';
import {
  BookOpen,
  RotateCcw,
  Activity,
  Target,
  Zap,
  Flame,
  CheckCircle2,
  Shield,
  Award,
  Sparkles,
  X,
  Play,
  Volume2,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { FighterArchetype, MoveData } from './FightingTypes';
import { useAudio } from '../../hooks/useAudio';

interface DojoTrainingOverlayProps {
  fighter: FighterArchetype;
  lastMoveUsed: MoveData | null;
  comboCount: number;
  comboDamage: number;
  onResetPositions: () => void;
  dummyGuardMode: 'none' | 'guard_all' | 'counter_hit' | 'cpu';
  onChangeDummyMode: (mode: 'none' | 'guard_all' | 'counter_hit' | 'cpu') => void;
  onCloseDojo: () => void;
}

interface TutorialStep {
  title: string;
  instruction: string;
  controls: string;
  tip: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Step 1: Basic Movement & Positioning',
    instruction: 'Learn how to approach and retreat from your opponent in the 3D arena.',
    controls: 'Press A / D keys (or D-Pad on mobile) to step left and right.',
    tip: 'Maintaining proper spacing keeps you out of your opponent’s heavy sweep range.',
  },
  {
    title: 'Step 2: Web-Swinging & Vault Mobility',
    instruction: 'Utilize spider agility to rapidly close distance or evade incoming attacks.',
    controls: 'Press Spacebar or tap the agility vault prompt.',
    tip: 'Swinging overhead disorients enemy tracking in full 3D space.',
  },
  {
    title: 'Step 3: Web Jab (Light Attack 1)',
    instruction: 'Execute a fast, low-commitment jab to intercept opponent start-ups.',
    controls: 'Press J key (or tap button 1 on mobile).',
    tip: 'Left Web Jab is your fastest startup tool (+1 advantage on block).',
  },
  {
    title: 'Step 4: Heavy Cross (Attack 2)',
    instruction: 'Deliver a crushing punch to break enemy guards and deal heavy damage.',
    controls: 'Press I key (or tap button 2 on mobile).',
    tip: 'Follows up naturally after a Web Jab for a 2-hit combo string.',
  },
  {
    title: 'Step 5: Air Launcher & Finishers',
    instruction: 'Launch opponents skyward and unleash Heat Bursts or Rage Arts.',
    controls: 'Press K/L for kicks, H for Heat, or U for Cinematic Rage Art!',
    tip: 'Landing a launcher opens up devastating aerial juggles.',
  },
];

interface ComboChallenge {
  id: string;
  title: string;
  sequence: string[];
  description: string;
  rewardPizza: number;
}

const DOJO_COMBO_CHALLENGES: ComboChallenge[] = [
  {
    id: 'c1',
    title: 'Basic Jab & Cross',
    sequence: ['lp', 'rp'],
    description: 'Execute a quick Left Web Jab followed by a Heavy Cross.',
    rewardPizza: 50,
  },
  {
    id: 'c2',
    title: 'Sweeping Low Kick',
    sequence: ['lk', 'rk'],
    description: 'Catch your opponent off-guard with a low sweep and high roundhouse.',
    rewardPizza: 75,
  },
  {
    id: 'c3',
    title: 'Air Launcher Combo',
    sequence: ['launcher', 'lp', 'rp'],
    description: 'Launch the dummy into the air and follow up with a mid-air combo string.',
    rewardPizza: 120,
  },
  {
    id: 'c4',
    title: 'Heat Burst Finisher',
    sequence: ['heat_burst', 'heat_smash'],
    description: 'Activate Heat Burst and unleash a devastating Heat Smash!',
    rewardPizza: 200,
  },
];

export default function DojoTrainingOverlay({
  fighter,
  lastMoveUsed,
  comboCount,
  comboDamage,
  onResetPositions,
  dummyGuardMode,
  onChangeDummyMode,
  onCloseDojo,
}: DojoTrainingOverlayProps) {
  const { playSound } = useAudio();
  const [activeTab, setActiveTab] = useState<'tutorial' | 'hud' | 'challenges' | 'framelist'>('tutorial');
  const [currentTutorialStep, setCurrentTutorialStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);

  const activeStep = TUTORIAL_STEPS[currentTutorialStep];
  const activeChallenge = DOJO_COMBO_CHALLENGES[currentChallengeIndex];

  return (
    <div className="absolute top-4 left-4 z-40 pointer-events-auto flex flex-col gap-3 w-80 sm:w-96 font-sans text-white select-none">
      {/* Dojo Header Card */}
      <div className="p-4 bg-neutral-950/95 border-2 border-amber-500/60 rounded-3xl shadow-[0_0_35px_rgba(245,158,11,0.3)] backdrop-blur-md flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40">
              <Target size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-amber-300 tracking-wider uppercase">
                DOJO TRAINING ACADEMY
              </h2>
              <p className="text-[10px] text-neutral-400">Interactive Tutorial & Combo Lab</p>
            </div>
          </div>
          <button
            onClick={onCloseDojo}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
            title="Exit Dojo"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-900 rounded-xl mb-3 text-[11px] font-bold">
          <button
            onClick={() => { setActiveTab('tutorial'); playSound('click'); }}
            className={`py-1.5 rounded-lg transition ${activeTab === 'tutorial' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'}`}
          >
            Tutorial
          </button>
          <button
            onClick={() => { setActiveTab('hud'); playSound('click'); }}
            className={`py-1.5 rounded-lg transition ${activeTab === 'hud' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'}`}
          >
            Lab HUD
          </button>
          <button
            onClick={() => { setActiveTab('challenges'); playSound('click'); }}
            className={`py-1.5 rounded-lg transition ${activeTab === 'challenges' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'}`}
          >
            Challenges
          </button>
          <button
            onClick={() => { setActiveTab('framelist'); playSound('click'); }}
            className={`py-1.5 rounded-lg transition ${activeTab === 'framelist' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'}`}
          >
            Moves
          </button>
        </div>

        {/* TAB 0: INTERACTIVE TUTORIAL SEQUENCE */}
        {activeTab === 'tutorial' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/40 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-black uppercase">Step {currentTutorialStep + 1} of {TUTORIAL_STEPS.length}</span>
                <span className="text-[10px] text-neutral-400">{Math.round(((currentTutorialStep + 1) / TUTORIAL_STEPS.length) * 100)}% Completed</span>
              </div>
              <h3 className="text-sm font-black text-white">{activeStep.title}</h3>
              <p className="text-xs text-neutral-300">{activeStep.instruction}</p>

              <div className="p-2.5 bg-black/60 border border-neutral-800 rounded-xl">
                <span className="text-[10px] font-bold text-amber-300 block mb-0.5 uppercase">Controls</span>
                <span className="text-xs font-mono text-white">{activeStep.controls}</span>
              </div>

              <div className="p-2.5 bg-blue-950/30 border border-blue-500/30 rounded-xl">
                <span className="text-[10px] font-bold text-blue-400 block mb-0.5 uppercase">Pro Coach Tip</span>
                <span className="text-xs text-neutral-300 italic">{activeStep.tip}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={currentTutorialStep === 0}
                onClick={() => { setCurrentTutorialStep(s => Math.max(0, s - 1)); playSound('click'); }}
                className="flex-1 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-xs font-bold transition"
              >
                Previous Step
              </button>
              <button
                onClick={() => {
                  setCompletedSteps(prev => ({ ...prev, [currentTutorialStep]: true }));
                  if (currentTutorialStep < TUTORIAL_STEPS.length - 1) {
                    setCurrentTutorialStep(s => s + 1);
                    playSound('rankup');
                  } else {
                    playSound('win');
                    setActiveTab('challenges');
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <span>{currentTutorialStep === TUTORIAL_STEPS.length - 1 ? 'Start Challenges!' : 'Next Step'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: LAB HUD & COMBO TRACKER */}
        {activeTab === 'hud' && (
          <div className="space-y-3">
            {/* Real-time Combo Meter */}
            <div className="p-3 bg-gradient-to-r from-amber-950/40 to-neutral-900 border border-amber-500/30 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-400">Combo Meter</div>
                <div className="text-2xl font-black italic text-yellow-200">
                  {comboCount} <span className="text-xs font-normal text-neutral-400">HITS</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-red-400">Damage Output</div>
                <div className="text-2xl font-black italic text-red-300">
                  {comboDamage} <span className="text-xs font-normal text-neutral-400">DMG</span>
                </div>
              </div>
            </div>

            {/* Frame Data Inspector */}
            <div className="p-3 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300">
                <span>Active Attack Frame Data</span>
                {lastMoveUsed && <span className="text-amber-400 font-mono">{lastMoveUsed.command}</span>}
              </div>
              {lastMoveUsed ? (
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                  <div className="p-2 bg-black/50 rounded-xl border border-neutral-800">
                    <div className="text-[9px] text-neutral-500 font-bold">DAMAGE</div>
                    <div className="font-black text-red-400 text-sm">{lastMoveUsed.damage}</div>
                  </div>
                  <div className="p-2 bg-black/50 rounded-xl border border-neutral-800">
                    <div className="text-[9px] text-neutral-500 font-bold">HIT STUN</div>
                    <div className="font-black text-cyan-400 text-sm">+{lastMoveUsed.hitStun}f</div>
                  </div>
                  <div className="p-2 bg-black/50 rounded-xl border border-neutral-800">
                    <div className="text-[9px] text-neutral-500 font-bold">ON BLOCK</div>
                    <div className={`font-black text-sm ${lastMoveUsed.blockAdvantage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {lastMoveUsed.blockAdvantage >= 0 ? `+${lastMoveUsed.blockAdvantage}` : lastMoveUsed.blockAdvantage}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-neutral-950/50 rounded-xl text-xs text-neutral-500 italic text-center">
                  Execute any attack to analyze frame data
                </div>
              )}
            </div>

            {/* Dummy Posture / Guard Setting */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-neutral-400 font-bold uppercase">Training Dummy Posture</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onChangeDummyMode('none'); playSound('click'); }}
                  className={`p-2 rounded-xl text-xs font-bold border transition ${
                    dummyGuardMode === 'none'
                      ? 'bg-amber-500 border-yellow-300 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Non-Moving Dummy
                </button>
                <button
                  onClick={() => { onChangeDummyMode('guard_all'); playSound('click'); }}
                  className={`p-2 rounded-xl text-xs font-bold border transition ${
                    dummyGuardMode === 'guard_all'
                      ? 'bg-blue-600 border-blue-400 text-white shadow'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Guard All
                </button>
                <button
                  onClick={() => { onChangeDummyMode('counter_hit'); playSound('click'); }}
                  className={`p-2 rounded-xl text-xs font-bold border transition ${
                    dummyGuardMode === 'counter_hit'
                      ? 'bg-red-600 border-red-400 text-white shadow'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Counter-Hit
                </button>
                <button
                  onClick={() => { onChangeDummyMode('cpu'); playSound('click'); }}
                  className={`p-2 rounded-xl text-xs font-bold border transition ${
                    dummyGuardMode === 'cpu'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Active Sparring
                </button>
              </div>
            </div>

            {/* Reset Position Button */}
            <button
              onClick={() => { onResetPositions(); playSound('whoosh'); }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neutral-800 to-neutral-900 hover:brightness-110 border border-neutral-700 font-bold text-xs flex items-center justify-center gap-2 text-neutral-200 transition shadow"
            >
              <RotateCcw size={14} />
              <span>Reset Fighter Positions</span>
            </button>
          </div>
        )}

        {/* TAB 2: COMBO CHALLENGES */}
        {activeTab === 'challenges' && (
          <div className="space-y-3">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">Challenge {currentChallengeIndex + 1} of {DOJO_COMBO_CHALLENGES.length}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">+{activeChallenge.rewardPizza} PIZZA</span>
              </div>
              <h3 className="text-sm font-black text-white">{activeChallenge.title}</h3>
              <p className="text-xs text-neutral-400">{activeChallenge.description}</p>
              
              <div className="flex gap-1.5 pt-1">
                {activeChallenge.sequence.map((cmd, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-black/60 border border-neutral-700 text-xs font-mono font-bold text-amber-300 uppercase">
                    {cmd}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={currentChallengeIndex === 0}
                onClick={() => { setCurrentChallengeIndex(c => Math.max(0, c - 1)); playSound('click'); }}
                className="flex-1 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-xs font-bold transition"
              >
                Previous
              </button>
              <button
                disabled={currentChallengeIndex === DOJO_COMBO_CHALLENGES.length - 1}
                onClick={() => { setCurrentChallengeIndex(c => Math.min(DOJO_COMBO_CHALLENGES.length - 1, c + 1)); playSound('click'); }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-neutral-950 font-black text-xs transition"
              >
                Next Challenge
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: COMMAND MOVE LIST */}
        {activeTab === 'framelist' && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <div className="text-[10px] font-bold text-neutral-400 uppercase">{fighter.name} Command List</div>
            {fighter.moves.map((m, idx) => (
              <div key={idx} className="p-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-black text-white">{m.name}</div>
                  <div className="text-[10px] text-amber-400 font-mono font-bold">{m.command}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-400">{m.damage} DMG</div>
                  <div className="text-[10px] text-neutral-500">+{m.hitStun}f / {m.blockAdvantage}f</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
