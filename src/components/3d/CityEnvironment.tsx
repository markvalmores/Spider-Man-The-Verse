import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  BuildingData,
  PizzaPickup,
  CrimeMission,
  WeatherType,
  PedestrianData,
  NearbyCitizenPrompt,
} from './CityTypes';
import WeatherSystem, { WEATHER_CONFIGS } from './WeatherSystem';
import CityPedestrians from './CityPedestrians';
import CityLandmarks3D from './CityLandmarks3D';
import CityRooftopProps, { INITIAL_BACKPACKS, BackpackCollectible } from './CityRooftopProps';
import CityCrimeCombat3D from './CityCrimeCombat3D';
import AerialRingChallenges from './AerialRingChallenges';
import { MultiplayerCityPlayers } from './MultiplayerCityPlayers';
import SpiderVisionAR from './SpiderVisionAR';
import SubwayFastTravel3D from './SubwayFastTravel3D';

interface CityEnvironmentProps {
  buildings: BuildingData[];
  playerPos: [number, number, number];
  pizzas: PizzaPickup[];
  activeMission: CrimeMission | null;
  weather: WeatherType;
  isPaused?: boolean;
  activeInteractionTrigger?: number;
  isPlayerAttackingOrSlamming?: boolean;
  isAttacking?: boolean;
  isSlamming?: boolean;
  spiderVisionActive?: boolean;
  onCollectPizza: (id: string, pts: number) => void;
  onReachMission: (id: string) => void;
  onPedestriansUpdate?: (peds: PedestrianData[]) => void;
  onNearbyCitizenChange?: (prompt: NearbyCitizenPrompt | null) => void;
  onCitizenInteracted?: (karmaReward: number, dialog: string) => void;
  onBackpackCollected?: (name: string, lore: string, reward: number) => void;
  onFastTravel?: (pos: [number, number, number], name: string) => void;
  playSound?: (sound: any) => void;
}

