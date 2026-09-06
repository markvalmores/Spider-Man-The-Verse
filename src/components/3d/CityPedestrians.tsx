import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  PedestrianData,
  PedestrianBehaviorState,
  WeatherType,
  NearbyCitizenPrompt,
} from './CityTypes';

interface CityPedestriansProps {
  weather: WeatherType;
  playerPos: [number, number, number];
  isPaused?: boolean;
  activeInteractionTrigger?: number; // timestamp increment when player presses E / Greet
  isPlayerAttackingOrSlamming?: boolean;
  onPedestriansUpdate?: (peds: PedestrianData[]) => void;
  onNearbyCitizenChange?: (prompt: NearbyCitizenPrompt | null) => void;
  onCitizenInteracted?: (karmaReward: number, dialog: string) => void;
  playSound?: (sound: any) => void;
}

const NYC_NAMES = [
  'Peter D.',
  'Officer Davis',
  'Aunt May',
  'Stan L.',
  'MJ fan',
  'Ned L.',
  'Miles F.',
  'Gwen S.',
  'Felicia',
  'Bodega Sal',
  'Coach Wilson',
  'J.J. Jr.',
  'Pizza Pete',
  'Gloria',
  'Flash T.',
  'Robbie R.',
];

const NYC_DIALOGS = [
  'Hey Spidey, do a backflip!',
  "I'm walkin' here, Spider-Man! Love you!",
  'My nephew has your poster in Queens!',
  'Give Green Goblin one for me!',
  'Stay dry out there in this weather!',
  'You saved my bodega last week, hero!',
  'Can we get a selfie, Web-Head?!',
  'New York loves you, Spider-Man!',
  'Keep Queens and Brooklyn safe!',
  'Spider-Man! You look amazing in person!',
];

