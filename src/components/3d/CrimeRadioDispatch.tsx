import React, { useState, useEffect } from 'react';
import { Radio, AlertTriangle, ShieldAlert, Crosshair, CheckCircle2 } from 'lucide-react';

export interface CrimeIncident {
  id: string;
  code: string;
  title: string;
  locationName: string;
  pos: [number, number, number];
  description: string;
  suspects: string;
  karmaReward: number;
  pizzaReward: number;
  urgency: 'HIGH' | 'CRITICAL' | 'MEDIUM';
}

const PROCEDURAL_CRIMES: CrimeIncident[] = [
  {
    id: 'crime_bank',
    code: '10-31',
    title: 'Financial District Bank Heist',
    locationName: 'Wall Street First National',
    pos: [110, 0, -110],
    description: 'Armed Maggia crew attempting to breach vault with thermal charges.',
    suspects: '5 Armed Mercenaries with automatic rifles',
    karmaReward: 120,
    pizzaReward: 300,
    urgency: 'CRITICAL',
  },
  {
    id: 'crime_rooftop',
    code: '10-99',
    title: 'Hell\'s Kitchen Rooftop Hostages',
    locationName: '42nd St Warehouse Rooftop',
    pos: [-45, 60, 45],
    description: 'Rooftop snipers holding building superintendent at gunpoint.',
    suspects: '3 Maggia snipers with laser sights',
    karmaReward: 90,
    pizzaReward: 200,
    urgency: 'HIGH',
  },
  {
    id: 'crime_drones',
    code: '10-54',
    title: 'Oscorp Rogue Attack Drones',
    locationName: 'Central Park North Lawn',
    pos: [-110, 35, -45],
    description: 'Autonomous military drones malfunctioning and targeting civilian paths.',
    suspects: '4 Airborne EMP Pulse Drones',
    karmaReward: 150,
    pizzaReward: 350,
    urgency: 'CRITICAL',
  },
  {
    id: 'crime_pursuit',
    code: '10-70',
    title: 'Armored Truck High-Speed Getaway',
    locationName: 'FDR Drive / Queensboro Bridge',
    pos: [0, 15, -220],
    description: 'Stolen cash transport smashing through Midtown traffic barriers.',
    suspects: 'Armored getaway van & 2 escort bikes',
    karmaReward: 140,
    pizzaReward: 280,
    urgency: 'HIGH',
  },
  {
    id: 'crime_crane',
    code: '10-44',
    title: 'Swaying Construction Crane Rescue',
    locationName: 'Times Square Tower Site',
    pos: [45, 75, -45],
    description: 'Cables snapped during storm wind! Worker dangling 80m above street.',
    suspects: 'Environmental Hazard / Structural Failure',
    karmaReward: 110,
    pizzaReward: 250,
    urgency: 'MEDIUM',
  },
];

interface CrimeRadioDispatchProps {
  playerPos: [number, number, number];
  onAcceptCrime: (crime: CrimeIncident) => void;
  activeIncident: CrimeIncident | null;
  onDismissIncident: () => void;
  playSound?: (s: string) => void;
}

