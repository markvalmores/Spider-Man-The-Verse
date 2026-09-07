import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { PlayerFighterState, ArenaStage, FighterArchetype } from './FightingTypes';
import { getSpiderSuitConfig, textureCache } from '../../utils/spiderManApi';

interface Tekken3DFightingArenaProps {
  p1: PlayerFighterState;
  p2: PlayerFighterState;
  p1Archetype: FighterArchetype;
  p2Archetype: FighterArchetype;
  stage: ArenaStage;
  hitSparkPos: [number, number, number] | null;
  isSlowMo: boolean;
  isCinematicRage: boolean;
}

function Fighter3DModel({
  state,
  archetype,
  isPlayer1,
  targetX,
}: {
  state: PlayerFighterState;
  archetype: FighterArchetype;
  isPlayer1: boolean;
  targetX: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const torsoRef = useRef<THREE.Mesh>(null);

  // Facing direction (face towards the opponent)
  const facingDir = isPlayer1 ? (state.positionX <= targetX ? 1 : -1) : (state.positionX >= targetX ? -1 : 1);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Smooth movement interpolation
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, state.positionX, 0.35);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, state.positionZ, 0.35);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, state.heightY, 0.4);

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      facingDir > 0 ? Math.PI / 2 : -Math.PI / 2,
      0.3
    );

    const time = performance.now() * 0.005;

    // Animation state machine
    if (state.currentAnimation === 'idle') {
      if (torsoRef.current) torsoRef.current.position.y = 1.6 + Math.sin(time * 3) * 0.06;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.4 + Math.sin(time * 3) * 0.15;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.7 - Math.sin(time * 3) * 0.15;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0.2;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.2;
    } else if (state.currentAnimation === 'punch_1') {
      // 1: Left Web Jab
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 2;
      if (torsoRef.current) torsoRef.current.rotation.y = 0.3;
    } else if (state.currentAnimation === 'punch_2') {
      // 2: Right Heavy Cross
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 2;
      if (torsoRef.current) torsoRef.current.rotation.y = -0.4;
    } else if (state.currentAnimation === 'kick_3') {
      // 3: Low Sweep Kick
      if (torsoRef.current) torsoRef.current.position.y = 1.0;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2.5;
    } else if (state.currentAnimation === 'kick_4' || state.currentAnimation === 'launcher') {
      // 4: Rising Launcher
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 1.3;
      if (torsoRef.current) torsoRef.current.position.y = 2.0;
    } else if (state.currentAnimation === 'heat_burst') {
      // Heat Burst Power Pose
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 2;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 2;
      if (torsoRef.current) torsoRef.current.rotation.z = Math.sin(time * 20) * 0.1;
    } else if (state.currentAnimation === 'rage_art') {
      // Rage Art Dramatic Pose
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 1.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 1.5;
      if (torsoRef.current) torsoRef.current.position.y = 2.4;
    } else if (state.currentAnimation === 'hurt') {
      if (torsoRef.current) torsoRef.current.rotation.z = -0.4 * facingDir;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0.5;
    } else if (state.currentAnimation === 'airborne' || state.currentAnimation === 'knockdown') {
      if (torsoRef.current) torsoRef.current.rotation.x = Math.PI / 3;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0.8;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.5;
    } else if (state.currentAnimation === 'block') {
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.PI / 2.2;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 2.2;
    } else if (state.currentAnimation === 'victory') {
      // Dynamic Tekken Victory Pose: Victorious raised arms, proud chest posture, power breathing
      if (torsoRef.current) {
        torsoRef.current.position.y = 1.7 + Math.sin(time * 4) * 0.08;
        torsoRef.current.rotation.y = Math.sin(time * 2) * 0.15;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -Math.PI * 0.85; // Raised high in triumph
        leftArmRef.current.rotation.z = -0.3;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -Math.PI * 0.8;
        rightArmRef.current.rotation.z = 0.35;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0.15;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.25;
    }
  });

  // Retrieve multi-layer suit texture metadata and procedural maps
  const suitConfig = useMemo(() => getSpiderSuitConfig(archetype.id), [archetype.id]);
  const layeredTexture = useMemo(() => {
    return textureCache.getLayeredTexture(
      suitConfig.patternType,
      suitConfig.primaryHex,
      suitConfig.secondaryHex,
      suitConfig.webHex,
      suitConfig.accentHex
    );
  }, [suitConfig]);

  return (
    <group ref={groupRef} position={[state.positionX, state.heightY, state.positionZ]}>
      {/* 1. Heat Mode Blue/Cyan/Gold Aura Flames */}
      {state.isHeatActive && (
        <group position={[0, 1.5, 0]}>
          <Sparkles count={40} scale={2.8} size={4} speed={4} color={archetype.heatColor} />
          <mesh>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color={archetype.heatColor} transparent opacity={0.25} wireframe />
          </mesh>
        </group>
      )}

      {/* 2. Rage Mode Red Burning Aura (Low Health < 25%) */}
      {state.isRageActive && (
        <group position={[0, 1.5, 0]}>
          <Sparkles count={55} scale={3.2} size={5} speed={6} color="#ef4444" />
          <mesh>
            <cylinderGeometry args={[1.2, 1.6, 3, 16]} />
            <meshBasicMaterial color="#dc2626" transparent opacity={0.3} wireframe />
          </mesh>
        </group>
      )}

      {/* 3. Victory Celebration Golden Light Pillar & Confetti Sparks */}
      {state.currentAnimation === 'victory' && (
        <group position={[0, 1.8, 0]}>
          <Sparkles count={80} scale={4} size={6} speed={3} color="#facc15" />
          <mesh>
            <cylinderGeometry args={[0.8, 2.2, 6, 24]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
          <pointLight color="#fde047" intensity={4} distance={8} />
        </group>
      )}

      {/* 4. Multi-Layered Mesh & Textures Character Hierarchy */}
      {/* Torso Base Layer */}
      <mesh ref={torsoRef} position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.45]} />
        <meshStandardMaterial
          map={layeredTexture}
          color={suitConfig.primaryHex}
          roughness={suitConfig.roughness}
          metalness={suitConfig.metalness}
          emissive={suitConfig.emissive || '#000000'}
          emissiveIntensity={suitConfig.emissiveIntensity || 0}
        />
      </mesh>

      {/* Secondary Musculature / Armor Layer */}
      <mesh position={[0, 1.6, 0.02]}>
        <boxGeometry args={[0.66, 0.86, 0.46]} />
        <meshStandardMaterial
          color={suitConfig.secondaryHex}
          roughness={suitConfig.roughness + 0.1}
          metalness={suitConfig.metalness}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Raised 3D Web Overlay Grid Layer on Chest */}
      <mesh position={[0, 1.6, 0.24]}>
        <planeGeometry args={[0.62, 0.82]} />
        <meshBasicMaterial color={suitConfig.webHex} wireframe transparent opacity={0.4} />
      </mesh>

      {/* Head & Mask Base Sphere */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial
          map={layeredTexture}
          color={suitConfig.primaryHex}
          roughness={suitConfig.roughness}
          metalness={suitConfig.metalness}
        />
      </mesh>

      {/* Mask Webbing Texture Wire Lattice */}
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.325, 14, 14]} />
        <meshBasicMaterial color={suitConfig.webHex} wireframe transparent opacity={0.3} />
      </mesh>

      {/* High-Definition Multi-Layered Spider Eye Lenses */}
      {/* Right Eye */}
      <group position={[0.12, 2.35, 0.25]} rotation={[0, 0.22, -0.15]}>
        {/* Outer Beveled Lens Frame */}
        <mesh position={[0, 0, -0.002]}>
          <planeGeometry args={[0.17, 0.11]} />
          <meshBasicMaterial color={suitConfig.eyeFrameHex} />
        </mesh>
        {/* Inner Reflective High-Contrast Lens */}
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[0.13, 0.08]} />
          <meshBasicMaterial color={suitConfig.eyeHex} />
        </mesh>
      </group>

      {/* Left Eye */}
      <group position={[-0.12, 2.35, 0.25]} rotation={[0, -0.22, 0.15]}>
        {/* Outer Beveled Lens Frame */}
        <mesh position={[0, 0, -0.002]}>
          <planeGeometry args={[0.17, 0.11]} />
          <meshBasicMaterial color={suitConfig.eyeFrameHex} />
        </mesh>
        {/* Inner Reflective High-Contrast Lens */}
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[0.13, 0.08]} />
          <meshBasicMaterial color={suitConfig.eyeHex} />
        </mesh>
      </group>

      {/* Front Iconic Spider Emblem Layer */}
      <mesh position={[0, 1.65, 0.245]}>
        <planeGeometry args={[0.32, 0.32]} />
        <meshBasicMaterial color={suitConfig.accentHex} transparent opacity={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Back Spider Emblem Layer */}
      <mesh position={[0, 1.65, -0.245]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.34, 0.34]} />
        <meshBasicMaterial color={suitConfig.primaryHex === '#09090b' ? '#ffffff' : '#dc2626'} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Left Arm with Layered Gauntlets */}
      <mesh ref={leftArmRef} position={[-0.45, 1.75, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial
          map={layeredTexture}
          color={suitConfig.primaryHex}
          roughness={suitConfig.roughness}
        />
        {/* Forearm Guard / Glove Layer */}
        <mesh position={[0, -0.38, 0]}>
          <boxGeometry args={[0.24, 0.28, 0.24]} />
          <meshStandardMaterial color={suitConfig.secondaryHex} metalness={suitConfig.metalness} />
        </mesh>
        {/* Web Shooter Nozzle */}
        <mesh position={[0, -0.48, 0.08]}>
          <boxGeometry args={[0.08, 0.06, 0.06]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
      </mesh>

      {/* Right Arm with Layered Gauntlets */}
      <mesh ref={rightArmRef} position={[0.45, 1.75, 0]} castShadow>
        <boxGeometry args={[0.22, 0.7, 0.22]} />
        <meshStandardMaterial
          map={layeredTexture}
          color={suitConfig.primaryHex}
          roughness={suitConfig.roughness}
        />
        {/* Forearm Guard / Glove Layer */}
        <mesh position={[0, -0.38, 0]}>
          <boxGeometry args={[0.24, 0.28, 0.24]} />
          <meshStandardMaterial color={suitConfig.secondaryHex} metalness={suitConfig.metalness} />
        </mesh>
        {/* Web Shooter Nozzle */}
        <mesh position={[0, -0.48, 0.08]}>
          <boxGeometry args={[0.08, 0.06, 0.06]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
      </mesh>

      {/* Left Leg & Boot Layers */}
      <mesh ref={leftLegRef} position={[-0.22, 0.7, 0]} castShadow>
        <boxGeometry args={[0.25, 0.9, 0.25]} />
        <meshStandardMaterial color={suitConfig.secondaryHex} roughness={suitConfig.roughness} />
        {/* Boot High Layer */}
        <mesh position={[0, -0.48, 0.05]}>
          <boxGeometry args={[0.27, 0.35, 0.35]} />
          <meshStandardMaterial map={layeredTexture} color={suitConfig.primaryHex} metalness={suitConfig.metalness} />
        </mesh>
      </mesh>

      {/* Right Leg & Boot Layers */}
      <mesh ref={rightLegRef} position={[0.22, 0.7, 0]} castShadow>
        <boxGeometry args={[0.25, 0.9, 0.25]} />
        <meshStandardMaterial color={suitConfig.secondaryHex} roughness={suitConfig.roughness} />
        {/* Boot High Layer */}
        <mesh position={[0, -0.48, 0.05]}>
          <boxGeometry args={[0.27, 0.35, 0.35]} />
          <meshStandardMaterial map={layeredTexture} color={suitConfig.primaryHex} metalness={suitConfig.metalness} />
        </mesh>
      </mesh>

      {/* Shadow Blob on ground */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function DynamicCameraAndLighting({
  p1Pos,
  p2Pos,
  isSlowMo,
  isCinematicRage,
}: {
  p1Pos: [number, number, number];
  p2Pos: [number, number, number];
  isSlowMo: boolean;
  isCinematicRage: boolean;
}) {
  const midX = (p1Pos[0] + p2Pos[0]) / 2;
  const dist = Math.abs(p1Pos[0] - p2Pos[0]);

  useFrame(({ camera }) => {
    if (isCinematicRage) {
      // Zoomed dynamic low angle camera for Rage Art
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, midX + 1.5, 0.15);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.4, 0.15);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 3.8, 0.15);
      camera.lookAt(midX, 1.8, 0);
    } else {
      // Tekken 8 Dynamic 3D tracking camera
      const targetCamZ = Math.max(5.5, dist * 0.85 + 2.5);
      const targetCamY = 2.2 + dist * 0.12;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, midX, 0.15);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.15);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.15);
      camera.lookAt(midX, 1.5, 0);
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 15]} intensity={1.8} castShadow />
      <pointLight position={[midX, 6, 2]} intensity={2.5} color="#ffffff" distance={20} />
      <pointLight position={[midX, 1, -5]} intensity={1.5} color="#38bdf8" distance={15} />
    </>
  );
}

