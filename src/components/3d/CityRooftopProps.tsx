import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface BackpackCollectible {
  id: string;
  name: string;
  lore: string;
  position: [number, number, number];
  collected: boolean;
  rewardPizza: number;
}

export const INITIAL_BACKPACKS: BackpackCollectible[] = [
  {
    id: 'bp_1',
    name: "Peter's High School Science Trophy",
    lore: "Midtown High 1st Place Physics Fair. Dr. Warren told me I'd do great things one day.",
    position: [0, 96, -20],
    collected: false,
    rewardPizza: 5,
  },
  {
    id: 'bp_2',
    name: 'First Web-Fluid Formula Vial',
    lore: 'Calculated the polymer chain tensile strength in my bedroom before Aunt May made dinner.',
    position: [40, 75, 40],
    collected: false,
    rewardPizza: 5,
  },
  {
    id: 'bp_3',
    name: 'Daily Bugle Press Pass #104',
    lore: 'J.J.J. yelled at me for 20 minutes before approving this badge. "PARKER, GET ME SPIDER-MAN!"',
    position: [-80, 105, 0],
    collected: false,
    rewardPizza: 5,
  },
  {
    id: 'bp_4',
    name: 'Prototype Spider-Tracer',
    lore: 'Emits a 2.4GHz chirp tuned to my spider-sense. Great for tailing getaway vans.',
    position: [120, 125, 120],
    collected: false,
    rewardPizza: 5,
  },
  {
    id: 'bp_5',
    name: 'Vulture Chitin Wing Scrap',
    lore: 'Toomes left this on the roof after our clash above the Queensboro Bridge.',
    position: [-120, 85, -120],
    collected: false,
    rewardPizza: 5,
  },
  {
    id: 'bp_6',
    name: 'Oscorp Security Keycard',
    lore: 'Norman Osborn dropped this during an emergency evacuation of the laboratory.',
    position: [160, 112, 120],
    collected: false,
    rewardPizza: 5,
  },
  {
    id: 'bp_7',
    name: 'Empire State Building Souvenir Coin',
    lore: 'Bought this on my first field trip with Uncle Ben and Aunt May.',
    position: [-160, 99, -160],
    collected: false,
    rewardPizza: 5,
  },
];

interface CityRooftopPropsProps {
  playerPos: [number, number, number];
  backpacks: BackpackCollectible[];
  onCollectBackpack: (id: string, name: string, lore: string, reward: number) => void;
  onVentBoost?: () => void;
}