export function CrimeRadioDispatch({
  playerPos,
  onAcceptCrime,
  activeIncident,
  onDismissIncident,
  playSound,
}: CrimeRadioDispatchProps) {
  const [incomingCrime, setIncomingCrime] = useState<CrimeIncident | null>(null);
  const [radioStatic, setRadioStatic] = useState<boolean>(false);

  // Procedural timer to dispatch police alerts periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (!incomingCrime && !activeIncident) {
        // Pick a random crime
        const randomCrime =
          PROCEDURAL_CRIMES[Math.floor(Math.random() * PROCEDURAL_CRIMES.length)];
        setRadioStatic(true);
        if (playSound) playSound('web');

        setTimeout(() => {
          setRadioStatic(false);
          setIncomingCrime(randomCrime);
          if (playSound) playSound('rankup');
        }, 1200);
      }
    }, 45000); // Every 45 seconds

    // Initial alert after 10s
    const initTimer = setTimeout(() => {
      if (!incomingCrime && !activeIncident) {
        setIncomingCrime(PROCEDURAL_CRIMES[0]);
      }
    }, 12000);

    return () => {
      clearInterval(timer);
      clearTimeout(initTimer);
    };
  }, [incomingCrime, activeIncident, playSound]);

  // Keyboard shortcut [R] to accept crime
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'r' || e.key === 'R') && incomingCrime) {
        onAcceptCrime(incomingCrime);
        setIncomingCrime(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [incomingCrime, onAcceptCrime]);

  if (!incomingCrime && !radioStatic && !activeIncident) return null;

  return (
    <div className="pointer-events-auto flex flex-col items-center select-none font-['Bangers']">
      {/* 1. Incoming Police Radio Scanner Audio Static Wave */}
      {radioStatic && (
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-950/95 border border-red-500 rounded-2xl shadow-2xl animate-pulse text-red-400 text-sm">
          <Radio size={16} className="animate-spin text-red-500" />
          <span className="font-sans font-bold tracking-wide">
            📻 NYPD DISPATCH FREQUENCY INTERCEPTED...
          </span>
          <div className="flex gap-0.5">
            <span className="w-1 h-3 bg-red-500 animate-bounce" />
            <span className="w-1 h-4 bg-red-400 animate-bounce delay-75" />
            <span className="w-1 h-2 bg-red-600 animate-bounce delay-150" />
          </div>
        </div>
      )}

      {/* 2. Incoming Dispatch Alert Card */}
      {incomingCrime && !activeIncident && (
        <div className="w-full max-w-md bg-gradient-to-br from-neutral-950/95 via-neutral-900/95 to-red-950/90 border-2 border-red-500/80 rounded-2xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.4)] backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-red-500/30 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600/30 border border-red-500 rounded-lg text-red-400 animate-pulse">
                <AlertTriangle size={18} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold text-xs tracking-wider font-sans">
                    POLICE DISPATCH [{incomingCrime.code}]
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded font-sans font-bold ${
                      incomingCrime.urgency === 'CRITICAL'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-amber-600 text-black'
                    }`}
                  >
                    {incomingCrime.urgency}
                  </span>
                </div>
                <h4 className="text-lg text-white font-bold tracking-wide leading-tight">
                  {incomingCrime.title}
                </h4>
              </div>
            </div>
            <button
              onClick={() => setIncomingCrime(null)}
              className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition text-sm font-sans"
            >
              ✕
            </button>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-xs font-sans text-neutral-300 mb-3">
            <div className="flex items-center gap-1.5 text-sky-300">
              <Crosshair size={13} />
              <span className="font-bold">Location:</span>
              <span>{incomingCrime.locationName}</span>
            </div>
            <p className="text-neutral-200 italic">{incomingCrime.description}</p>
            <div className="text-[11px] text-red-300/90">
              <span className="font-semibold text-red-400">Hostiles:</span>{' '}
              {incomingCrime.suspects}
            </div>
          </div>

          {/* Rewards & Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs font-sans">
              <span className="text-amber-400 font-bold">+{incomingCrime.pizzaReward} 🍕</span>
              <span className="text-neutral-500">•</span>
              <span className="text-yellow-300 font-bold">
                +{incomingCrime.karmaReward} KARMA
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIncomingCrime(null)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-xl font-sans font-semibold transition"
              >
                Ignore
              </button>
              <button
                onClick={() => {
                  onAcceptCrime(incomingCrime);
                  setIncomingCrime(null);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 active:scale-95 text-white font-bold text-sm rounded-xl border border-yellow-300 shadow-lg tracking-wider cursor-pointer"
              >
                <span>ACCEPT CRIME</span>
                <kbd className="px-1.5 py-0.2 bg-black/60 text-yellow-300 rounded text-[10px] font-mono">
                  [R]
                </kbd>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Active Crime Tracking Banner */}
      {activeIncident && (
        <div className="flex items-center gap-3 px-4 py-2 bg-neutral-950/90 border border-red-500/70 rounded-2xl backdrop-blur-md shadow-xl text-white">
          <ShieldAlert size={18} className="text-red-400 animate-pulse" />
          <div>
            <div className="text-[10px] text-red-400 font-sans font-bold uppercase tracking-wider">
              RESPONDING TO CRIME [{activeIncident.code}]
            </div>
            <div className="text-sm font-bold text-white tracking-wide">
              {activeIncident.title} • {activeIncident.locationName}
            </div>
          </div>
          <button
            onClick={onDismissIncident}
            className="ml-2 px-2 py-1 bg-red-900/60 hover:bg-red-800 text-red-200 text-xs rounded-lg font-sans font-semibold transition"
            title="Complete / Dismiss Crime"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