export default function CityEnvironment({
  buildings,
  playerPos,
  pizzas,
  activeMission,
  weather,
  isPaused = false,
  activeInteractionTrigger = 0,
  isPlayerAttackingOrSlamming = false,
  isAttacking = false,
  isSlamming = false,
  spiderVisionActive = false,
  onCollectPizza,
  onReachMission,
  onPedestriansUpdate,
  onNearbyCitizenChange,
  onCitizenInteracted,
  onBackpackCollected,
  onFastTravel,
  playSound,
}: CityEnvironmentProps) {
  const pizzaGroupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const weatherConfig = WEATHER_CONFIGS[weather];
  const [backpacks, setBackpacks] = useState<BackpackCollectible[]>(INITIAL_BACKPACKS);

  const handleCollectBackpack = (id: string, name: string, lore: string, reward: number) => {
    setBackpacks((prev) =>
      prev.map((bp) => (bp.id === id ? { ...bp, collected: true } : bp))
    );
    if (onBackpackCollected) {
      onBackpackCollected(name, lore, reward);
    }
  };

  // Animate collectibles
  useFrame((_, delta) => {
    if (pizzaGroupRef.current) {
      pizzaGroupRef.current.children.forEach((child) => {
        child.rotation.y += delta * 2;
      });
    }

    if (beaconRef.current) {
      beaconRef.current.rotation.y += delta;
    }

    // Check collision with pizzas
    pizzas.forEach((p) => {
      if (!p.collected) {
        const dx = playerPos[0] - p.position[0];
        const dy = playerPos[1] - p.position[1];
        const dz = playerPos[2] - p.position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4.0) {
          onCollectPizza(p.id, p.points);
        }
      }
    });

    // Check collision with active mission beacon
    if (activeMission && !activeMission.completed) {
      const mx = playerPos[0] - activeMission.location[0];
      const my = playerPos[1] - activeMission.location[1];
      const mz = playerPos[2] - activeMission.location[2];
      const mDist = Math.sqrt(mx * mx + my * my + mz * mz);
      if (mDist < 7.0) {
        onReachMission(activeMission.id);
      }
    }
  });

  // Dynamic View-Frustum / Radius streaming: only render buildings within 260 units of player
  const visibleBuildings = useMemo(() => {
    return buildings.filter((b) => {
      const dx = b.x - playerPos[0];
      const dz = b.z - playerPos[2];
      return Math.sqrt(dx * dx + dz * dz) < 240;
    });
  }, [buildings, Math.floor(playerPos[0] / 30), Math.floor(playerPos[2] / 30)]);

  return (
    <group>
      {/* City Ground / Asphalt with Weather Surface Reactions */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial
          color={weatherConfig.groundColor}
          roughness={weatherConfig.groundRoughness}
          metalness={weatherConfig.groundMetalness}
        />
      </mesh>

      {/* Street Grid markings */}
      <gridHelper
        args={[
          700,
          70,
          weather === 'snow' ? '#94a3b8' : '#384252',
          weather === 'snow' ? '#475569' : '#212733',
        ]}
        position={[0, 0.05, 0]}
      />

      {/* Procedural Buildings */}
      {visibleBuildings.map((b) => (
        <group key={b.id} position={[b.x, b.height / 2, b.z]}>
          {/* Main Skyscraper Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.width, b.height, b.depth]} />
            <meshStandardMaterial
              color={b.color}
              roughness={weather === 'rain' ? 0.2 : 0.35}
              metalness={weather === 'rain' ? 0.5 : 0.4}
            />
          </mesh>

          {/* Glowing Window Facades */}
          <mesh position={[0, 0, b.depth / 2 + 0.05]}>
            <planeGeometry args={[b.width * 0.9, b.height * 0.88]} />
            <meshStandardMaterial
              color={b.windowColor}
              emissive={b.windowColor}
              emissiveIntensity={weather === 'rain' ? 0.85 : 0.65}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0, -b.depth / 2 - 0.05]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[b.width * 0.9, b.height * 0.88]} />
            <meshStandardMaterial
              color={b.windowColor}
              emissive={b.windowColor}
              emissiveIntensity={weather === 'rain' ? 0.85 : 0.65}
              roughness={0.2}
            />
          </mesh>

          {/* Rooftop Trim & Perch Ledge */}
          <mesh position={[0, b.height / 2 + 0.3, 0]}>
            <boxGeometry args={[b.width + 0.6, 0.6, b.depth + 0.6]} />
            <meshStandardMaterial
              color={weather === 'snow' ? '#f1f5f9' : '#334155'}
              roughness={weather === 'snow' ? 0.9 : 0.6}
            />
          </mesh>

          {/* Snow Blanket on Rooftops during Snow weather */}
          {weather === 'snow' && (
            <mesh position={[0, b.height / 2 + 0.62, 0]}>
              <boxGeometry args={[b.width + 0.4, 0.2, b.depth + 0.4]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.85} />
            </mesh>
          )}

          {/* Web Anchor Point Beacon indicator */}
          <mesh position={[0, b.height / 2 + 1.2, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={1.2}
            />
          </mesh>

          {/* Rooftop Water Tower */}
          {b.hasWaterTower && (
            <group position={[b.width * 0.25, b.height / 2 + 2.5, b.depth * 0.25]}>
              <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[1.6, 1.6, 2.8, 12]} />
                <meshStandardMaterial color="#78350f" roughness={0.8} />
              </mesh>
              {/* Stand */}
              <mesh position={[0, -0.8, 0]}>
                <cylinderGeometry args={[1.2, 1.8, 1.8, 6]} />
                <meshStandardMaterial color="#475569" metalness={0.7} />
              </mesh>
            </group>
          )}

          {/* Radio Antenna */}
          {b.hasAntenna && (
            <mesh position={[-b.width * 0.25, b.height / 2 + 6, -b.depth * 0.25]}>
              <cylinderGeometry args={[0.08, 0.2, 12, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              <mesh position={[0, 6, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
            </mesh>
          )}

          {/* Rooftop HVAC Parkour Unit (Vaultable) */}
          <group position={[-b.width * 0.22, b.height / 2 + 0.6, b.depth * 0.2]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[3.2, 1.2, 2.4]} />
              <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.35} />
            </mesh>
            {/* Ventilation fan grating */}
            <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.0, 1.6]} />
              <meshStandardMaterial color="#334155" roughness={0.9} />
            </mesh>
            {/* Warning Hazard Stripe */}
            <mesh position={[0, 0, 1.21]}>
              <planeGeometry args={[2.8, 0.2]} />
              <meshBasicMaterial color="#eab308" />
            </mesh>
          </group>

          {/* Rooftop Secondary Generator Unit */}
          {b.width > 28 && (
            <mesh position={[b.width * 0.18, b.height / 2 + 0.5, -b.depth * 0.18]} castShadow>
              <boxGeometry args={[2.6, 1.0, 3.2]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>
          )}

          {/* Street Level Concrete Vaulting Barrier */}
          <mesh position={[b.width / 2 + 3.2, -b.height / 2 + 0.5, 0]} castShadow>
            <boxGeometry args={[0.8, 1.0, 4.5]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Floating Collectible Pizzas */}
      <group ref={pizzaGroupRef}>
        {pizzas.map(
          (p) =>
            !p.collected && (
              <group key={p.id} position={p.position}>
                {/* Pizza Box / Slice */}
                <mesh position={[0, 0.4, 0]}>
                  <cylinderGeometry args={[1.3, 1.3, 0.25, 8]} />
                  <meshStandardMaterial color="#f59e0b" roughness={0.4} />
                </mesh>
                {/* Pepperoni / Toppings */}
                <mesh position={[0, 0.55, 0]}>
                  <cylinderGeometry args={[0.9, 0.9, 0.08, 6]} />
                  <meshStandardMaterial color="#dc2626" roughness={0.3} />
                </mesh>
                {/* Floating Glow Ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.6, 1.9, 16]} />
                  <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
                </mesh>
              </group>
            )
        )}
      </group>

      {/* Active Mission Holographic Beacon */}
      {activeMission && !activeMission.completed && (
        <group position={activeMission.location}>
          <mesh ref={beaconRef} position={[0, 30, 0]}>
            <cylinderGeometry args={[1.8, 1.8, 60, 16]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Mission Crest Ring */}
          <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5, 3.5, 24]} />
            <meshBasicMaterial color="#f87171" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 4, 0]}>
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#dc2626"
              emissiveIntensity={1.5}
            />
          </mesh>
        </group>
      )}

      {/* Iconic NYC & Marvel Landmarks, Bridges, Parks, Billboards & Dynamic Traffic */}
      <CityLandmarks3D
        playerPos={playerPos}
        weather={weather}
        playSound={playSound}
      />

      {/* Rooftop Props: Peter's Hidden Backpacks, Steam Vents, Water Towers, Cranes */}
      <CityRooftopProps
        playerPos={playerPos}
        backpacks={backpacks}
        onCollectBackpack={handleCollectBackpack}
      />

      {/* 3D Crime Combat System with animated hostiles and combat popups */}
      <CityCrimeCombat3D
        playerPos={playerPos}
        isAttacking={isAttacking}
        isSlamming={isSlamming}
        crimeActive={!!activeMission && !activeMission.completed}
        crimeLocation={activeMission ? activeMission.location : [80, 40, 50]}
        onEnemyDefeated={(name, karma, pizza) => {
          if (onCitizenInteracted) {
            onCitizenInteracted(karma, `Defeated ${name}! +${pizza} Pizza`);
          }
        }}
        onAllEnemiesCleared={() => {
          if (activeMission) {
            onReachMission(activeMission.id);
          }
        }}
        playSound={playSound}
      />

      {/* Skyline Aerial Rings Web-Swing Challenges */}
      <AerialRingChallenges
        playerPos={playerPos}
        onPassRing={(ringId, total) => {
          if (onCitizenInteracted) {
            onCitizenInteracted(10, `Ring Checkpoint ${ringId}/${total} Cleared! ⚡`);
          }
        }}
        onCourseCompleted={() => {
          if (onCitizenInteracted) {
            onCitizenInteracted(100, `🏆 SKYLINE TIME TRIAL COMPLETED! +100 KARMA`);
          }
        }}
        playSound={playSound}
      />

      {/* Real-time Multiplayer Co-Op Spider-Heroes swinging through NYC */}
      <MultiplayerCityPlayers
        localPlayerPos={playerPos}
      />

      {/* Spider-Vision AR Scanner Hologram Overlay */}
      <SpiderVisionAR
        active={spiderVisionActive}
        playerPos={playerPos}
        activeMission={activeMission}
        backpacks={backpacks}
      />

      {/* 3D Subway Fast Travel Stations in Manhattan */}
      <SubwayFastTravel3D
        playerPos={playerPos}
        onFastTravel={(pos, name) => {
          if (onFastTravel) onFastTravel(pos, name);
          if (onCitizenInteracted) {
            onCitizenInteracted(15, `Subway Fast-Travel to ${name}! 🚇`);
          }
        }}
        playSound={playSound}
      />

      {/* 3D Living Pedestrians with AI Reactions & Interactions */}
      <CityPedestrians
        weather={weather}
        playerPos={playerPos}
        isPaused={isPaused}
        activeInteractionTrigger={activeInteractionTrigger}
        isPlayerAttackingOrSlamming={isPlayerAttackingOrSlamming}
        onPedestriansUpdate={onPedestriansUpdate}
        onNearbyCitizenChange={onNearbyCitizenChange}
        onCitizenInteracted={onCitizenInteracted}
        playSound={playSound}
      />

      {/* Atmospheric Weather Particles (Rain / Snow / Sunlight) */}
      <WeatherSystem
        weather={weather}
        playerPos={playerPos}
        isPaused={isPaused}
      />
    </group>
  );
}