export default function CityRooftopProps({
  playerPos,
  backpacks,
  onCollectBackpack,
  onVentBoost,
}: CityRooftopPropsProps) {
  const backpackGroupRef = useRef<THREE.Group>(null);
  const steamPuffsRef = useRef<THREE.Group>(null);

  // Steam Vents locations on rooftops
  const steamVents: [number, number, number][] = [
    [0, 95.5, -15],
    [40, 75.5, 40],
    [-80, 104.5, -5],
    [120, 124.5, 115],
    [-120, 84.5, -115],
    [40, 75.5, -60],
    [-40, 85.5, 70],
    [160, 111.5, 120],
    [-160, 98.5, -160],
  ];

  // Water Towers locations
  const waterTowers: [number, number, number][] = [
    [15, 96, -25],
    [-10, 96, -15],
    [45, 76, 45],
    [-85, 105, 10],
    [125, 125, 105],
    [-125, 85, -110],
    [165, 112, 115],
    [-165, 99, -155],
  ];

  // Construction Cranes
  const cranes: { pos: [number, number, number]; rotY: number }[] = [
    { pos: [80, 115, -40], rotY: 0.8 },
    { pos: [-80, 125, 80], rotY: -1.2 },
    { pos: [160, 135, 80], rotY: 2.1 },
    { pos: [-160, 110, -120], rotY: -0.6 },
  ];

  useFrame((_, delta) => {
    // Spin backpacks
    if (backpackGroupRef.current) {
      backpackGroupRef.current.children.forEach((child) => {
        child.rotation.y += delta * 2.2;
      });
    }

    // Check proximity to backpacks (pickup radius ~3.5m)
    backpacks.forEach((bp) => {
      if (!bp.collected) {
        const dx = playerPos[0] - bp.position[0];
        const dy = playerPos[1] - bp.position[1];
        const dz = playerPos[2] - bp.position[2];
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 16) {
          onCollectBackpack(bp.id, bp.name, bp.lore, bp.rewardPizza);
        }
      }
    });

    // Check steam vent launch boost (radius ~2.8m)
    if (onVentBoost) {
      steamVents.forEach((vent) => {
        const dx = playerPos[0] - vent[0];
        const dy = playerPos[1] - (vent[1] + 1);
        const dz = playerPos[2] - vent[2];
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < 7) {
          onVentBoost();
        }
      });
    }
  });

  return (
    <group>
      {/* 1. PETER PARKER'S HIDDEN BACKPACKS */}
      <group ref={backpackGroupRef}>
        {backpacks.map(
          (bp) =>
            !bp.collected && (
              <group key={bp.id} position={bp.position}>
                {/* Backpack Bag Body */}
                <mesh position={[0, 0.4, 0]}>
                  <boxGeometry args={[0.9, 1.1, 0.55]} />
                  <meshStandardMaterial
                    color="#b91c1c"
                    roughness={0.4}
                    metalness={0.2}
                  />
                </mesh>
                {/* Backpack Front Pocket */}
                <mesh position={[0, 0.3, 0.32]}>
                  <boxGeometry args={[0.7, 0.55, 0.2]} />
                  <meshStandardMaterial color="#1e3a8a" roughness={0.5} />
                </mesh>
                {/* Spider Symbol Pin */}
                <mesh position={[0, 0.3, 0.44]}>
                  <sphereGeometry args={[0.12, 8, 8]} />
                  <meshStandardMaterial
                    color="#f59e0b"
                    emissive="#d97706"
                    emissiveIntensity={1.2}
                  />
                </mesh>
                {/* Webbing Tether holding backpack to chimney / vent */}
                <mesh position={[0, -0.2, 0]}>
                  <cylinderGeometry args={[0.08, 0.4, 0.6, 8]} />
                  <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
                </mesh>
                {/* Golden Lore Beacon Pulsing Ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                  <ringGeometry args={[1.2, 1.5, 16]} />
                  <meshBasicMaterial
                    color="#fbbf24"
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.8}
                  />
                </mesh>
              </group>
            )
        )}
      </group>

      {/* 2. ROOFTOP STEAM AIR VENTS */}
      {steamVents.map((pos, idx) => (
        <group key={`vent-${idx}`} position={pos}>
          {/* Vent Grate Housing */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[1.2, 1.4, 0.8, 12]} />
            <meshStandardMaterial color="#374151" roughness={0.7} metalness={0.6} />
          </mesh>
          {/* Inner Exhaust Grate */}
          <mesh position={[0, 0.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 1.1, 12]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          {/* Animated Steam Column */}
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[1.8, 0.8, 6.0, 12]} />
            <meshBasicMaterial
              color="#e0f2fe"
              transparent
              opacity={0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 3. NYC WATER TOWERS */}
      {waterTowers.map((pos, idx) => (
        <group key={`watertower-${idx}`} position={pos}>
          {/* Wooden Barrel Tank */}
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[2.8, 2.8, 4.5, 16]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </mesh>
          {/* Metal Hoops */}
          <mesh position={[0, 6.5, 0]}>
            <cylinderGeometry args={[2.85, 2.85, 0.2, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[2.85, 2.85, 0.2, 16]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} />
          </mesh>
          {/* Conical Roof */}
          <mesh position={[0, 8.2, 0]}>
            <coneGeometry args={[3.2, 2.2, 16]} />
            <meshStandardMaterial color="#451a03" roughness={0.7} />
          </mesh>
          {/* Steel Support Legs */}
          <mesh position={[1.8, 1.4, 1.8]}>
            <cylinderGeometry args={[0.15, 0.15, 2.8, 6]} />
            <meshStandardMaterial color="#374151" metalness={0.8} />
          </mesh>
          <mesh position={[-1.8, 1.4, 1.8]}>
            <cylinderGeometry args={[0.15, 0.15, 2.8, 6]} />
            <meshStandardMaterial color="#374151" metalness={0.8} />
          </mesh>
          <mesh position={[1.8, 1.4, -1.8]}>
            <cylinderGeometry args={[0.15, 0.15, 2.8, 6]} />
            <meshStandardMaterial color="#374151" metalness={0.8} />
          </mesh>
          <mesh position={[-1.8, 1.4, -1.8]}>
            <cylinderGeometry args={[0.15, 0.15, 2.8, 6]} />
            <meshStandardMaterial color="#374151" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 4. ROOFTOP CONSTRUCTION CRANES */}
      {cranes.map((crane, idx) => (
        <group key={`crane-${idx}`} position={crane.pos} rotation={[0, crane.rotY, 0]}>
          {/* Base Mast Tower */}
          <mesh position={[0, 15, 0]}>
            <boxGeometry args={[2, 30, 2]} />
            <meshStandardMaterial color="#eab308" metalness={0.6} />
          </mesh>
          {/* Crane Cabin */}
          <mesh position={[0, 31, 1.5]}>
            <boxGeometry args={[3, 2.5, 3]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
          {/* Long Jib Arm */}
          <mesh position={[0, 32.5, 18]}>
            <boxGeometry args={[1.5, 1.5, 38]} />
            <meshStandardMaterial color="#facc15" metalness={0.6} />
          </mesh>
          {/* Counterweight Jib */}
          <mesh position={[0, 32.5, -8]}>
            <boxGeometry args={[1.5, 1.5, 14]} />
            <meshStandardMaterial color="#ca8a04" />
          </mesh>
          {/* Heavy Counterweight Block */}
          <mesh position={[0, 31.5, -13]}>
            <boxGeometry args={[3, 3, 3.5]} />
            <meshStandardMaterial color="#374151" roughness={0.9} />
          </mesh>
          {/* Hoist Cable and Hook */}
          <mesh position={[0, 20, 26]}>
            <cylinderGeometry args={[0.05, 0.05, 24, 6]} />
            <meshBasicMaterial color="#111827" />
          </mesh>
          <mesh position={[0, 8, 26]}>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
