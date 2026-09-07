import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Compass,
  CloudRain,
  Sun,
  Snowflake,
  ShieldAlert,
  Pizza,
  Users,
  Navigation,
  Layers,
  X,
  Crosshair,
} from 'lucide-react';
import {
  BuildingData,
  CrimeMission,
  PizzaPickup,
  WeatherType,
  WeatherZone,
  MANHATTAN_WEATHER_ZONES,
  PedestrianData,
} from './CityTypes';

interface CityMinimapProps {
  playerPos: [number, number, number];
  playerRotY?: number;
  buildings: BuildingData[];
  activeMission: CrimeMission | null;
  pizzas: PizzaPickup[];
  pedestrians?: PedestrianData[];
  currentWeather: WeatherType;
  onSelectWeatherZone?: (zone: WeatherZone) => void;
  onCloseExpanded?: () => void;
  isExpandedInitial?: boolean;
}

export default function CityMinimap({
  playerPos,
  playerRotY = 0,
  buildings,
  activeMission,
  pizzas,
  pedestrians = [],
  currentWeather,
  onSelectWeatherZone,
}: CityMinimapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.2); // 0.8x to 2.5x
  const [showWeatherZones, setShowWeatherZones] = useState(true);
  const [showPedestrians, setShowPedestrians] = useState(true);
  const [showBuildings, setShowBuildings] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const expandedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active zone determination based on player coords
  const currentZone = useMemo(() => {
    for (const zone of MANHATTAN_WEATHER_ZONES) {
      const dx = playerPos[0] - zone.center[0];
      const dz = playerPos[2] - zone.center[1];
      if (Math.sqrt(dx * dx + dz * dz) <= zone.radius) {
        return zone;
      }
    }
    return MANHATTAN_WEATHER_ZONES[0];
  }, [playerPos]);

  // Distance and angle to active mission
  const missionInfo = useMemo(() => {
    if (!activeMission || activeMission.completed) return null;
    const dx = activeMission.location[0] - playerPos[0];
    const dz = activeMission.location[2] - playerPos[2];
    const dist = Math.round(Math.sqrt(dx * dx + dz * dz));
    const angle = Math.atan2(dx, dz); // angle relative to north
    return { dist, dx, dz, angle };
  }, [activeMission, playerPos]);

  // Render Minimap Radar Canvas
  const drawMinimap = (
    canvas: HTMLCanvasElement,
    size: number,
    centerOnPlayer: boolean,
    zoom: number
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    const halfSize = size / 2;
    const worldScale = (size / 320) * zoom; // scale factor pixels per world unit

    // Save initial state
    ctx.save();

    // In compact mode, radar is a circle
    if (!isExpanded) {
      ctx.beginPath();
      ctx.arc(halfSize, halfSize, halfSize - 3, 0, Math.PI * 2);
      ctx.clip();
    }

    // 1. Radar Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, size, size);

    // World coordinate transform
    // Center point in canvas:
    const originCanvasX = centerOnPlayer ? halfSize - playerPos[0] * worldScale : halfSize;
    const originCanvasZ = centerOnPlayer ? halfSize - playerPos[2] * worldScale : halfSize;

    // Helper: convert world (x, z) to canvas (cx, cz)
    const toCanvasX = (wx: number) => originCanvasX + wx * worldScale;
    const toCanvasZ = (wz: number) => originCanvasZ + wz * worldScale;

    // 2. Weather Zones Overlay
    if (showWeatherZones) {
      MANHATTAN_WEATHER_ZONES.forEach((zone) => {
        const zx = toCanvasX(zone.center[0]);
        const zz = toCanvasZ(zone.center[1]);
        const zRadius = zone.radius * worldScale;

        // Radial gradient for radar weather cell
        const grad = ctx.createRadialGradient(zx, zz, zRadius * 0.1, zx, zz, zRadius);
        if (zone.weather === 'rain') {
          grad.addColorStop(0, 'rgba(2, 132, 199, 0.45)');
          grad.addColorStop(0.75, 'rgba(2, 132, 199, 0.22)');
          grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        } else if (zone.weather === 'snow') {
          grad.addColorStop(0, 'rgba(165, 180, 252, 0.45)');
          grad.addColorStop(0.75, 'rgba(165, 180, 252, 0.22)');
          grad.addColorStop(1, 'rgba(165, 180, 252, 0)');
        } else {
          grad.addColorStop(0, 'rgba(245, 158, 11, 0.38)');
          grad.addColorStop(0.75, 'rgba(245, 158, 11, 0.18)');
          grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(zx, zz, zRadius, 0, Math.PI * 2);
        ctx.fill();

        // Zone perimeter dashed border
        ctx.strokeStyle = zone.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Zone label in expanded view
        if (isExpanded) {
          ctx.fillStyle = zone.color;
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          const icon = zone.weather === 'rain' ? '🌧️' : zone.weather === 'snow' ? '❄️' : '☀️';
          ctx.fillText(`${icon} ${zone.name}`, zx, zz - zRadius + 14);
        }
      });
    }

    // 3. Street Grid Network & Central Plaza
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Avenue Lines
    const avenueOffsets = [-130, -85, -40, 5, 50, 95, 140];
    avenueOffsets.forEach((ax) => {
      const lineX = toCanvasX(ax);
      ctx.beginPath();
      ctx.moveTo(lineX, toCanvasZ(-160));
      ctx.lineTo(lineX, toCanvasZ(160));
      ctx.stroke();
    });

    // Cross Streets
    for (let sz = -160; sz <= 160; sz += 40) {
      const lineZ = toCanvasZ(sz);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(-160), lineZ);
      ctx.lineTo(toCanvasX(160), lineZ);
      ctx.stroke();
    }

    // Central Plaza circle
    ctx.beginPath();
    ctx.arc(toCanvasX(0), toCanvasZ(0), 16 * worldScale, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 4. Building Footprints
    if (showBuildings) {
      buildings.forEach((b) => {
        const bx = toCanvasX(b.x - b.width / 2);
        const bz = toCanvasZ(b.z - b.depth / 2);
        const bw = b.width * worldScale;
        const bd = b.depth * worldScale;

        // Skip buildings completely outside radar viewport
        if (bx + bw < -20 || bx > size + 20 || bz + bd < -20 || bz > size + 20) return;

        ctx.fillStyle = b.height > 60 ? '#1e293b' : '#0f172a';
        ctx.fillRect(bx, bz, bw, bd);

        ctx.strokeStyle = b.height > 60 ? '#38bdf8' : '#334155';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(bx, bz, bw, bd);
      });
    }

    // 5. Living Pedestrians Dots
    if (showPedestrians && pedestrians.length > 0) {
      pedestrians.forEach((ped) => {
        const px = toCanvasX(ped.x);
        const pz = toCanvasZ(ped.z);

        // Render pedestrian dot
        ctx.beginPath();
        ctx.arc(px, pz, 1.8, 0, Math.PI * 2);
        if (ped.state === 'cheering' || ped.state === 'highfive') {
          ctx.fillStyle = '#eab308'; // glowing yellow for fans
        } else if (ped.state === 'paparazzi') {
          ctx.fillStyle = '#38bdf8'; // camera flash cyan
        } else {
          ctx.fillStyle = '#64748b'; // standard pedestrian
        }
        ctx.fill();
      });
    }

    // 6. Pizza Collectible Markers
    pizzas.forEach((p) => {
      if (p.collected) return;
      const px = toCanvasX(p.position[0]);
      const pz = toCanvasZ(p.position[2]);

      ctx.beginPath();
      ctx.arc(px, pz, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 6.5 Iconic NYC & Marvel Landmarks
    const landmarks = [
      { name: 'Avengers Tower', icon: '🅰️', x: 110, z: -110, color: '#38bdf8' },
      { name: 'Oscorp', icon: '🏢', x: -110, z: 110, color: '#10b981' },
      { name: 'Daily Bugle', icon: '📰', x: 0, z: 115, color: '#fbbf24' },
      { name: 'Queensboro Bridge', icon: '🌉', x: 0, z: -220, color: '#94a3b8' },
      { name: 'Central Park', icon: '🌲', x: -110, z: -45, color: '#22c55e' },
      { name: 'Times Square', icon: '✨', x: 0, z: -45, color: '#ec4899' },
    ];

    landmarks.forEach((lm) => {
      const lx = toCanvasX(lm.x);
      const lz = toCanvasZ(lm.z);
      if (lx < -30 || lx > size + 30 || lz < -30 || lz > size + 30) return;

      // Marker diamond
      ctx.save();
      ctx.translate(lx, lz);
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fillStyle = lm.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      if (isExpanded) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${lm.icon} ${lm.name}`, 0, -8);
      }
      ctx.restore();
    });

    // 6.6 Co-Op Multiplayer Heroes (Green Icon Indicators)
    const coopPlayers = [
      { name: 'Miles', x: 85, z: 50 },
      { name: 'Gwen', x: -100, z: -80 },
      { name: 'Raimi_Peter', x: 120, z: 90 },
      { name: 'Andrew_Spidey', x: -80, z: 100 },
    ];
    coopPlayers.forEach((cp) => {
      const cx = toCanvasX(cp.x);
      const cz = toCanvasZ(cp.z);
      ctx.beginPath();
      ctx.arc(cx, cz, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e'; // Green icon indicator
      ctx.fill();
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (isExpanded) {
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`🟢 ${cp.name}`, cx, cz - 7);
      }
    });

    // 7. Active Crime Mission Marker
    if (activeMission && !activeMission.completed) {
      const mx = toCanvasX(activeMission.location[0]);
      const mz = toCanvasZ(activeMission.location[2]);

      // Check if mission is inside radar or needs clamp
      const distFromCenter = Math.sqrt((mx - halfSize) ** 2 + (mz - halfSize) ** 2);
      const isInsideRadar = distFromCenter < halfSize - 16;

      if (isInsideRadar || isExpanded) {
        // Pulsing alert rings
        ctx.beginPath();
        ctx.arc(mx, mz, 9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mx, mz, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();

        // Label
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CRIME', mx, mz - 12);
      } else {
        // Off-screen edge clamp arrow on radar boundary
        const clampRadius = halfSize - 14;
        const angle = Math.atan2(mz - halfSize, mx - halfSize);
        const edgeX = halfSize + Math.cos(angle) * clampRadius;
        const edgeY = halfSize + Math.sin(angle) * clampRadius;

        ctx.save();
        ctx.translate(edgeX, edgeY);
        ctx.rotate(angle);

        // Arrow shape
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-6, -6);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-6, 6);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }

    // 8. Player Spider-Man Marker (Center in compact, absolute in expanded)
    const playerCanvasX = centerOnPlayer ? halfSize : toCanvasX(playerPos[0]);
    const playerCanvasZ = centerOnPlayer ? halfSize : toCanvasZ(playerPos[2]);

    ctx.save();
    ctx.translate(playerCanvasX, playerCanvasZ);
    // Rotate with player facing heading
    ctx.rotate(playerRotY);

    // Spider-Man Directional Chevron & Mask
    // Pulse field
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.fill();

    // Directional Pointer Needle
    ctx.beginPath();
    ctx.moveTo(0, 11);
    ctx.lineTo(-6, -5);
    ctx.lineTo(0, -2);
    ctx.lineTo(6, -5);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Golden spider center dot
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();

    ctx.restore();

    // 9. Radar Range Rings & Crosshairs
    if (!isExpanded) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;

      // Range rings (50m, 100m)
      ctx.beginPath();
      ctx.arc(halfSize, halfSize, halfSize * 0.45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(halfSize, halfSize, halfSize * 0.85, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(halfSize, 4);
      ctx.lineTo(halfSize, 14);
      ctx.moveTo(halfSize, size - 14);
      ctx.lineTo(halfSize, size - 4);
      ctx.moveTo(4, halfSize);
      ctx.lineTo(14, halfSize);
      ctx.moveTo(size - 14, halfSize);
      ctx.lineTo(size - 4, halfSize);
      ctx.stroke();

      // Outer bezel border
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(halfSize, halfSize, halfSize - 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Continuous animation frame for radar
  useEffect(() => {
    let animId: number;
    const render = () => {
      if (canvasRef.current && !isExpanded) {
        drawMinimap(canvasRef.current, 190, true, zoomLevel);
      }
      if (expandedCanvasRef.current && isExpanded) {
        drawMinimap(expandedCanvasRef.current, 520, false, zoomLevel * 0.85);
      }
      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isExpanded,
    zoomLevel,
    playerPos,
    playerRotY,
    buildings,
    activeMission,
    pizzas,
    pedestrians,
    showWeatherZones,
    showPedestrians,
    showBuildings,
  ]);

  // Keyboard shortcut: 'M' to toggle map
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setIsExpanded((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* 1. COMPACT CORNER RADAR (Docked in Visor HUD) */}
      {!isExpanded && (
        <div className="relative flex flex-col items-center select-none pointer-events-auto">
          {/* Top Info Header */}
          <div className="flex items-center justify-between w-48 px-2 py-1 bg-black/85 border border-neutral-800 rounded-t-2xl text-[11px] font-mono text-neutral-300 backdrop-blur-md">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-red-400 font-bold">MANHATTAN</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-amber-400">
              <Compass size={11} />
              <span>
                {Math.round(playerPos[0])},{Math.round(playerPos[2])}
              </span>
            </div>
          </div>

          {/* Radar Screen Container */}
          <div className="relative w-[190px] h-[190px] rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)] border-2 border-red-600/80 overflow-hidden bg-neutral-950">
            <canvas
              ref={canvasRef}
              width={190}
              height={190}
              className="w-full h-full block cursor-pointer"
              onClick={() => setIsExpanded(true)}
              title="Click to Expand Tactical Map [M]"
            />

            {/* North Indicator */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-black text-sky-400 font-mono tracking-widest pointer-events-none drop-shadow">
              N
            </div>

            {/* Tactical sweep beam overlay */}
            <div className="absolute inset-0 rounded-full border border-sky-400/20 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(56,189,248,0.18)_360deg)] animate-[spin_4s_linear_infinite]" />

            {/* Quick Controls overlay on hover */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.min(2.5, z + 0.3));
                }}
                className="w-5 h-5 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center text-xs font-bold transition border border-neutral-700"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.max(0.7, z - 0.3));
                }}
                className="w-5 h-5 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center text-xs font-bold transition border border-neutral-700"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="w-5 h-5 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition border border-neutral-700"
                title="Expand Map [M]"
              >
                <Maximize2 size={11} />
              </button>
            </div>
          </div>

          {/* Bottom Weather Zone & Crime Ribbon */}
          <div className="flex flex-col items-center w-48 mt-1 gap-1">
            {/* Active Weather Zone */}
            <div className="flex items-center justify-between w-full px-2.5 py-1 bg-black/80 border border-neutral-800 rounded-xl text-[10px] font-sans text-neutral-300">
              <span className="text-neutral-400 truncate max-w-[100px]">{currentZone.name}</span>
              <span className="flex items-center gap-1 font-bold text-amber-400 uppercase">
                {currentZone.weather === 'rain' ? (
                  <CloudRain size={12} className="text-sky-400" />
                ) : currentZone.weather === 'snow' ? (
                  <Snowflake size={12} className="text-indigo-300" />
                ) : (
                  <Sun size={12} className="text-amber-400" />
                )}
                {currentZone.weather}
              </span>
            </div>

            {/* Mission Distance Pill */}
            {missionInfo && (
              <div className="flex items-center justify-between w-full px-2.5 py-1 bg-red-950/80 border border-red-600/60 rounded-xl text-[10px] font-bold text-red-300 animate-pulse">
                <span className="flex items-center gap-1">
                  <ShieldAlert size={12} className="text-red-400" />
                  CRIME IN PROGRESS
                </span>
                <span>{missionInfo.dist}m</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. EXPANDED FULL TACTICAL MANHATTAN MAP MODAL */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans pointer-events-auto">
          <div className="bg-neutral-900 border border-red-600/60 rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold">
                  🕷️
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-wide font-['Bangers'] flex items-center gap-2">
                    MANHATTAN TACTICAL RADAR
                    <span className="text-xs font-mono font-normal text-sky-400 px-2 py-0.5 bg-sky-950/60 border border-sky-800 rounded-full">
                      LIVE SATELLITE FEED
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Coordinates: X: {Math.round(playerPos[0])}m, Z: {Math.round(playerPos[2])}m •
                    Altitude: {Math.max(0, Math.round(playerPos[1]))}m
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-red-600 text-neutral-300 hover:text-white rounded-xl text-sm transition"
              >
                <Minimize2 size={16} />
                <span>Return [M / ESC]</span>
              </button>
            </div>

            {/* Main Content: Map Canvas + Sidebar */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Map Canvas Viewport */}
              <div className="flex-1 relative bg-neutral-950 flex items-center justify-center overflow-hidden">
                <canvas
                  ref={expandedCanvasRef}
                  width={520}
                  height={520}
                  className="w-[520px] h-[520px] max-w-full max-h-full object-contain border border-neutral-800 rounded-2xl shadow-2xl"
                />

                {/* Tactical Overlays / Controls within Viewport */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 bg-neutral-900/90 border border-neutral-700 p-2 rounded-2xl backdrop-blur-md text-xs">
                  <span className="text-neutral-400 font-bold px-1">Map Layers</span>
                  <button
                    onClick={() => setShowWeatherZones((v) => !v)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                      showWeatherZones
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : 'text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <Layers size={14} />
                    <span>Weather Zones</span>
                  </button>
                  <button
                    onClick={() => setShowBuildings((v) => !v)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                      showBuildings
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                        : 'text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <Crosshair size={14} />
                    <span>Building Grid</span>
                  </button>
                  <button
                    onClick={() => setShowPedestrians((v) => !v)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition ${
                      showPedestrians
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <Users size={14} />
                    <span>Pedestrian Signals</span>
                  </button>
                </div>

                {/* Zoom Buttons */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-neutral-900/90 border border-neutral-700 p-1.5 rounded-2xl backdrop-blur-md">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                    className="p-2 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-xs font-mono text-neutral-400 min-w-10 text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                    className="p-2 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
              </div>

              {/* Sidebar: Meteorological Micro-Climates & Active Alerts */}
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-neutral-800 bg-neutral-950/70 p-5 flex flex-col gap-4 overflow-y-auto">
                {/* Weather Sectors Panel */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Navigation size={14} className="text-red-400" />
                    Manhattan Weather Sectors
                  </h3>

                  <div className="space-y-2">
                    {MANHATTAN_WEATHER_ZONES.map((zone) => {
                      const isCurrent = currentZone.id === zone.id;
                      return (
                        <div
                          key={zone.id}
                          className={`p-3 rounded-2xl border transition ${
                            isCurrent
                              ? 'bg-neutral-800/90 border-red-500 shadow-lg'
                              : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base">
                                {zone.weather === 'rain'
                                  ? '🌧️'
                                  : zone.weather === 'snow'
                                  ? '❄️'
                                  : '☀️'}
                              </span>
                              <span className="font-bold text-xs text-white">{zone.name}</span>
                            </div>
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800">
                                YOU ARE HERE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 mb-1.5">{zone.description}</p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                            <span>{zone.district}</span>
                            <span className="capitalize text-amber-400">{zone.weather}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Active Missions Radar Log */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-red-400" />
                    Active Beacon Dispatch
                  </h3>

                  {activeMission && !activeMission.completed ? (
                    <div className="p-3 bg-red-950/40 border border-red-600/50 rounded-2xl">
                      <div className="flex items-center justify-between text-xs font-bold text-red-300 mb-1">
                        <span>{activeMission.title}</span>
                        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                          {missionInfo?.dist}m AWAY
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300 mb-2">
                        {activeMission.description}
                      </p>
                      <div className="text-[10px] text-yellow-400 font-bold">
                        Reward: +{activeMission.reward} Pizza Slices 🍕
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl text-center text-xs text-neutral-500">
                      All immediate city emergencies resolved! Patrol the city to trigger new crime
                      events.
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-auto pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1.5">
                  <div className="font-bold text-neutral-300">Map Legend:</div>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Spider-Man
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> Crime
                      Beacon
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Pizza Collectible
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span> Citizen Signals
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
