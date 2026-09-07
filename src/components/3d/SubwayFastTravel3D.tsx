import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { MapPin, ArrowRight, Train } from 'lucide-react';

export interface SubwayStation {
  id: string;
  name: string;
  lines: string[];
  district: string;
  position: [number, number, number];
  color: string;
}

export const SUBWAY_STATIONS: SubwayStation[] = [
  {
    id: 'subway_times_sq',
    name: 'Times Sq - 42nd St',
    lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'],
    district: 'Midtown Theater District',
    position: [110, 0, 80],
    color: '#eab308',
  },
  {
    id: 'subway_wall_st',
    name: 'Wall St - Financial Hub',
    lines: ['4', '5', 'J', 'Z'],
    district: 'Lower Manhattan / Wall Street',
    position: [80, 0, 40],
    color: '#22c55e',
  },
  {
    id: 'subway_columbus',
    name: '59th St - Columbus Circle',
    lines: ['A', 'B', 'C', 'D', '1'],
    district: 'Central Park South',
    position: [75, 0, -90],
    color: '#3b82f6',
  },
  {
    id: 'subway_queens_plaza',
    name: 'Queensboro Plaza',
    lines: ['7', 'N', 'W'],
    district: 'East River Bridge Terminal',
    position: [-70, 0, 90],
    color: '#a855f7',
  },
];

interface SubwayFastTravel3DProps {
  playerPos: [number, number, number];
  onFastTravel: (destination: [number, number, number], stationName: string) => void;
  playSound?: (sound: any) => void;
}

export default function SubwayFastTravel3D({
  playerPos,
  onFastTravel,
  playSound,
}: SubwayFastTravel3DProps) {
  const [activeStationPrompt, setActiveStationPrompt] = React.useState<SubwayStation | null>(null);
  const [fastTravelModalStation, setFastTravelModalStation] = React.useState<SubwayStation | null>(null);

  useFrame(() => {
    let nearby: SubwayStation | null = null;
    for (const station of SUBWAY_STATIONS) {
      const dx = playerPos[0] - station.position[0];
      const dy = playerPos[1] - station.position[1];
      const dz = playerPos[2] - station.position[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 5.5) {
        nearby = station;
        break;
      }
    }
    setActiveStationPrompt(nearby);
  });

  return (
    <group>
      {/* 3D NYC Subway Station Entrances */}
      {SUBWAY_STATIONS.map((station) => (
        <group key={station.id} position={station.position}>
          {/* Subway Staircase Well Pit */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[4.2, 1.0, 7]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>

          {/* Green Wrought-Iron Railings */}
          <mesh position={[-2.1, 0.6, 0]}>
            <boxGeometry args={[0.1, 1.2, 7]} />
            <meshStandardMaterial color="#064e3b" roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh position={[2.1, 0.6, 0]}>
            <boxGeometry args={[0.1, 1.2, 7]} />
            <meshStandardMaterial color="#064e3b" roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.6, -3.5]}>
            <boxGeometry args={[4.2, 1.2, 0.1]} />
            <meshStandardMaterial color="#064e3b" roughness={0.5} metalness={0.6} />
          </mesh>

          {/* Classic NYC MTA Green Globe Lamp Posts */}
          <group position={[-2.1, 1.4, 3.2]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
              <meshStandardMaterial color="#064e3b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <sphereGeometry args={[0.3, 12, 12]} />
              <meshStandardMaterial
                color="#22c55e"
                emissive="#16a34a"
                emissiveIntensity={1.4}
              />
            </mesh>
          </group>

          <group position={[2.1, 1.4, 3.2]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
              <meshStandardMaterial color="#064e3b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.9, 0]}>
              <sphereGeometry args={[0.3, 12, 12]} />
              <meshStandardMaterial
                color="#22c55e"
                emissive="#16a34a"
                emissiveIntensity={1.4}
              />
            </mesh>
          </group>

          {/* Subway Station Entrance Sign Over Bar */}
          <group position={[0, 2.2, 3.2]}>
            <mesh>
              <boxGeometry args={[3.8, 0.6, 0.15]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
            <Html center position={[0, 0, 0.1]} distanceFactor={22}>
              <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-700 px-3 py-1 rounded-md text-white font-mono whitespace-nowrap shadow-lg select-none">
                <span className="text-emerald-400 font-bold text-xs">MTA</span>
                <span className="text-xs font-bold font-sans">{station.name}</span>
                <div className="flex gap-0.5 ml-1">
                  {station.lines.slice(0, 3).map((line, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] flex items-center justify-center font-bold"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </Html>
          </group>

          {/* Proximity Interaction Prompt */}
          {activeStationPrompt?.id === station.id && (
            <Html position={[0, 3.2, 0]} center distanceFactor={18}>
              <div className="flex flex-col items-center pointer-events-auto select-none animate-bounce">
                <button
                  onClick={() => setFastTravelModalStation(station)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-['Bangers'] tracking-wider text-base rounded-xl border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.8)] cursor-pointer"
                >
                  <Train size={18} />
                  <span>ENTER SUBWAY FAST TRAVEL</span>
                </button>
              </div>
            </Html>
          )}
        </group>
      ))}

      {/* Subway Fast Travel Selection Modal */}
      {fastTravelModalStation && (
        <Html fullscreen>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden text-white font-sans">
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-950 border border-emerald-500/50 rounded-xl text-emerald-400">
                    <Train size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-['Bangers'] tracking-wide">
                      MTA SUBWAY EXPRESS NETWORK
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Current Station: {fastTravelModalStation.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFastTravelModalStation(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs text-neutral-300 uppercase tracking-wider font-bold">
                  SELECT DESTINATION STATION IN MANHATTAN:
                </p>
                {SUBWAY_STATIONS.map((dest) => {
                  const isCurrent = dest.id === fastTravelModalStation.id;
                  return (
                    <button
                      key={dest.id}
                      disabled={isCurrent}
                      onClick={() => {
                        onFastTravel([dest.position[0], 2, dest.position[2] + 4], dest.name);
                        setFastTravelModalStation(null);
                        if (playSound) playSound('swing');
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition text-left ${
                        isCurrent
                          ? 'bg-neutral-950/50 border-neutral-800 opacity-50 cursor-not-allowed'
                          : 'bg-neutral-950 hover:bg-neutral-800/80 border-neutral-700 hover:border-emerald-500 cursor-pointer active:scale-98'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className="text-emerald-400" />
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{dest.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
                                (You are here)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400">{dest.district}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {dest.lines.slice(0, 4).map((l, i) => (
                          <span
                            key={i}
                            className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold"
                          >
                            {l}
                          </span>
                        ))}
                        <ArrowRight size={16} className="text-neutral-400 ml-2" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
                <button
                  onClick={() => setFastTravelModalStation(null)}
                  className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
