import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { WeatherConfig, WeatherType } from './CityTypes';

export const WEATHER_CONFIGS: Record<WeatherType, WeatherConfig> = {
  clear: {
    type: 'clear',
    label: 'Manhattan Daylight',
    icon: '☀️',
    fogColor: '#0a101d',
    fogNear: 70,
    fogFar: 380,
    skyColor: '#090d16',
    sunColor: '#fef08a',
    sunIntensity: 1.8,
    ambientIntensity: 0.5,
    hemisphereSky: '#38bdf8',
    hemisphereGround: '#0f172a',
    groundColor: '#14171c',
    groundRoughness: 0.85,
    groundMetalness: 0.1,
    pedestrianBehavior: 'Casual strolls, cheerful strides & waving at Spidey',
  },
  rain: {
    type: 'rain',
    label: 'Downpour Storm',
    icon: '🌧️',
    fogColor: '#080d14',
    fogNear: 35,
    fogFar: 220,
    skyColor: '#060a10',
    sunColor: '#94a3b8',
    sunIntensity: 0.75,
    ambientIntensity: 0.35,
    hemisphereSky: '#334155',
    hemisphereGround: '#090d16',
    groundColor: '#090c12',
    groundRoughness: 0.12, // Wet glossy road reflection!
    groundMetalness: 0.65,
    pedestrianBehavior: 'Carrying colorful umbrellas, hurrying past puddles',
  },
  snow: {
    type: 'snow',
    label: 'Winter Flurry',
    icon: '❄️',
    fogColor: '#1e2436',
    fogNear: 40,
    fogFar: 260,
    skyColor: '#171c2b',
    sunColor: '#e0e7ff',
    sunIntensity: 1.1,
    ambientIntensity: 0.65,
    hemisphereSky: '#93c5fd',
    hemisphereGround: '#94a3b8',
    groundColor: '#2b3548', // Frosted snow ground
    groundRoughness: 0.65,
    groundMetalness: 0.2,
    pedestrianBehavior: 'Wearing beanies, tucking in coats & shivering in snow',
  },
};

interface WeatherSystemProps {
  weather: WeatherType;
  playerPos: [number, number, number];
  isPaused?: boolean;
}

export default function WeatherSystem({ weather, playerPos, isPaused = false }: WeatherSystemProps) {
  // Rain particle count & buffers
  const rainCount = 2400;
  const rainGeoRef = useRef<THREE.BufferGeometry>(null);
  const rainPositions = useMemo(() => {
    const arr = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 1] = Math.random() * 120;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return arr;
  }, []);

  // Snow particle count & buffers
  const snowCount = 1800;
  const snowGeoRef = useRef<THREE.BufferGeometry>(null);
  const snowPositions = useMemo(() => {
    const arr = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 200;
      arr[i * 3 + 1] = Math.random() * 120;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return arr;
  }, []);

  // Puddle ripple circles for rain
  const rippleMeshRef = useRef<THREE.InstancedMesh>(null);
  const rippleCount = 30;
  const rippleStates = useMemo(() => {
    return Array.from({ length: rippleCount }, () => ({
      x: (Math.random() - 0.5) * 120,
      z: (Math.random() - 0.5) * 120,
      scale: Math.random() * 0.8 + 0.2,
      maxScale: 1.8 + Math.random() * 0.8,
      speed: 1.5 + Math.random() * 2,
    }));
  }, []);

  useFrame((state, delta) => {
    if (isPaused) return;
    const dt = Math.min(delta, 0.1);
    const clock = state.clock.getElapsedTime();

    // 1. Rain Animation: High speed downward streak + wind shear
    if (weather === 'rain' && rainGeoRef.current) {
      const posAttr = rainGeoRef.current.attributes.position;
      const posArray = posAttr.array as Float32Array;
      const pX = playerPos[0];
      const pY = playerPos[1];
      const pZ = playerPos[2];

      for (let i = 0; i < rainCount; i++) {
        const i3 = i * 3;
        // Fall fast
        posArray[i3 + 1] -= dt * 115;
        // Wind drift
        posArray[i3] += dt * 12;

        // Reset relative to player bounding volume
        if (posArray[i3 + 1] < pY - 30) {
          posArray[i3 + 1] = pY + 80 + Math.random() * 20;
          posArray[i3] = pX + (Math.random() - 0.5) * 160;
          posArray[i3 + 2] = pZ + (Math.random() - 0.5) * 160;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 2. Snow Animation: Gentle floating, fluttering drift
    if (weather === 'snow' && snowGeoRef.current) {
      const posAttr = snowGeoRef.current.attributes.position;
      const posArray = posAttr.array as Float32Array;
      const pX = playerPos[0];
      const pY = playerPos[1];
      const pZ = playerPos[2];

      for (let i = 0; i < snowCount; i++) {
        const i3 = i * 3;
        // Float down softly
        posArray[i3 + 1] -= dt * 14;
        // Sinusoidal wind sway
        posArray[i3] += Math.sin(clock * 1.5 + i) * dt * 7;
        posArray[i3 + 2] += Math.cos(clock * 1.2 + i * 0.7) * dt * 7;

        if (posArray[i3 + 1] < pY - 20) {
          posArray[i3 + 1] = pY + 70 + Math.random() * 20;
          posArray[i3] = pX + (Math.random() - 0.5) * 160;
          posArray[i3 + 2] = pZ + (Math.random() - 0.5) * 160;
        }
      }
      posAttr.needsUpdate = true;
    }

    // 3. Ground Puddle Ripples in Rain
    if (weather === 'rain' && rippleMeshRef.current) {
      const dummy = new THREE.Object3D();
      rippleStates.forEach((rip, idx) => {
        rip.scale += rip.speed * dt;
        if (rip.scale >= rip.maxScale) {
          rip.scale = 0.1;
          rip.x = playerPos[0] + (Math.random() - 0.5) * 80;
          rip.z = playerPos[2] + (Math.random() - 0.5) * 80;
        }
        dummy.position.set(rip.x, 0.04, rip.z);
        dummy.rotation.x = -Math.PI / 2;
        dummy.scale.set(rip.scale, rip.scale, rip.scale);
        dummy.updateMatrix();
        rippleMeshRef.current?.setMatrixAt(idx, dummy.matrix);
      });
      rippleMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* 1. Rain Streaks Particle System */}
      {weather === 'rain' && (
        <>
          <points>
            <bufferGeometry ref={rainGeoRef}>
              <bufferAttribute
                attach="attributes-position"
                count={rainCount}
                array={rainPositions}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              color="#bae6fd"
              size={0.65}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </points>

          {/* Ground Puddle Ripples */}
          <instancedMesh
            ref={rippleMeshRef}
            args={[undefined, undefined, rippleCount]}
            position={[0, 0, 0]}
          >
            <ringGeometry args={[0.3, 0.42, 16]} />
            <meshBasicMaterial
              color="#7dd3fc"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </instancedMesh>
        </>
      )}

      {/* 2. Snowflakes Particle System */}
      {weather === 'snow' && (
        <points>
          <bufferGeometry ref={snowGeoRef}>
            <bufferAttribute
              attach="attributes-position"
              count={snowCount}
              array={snowPositions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#ffffff"
            size={0.9}
            transparent
            opacity={0.88}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* 3. Sunny Sunlight Motes in Clear Weather */}
      {weather === 'clear' && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={300}
              array={new Float32Array(
                Array.from({ length: 900 }, () => (Math.random() - 0.5) * 140)
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#fef08a"
            size={0.4}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}
