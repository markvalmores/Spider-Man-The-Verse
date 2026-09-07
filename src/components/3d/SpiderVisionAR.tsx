import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Eye, ShieldAlert, Target, Compass, Zap, MapPin } from 'lucide-react';
import { CrimeMission } from './CityTypes';
import { BackpackCollectible } from './CityRooftopProps';

export interface ARPointOfInterest {
  id: string;
  name: string;
  type: 'landmark' | 'crime' | 'collectible' | 'subway' | 'vent';
  position: [number, number, number];
  color: string;
  icon: string;
  desc: string;
}

interface SpiderVisionARProps {
  active: boolean;
  playerPos: [number, number, number];
  activeMission: CrimeMission | null;
  backpacks?: BackpackCollectible[];
}

export const MANHATTAN_POIS: ARPointOfInterest[] = [
  {
    id: 'poi_avengers',
    name: 'Avengers Tower',
    type: 'landmark',
    position: [0, 160, -20],
    color: '#0284c7',
    icon: '🅰️',
    desc: 'Stark High-Altitude Helipad & Arc Reactor Core',
  },
  {
    id: 'poi_oscorp',
    name: 'Oscorp Headquarters',
    type: 'landmark',
    position: [60, 175, 60],
    color: '#10b981',
    icon: '🧪',
    desc: 'Genetics Labs & Cross-Species Tech Facility',
  },
  {
    id: 'poi_bugle',
    name: 'Daily Bugle Tower',
    type: 'landmark',
    position: [-100, 130, 0],
    color: '#ef4444',
    icon: '📰',
    desc: 'J. Jonah Jameson Editorial Headquarters',
  },
  {
    id: 'poi_times_sq',
    name: 'Times Square',
    type: 'landmark',
    position: [120, 30, 90],
    color: '#f59e0b',
    icon: '✨',
    desc: 'Manhattan Commercial Crossroads & LED Plaza',
  },
  {
    id: 'poi_bridge',
    name: 'Queensboro Bridge',
    type: 'landmark',
    position: [-80, 75, 100],
    color: '#8b5cf6',
    icon: '🌉',
    desc: 'East River Cantilever Suspension Bridge',
  },
  {
    id: 'poi_park',
    name: 'Central Park Sanctuary',
    type: 'landmark',
    position: [90, 20, -100],
    color: '#22c55e',
    icon: '🌳',
    desc: 'Lush Urban Green Space & Spider Monument',
  },
  {
    id: 'poi_subway_times',
    name: 'Subway: Times Sq 42nd St',
    type: 'subway',
    position: [110, 1, 80],
    color: '#eab308',
    icon: '🚇',
    desc: 'MTA Express Lines 1/2/3/N/Q/R Fast Travel',
  },
  {
    id: 'poi_subway_wall',
    name: 'Subway: Wall Street 4/5',
    type: 'subway',
    position: [80, 1, 40],
    color: '#22c55e',
    icon: '🚇',
    desc: 'Financial District Transit Terminal',
  },
  {
    id: 'poi_subway_columbus',
    name: 'Subway: Columbus Circle A/C/D',
    type: 'subway',
    position: [75, 1, -90],
    color: '#3b82f6',
    icon: '🚇',
    desc: 'Central Park West Fast-Travel Node',
  },
];

export default function SpiderVisionAR({
  active,
  playerPos,
  activeMission,
  backpacks = [],
}: SpiderVisionARProps) {
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (pulseRef.current && active) {
      pulseRef.current.scale.addScalar(delta * 2.5);
      if (pulseRef.current.scale.x > 8.0) {
        pulseRef.current.scale.set(1, 1, 1);
      }
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* 1. Spider-Sense Sonar Radar Wave around player */}
      <mesh
        ref={pulseRef}
        position={[playerPos[0], playerPos[1] + 1, playerPos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[2, 2.6, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* 2. AR Beacons for Manhattan Key Landmarks & Subways */}
      {MANHATTAN_POIS.map((poi) => {
        const dx = playerPos[0] - poi.position[0];
        const dy = playerPos[1] - poi.position[1];
        const dz = playerPos[2] - poi.position[2];
        const dist = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz));

        return (
          <group key={poi.id} position={poi.position}>
            {/* Holographic Vertical Light Column */}
            <mesh position={[0, 20, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 40, 8]} />
              <meshBasicMaterial color={poi.color} transparent opacity={0.4} />
            </mesh>

            {/* Glowing AR Icon Tag */}
            <Html center distanceFactor={35} className="pointer-events-none select-none">
              <div
                className="flex flex-col items-center p-2 rounded-xl backdrop-blur-md border shadow-2xl transition-transform animate-pulse"
                style={{
                  backgroundColor: 'rgba(10, 15, 30, 0.85)',
                  borderColor: poi.color,
                  boxShadow: `0 0 15px ${poi.color}80`,
                }}
              >
                <div className="flex items-center gap-1.5 font-['Bangers'] text-white text-sm sm:text-base">
                  <span>{poi.icon}</span>
                  <span style={{ color: poi.color }}>{poi.name}</span>
                  <span className="text-neutral-300 font-mono text-xs bg-black/60 px-1.5 py-0.5 rounded">
                    {dist}m
                  </span>
                </div>
                <div className="text-[10px] text-neutral-300 font-sans max-w-[160px] text-center mt-0.5 hidden sm:block">
                  {poi.desc}
                </div>
              </div>
            </Html>
          </group>
        );
      })}

      {/* 3. AR Crime Threat Beacons */}
      {activeMission && !activeMission.completed && (
        <group position={activeMission.location}>
          <mesh position={[0, 15, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 30, 8]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
          </mesh>

          <Html center distanceFactor={30}>
            <div className="flex flex-col items-center bg-red-950/90 border-2 border-red-500 text-white px-3 py-1.5 rounded-2xl shadow-[0_0_20px_#ef4444] animate-bounce pointer-events-none select-none font-['Bangers']">
              <div className="flex items-center gap-1 text-yellow-300 text-base">
                <ShieldAlert size={18} className="text-red-400" />
                <span>ACTIVE CRIME IN PROGRESS</span>
              </div>
              <div className="text-xs text-white font-sans">{activeMission.title}</div>
            </div>
          </Html>
        </group>
      )}

      {/* 4. AR Collectible Backpack Beacons */}
      {backpacks.map(
        (bp) =>
          !bp.collected && (
            <group key={`ar-${bp.id}`} position={bp.position}>
              <mesh position={[0, 8, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 16, 6]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} />
              </mesh>
              <Html center distanceFactor={25}>
                <div className="flex items-center gap-1 bg-amber-950/90 border border-yellow-400 text-yellow-300 px-2 py-0.5 rounded-lg text-xs font-mono font-bold shadow-lg pointer-events-none select-none">
                  <span>🎒</span>
                  <span>BACKPACK NEARBY</span>
                </div>
              </Html>
            </group>
          )
      )}
    </group>
  );
}
