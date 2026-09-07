import React from 'react';
import { Zap, Bomb, Disc, Shield, Radio } from 'lucide-react';

export type SpiderGadgetType =
  | 'web_shooter'
  | 'impact_web'
  | 'web_bomb'
  | 'electric_web'
  | 'suspension_matrix';

export interface SpiderGadgetInfo {
  id: SpiderGadgetType;
  name: string;
  icon: string;
  description: string;
  maxCharges: number;
  currentCharges: number;
  cooldownSec: number;
  color: string;
  hotkey: string;
}

export const GADGET_DEFINITIONS: Record<SpiderGadgetType, SpiderGadgetInfo> = {
  web_shooter: {
    id: 'web_shooter',
    name: 'Web-Shooters',
    icon: '🕸️',
    description: 'Rapid-fire synthetic fluid strands to restrain enemies & latch to perches.',
    maxCharges: 8,
    currentCharges: 8,
    cooldownSec: 1.5,
    color: '#ffffff',
    hotkey: '1',
  },
  impact_web: {
    id: 'impact_web',
    name: 'Impact Web',
    icon: '💥',
    description: 'High-velocity compressed web pellet that knocks hostiles into building walls.',
    maxCharges: 4,
    currentCharges: 4,
    cooldownSec: 4.0,
    color: '#ef4444',
    hotkey: '2',
  },
  web_bomb: {
    id: 'web_bomb',
    name: 'Web Bomb',
    icon: '💣',
    description: 'Proximity explosive that detonates into a multi-strand radial web cocoon.',
    maxCharges: 3,
    currentCharges: 3,
    cooldownSec: 6.0,
    color: '#f59e0b',
    hotkey: '3',
  },
  electric_web: {
    id: 'electric_web',
    name: 'Electric Web',
    icon: '⚡',
    description: 'High-voltage bio-electric taser webbing that chains lightning between foes.',
    maxCharges: 4,
    currentCharges: 4,
    cooldownSec: 5.0,
    color: '#38bdf8',
    hotkey: '4',
  },
  suspension_matrix: {
    id: 'suspension_matrix',
    name: 'Suspension Matrix',
    icon: '🌌',
    description: 'Deployable anti-gravity generator that levitates surrounding targets in zero-g.',
    maxCharges: 2,
    currentCharges: 2,
    cooldownSec: 10.0,
    color: '#a855f7',
    hotkey: '5',
  },
};

interface SpiderGadgetBarProps {
  activeGadget: SpiderGadgetType;
  onSelectGadget: (gadget: SpiderGadgetType) => void;
  charges: Record<SpiderGadgetType, number>;
  onFireGadget?: (gadget: SpiderGadgetType) => void;
}

export function SpiderGadgetBar({
  activeGadget,
  onSelectGadget,
  charges,
  onFireGadget,
}: SpiderGadgetBarProps) {
  const gadgetKeys: SpiderGadgetType[] = [
    'web_shooter',
    'impact_web',
    'web_bomb',
    'electric_web',
    'suspension_matrix',
  ];

  return (
    <div className="pointer-events-auto flex items-center gap-1.5 bg-neutral-950/90 border border-neutral-800 px-3 py-1.5 rounded-2xl backdrop-blur-md shadow-2xl">
      <span className="text-[10px] text-neutral-400 font-sans font-bold uppercase tracking-wider mr-1 hidden sm:inline">
        GADGETS:
      </span>

      {gadgetKeys.map((key) => {
        const info = GADGET_DEFINITIONS[key];
        const isSelected = activeGadget === key;
        const currentCharges = charges[key] ?? info.maxCharges;

        return (
          <button
            key={key}
            onClick={() => {
              onSelectGadget(key);
              if (onFireGadget) onFireGadget(key);
            }}
            className={`relative flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border transition active:scale-95 group ${
              isSelected
                ? 'bg-neutral-800 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] scale-105'
                : 'bg-neutral-900/80 border-neutral-700/80 hover:border-neutral-500 opacity-80 hover:opacity-100'
            }`}
            title={`${info.name} [Hotkey ${info.hotkey}]: ${info.description}`}
          >
            {/* Gadget Icon */}
            <span className="text-base sm:text-lg group-hover:scale-110 transition">
              {info.icon}
            </span>

            {/* Charges Counter Indicator */}
            <div className="flex gap-0.5 mt-0.5">
              {Array.from({ length: info.maxCharges }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1 h-1 rounded-full ${
                    i < currentCharges ? 'bg-red-400' : 'bg-neutral-700'
                  }`}
                />
              ))}
            </div>

            {/* Hotkey Tag */}
            <span className="absolute -top-1.5 -right-1 bg-black/90 text-neutral-300 border border-neutral-700 rounded text-[9px] font-mono px-1">
              {info.hotkey}
            </span>
          </button>
        );
      })}
    </div>
  );
}
