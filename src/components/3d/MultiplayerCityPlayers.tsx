import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface RemotePlayer {
  id: string;
  name: string;
  suitId: string;
  level: number;
  color: string;
  pathRadius: number;
  speed: number;
  heightOffset: number;
  phaseOffset: number;
  swingPeriod: number;
  isOnline: boolean;
}

export interface MultiplayerCityPlayersProps {
  enabled?: boolean;
  localPlayerPos?: [number, number, number];
  currentSuitId?: string;
}

const COOP_PLAYERS: RemotePlayer[] = [
  {
    id: 'player_miles',
    name: 'Miles_Morales_Brooklyn',
    suitId: 'spiderman-3-black',
    level: 42,
    color: '#ef4444',
    pathRadius: 85,
    speed: 0.45,
    heightOffset: 45,
    phaseOffset: 0.5,
    swingPeriod: 3.2,
    isOnline: true,
  },
  {
    id: 'player_gwen',
    name: 'GhostSpider_Gwen',
    suitId: 'homecoming',
    level: 38,
    color: '#38bdf8',
    pathRadius: 120,
    speed: 0.38,
    heightOffset: 65,
    phaseOffset: 2.1,
    swingPeriod: 2.8,
    isOnline: true,
  },
  {
    id: 'player_tobey',
    name: 'Raimi_Peter_NYC',
    suitId: 'spiderman-2',
    level: 50,
    color: '#dc2626',
    pathRadius: 150,
    speed: 0.52,
    heightOffset: 80,
    phaseOffset: 4.3,
    swingPeriod: 3.5,
    isOnline: true,
  },
  {
    id: 'player_andrew',
    name: 'Amazing_Spidey_Queens',
    suitId: 'tasm-2',
    level: 45,
    color: '#f59e0b',
    pathRadius: 95,
    speed: 0.48,
    heightOffset: 55,
    phaseOffset: 5.7,
    swingPeriod: 3.0,
    isOnline: true,
  },
];

function RemotePlayerRig({ player, localPos }: { player: RemotePlayer; localPos: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const webLineRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime() * player.speed + player.phaseOffset;

    // Figure-8 trajectory around downtown skyscrapers
    const x = Math.sin(t) * player.pathRadius;
    const z = Math.sin(t * 2) * (player.pathRadius * 0.7);
    const swingBob = Math.sin(t * player.swingPeriod) * 12;
    const y = player.heightOffset + swingBob;

    groupRef.current.position.set(x, Math.max(12, y), z);

    // Look in motion direction
    const nextT = t + 0.05;
    const nextX = Math.sin(nextT) * player.pathRadius;
    const nextZ = Math.sin(nextT * 2) * (player.pathRadius * 0.7);
    const angle = Math.atan2(nextX - x, nextZ - z);
    groupRef.current.rotation.y = angle;

    // Dynamic web strand from higher anchor
    if (webLineRef.current) {
      const anchorY = y + 25;
      const anchorX = x + Math.sin(t * 1.5) * 10;
      const anchorZ = z + Math.cos(t * 1.5) * 10;
      const playerPosVec = new THREE.Vector3(x, y, z);
      const anchorVec = new THREE.Vector3(anchorX, anchorY, anchorZ);
      const dist = playerPosVec.distanceTo(anchorVec);

      webLineRef.current.position.copy(playerPosVec).lerp(anchorVec, 0.5);
      webLineRef.current.scale.set(1, dist, 1);
      const dir = anchorVec.clone().sub(playerPosVec).normalize();
      webLineRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    }
  });

  const distToLocal = useMemo(() => {
    const dx = localPos[0];
    const dz = localPos[2];
    return Math.hypot(dx, dz);
  }, [localPos]);

  return (
    <>
      <group ref={groupRef}>
        {/* Remote Character 3D Rig */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.65, 0.8, 0.4]} />
          <meshStandardMaterial color={player.color} roughness={0.3} metalness={0.3} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.85, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={player.color} roughness={0.3} />
        </mesh>

        {/* Limbs in swinging pose */}
        <mesh position={[-0.35, 1.1, -0.2]} rotation={[0.6, 0, -0.3]}>
          <boxGeometry args={[0.18, 0.65, 0.18]} />
          <meshStandardMaterial color={player.color} />
        </mesh>
        <mesh position={[0.35, 1.8, 0.1]} rotation={[-2.4, 0, 0.2]}>
          <boxGeometry args={[0.18, 0.65, 0.18]} />
          <meshStandardMaterial color={player.color} />
        </mesh>
        <mesh position={[-0.2, 0.4, 0.2]} rotation={[0.8, 0, 0]}>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[0.2, 0.4, 0.3]} rotation={[1.1, 0, 0]}>
          <boxGeometry args={[0.2, 0.7, 0.2]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>

        {/* Online Player Overhead HUD Tag */}
        <Html position={[0, 2.6, 0]} center distanceFactor={24}>
          <div className="pointer-events-none select-none flex flex-col items-center">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-emerald-500/70 rounded-full shadow-lg shadow-emerald-950/40 text-xs font-semibold whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <span className="text-white font-mono">{player.name}</span>
              <span className="px-1 py-0.2 bg-emerald-900/80 text-emerald-300 rounded text-[10px] font-bold">
                Lv.{player.level}
              </span>
            </div>
            <div className="text-[10px] text-emerald-300/80 font-mono mt-0.5">
              🕷️ Co-Op Patrol
            </div>
          </div>
        </Html>
      </group>

      {/* Web strand attached to remote player */}
      <mesh ref={webLineRef}>
        <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </>
  );
}

export function MultiplayerCityPlayers({
  enabled = true,
  localPlayerPos = [0, 15, 0],
}: MultiplayerCityPlayersProps) {
  if (!enabled) return null;

  return (
    <group name="multiplayer-city-players">
      {COOP_PLAYERS.map((player) => (
        <RemotePlayerRig key={player.id} player={player} localPos={localPlayerPos} />
      ))}
    </group>
  );
}
