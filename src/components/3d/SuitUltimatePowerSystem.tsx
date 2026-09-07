import React, { useState, useEffect } from 'react';
import { Zap, Shield, Sparkles, Flame, Orbit } from 'lucide-react';

export interface SuitPowerDefinition {
  suitKey: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  durationSec: number;
}

export const SUIT_POWER_DEFINITIONS: Record<string, SuitPowerDefinition> = {
  'spider-man-3-black': {
    suitKey: 'spider-man-3-black',
    name: 'Symbiote Tendril Surge',
    icon: '🖤',
    description: 'Extends ferocious alien tendrils in 360 degrees, web-slapping all nearby hostiles.',
    color: '#a855f7',
    durationSec: 8,
  },
  'iron-spider-mcu': {
    suitKey: 'iron-spider-mcu',
    name: 'Iron Spider Waldoes',
    icon: '🦾',
    description: 'Deploys 4 high-tensile golden robotic spider arms that automatically strike foes.',
    color: '#eab308',
    durationSec: 10,
  },
  'homecoming-stark': {
    suitKey: 'homecoming-stark',
    name: 'Stark Tech EMP Shockwave',
    icon: '⚡',
    description: 'Fires an amplified repulsor pulse that disables all enemy drones and tech weapons.',
    color: '#38bdf8',
    durationSec: 6,
  },
  'spider-man-2-classic': {
    suitKey: 'spider-man-2-classic',
    name: 'Web Blossom Barrage',
    icon: '🕸️',
    description: 'Spins into the air firing rapid web canisters, instantly encasing all targets in webbing.',
    color: '#ef4444',
    durationSec: 7,
  },
  'tasm2-high-gloss': {
    suitKey: 'tasm2-high-gloss',
    name: 'Supersonic Afterimage',
    icon: '💨',
    description: 'Increases swing and dash speed by 200% leaving a vivid neon trail through Manhattan.',
    color: '#06b6d4',
    durationSec: 12,
  },
};

interface SuitUltimatePowerHUDProps {
  suitId: string;
  suitName: string;
  powerCharge: number; // 0 to 100
  isActive: boolean;
  onActivatePower: () => void;
}

export function SuitUltimatePowerHUD({
  suitId,
  suitName,
  powerCharge,
  isActive,
  onActivatePower,
}: SuitUltimatePowerHUDProps) {
  const definition =
    SUIT_POWER_DEFINITIONS[suitId] ||
    SUIT_POWER_DEFINITIONS['spider-man-2-classic'];

  const isFull = powerCharge >= 100;

  return (
    <div className="pointer-events-auto flex items-center gap-2">
      <button
        disabled={!isFull && !isActive}
        onClick={onActivatePower}
        className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border transition active:scale-95 shadow-2xl ${
          isActive
            ? 'bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-500 border-yellow-300 text-white animate-pulse shadow-[0_0_25px_rgba(234,179,8,0.8)] scale-105'
            : isFull
            ? 'bg-neutral-900 border-amber-400 text-yellow-300 hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer'
            : 'bg-neutral-950/85 border-neutral-800 text-neutral-400 opacity-80 cursor-not-allowed'
        }`}
        title={`Suit Power: ${definition.name} - ${definition.description} [Shortcut: F]`}
      >
        {/* Power Icon */}
        <span className="text-base">{definition.icon}</span>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold font-['Bangers'] tracking-wide">
              {isActive ? 'POWER ACTIVE!' : definition.name}
            </span>
            <kbd className="px-1 py-0.2 bg-black/60 text-white rounded text-[9px] font-mono border border-neutral-700">
              F
            </kbd>
          </div>

          {/* Progress gauge */}
          <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-0.5 border border-neutral-700">
            <div
              className={`h-full transition-all duration-300 ${
                isActive
                  ? 'bg-yellow-300 animate-pulse'
                  : isFull
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                  : 'bg-red-500'
              }`}
              style={{
                width: isActive ? '100%' : `${powerCharge}%`,
              }}
            />
          </div>
        </div>

        {/* Ready indicator */}
        {isFull && !isActive && (
          <span className="text-[10px] font-mono font-black bg-yellow-400 text-neutral-950 px-1.5 py-0.5 rounded-full animate-bounce">
            READY
          </span>
        )}
      </button>
    </div>
  );
}
