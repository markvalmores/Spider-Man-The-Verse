import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { WeatherType } from './CityTypes';

interface CityLandmarks3DProps {
  playerPos: [number, number, number];
  weather: WeatherType;
  onLandmarkBoost?: () => void;
  playSound?: (s: any) => void;
}

export default function CityLandmarks3D({
  playerPos,
  weather,
  onLandmarkBoost,
  playSound,
}: CityLandmarks3DProps) {
  const avengersLogoRef = useRef<THREE.Group>(null);
  const bugleGlobeRef = useRef<THREE.Mesh>(null);
  const thermalGroupRef = useRef<THREE.Group>(null);
  const trafficGroupRef = useRef<THREE.Group>(null);

  // Updraft canyon positions for high-speed supersonic gliding boosts
  const thermals = useMemo(
    () => [
      { id: 't1', pos: [0, 35, -70] as [number, number, number], radius: 10, height: 45 },
      { id: 't2', pos: [-75, 45, 0] as [number, number, number], radius: 10, height: 55 },
      { id: 't3', pos: [75, 40, 75] as [number, number, number], radius: 10, height: 50 },
      { id: 't4', pos: [110, 50, -65] as [number, number, number], radius: 10, height: 60 },
    ],
    []
  );

  // Dynamic NYC Street Traffic
  const trafficVehicles = useMemo(
    () => [
      { id: 'taxi_1', type: 'taxi', axis: 'z', lane: -22, speed: 14, min: -180, max: 180, pos: [0, 0.4, -100] as [number, number, number], dir: 1 },
      { id: 'taxi_2', type: 'taxi', axis: 'z', lane: 22, speed: 16, min: -180, max: 180, pos: [0, 0.4, 60] as [number, number, number], dir: -1 },
      { id: 'police_1', type: 'police', axis: 'x', lane: -68, speed: 20, min: -180, max: 180, pos: [-80, 0.4, 0] as [number, number, number], dir: 1 },
      { id: 'bus_1', type: 'bus', axis: 'x', lane: 68, speed: 10, min: -180, max: 180, pos: [50, 0.4, 0] as [number, number, number], dir: -1 },
      { id: 'taxi_3', type: 'taxi', axis: 'z', lane: -112, speed: 15, min: -180, max: 180, pos: [0, 0.4, -40] as [number, number, number], dir: 1 },
      { id: 'taxi_4', type: 'taxi', axis: 'z', lane: 112, speed: 13, min: -180, max: 180, pos: [0, 0.4, 120] as [number, number, number], dir: -1 },
    ],
    []
  );

  // Animate landmarks & traffic
  useFrame((_, delta) => {
    // Rotate Daily Bugle rooftop globe
    if (bugleGlobeRef.current) {
      bugleGlobeRef.current.rotation.y += delta * 0.4;
    }

    // Pulse Avengers Hologram
    if (avengersLogoRef.current) {
      avengersLogoRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.15;
    }

    // Animate Thermal Particle Rings
    if (thermalGroupRef.current) {
      thermalGroupRef.current.children.forEach((child, i) => {
        child.rotation.y += delta * (1.2 + i * 0.2);
      });
    }

    // Move Street Traffic Vehicles
    if (trafficGroupRef.current) {
      trafficGroupRef.current.children.forEach((vehMesh, idx) => {
        const data = trafficVehicles[idx];
        if (!data) return;
        if (data.axis === 'z') {
          vehMesh.position.z += data.speed * data.dir * delta;
          if (vehMesh.position.z > data.max) vehMesh.position.z = data.min;
          if (vehMesh.position.z < data.min) vehMesh.position.z = data.max;
        } else {
          vehMesh.position.x += data.speed * data.dir * delta;
          if (vehMesh.position.x > data.max) vehMesh.position.x = data.min;
          if (vehMesh.position.x < data.min) vehMesh.position.x = data.max;
        }
      });
    }
  });

  return (
    <group name="city-landmarks-3d">
      {/* ======================================================== */}
      {/* 1. AVENGERS / STARK TOWER (Position: [110, 0, -110], Height: 110) */}
      {/* ======================================================== */}
      <group position={[110, 0, -110]}>
        {/* Base Tower Section */}
        <mesh position={[0, 40, 0]} castShadow receiveShadow>
          <boxGeometry args={[30, 80, 30]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Upper Cantilever Curve */}
        <mesh position={[0, 90, 4]} rotation={[0.15, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[26, 35, 22]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* Stark Cantilever Landing Helipad */}
        <group position={[0, 96, 18]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <cylinderGeometry args={[14, 14, 1.2, 24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Helipad 'H' Marking & Blue Ring */}
          <mesh position={[0, 0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[10, 12, 24]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          {/* Helipad Perimeter Aviation Lights */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
            <mesh
              key={i}
              position={[Math.cos(ang) * 13, 0.7, Math.sin(ang) * 13]}
            >
              <sphereGeometry args={[0.35, 8, 8]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          ))}
        </group>

        {/* Giant Glowing Avengers "A" Holographic Emblem */}
        <group ref={avengersLogoRef} position={[0, 85, 15.5]}>
          {/* Outer Ring */}
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[6.5, 7.8, 32]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
          {/* Inner "A" Crossbars */}
          <mesh position={[-1.8, 0, 0.1]} rotation={[0, 0, -0.3]}>
            <planeGeometry args={[1.6, 12]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[1.8, 0, 0.1]} rotation={[0, 0, 0.3]}>
            <planeGeometry args={[1.6, 12]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -1.2, 0.15]}>
            <planeGeometry args={[6, 1.4]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
          {/* Arrow Chevron Point */}
          <mesh position={[3.2, -1.2, 0.2]} rotation={[0, 0, -Math.PI / 4]}>
            <planeGeometry args={[2.5, 1.4]} />
            <meshBasicMaterial color="#0284c7" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* High-Altitude Apex Spire */}
        <mesh position={[0, 114, 0]}>
          <cylinderGeometry args={[0.15, 0.6, 16, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 122, 0]}>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 2. OSCORP TOWER (Position: [-110, 0, 110], Height: 105) */}
      {/* ======================================================== */}
      <group position={[-110, 0, 110]}>
        {/* Sleek Triangular Prism Body */}
        <mesh position={[0, 48, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[15, 20, 96, 3]} />
          <meshStandardMaterial
            color="#09090b"
            roughness={0.18}
            metalness={0.85}
          />
        </mesh>

        {/* Green Bioluminescent Windows Striping */}
        <mesh position={[0, 50, 0]}>
          <cylinderGeometry args={[15.2, 20.2, 92, 3]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={0.85}
            wireframe
          />
        </mesh>

        {/* Oscorp Giant Rooftop Logo Billboard */}
        <group position={[0, 98, 0]}>
          <mesh position={[0, 0, 12]}>
            <boxGeometry args={[18, 5, 0.8]} />
            <meshStandardMaterial color="#022c22" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 12.5]}>
            <planeGeometry args={[16, 3.5]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
          {/* Green High-Energy Apex Beacon */}
          <mesh position={[0, 6, 0]}>
            <octahedronGeometry args={[2.5, 0]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={2.0}
            />
          </mesh>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 3. DAILY BUGLE HEADQUARTERS (Position: [0, 0, 115], Height: 75) */}
      {/* ======================================================== */}
      <group position={[0, 0, 115]}>
        {/* Classic Art Deco Brick & Stone Skyscraper */}
        <mesh position={[0, 32, 0]} castShadow receiveShadow>
          <boxGeometry args={[28, 64, 28]} />
          <meshStandardMaterial
            color="#451a03"
            roughness={0.7}
            metalness={0.15}
          />
        </mesh>

        {/* Stone Facade Window Grids */}
        <mesh position={[0, 32, 14.1]}>
          <planeGeometry args={[25, 58]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#eab308"
            emissiveIntensity={0.65}
            roughness={0.2}
          />
        </mesh>

        {/* Rooftop Daily Bugle Billboard */}
        <group position={[0, 68, 0]}>
          {/* Steel Frame Stand */}
          <mesh position={[0, 3, 0]}>
            <boxGeometry args={[24, 6, 1.2]} />
            <meshStandardMaterial color="#1c1917" metalness={0.8} />
          </mesh>
          {/* Illuminated Red News Banner */}
          <mesh position={[0, 3, 0.7]}>
            <planeGeometry args={[23, 5]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>

          {/* Iconic Spinning Golden Globe */}
          <mesh ref={bugleGlobeRef} position={[10, 8, 10]} castShadow>
            <sphereGeometry args={[3.2, 16, 16]} />
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 4. QUEENSBORO / EAST RIVER SUSPENSION BRIDGE & WATER */}
      {/* ======================================================== */}
      <group position={[0, 0, -220]}>
        {/* River Water Surface with Shimmer */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[500, 90]} />
          <meshStandardMaterial
            color={weather === 'snow' ? '#334155' : '#0369a1'}
            roughness={0.1}
            metalness={0.7}
          />
        </mesh>

        {/* Bridge Roadway Deck */}
        <mesh position={[0, 12, 0]} castShadow receiveShadow>
          <boxGeometry args={[360, 2.5, 18]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>

        {/* Bridge Roadway Stripes */}
        <mesh position={[0, 13.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[350, 0.6]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>

        {/* Bridge Suspension Tower 1 */}
        <group position={[-75, 0, 0]}>
          {/* Left Column */}
          <mesh position={[0, 38, -8]} castShadow>
            <boxGeometry args={[6, 76, 5]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Right Column */}
          <mesh position={[0, 38, 8]} castShadow>
            <boxGeometry args={[6, 76, 5]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Gothic Cross Arch */}
          <mesh position={[0, 65, 0]}>
            <boxGeometry args={[6, 12, 21]} />
            <meshStandardMaterial color="#64748b" metalness={0.5} />
          </mesh>
          {/* Pinnacle Spire */}
          <mesh position={[0, 78, 0]}>
            <cylinderGeometry args={[0.2, 1.2, 14, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>

        {/* Bridge Suspension Tower 2 */}
        <group position={[75, 0, 0]}>
          <mesh position={[0, 38, -8]} castShadow>
            <boxGeometry args={[6, 76, 5]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 38, 8]} castShadow>
            <boxGeometry args={[6, 76, 5]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 65, 0]}>
            <boxGeometry args={[6, 12, 21]} />
            <meshStandardMaterial color="#64748b" metalness={0.5} />
          </mesh>
          <mesh position={[0, 78, 0]}>
            <cylinderGeometry args={[0.2, 1.2, 14, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 5. CENTRAL PARK OASIS & PLAZA (Position: [-110, 0, -45]) */}
      {/* ======================================================== */}
      <group position={[-110, 0, -45]}>
        {/* Lush Green Park Turf */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} receiveShadow>
          <planeGeometry args={[55, 55]} />
          <meshStandardMaterial
            color={weather === 'snow' ? '#e2e8f0' : '#15803d'}
            roughness={0.9}
          />
        </mesh>

        {/* Cobblestone Winding Pathway */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[12, 17, 24]} />
          <meshStandardMaterial color="#78716c" roughness={0.8} />
        </mesh>

        {/* Center Bronze Hero Monument */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[3, 3.8, 2.4, 12]} />
            <meshStandardMaterial color="#57534e" roughness={0.6} />
          </mesh>
          {/* Bronze Statue */}
          <mesh position={[0, 4.2, 0]} castShadow>
            <cylinderGeometry args={[0.8, 1.2, 4, 8]} />
            <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* Park Swingable Elm Trees */}
        {[
          [-18, -18],
          [18, -18],
          [-18, 18],
          [18, 18],
          [0, 22],
          [0, -22],
        ].map(([tx, tz], i) => (
          <group key={i} position={[tx, 0, tz]}>
            {/* Trunk */}
            <mesh position={[0, 3.5, 0]} castShadow>
              <cylinderGeometry args={[0.6, 0.9, 7, 8]} />
              <meshStandardMaterial color="#713f12" roughness={0.9} />
            </mesh>
            {/* Foliage Canopy */}
            <mesh position={[0, 8.5, 0]} castShadow>
              <sphereGeometry args={[3.8, 10, 10]} />
              <meshStandardMaterial
                color={weather === 'snow' ? '#cbd5e1' : '#166534'}
                roughness={0.8}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* ======================================================== */}
      {/* 6. TIMES SQUARE NEON BILLBOARD PLAZA (Position: [0, 0, -45]) */}
      {/* ======================================================== */}
      <group position={[0, 0, -45]}>
        {/* Animated Digital Neon Screens */}
        <mesh position={[-16, 22, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[22, 14]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[16, 22, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[22, 14]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
        <mesh position={[0, 26, -16]}>
          <planeGeometry args={[26, 12]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 7. DYNAMIC STREET TRAFFIC (NYC Yellow Taxis, Police, Buses) */}
      {/* ======================================================== */}
      <group ref={trafficGroupRef} name="traffic-vehicles">
        {trafficVehicles.map((veh) => (
          <group
            key={veh.id}
            position={
              veh.axis === 'z'
                ? [veh.lane, veh.pos[1], veh.pos[2]]
                : [veh.pos[0], veh.pos[1], veh.lane]
            }
            rotation={
              veh.axis === 'z'
                ? [0, veh.dir === 1 ? 0 : Math.PI, 0]
                : [0, veh.dir === 1 ? Math.PI / 2 : -Math.PI / 2, 0]
            }
          >
            {/* Vehicle Body */}
            {veh.type === 'taxi' && (
              <group>
                {/* Yellow Taxi Chassis */}
                <mesh position={[0, 0.5, 0]} castShadow>
                  <boxGeometry args={[2.2, 0.9, 4.4]} />
                  <meshStandardMaterial color="#eab308" roughness={0.3} />
                </mesh>
                {/* Taxi Cabin Roof */}
                <mesh position={[0, 1.2, -0.2]} castShadow>
                  <boxGeometry args={[1.9, 0.7, 2.4]} />
                  <meshStandardMaterial color="#18181b" roughness={0.1} />
                </mesh>
                {/* Rooftop TAXI light */}
                <mesh position={[0, 1.65, -0.2]}>
                  <boxGeometry args={[0.8, 0.25, 0.4]} />
                  <meshBasicMaterial color="#fef08a" />
                </mesh>
                {/* Headlights */}
                <mesh position={[0.7, 0.5, 2.22]}>
                  <sphereGeometry args={[0.18, 6, 6]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh position={[-0.7, 0.5, 2.22]}>
                  <sphereGeometry args={[0.18, 6, 6]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                {/* Taillights */}
                <mesh position={[0.7, 0.5, -2.22]}>
                  <sphereGeometry args={[0.18, 6, 6]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
                <mesh position={[-0.7, 0.5, -2.22]}>
                  <sphereGeometry args={[0.18, 6, 6]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
              </group>
            )}

            {veh.type === 'police' && (
              <group>
                {/* Police Cruiser Chassis */}
                <mesh position={[0, 0.5, 0]} castShadow>
                  <boxGeometry args={[2.2, 0.9, 4.5]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.3} />
                </mesh>
                <mesh position={[0, 1.2, -0.2]} castShadow>
                  <boxGeometry args={[1.9, 0.7, 2.4]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.1} />
                </mesh>
                {/* Emergency Flashing Siren */}
                <mesh position={[-0.4, 1.65, -0.2]}>
                  <boxGeometry args={[0.4, 0.25, 0.3]} />
                  <meshBasicMaterial color="#3b82f6" />
                </mesh>
                <mesh position={[0.4, 1.65, -0.2]}>
                  <boxGeometry args={[0.4, 0.25, 0.3]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
              </group>
            )}

            {veh.type === 'bus' && (
              <group>
                {/* Blue Transit Bus Chassis */}
                <mesh position={[0, 1.4, 0]} castShadow>
                  <boxGeometry args={[2.8, 2.6, 9.5]} />
                  <meshStandardMaterial color="#0284c7" roughness={0.4} />
                </mesh>
                {/* Bus Windows Strip */}
                <mesh position={[0, 1.8, 0]}>
                  <boxGeometry args={[2.85, 1.0, 9.0]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.1} />
                </mesh>
              </group>
            )}
          </group>
        ))}
      </group>

      {/* ======================================================== */}
      {/* 8. THERMAL UPDRAFT CANYONS (Canyon Air Currents for Gliding) */}
      {/* ======================================================== */}
      <group ref={thermalGroupRef} name="thermal-updrafts">
        {thermals.map((t) => (
          <group key={t.id} position={t.pos}>
            {/* Glowing Ring 1 */}
            <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[t.radius - 1, t.radius, 24]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
            {/* Glowing Ring 2 */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[t.radius - 1.2, t.radius, 24]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} side={THREE.DoubleSide} />
            </mesh>
            {/* Glowing Ring 3 */}
            <mesh position={[0, 12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[t.radius - 1.5, t.radius, 24]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