export default function Tekken3DFightingArena({
  p1,
  p2,
  p1Archetype,
  p2Archetype,
  stage,
  hitSparkPos,
  isSlowMo,
  isCinematicRage,
}: Tekken3DFightingArenaProps) {
  return (
    <div className="w-full h-full relative select-none overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 2.5, 8], fov: 48 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[stage.skyColor]} />
        <fog attach="fog" args={[stage.skyColor, 12, 45]} />

        <DynamicCameraAndLighting
          p1Pos={[p1.positionX, p1.heightY, p1.positionZ]}
          p2Pos={[p2.positionX, p2.heightY, p2.positionZ]}
          isSlowMo={isSlowMo}
          isCinematicRage={isCinematicRage}
        />

        {/* 3D Arena Stage Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[26, 20]} />
          <meshStandardMaterial
            color={stage.groundColor}
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>

        {/* Outer Ring Border Lines */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[11.8, 12.2, 64]} />
          <meshBasicMaterial color={stage.accentColor} />
        </mesh>

        {/* Left Wall Splat Boundary Barrier */}
        <mesh position={[-12, 4, 0]}>
          <boxGeometry args={[0.5, 8, 18]} />
          <meshStandardMaterial color={stage.wallColor} transparent opacity={0.35} metalness={0.9} />
        </mesh>

        {/* Right Wall Splat Boundary Barrier */}
        <mesh position={[12, 4, 0]}>
          <boxGeometry args={[0.5, 8, 18]} />
          <meshStandardMaterial color={stage.wallColor} transparent opacity={0.35} metalness={0.9} />
        </mesh>

        {/* Back Skyline Skyscraper Facades */}
        <group position={[0, 0, -10]}>
          <mesh position={[-15, 10, -5]}>
            <boxGeometry args={[8, 30, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 15, -8]}>
            <boxGeometry args={[10, 40, 10]} />
            <meshStandardMaterial color="#090d16" />
          </mesh>
          <mesh position={[15, 12, -5]}>
            <boxGeometry args={[8, 32, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Atmospheric Floating Embers / Sparks */}
        <Sparkles count={60} scale={[24, 10, 15]} size={3} speed={1.2} color={stage.accentColor} />

        {/* P1 & P2 3D Fighters */}
        <Fighter3DModel
          state={p1}
          archetype={p1Archetype}
          isPlayer1={true}
          targetX={p2.positionX}
        />

        <Fighter3DModel
          state={p2}
          archetype={p2Archetype}
          isPlayer1={false}
          targetX={p1.positionX}
        />

        {/* Hit Impact Sparks Explosion */}
        {hitSparkPos && (
          <group position={hitSparkPos}>
            <Sparkles count={50} scale={2} size={8} speed={8} color="#fef08a" />
            <mesh>
              <sphereGeometry args={[0.5, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        )}
      </Canvas>
    </div>
  );
}
