import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export interface AerialRing {
  id: number;
  position: [number, number, number];
  rotation: [number, number, number];
  passed: boolean;
  radius: number;
}

const SKYLINE_COURSE_RINGS: AerialRing[] = [
  { id: 1, position: [0, 45, 20], rotation: [0, 0, 0], passed: false, radius: 4.8 },
  { id: 2, position: [40, 70, -20], rotation: [0, 0.4, 0], passed: false, radius: 4.8 },
  { id: 3, position: [100, 105, -90], rotation: [0, 0.8, 0], passed: false, radius: 5.2 },
  { id: 4, position: [110, 130, -110], rotation: [0, 1.4, 0], passed: false, radius: 5.5 }, // Avengers Tower Helipad pass
  { id: 5, position: [50, 115, -140], rotation: [0, 2.2, 0], passed: false, radius: 5.0 },
  { id: 6, position: [-120, 125, -150], rotation: [0, 2.8, 0], passed: false, radius: 5.5 }, // Empire State pass
  { id: 7, position: [-150, 105, -80], rotation: [0, 3.1, 0], passed: false, radius: 5.0 },
  { id: 8, position: [-120, 85, 80], rotation: [0, -2.5, 0], passed: false, radius: 4.8 }, // Oscorp Tower swoop
  { id: 9, position: [-50, 65, 120], rotation: [0, -1.8, 0], passed: false, radius: 4.8 },
  { id: 10, position: [0, 50, 40], rotation: [0, -0.6, 0], passed: false, radius: 5.0 },
];

interface AerialRingChallengesProps {
  playerPos: [number, number, number];
  onPassRing: (ringId: number, totalRings: number) => void;
  onCourseCompleted?: () => void;
  playSound?: (sound: any) => void;
}

export default function AerialRingChallenges({
  playerPos,
  onPassRing,
  onCourseCompleted,
  playSound,
}: AerialRingChallengesProps) {
  const [rings, setRings] = useState<AerialRing[]>(SKYLINE_COURSE_RINGS);
  const [ringFlash, setRingFlash] = useState<number | null>(null);

  useFrame((_, delta) => {
    rings.forEach((ring) => {
      if (!ring.passed) {
        const dx = playerPos[0] - ring.position[0];
        const dy = playerPos[1] - ring.position[1];
        const dz = playerPos[2] - ring.position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Check if player flew through ring
        if (dist <= ring.radius + 1.2) {
          setRingFlash(ring.id);
          setTimeout(() => setRingFlash(null), 800);

          setRings((prev) => {
            const next = prev.map((r) => (r.id === ring.id ? { ...r, passed: true } : r));
            const allPassed = next.every((r) => r.passed);
            if (allPassed && onCourseCompleted) {
              onCourseCompleted();
            }
            return next;
          });

          onPassRing(ring.id, SKYLINE_COURSE_RINGS.length);
        }
      }
    });
  });

  return (
    <group>
      {rings.map((ring) => (
        <group key={ring.id} position={ring.position} rotation={ring.rotation}>
          {/* Outer Golden Torus Ring */}
          <mesh>
            <torusGeometry args={[ring.radius, 0.22, 12, 32]} />
            <meshStandardMaterial
              color={ring.passed ? '#10b981' : '#f59e0b'}
              emissive={ring.passed ? '#059669' : '#d97706'}
              emissiveIntensity={ring.passed ? 0.8 : 1.8}
            />
          </mesh>

          {/* Inner Holographic Glow Disk */}
          {!ring.passed && (
            <mesh>
              <circleGeometry args={[ring.radius, 24]} />
              <meshBasicMaterial
                color="#fbbf24"
                transparent
                opacity={0.22}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}

          {/* Ring Number Tag */}
          {!ring.passed && (
            <Html position={[0, ring.radius + 1.2, 0]} center distanceFactor={25}>
              <div className="bg-neutral-950/90 border border-amber-500 text-amber-300 px-2 py-0.5 rounded-full text-xs font-mono font-black shadow-lg pointer-events-none select-none">
                RING {ring.id}/{SKYLINE_COURSE_RINGS.length}
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
