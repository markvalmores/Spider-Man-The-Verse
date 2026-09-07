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
  { id: 1, position: [0, 80, 20], rotation: [0, 0, 0], passed: false, radius: 4.5 },
  { id: 2, position: [25, 95, 45], rotation: [0, 0.4, 0], passed: false, radius: 4.5 },
  { id: 3, position: [60, 110, 80], rotation: [0, 0.7, 0], passed: false, radius: 4.5 },
  { id: 4, position: [90, 125, 60], rotation: [0, 1.4, 0], passed: false, radius: 4.5 },
  { id: 5, position: [110, 140, 20], rotation: [0, 2.0, 0], passed: false, radius: 4.5 },
  { id: 6, position: [90, 130, -30], rotation: [0, 2.8, 0], passed: false, radius: 4.5 },
  { id: 7, position: [40, 115, -70], rotation: [0, 3.1, 0], passed: false, radius: 4.5 },
  { id: 8, position: [-20, 100, -80], rotation: [0, -2.5, 0], passed: false, radius: 4.5 },
  { id: 9, position: [-70, 90, -40], rotation: [0, -1.8, 0], passed: false, radius: 4.5 },
  { id: 10, position: [-40, 85, 0], rotation: [0, -0.6, 0], passed: false, radius: 4.5 },
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
