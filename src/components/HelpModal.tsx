import React, { useState } from 'react';
import { HelpCircle, X, Monitor, Smartphone, Gamepad2, Swords, Compass, Trophy, Zap, Shield, BookOpen, Target } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  const { playSound } = useAudio();
  const [activeDeviceTab, setActiveDeviceTab] = useState<'desktop' | 'mobile' | 'gamepad'>('desktop');
  const [activeModeTab, setActiveModeTab] = useState<'dojo' | 'explore' | 'battle' | 'ranked' | 'arcade'>('dojo');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-neutral-950 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.4)] flex flex-col text-white font-sans overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40">
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide uppercase font-['Bangers']">
                HOW TO PLAY & GAME MANUAL
              </h2>
              <p className="text-xs text-neutral-400">Complete guide for all modes and devices</p>
            </div>
          </div>
          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Device Controller Tabs */}
        <div className="mb-4">
          <div className="text-xs font-bold text-neutral-400 uppercase mb-2">Select Your Device Controls</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setActiveDeviceTab('desktop'); playSound('click'); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition ${
                activeDeviceTab === 'desktop'
                  ? 'bg-amber-500 border-yellow-300 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor size={16} />
              <span>Desktop (Keyboard & Mouse)</span>
            </button>
            <button
              onClick={() => { setActiveDeviceTab('mobile'); playSound('click'); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition ${
                activeDeviceTab === 'mobile'
                  ? 'bg-blue-600 border-blue-400 text-white shadow'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone size={16} />
              <span>Mobile / Touchscreen</span>
            </button>
            <button
              onClick={() => { setActiveDeviceTab('gamepad'); playSound('click'); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition ${
                activeDeviceTab === 'gamepad'
                  ? 'bg-red-600 border-red-400 text-white shadow'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Gamepad2 size={16} />
              <span>Console Gamepad</span>
            </button>
          </div>
        </div>

        {/* Device Content Display */}
        <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl mb-4 text-xs space-y-2">
          {activeDeviceTab === 'desktop' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">A / D Keys</span>
                <span className="text-neutral-300">Move Left / Right</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">J Key</span>
                <span className="text-neutral-300">Left Web Jab (1)</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">I Key</span>
                <span className="text-neutral-300">Heavy Cross (2)</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">K / L Keys</span>
                <span className="text-neutral-300">Low Sweep / Kick (3/4)</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">H Key</span>
                <span className="text-neutral-300">Heat Burst / Smash</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">U Key</span>
                <span className="text-neutral-300">Rage Art Cinematic</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">Spacebar</span>
                <span className="text-neutral-300">Web-Swing / Vault</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">Mouse Click</span>
                <span className="text-neutral-300">UI Interaction & Photo Mode</span>
              </div>
            </div>
          )}

          {activeDeviceTab === 'mobile' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-blue-400 font-bold block mb-1">On-Screen D-Pad</span>
                <span className="text-neutral-300">Tap Step Left / Right or Guard (S) on the touch buttons at bottom left.</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-blue-400 font-bold block mb-1">Action Buttons (1, 2, 3, 4)</span>
                <span className="text-neutral-300">Tap glowing attack pills at bottom right to execute punches, kicks, and throws.</span>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-blue-400 font-bold block mb-1">Heat & Rage Bursts</span>
                <span className="text-neutral-300">Tap Heat or Rage buttons instantly when charged to trigger cinematic finishers.</span>
              </div>
            </div>
          )}

          {activeDeviceTab === 'gamepad' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-red-400 font-bold block mb-1">Left Stick</span>
                <span className="text-neutral-300">Move & Step</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-red-400 font-bold block mb-1">Square / X</span>
                <span className="text-neutral-300">Left Jab (1)</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-red-400 font-bold block mb-1">Triangle / Y</span>
                <span className="text-neutral-300">Right Cross (2)</span>
              </div>
              <div className="p-2.5 bg-black/40 rounded-xl border border-neutral-800">
                <span className="text-red-400 font-bold block mb-1">Cross / A & Circle / B</span>
                <span className="text-neutral-300">Low Kick & Roundhouse</span>
              </div>
            </div>
          )}
        </div>

        {/* Game Modes Guide */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          <div className="text-xs font-bold text-neutral-400 uppercase">Game Modes Guide</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div className="flex items-center gap-2 font-black text-amber-400 text-sm mb-1">
                <Target size={16} />
                <span>Dojo Training Mode (Practice)</span>
              </div>
              <p className="text-neutral-300 text-xs">
                Practice combos and timing against a non-moving dummy. Follow the interactive tutorial sequence, inspect active frame data, and complete combo challenges.
              </p>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div className="flex items-center gap-2 font-black text-blue-400 text-sm mb-1">
                <Compass size={16} />
                <span>Explore the World (3D City)</span>
              </div>
              <p className="text-neutral-300 text-xs">
                Web-swing across New York City buildings, collect pizza boxes, activate photo mode poses, and complete open-world missions.
              </p>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div className="flex items-center gap-2 font-black text-red-400 text-sm mb-1">
                <Swords size={16} />
                <span>Rank Fighting & Versus</span>
              </div>
              <p className="text-neutral-300 text-xs">
                Climb the Tekken 8 rank ladder from Beginner up to Tekken God Supreme in intense 1v1 or Tag Team battles with dynamic stage boundaries and heat bursts.
              </p>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div className="flex items-center gap-2 font-black text-emerald-400 text-sm mb-1">
                <Trophy size={16} />
                <span>Arcade Story Mode</span>
              </div>
              <p className="text-neutral-300 text-xs">
                Battle through 5 cinematic boss stages against Kingpin, Kraven, Doc Ock, Green Goblin, and Venom with pre-fight dialogue and massive pizza rewards.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-4 border-t border-neutral-800 mt-4 flex justify-end">
          <button
            onClick={() => { playSound('click'); onClose(); }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-red-600 text-neutral-950 font-black text-sm hover:brightness-110 transition shadow-lg"
          >
            GOT IT, LET'S SWING!
          </button>
        </div>
      </div>
    </div>
  );
}