export default function CityPedestrians({
  weather,
  playerPos,
  isPaused = false,
  activeInteractionTrigger = 0,
  isPlayerAttackingOrSlamming = false,
  onPedestriansUpdate,
  onNearbyCitizenChange,
  onCitizenInteracted,
  playSound,
}: CityPedestriansProps) {
  // Generate a network of pedestrians patrolling sidewalks
  const initialPedestrians = useMemo<PedestrianData[]>(() => {
    const list: PedestrianData[] = [];
    const bodyColors = [
      '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#06b6d4', '#64748b', '#d97706', '#0284c7',
    ];
    const pantsColors = ['#1e293b', '#0f172a', '#334155', '#1e1b4b', '#475569'];
    const umbrellaColors = [
      '#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea',
      '#e11d48', '#0891b2', '#f97316', '#4f46e5',
    ];
    const hatColors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];

    let idCount = 0;

    // Grid sidewalks along avenues: x in [-130, -85, -40, 5, 50, 95, 140]
    const sidewalkOffsets = [-130, -85, -40, 5, 50, 95, 140];

    sidewalkOffsets.forEach((avenueX) => {
      // 5 pedestrians per avenue sidewalk
      for (let i = 0; i < 5; i++) {
        const startZ = -140 + i * 55 + (Math.random() * 8 - 4);
        const targetZ = startZ + (Math.random() > 0.5 ? 55 : -55);
        const name = NYC_NAMES[idCount % NYC_NAMES.length];
        list.push({
          id: `ped_${idCount++}`,
          name,
          x: avenueX + (Math.random() * 3 - 1.5),
          z: startZ,
          targetX: avenueX + (Math.random() * 3 - 1.5),
          targetZ,
          speed: 2.6 + Math.random() * 1.4,
          rotY: targetZ > startZ ? 0 : Math.PI,
          bodyColor: bodyColors[idCount % bodyColors.length],
          pantsColor: pantsColors[idCount % pantsColors.length],
          umbrellaColor: umbrellaColors[idCount % umbrellaColors.length],
          hatColor: hatColors[idCount % hatColors.length],
          hasHat: Math.random() > 0.3,
          walkOffset: Math.random() * Math.PI * 2,
          isScared: false,
          speechBubble: null,
          speechTimer: 0,
          state: 'walking',
          reactionTimer: 0,
          hasInteracted: false,
          phoneFlash: false,
        });
      }
    });

    // Central Plaza pedestrians
    for (let p = 0; p < 12; p++) {
      const angle = (p / 12) * Math.PI * 2;
      const radius = 8 + Math.random() * 14;
      const name = NYC_NAMES[idCount % NYC_NAMES.length];
      list.push({
        id: `ped_plaza_${idCount++}`,
        name,
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        targetX: Math.cos(angle + 1.2) * radius,
        targetZ: Math.sin(angle + 1.2) * radius,
        speed: 2.0 + Math.random() * 1.0,
        rotY: angle + Math.PI / 2,
        bodyColor: bodyColors[idCount % bodyColors.length],
        pantsColor: pantsColors[idCount % pantsColors.length],
        umbrellaColor: umbrellaColors[idCount % umbrellaColors.length],
        hatColor: hatColors[idCount % hatColors.length],
        hasHat: true,
        walkOffset: Math.random() * Math.PI * 2,
        isScared: false,
        speechBubble: null,
        speechTimer: 0,
        state: 'walking',
        reactionTimer: 0,
        hasInteracted: false,
        phoneFlash: false,
      });
    }

    return list;
  }, []);

  const [pedestrians, setPedestrians] = useState<PedestrianData[]>(initialPedestrians);
  const pedsRef = useRef<PedestrianData[]>(initialPedestrians);
  pedsRef.current = pedestrians;

  const lastCandidateIdRef = useRef<string | null>(null);
  const lastParentSyncRef = useRef<number>(0);
  const lastTriggerRef = useRef(activeInteractionTrigger);

  // Handle interaction trigger (E key / Greet HUD button)
  useEffect(() => {
    if (activeInteractionTrigger === lastTriggerRef.current) return;
    lastTriggerRef.current = activeInteractionTrigger;

    // Find nearest citizen within 5m
    let nearestPed: PedestrianData | null = null;
    let minDist = 5.2;

    pedsRef.current.forEach((ped) => {
      const dx = playerPos[0] - ped.x;
      const dz = playerPos[2] - ped.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < minDist) {
        minDist = d;
        nearestPed = ped;
      }
    });

    if (nearestPed) {
      const pedToUpdate = nearestPed as PedestrianData;
      const dialog = NYC_DIALOGS[Math.floor(Math.random() * NYC_DIALOGS.length)];
      const karmaReward = 20;

      // Sound
      if (playSound) {
        playSound('highfive');
        setTimeout(() => playSound('cheer'), 250);
      }

      // Notify parent
      onCitizenInteracted?.(karmaReward, dialog);

      // Update pedestrian state
      setPedestrians((prev) =>
        prev.map((p) => {
          if (p.id === pedToUpdate.id) {
            return {
              ...p,
              state: 'highfive',
              reactionTimer: 4.0,
              speechBubble: dialog,
              speechTimer: 4.0,
              hasInteracted: true,
              phoneFlash: true,
            };
          }
          return p;
        })
      );
    }
  }, [activeInteractionTrigger, playerPos, playSound, onCitizenInteracted]);

  useFrame((state, delta) => {
    if (isPaused) return;
    const dt = Math.min(delta, 0.1);
    const clock = state.clock.getElapsedTime();

    const weatherSpeedMul = weather === 'rain' ? 1.45 : weather === 'snow' ? 0.75 : 1.0;
    const isPlayerGrounded = playerPos[1] < 3.2;

    let closestCandidate: NearbyCitizenPrompt | null = null;
    let closestDist = 5.0;

    const updated = pedsRef.current.map((ped) => {
      const dx = playerPos[0] - ped.x;
      const dy = playerPos[1] - 0;
      const dz = playerPos[2] - ped.z;
      const distToPlayer = Math.sqrt(dx * dx + dy * dy + dz * dz);

      let curState: PedestrianBehaviorState = ped.state;
      let reactionT = (ped.reactionTimer || 0) - dt;
      let speechT = (ped.speechTimer || 0) - dt;
      let speech = ped.speechBubble;
      let flash = ped.phoneFlash;

      // Handle scared reaction if player slams or attacks nearby
      if (isPlayerAttackingOrSlamming && distToPlayer < 14) {
        curState = 'scared';
        reactionT = 3.5;
        speech = 'WATCH OUT! SPIDEY IS IN COMBAT!';
        speechT = 3.0;
      }

      // Proximity reactions when Spidey is near
      if (reactionT <= 0) {
        if (distToPlayer < 8.0) {
          // If close on ground: Paparazzi / Fan Cheering / High-Five ready
          if (isPlayerGrounded) {
            curState = ped.hasInteracted
              ? 'cheering'
              : Math.random() > 0.45
              ? 'paparazzi'
              : 'cheering';
          } else {
            // Flying overhead: Look up and cheer!
            curState = 'cheering';
          }
          reactionT = 3.5;

          if (!speech) {
            speech =
              curState === 'paparazzi'
                ? 'SMILE SPIDEY! 📸'
                : 'SPIDER-MAN! NYC LOVES YA!';
            speechT = 3.0;
          }
        } else {
          curState = 'walking';
          flash = false;
        }
      }

      // Check for prompt if player is close enough to interact
      if (isPlayerGrounded && distToPlayer < closestDist) {
        closestDist = distToPlayer;
        closestCandidate = {
          id: ped.id,
          name: ped.name,
          distance: Math.round(distToPlayer * 10) / 10,
          actionText: curState === 'paparazzi' ? 'POSE FOR PHOTO' : 'HIGH-FIVE CITIZEN',
          quote: speech || 'Hey, Spider-Man!',
        };
      }

      // Phone flash strobe effect
      if (curState === 'paparazzi') {
        flash = Math.sin(clock * 18) > 0.8;
      } else {
        flash = false;
      }

      if (speechT <= 0) {
        speech = null;
      }

      // Scared behavior: run away from player
      if (curState === 'scared') {
        const awayX = ped.x - playerPos[0];
        const awayZ = ped.z - playerPos[2];
        const awayLen = Math.sqrt(awayX * awayX + awayZ * awayZ) || 1;
        const speed = ped.speed * 1.8 * dt;
        return {
          ...ped,
          x: ped.x + (awayX / awayLen) * speed,
          z: ped.z + (awayZ / awayLen) * speed,
          rotY: Math.atan2(awayX, awayZ),
          state: curState,
          reactionTimer: reactionT,
          speechBubble: speech,
          speechTimer: speechT,
        };
      }

      // If cheering or interacting, face the player directly
      if (curState === 'cheering' || curState === 'paparazzi' || curState === 'highfive') {
        const faceAngle = Math.atan2(dx, dz);
        return {
          ...ped,
          rotY: faceAngle,
          state: curState,
          reactionTimer: reactionT,
          speechBubble: speech,
          speechTimer: speechT,
          phoneFlash: flash,
        };
      }

      // Normal walking pathing toward target
      const toTargetX = ped.targetX - ped.x;
      const toTargetZ = ped.targetZ - ped.z;
      const targetDist = Math.sqrt(toTargetX * toTargetX + toTargetZ * toTargetZ);

      let newX = ped.x;
      let newZ = ped.z;
      let newTargetX = ped.targetX;
      let newTargetZ = ped.targetZ;
      let newRot = ped.rotY;

      if (targetDist < 1.5) {
        newTargetX = ped.x + (Math.random() > 0.5 ? 45 : -45);
        newTargetZ = ped.z + (Math.random() > 0.5 ? 45 : -45);
        newTargetX = Math.max(-145, Math.min(145, newTargetX));
        newTargetZ = Math.max(-145, Math.min(145, newTargetZ));
      } else {
        const step = ped.speed * weatherSpeedMul * dt;
        const dirX = toTargetX / targetDist;
        const dirZ = toTargetZ / targetDist;
        newX += dirX * step;
        newZ += dirZ * step;
        newRot = Math.atan2(dirX, dirZ);
      }

      return {
        ...ped,
        x: newX,
        z: newZ,
        targetX: newTargetX,
        targetZ: newTargetZ,
        rotY: newRot,
        state: curState,
        reactionTimer: reactionT,
        speechBubble: speech,
        speechTimer: speechT,
        phoneFlash: false,
      };
    });

    // Notify parent of nearby citizen prompt ONLY when the candidate actually changes
    const newCandidateId = closestCandidate ? closestCandidate.id : null;
    if (newCandidateId !== lastCandidateIdRef.current) {
      lastCandidateIdRef.current = newCandidateId;
      onNearbyCitizenChange?.(closestCandidate);
    }

    // Update internal state occasionally, and throttle parent minimap updates
    if (Math.floor(clock * 10) % 3 === 0) {
      setPedestrians(updated);
      if (clock - lastParentSyncRef.current > 2.0) {
        lastParentSyncRef.current = clock;
        onPedestriansUpdate?.(updated);
      }
    } else {
      pedsRef.current = updated;
    }
  });

  return (
    <group>
      {pedestrians.map((ped) => {
        // Distance check from player: only render within 140 units
        const dx = ped.x - playerPos[0];
        const dz = ped.z - playerPos[2];
        if (dx * dx + dz * dz > 140 * 140) return null;

        const isHoldingUmbrella = weather === 'rain';
        const isShivering = weather === 'snow';
        const isCheering = ped.state === 'cheering';
        const isPaparazzi = ped.state === 'paparazzi';
        const isHighFiving = ped.state === 'highfive';
        const isScared = ped.state === 'scared';

        return (
          <group
            key={ped.id}
            position={[ped.x, 0, ped.z]}
            rotation={[0, ped.rotY, 0]}
          >
            {/* Pedestrian Body Rig */}
            <group position={[0, 0, 0]}>
              {/* Legs */}
              <mesh position={[-0.15, 0.45, 0]}>
                <boxGeometry args={[0.16, 0.9, 0.18]} />
                <meshStandardMaterial color={ped.pantsColor} roughness={0.7} />
              </mesh>
              <mesh position={[0.15, 0.45, 0]}>
                <boxGeometry args={[0.16, 0.9, 0.18]} />
                <meshStandardMaterial color={ped.pantsColor} roughness={0.7} />
              </mesh>

              {/* Torso / Coat */}
              <mesh position={[0, 1.15, 0]}>
                <boxGeometry args={[0.5, 0.65, 0.32]} />
                <meshStandardMaterial color={ped.bodyColor} roughness={0.6} />
              </mesh>

              {/* Head */}
              <mesh position={[0, 1.62, 0]}>
                <sphereGeometry args={[0.2, 10, 10]} />
                <meshStandardMaterial color="#fed7aa" roughness={0.5} />
              </mesh>

              {/* Accessories according to Weather */}
              {/* 1. Rain: Umbrella */}
              {isHoldingUmbrella && !isPaparazzi && (
                <group position={[0.25, 1.25, 0.1]}>
                  <mesh position={[0, 0.5, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 1.1, 6]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.7} />
                  </mesh>
                  <mesh position={[0, 1.05, 0]}>
                    <cylinderGeometry args={[0.85, 0.1, 0.38, 12]} />
                    <meshStandardMaterial
                      color={ped.umbrellaColor}
                      roughness={0.2}
                      metalness={0.1}
                    />
                  </mesh>
                </group>
              )}

              {/* 2. Snow: Winter Beanie Hat & Scarf */}
              {weather === 'snow' && (
                <>
                  <mesh position={[0, 1.76, 0]}>
                    <sphereGeometry args={[0.22, 8, 8]} />
                    <meshStandardMaterial color={ped.hatColor || '#ef4444'} roughness={0.8} />
                  </mesh>
                  <mesh position={[0, 1.96, 0]}>
                    <sphereGeometry args={[0.07, 6, 6]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.9} />
                  </mesh>
                  <mesh position={[0, 1.48, 0]}>
                    <torusGeometry args={[0.18, 0.08, 6, 12]} />
                    <meshStandardMaterial color={ped.hatColor || '#ef4444'} roughness={0.8} />
                  </mesh>
                </>
              )}

              {/* 3. Dynamic Arms for AI States */}
              {/* CHEERING: Arms raised overhead waving! */}
              {isCheering && (
                <>
                  <mesh position={[-0.35, 1.65, 0]} rotation={[0, 0, 0.5]}>
                    <boxGeometry args={[0.14, 0.65, 0.15]} />
                    <meshStandardMaterial color={ped.bodyColor} />
                  </mesh>
                  <mesh position={[0.35, 1.65, 0]} rotation={[0, 0, -0.5]}>
                    <boxGeometry args={[0.14, 0.65, 0.15]} />
                    <meshStandardMaterial color={ped.bodyColor} />
                  </mesh>
                </>
              )}

              {/* PAPARAZZI: Holding up smartphone snapping photos */}
              {isPaparazzi && (
                <>
                  <mesh position={[0, 1.35, 0.35]} rotation={[-1.2, 0, 0]}>
                    <boxGeometry args={[0.4, 0.12, 0.12]} />
                    <meshStandardMaterial color={ped.bodyColor} />
                  </mesh>
                  {/* Smartphone box */}
                  <mesh position={[0, 1.45, 0.48]}>
                    <boxGeometry args={[0.2, 0.32, 0.03]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.8} />
                  </mesh>
                  {/* Camera Flash Lens */}
                  <mesh position={[0.06, 1.55, 0.5]}>
                    <sphereGeometry args={[0.04, 6, 6]} />
                    <meshBasicMaterial
                      color={ped.phoneFlash ? '#ffffff' : '#38bdf8'}
                    />
                  </mesh>
                  {ped.phoneFlash && (
                    <pointLight
                      position={[0, 1.55, 0.6]}
                      intensity={2.0}
                      distance={6}
                      color="#ffffff"
                    />
                  )}
                </>
              )}

              {/* HIGH FIVE: Right hand extended forward */}
              {isHighFiving && (
                <>
                  <mesh position={[-0.32, 1.12, 0]}>
                    <boxGeometry args={[0.14, 0.55, 0.15]} />
                    <meshStandardMaterial color={ped.bodyColor} />
                  </mesh>
                  <mesh position={[0.3, 1.4, 0.3]} rotation={[-1.4, 0, -0.2]}>
                    <boxGeometry args={[0.14, 0.65, 0.15]} />
                    <meshStandardMaterial color={ped.bodyColor} />
                  </mesh>
                  {/* Open Palm */}
                  <mesh position={[0.3, 1.68, 0.32]}>
                    <boxGeometry args={[0.18, 0.18, 0.05]} />
                    <meshStandardMaterial color="#fed7aa" />
                  </mesh>
                </>
              )}

              {/* SCARED: Arms flailing backward */}
              {isScared && (
                <>
                  <mesh position={[-0.35, 1.45, -0.1]} rotation={[1.2, 0, 0.4]}>
                    <boxGeometry args={[0.14, 0.6, 0.15]} />
                    <meshStandardMaterial color={ped.bodyColor} />
                  </mesh>
                  <mesh position={[0.35, 1.45, -0.1]} rotation={[1.2, 0, -0.4]}>
                    <boxGeometry args={[0.14, 0.6, 0.15]} />
                    <meshStandardMaterial color={ped.bodyColor} />
                  </mesh>
                </>
              )}

              {/* DEFAULT WALKING: Arms at sides with gentle sway */}
              {!isCheering && !isPaparazzi && !isHighFiving && !isScared && !isHoldingUmbrella && (
                <>
                  <mesh
                    position={[-0.32, 1.12, 0]}
                    rotation={[isShivering ? 0.6 : 0, 0, isShivering ? 0.3 : 0]}
                  >
                    <boxGeometry args={[0.14, 0.55, 0.15]} />
                    <meshStandardMaterial color={ped.bodyColor} roughness={0.6} />
                  </mesh>
                  <mesh
                    position={[0.32, 1.12, 0]}
                    rotation={[isShivering ? 0.6 : 0, 0, isShivering ? -0.3 : 0]}
                  >
                    <boxGeometry args={[0.14, 0.55, 0.15]} />
                    <meshStandardMaterial color={ped.bodyColor} roughness={0.6} />
                  </mesh>
                </>
              )}
            </group>

            {/* Comic Speech Bubble Billboard */}
            {ped.speechBubble && (
              <group position={[0, 2.45, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[1.8, 0.55, 0.06]} />
                  <meshBasicMaterial color={isHighFiving ? '#fef08a' : '#ffffff'} />
                </mesh>
                <mesh position={[0, 0, -0.01]}>
                  <boxGeometry args={[1.88, 0.63, 0.04]} />
                  <meshBasicMaterial color="#000000" />
                </mesh>
                <mesh position={[0, -0.34, 0]} rotation={[0, 0, Math.PI / 4]}>
                  <boxGeometry args={[0.18, 0.18, 0.05]} />
                  <meshBasicMaterial color={isHighFiving ? '#fef08a' : '#ffffff'} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}
