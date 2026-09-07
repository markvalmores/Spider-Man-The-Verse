import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export interface CrimeEnemy {
  id: string;
  name: string;
  type: 'thug' | 'enforcer' | 'drone' | 'sniper';
  position: [number, number, number];
  rotationY: number;
  health: number;
  maxHealth: number;
  isWebbed: boolean;
  isStunned: boolean;
  isKnockedOut: boolean;
  webDurationSec: number;
}

interface CityCrimeCombat3DProps {
  playerPos: [number, number, number];
  isAttacking: boolean;
  isSlamming: boolean;
  crimeActive: boolean;
  crimeLocation?: [number, number, number];
  onEnemyDefeated?: (enemyName: string, rewardKarma: number, rewardPizza: number) => void;
  onAllEnemiesCleared?: () => void;
  playSound?: (sound: any) => void;
}

export default function CityCrimeCombat3D({
  playerPos,
  isAttacking,
  isSlamming,
  crimeActive,
  crimeLocation = [80, 40, 50],
  onEnemyDefeated,
  onAllEnemiesCleared,
  playSound,
}: CityCrimeCombat3DProps) {
  const [enemies, setEnemies] = useState<CrimeEnemy[]>([]);
  const [combatPopup, setCombatPopup] = useState<{ text: string; color: string; pos: [number, number, number] } | null>(null);
  const prevAttackRef = useRef(false);
  const prevSlamRef = useRef(false);

  // Initialize squad of enemies at crime location when active
  useEffect(() => {
    if (crimeActive) {
      const [cx, cy, cz] = crimeLocation;
      setEnemies([
        {
          id: 'enemy_1',
          name: 'Maggia Enforcer',
          type: 'enforcer',
          position: [cx + 3, cy, cz + 2],
          rotationY: 0.5,
          health: 100,
          maxHealth: 100,
          isWebbed: false,
          isStunned: false,
          isKnockedOut: false,
          webDurationSec: 0,
        },
        {
          id: 'enemy_2',
          name: 'Bank Robber',
          type: 'thug',
          position: [cx - 3, cy, cz + 4],
          rotationY: -0.8,
          health: 70,
          maxHealth: 70,
          isWebbed: false,
          isStunned: false,
          isKnockedOut: false,
          webDurationSec: 0,
        },
        {
          id: 'enemy_3',
          name: 'Getaway Look-out',
          type: 'thug',
          position: [cx + 5, cy, cz - 3],
          rotationY: 2.1,
          health: 70,
          maxHealth: 70,
          isWebbed: false,
          isStunned: false,
          isKnockedOut: false,
          webDurationSec: 0,
        },
        {
          id: 'enemy_4',
          name: 'Rogue Oscorp Drone',
          type: 'drone',
          position: [cx, cy + 4, cz],
          rotationY: 0,
          health: 60,
          maxHealth: 60,
          isWebbed: false,
          isStunned: false,
          isKnockedOut: false,
          webDurationSec: 0,
        },
      ]);
    } else {
      setEnemies([]);
    }
  }, [crimeActive, crimeLocation]);

  // Combat collision & hit detection frame
  useFrame((state, delta) => {
    if (!crimeActive || enemies.length === 0) return;

    // Detect new attack or ground slam trigger
    const justAttacked = isAttacking && !prevAttackRef.current;
    const justSlammed = isSlamming && !prevSlamRef.current;
    prevAttackRef.current = isAttacking;
    prevSlamRef.current = isSlamming;

    if (justAttacked || justSlammed) {
      let anyHit = false;

      setEnemies((prev) => {
        const next = prev.map((enemy) => {
          if (enemy.isKnockedOut) return enemy;

          const dx = playerPos[0] - enemy.position[0];
          const dy = playerPos[1] - enemy.position[1];
          const dz = playerPos[2] - enemy.position[2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Hit range (Melee: 4.5m, Ground slam: 8m)
          const hitRange = justSlammed ? 8.5 : 4.5;

          if (dist <= hitRange) {
            anyHit = true;
            const damage = justSlammed ? 60 : 35;
            const newHp = Math.max(0, enemy.health - damage);
            const isDead = newHp === 0;

            // Trigger visual floating combat comic text
            const comicTexts = ['💥 BAM!', '⚡ THWIP!', '🥊 POW!', '💫 CRACK!', '🕸️ WHAM!'];
            const chosen = comicTexts[Math.floor(Math.random() * comicTexts.length)];
            setCombatPopup({
              text: isDead ? 'KO! WEB RESTRAINED' : chosen,
              color: isDead ? '#ef4444' : '#fbbf24',
              pos: [enemy.position[0], enemy.position[1] + 2, enemy.position[2]],
            });
            setTimeout(() => setCombatPopup(null), 1200);

            if (isDead && onEnemyDefeated) {
              onEnemyDefeated(enemy.name, 25, 2);
            }

            return {
              ...enemy,
              health: newHp,
              isKnockedOut: isDead,
              isWebbed: isDead,
              isStunned: !isDead,
            };
          }

          return enemy;
        });

        // Check if all are cleared
        const remaining = next.filter((e) => !e.isKnockedOut);
        if (remaining.length === 0 && prev.some((e) => !e.isKnockedOut)) {
          if (onAllEnemiesCleared) {
            onAllEnemiesCleared();
          }
        }

        return next;
      });
    }
  });

  if (!crimeActive || enemies.length === 0) return null;

  return (
    <group>
      {/* Dynamic Comic Popups in 3D Space */}
      {combatPopup && (
        <group position={combatPopup.pos}>
          <Html center distanceFactor={25} className="pointer-events-none select-none">
            <div
              className="text-2xl sm:text-3xl font-black font-['Bangers'] tracking-wider px-3 py-1 rounded-xl border-2 border-black shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce text-center whitespace-nowrap"
              style={{
                backgroundColor: combatPopup.color,
                color: '#111827',
                transform: 'rotate(-5deg)',
              }}
            >
              {combatPopup.text}
            </div>
          </Html>
        </group>
      )}

      {/* Render 3D Hostiles */}
      {enemies.map((enemy) => (
        <group
          key={enemy.id}
          position={enemy.position}
          rotation={[enemy.isKnockedOut ? Math.PI / 2 : 0, enemy.rotationY, 0]}
        >
          {/* Overhead Health Meter and Tag */}
          {!enemy.isKnockedOut && (
            <Html position={[0, enemy.type === 'drone' ? 1.5 : 2.6, 0]} center distanceFactor={20}>
              <div className="flex flex-col items-center pointer-events-none select-none">
                <span className="text-[10px] font-sans font-bold text-red-400 bg-neutral-950/80 px-2 py-0.5 rounded border border-red-500/50 uppercase">
                  {enemy.name}
                </span>
                {/* Health Bar */}
                <div className="w-14 h-1.5 bg-neutral-900 border border-neutral-700 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-red-500 transition-all duration-200"
                    style={{
                      width: `${(enemy.health / enemy.maxHealth) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </Html>
          )}

          {/* Web Cocoon when defeated */}
          {enemy.isKnockedOut && (
            <group position={[0, 0.4, 0]}>
              <mesh>
                <capsuleGeometry args={[0.5, 1.4, 8, 16]} />
                <meshStandardMaterial
                  color="#ffffff"
                  roughness={0.2}
                  transparent
                  opacity={0.88}
                  emissive="#e0f2fe"
                  emissiveIntensity={0.4}
                />
              </mesh>
            </group>
          )}

          {/* ENEMY MESH MODELS */}
          {enemy.type === 'drone' ? (
            /* Drone Model */
            <group position={[0, 0, 0]}>
              {/* Drone Body */}
              <mesh>
                <boxGeometry args={[1.2, 0.3, 1.2]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
              {/* Central Core Eye */}
              <mesh position={[0, 0, 0.6]}>
                <sphereGeometry args={[0.2, 12, 12]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              {/* 4 Rotors */}
              {[
                [0.7, 0.2, 0.7],
                [-0.7, 0.2, 0.7],
                [0.7, 0.2, -0.7],
                [-0.7, 0.2, -0.7],
              ].map((rpos, i) => (
                <mesh key={i} position={rpos as [number, number, number]}>
                  <cylinderGeometry args={[0.3, 0.3, 0.05, 8]} />
                  <meshStandardMaterial color="#64748b" />
                </mesh>
              ))}
            </group>
          ) : (
            /* Humanoid Thug / Enforcer Model */
            <group position={[0, 0.9, 0]}>
              {/* Torso */}
              <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.7, 0.8, 0.45]} />
                <meshStandardMaterial
                  color={enemy.type === 'enforcer' ? '#1e3a8a' : '#374151'}
                  roughness={0.6}
                />
              </mesh>
              {/* Head */}
              <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[0.24, 12, 12]} />
                <meshStandardMaterial color="#fed7aa" roughness={0.5} />
              </mesh>
              {/* Mask / Ski Hood */}
              <mesh position={[0, 0.8, 0.05]}>
                <sphereGeometry args={[0.25, 12, 12]} />
                <meshStandardMaterial color="#111827" roughness={0.8} />
              </mesh>
              {/* Left Arm */}
              <mesh position={[-0.45, 0.2, 0]}>
                <capsuleGeometry args={[0.1, 0.6, 6, 8]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
              {/* Right Arm (Holding weapon) */}
              <mesh position={[0.45, 0.2, 0.2]} rotation={[0.4, 0, 0]}>
                <capsuleGeometry args={[0.1, 0.6, 6, 8]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
              {/* Crowbar / Baseball bat */}
              <mesh position={[0.55, 0.4, 0.4]} rotation={[0.6, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
              </mesh>
              {/* Legs */}
              <mesh position={[-0.2, -0.6, 0]}>
                <capsuleGeometry args={[0.12, 0.6, 6, 8]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
              <mesh position={[0.2, -0.6, 0]}>
                <capsuleGeometry args={[0.12, 0.6, 6, 8]} />
                <meshStandardMaterial color="#0f172a" />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
}
